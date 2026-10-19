import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import AppImage from '@components/AppImage';
import Modal from '@components/modals/AdaptiveModal';
import Avatar from '@components/Avatar';
import useUserStore from '@stores/userStore';
import naverPlaceApi from '@utils/api/naverPlaceApi';
import {normalizePlaceSearchResult} from '@utils/communityLocation';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';
import {formatNumber} from '@utils/localeFormat';
import {COLORS as C} from '@constants/colors';
import ChatBlueIcon from '@assets/images/chat_bubbles_blue.svg';
import SearchIcon from '@assets/images/search_black.svg';
import MenuIcon from '@assets/images/bullet_list_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import SendIcon from '@assets/images/arrow_right_white.svg';
import PhotoIcon from '@assets/images/Photo.svg';
import CameraIcon from '@assets/images/camera_black.svg';
import PinIcon from '@assets/images/map_pin_black.svg';
import RadioOn from '@assets/images/radio_button_enabled.svg';
import RadioOff from '@assets/images/radio_button_disabled.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import ReportIcon from '@assets/images/warning_alarm_orange.svg';
import ExitIcon from '@assets/images/arrow_right_black.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import {chatApi, companionApi, newIntentKey, uploadBinary} from './api';
import {
  countText,
  displayDate,
  displayTime,
  hasAction,
  mergeMessages,
  parsePayload,
  roomForAccess,
} from './model';
import {
  Action,
  Chip,
  CompanionCard,
  Field,
  LoginGate,
  Person,
  ResourceBody,
  Screen,
  Title,
  Txt,
  styles as s,
  useFeedback,
  useResource,
  useTask,
} from './ui';

export function CompanionInbox({navigation, route}) {
  const {t} = useTranslation();
  const feedback = useFeedback();
  const [role, setRole] = useState('');
  const endedShown = useRef(false);
  useEffect(() => {
    if (route?.params?.ended && !endedShown.current) {
      endedShown.current = true;
      feedback.inform(t('companion.inquiryEnded'));
    }
  }, [route?.params?.ended, feedback, t]);
  const token = useUserStore(state => state.accessToken);
  const resource = useResource(
    async () => (token ? (await chatApi.list(role)).data : []),
    [role, token],
  );
  return (
    <Screen title={t('companion.inbox')}>
      <LoginGate navigation={navigation}>
        <View style={[s.wrap, {padding: 20}]}>
          {['', 'ORGANIZER', 'PARTICIPANT'].map(value => (
            <Chip
              key={value}
              label={t(value ? `companion.role.${value}` : 'common.all')}
              selected={value === role}
              onPress={() => setRole(value)}
            />
          ))}
        </View>
        <ResourceBody resource={resource}>
          {!resource.data?.length ? (
            <View style={s.empty}>
              <ChatBlueIcon width={56} height={56} />
              <Title>{t('companion.inboxEmpty')}</Title>
              <Txt style={[s.muted, {textAlign: 'center'}]}>
                {t('companion.inboxEmptyBody')}
              </Txt>
              <Action
                label={t('companion.find')}
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: '커뮤니티',
                    params: {tab: 'COMPANION'},
                  })
                }
              />
            </View>
          ) : (
            resource.data.map(room => (
              <TouchableOpacity
                key={room.roomId}
                style={[s.row, {paddingVertical: 12}]}
                onPress={() =>
                  navigation.navigate('CompanionChat', {
                    roomId: room.roomId,
                    companionId: room.companionId,
                  })
                }>
                <View style={{width: 52, height: 48}}>
                  <Avatar size={38} />
                  {room.roomType === 'COMPANION_GROUP' && (
                    <Avatar
                      size={32}
                      style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        borderWidth: 2,
                        borderColor: C.grayscale_0,
                      }}
                    />
                  )}
                </View>
                <View style={[s.grow, {gap: 5}]}>
                  <View style={s.wrap}>
                    <View style={s.roleBadge}>
                      <Txt style={s.small}>
                        {t(
                          room.myMemberRole === 'OWNER'
                            ? 'companion.role.ORGANIZER'
                            : 'companion.role.PARTICIPANT',
                        )}
                      </Txt>
                    </View>
                    <Txt numberOfLines={1} style={{flexShrink: 1}}>
                      {room.title}
                    </Txt>
                    {room.roomType === 'COMPANION_GROUP' && (
                      <Txt style={s.small}>
                        {formatNumber(room.activeMemberCount)}
                      </Txt>
                    )}
                  </View>
                  <Txt numberOfLines={1} style={s.small}>
                    {room.lastMessage?.content ?? room.lastMessageContent ?? ''}
                  </Txt>
                </View>
                <View style={{alignItems: 'flex-end', gap: 8}}>
                  <Txt style={s.small}>
                    {displayTime(
                      room.lastMessage?.sentAt || room.lastMessageAt,
                    )}
                  </Txt>
                  {room.unreadCount > 0 && (
                    <View
                      style={[s.badge, {backgroundColor: C.primary_orange}]}>
                      <Txt style={[s.small, {color: C.grayscale_0}]}>
                        {formatNumber(room.unreadCount)}
                      </Txt>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ResourceBody>
      </LoginGate>
      {feedback.modal}
    </Screen>
  );
}

function PrivateImage({message, roomId}) {
  const {t} = useTranslation();
  const [uri, setUri] = useState(null);
  const [failed, setFailed] = useState(false);
  const retries = useRef(0);
  const payload = parsePayload(message);
  const load = useCallback(async () => {
    try {
      const response = await chatApi.download(roomId, payload.publicUrl);
      setUri(response.data.downloadUrl);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [roomId, payload.publicUrl]);
  useEffect(() => {
    load();
  }, [load]);
  if (failed) {
    return (
      <TouchableOpacity
        onPress={() => {
          retries.current = 0;
          load();
        }}>
        <Txt>{t('companion.imageUnavailable')}</Txt>
      </TouchableOpacity>
    );
  }
  return uri ? (
    <AppImage
      uri={uri}
      style={{width: 200, maxWidth: '100%', height: 160, borderRadius: 8}}
      onError={() => {
        if (retries.current++ < 1) {
          load();
        } else {
          setFailed(true);
        }
      }}
    />
  ) : (
    <Txt style={s.small}>{t('companion.loading')}</Txt>
  );
}
function MessageContent({message, roomId}) {
  const {t} = useTranslation();
  const payload = parsePayload(message);
  if (message.contentKind === 'IMAGE') {
    return <PrivateImage message={message} roomId={roomId} />;
  }
  if (message.contentKind === 'LOCATION') {
    return (
      <View style={{gap: 6}}>
        <PinIcon width={20} height={20} />
        <Txt>{payload.name || message.content}</Txt>
        {payload.address && (
          <Txt style={s.small}>{trimJejuPrefix(payload.address)}</Txt>
        )}
        <Txt style={s.small}>
          {t('companion.coordinates', {
            latitude: payload.latitude,
            longitude: payload.longitude,
          })}
        </Txt>
      </View>
    );
  }
  return <Txt>{message.content}</Txt>;
}

export function CompanionChat({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId, participant, mayRejoin} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const focused = useIsFocused();
  const userId = useUserStore(state => state.userProfile?.userId);
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [content, setContent] = useState('');
  const [connection, setConnection] = useState('CONNECTING');
  const [attachment, setAttachment] = useState(false);
  const [retry, setRetry] = useState(0);
  const readBy = useRef({});
  const anchorY = useRef(null);
  const anchorMessageId = route.params?.anchorMessageId;
  const [currentParticipant, setCurrentParticipant] = useState(participant);
  const socket = useRef(null);
  const heartbeat = useRef(null);
  const scroll = useRef(null);
  const ending = useRef(false);
  useEffect(() => {
    setMessages([]);
    setCursor(null);
    setHasNext(false);
    readBy.current = {};
  }, [roomId]);
  const resource = useResource(
    async isCurrent => {
      const [room, detail] = await Promise.all([
        chatApi.detail(roomId),
        companionApi.detail(companionId),
      ]);
      if (!isCurrent()) {
        return null;
      }
      if (
        detail.data.status === 'CANCELLED' ||
        detail.data.myParticipationStatus === 'REMOVED'
      ) {
        navigation.replace('CompanionInbox');
        return null;
      }
      if (
        room.data.roomType === 'COMPANION_DIRECT' &&
        detail.data.status !== 'OPEN'
      ) {
        const confirmed =
          String(detail.data.organizerId) === String(userId) ||
          detail.data.myParticipationStatus === 'ACCEPTED';
        navigation.replace(
          confirmed && detail.data.confirmedCount > 0
            ? 'CompanionChatAccess'
            : 'CompanionInbox',
          {companionId, ended: !confirmed},
        );
        return null;
      }
      if (
        room.data.myMemberRole === 'OWNER' &&
        room.data.roomType === 'COMPANION_DIRECT'
      ) {
        let page = 0;
        let found;
        let last = false;
        while (!found && !last && isCurrent()) {
          const management = (
            await companionApi.management(companionId, page++)
          ).data;
          found = management.applications.content.find(
            person => String(person.directRoomId) === String(roomId),
          );
          last = management.applications.last;
        }
        if (!isCurrent()) {
          return null;
        }
        setCurrentParticipant(found || null);
      }
      return {room: room.data, detail: detail.data};
    },
    [roomId, companionId, retry, navigation, userId],
  );
  const room = resource.data?.room;
  const detail = resource.data?.detail;
  const isGroup = room?.roomType === 'COMPANION_GROUP';
  const own = room?.myMemberRole === 'OWNER';
  const left =
    room?.myMembershipStatus === 'LEFT' || room?.membershipStatus === 'LEFT';
  const reloadResource = resource.reload;
  const showError = feedback.error;
  const transition = useCallback(async () => {
    if (ending.current) {
      return;
    }
    ending.current = true;
    try {
      const [current, access] = await Promise.all([
        companionApi.detail(companionId),
        companionApi.access(companionId),
      ]);
      const next = roomForAccess(access.data, current.data);
      if (next && String(next) !== String(roomId)) {
        navigation.replace('CompanionChat', {roomId: next, companionId});
        return;
      }
      if (
        current.data.status === 'CLOSED' &&
        (String(current.data.organizerId) === String(userId) ||
          current.data.myParticipationStatus === 'ACCEPTED') &&
        current.data.confirmedCount > 0 &&
        !isGroup
      ) {
        navigation.replace('CompanionChatAccess', {companionId});
        return;
      }
      if (
        current.data.status === 'CANCELLED' ||
        (!isGroup && current.data.status !== 'OPEN') ||
        current.data.myParticipationStatus === 'REMOVED'
      ) {
        navigation.replace('CompanionInbox', {
          ended: current.data.status === 'CLOSED',
        });
        return;
      }
      reloadResource();
    } catch (error) {
      if ([403, 404].includes(error.response?.status)) {
        navigation.replace('CompanionInbox');
      } else {
        showError(error);
      }
    } finally {
      ending.current = false;
    }
  }, [
    companionId,
    showError,
    isGroup,
    navigation,
    reloadResource,
    roomId,
    userId,
  ]);
  useEffect(() => {
    if (!focused || !room || left) {
      return;
    }
    let disposed = false;
    let ws;
    setConnection('CONNECTING');
    const markRead = lastReadMessageId =>
      chatApi.read(roomId, lastReadMessageId).catch(() => {});
    const connect = async () => {
      try {
        const history = (await chatApi.messages(roomId)).data;
        if (disposed) {
          return;
        }
        setMessages(previous => mergeMessages(previous, history.messages));
        setCursor(history.nextCursorMessageId);
        setHasNext(history.hasNext);
        ws = chatApi.connect(
          roomId,
          event => {
            if (disposed) {
              return;
            }
            const payload = event.payload || {};
            if (event.type === 'MESSAGE') {
              setMessages(previous => mergeMessages(previous, [payload]));
              markRead(payload.messageId);
            } else if (
              event.type === 'ACK' &&
              payload.messageId &&
              payload.clientMessageId
            ) {
              setMessages(previous =>
                mergeMessages(previous, [
                  {...payload, sentAt: payload.acceptedAt},
                ]),
              );
            } else if (event.type === 'ROOM_READ_UPDATED') {
              const previousRead = readBy.current[payload.userId];
              readBy.current[payload.userId] = payload.lastReadMessageId;
              if (previousRead != null) {
                setMessages(previous =>
                  previous.map(message =>
                    Number(message.messageId) > Number(previousRead) &&
                    Number(message.messageId) <=
                      Number(payload.lastReadMessageId)
                      ? {
                          ...message,
                          unreadMemberCount: Math.max(
                            0,
                            (message.unreadMemberCount || 0) - 1,
                          ),
                        }
                      : message,
                  ),
                );
              } else {
                chatApi
                  .messages(roomId)
                  .then(({data}) => {
                    if (!disposed) {
                      setMessages(previous =>
                        mergeMessages(previous, data.messages),
                      );
                    }
                  })
                  .catch(() => {});
              }
            } else if (event.type === 'ROOM_NOTICE_UPDATED') {
              resource.reload();
            } else if (event.type === 'ROOM_SYSTEM_EVENT') {
              transition();
            } else if (event.type === 'ERROR') {
              setConnection('ERROR');
              if (
                ['STATE_CONFLICT', 'FORBIDDEN', 'UNAUTHORIZED'].includes(
                  payload.code,
                )
              ) {
                transition();
              }
            }
          },
          () => {
            if (!disposed) {
              clearInterval(heartbeat.current);
              setConnection('DISCONNECTED');
              transition();
            }
          },
          () => {
            if (disposed) {
              ws.close();
              return;
            }
            setConnection('CONNECTED');
            markRead();
            heartbeat.current = setInterval(() => {
              if (ws.readyState === 1) {
                ws.send(
                  JSON.stringify({
                    type: 'PING',
                    clientMessageId: newIntentKey(),
                  }),
                );
              }
            }, 25000);
          },
        );
        socket.current = ws;
        ws.onerror = () => {
          if (!disposed) {
            setConnection('ERROR');
          }
        };
      } catch (error) {
        if (!disposed) {
          setConnection('ERROR');
          feedback.error(error);
        }
      }
    };
    connect();
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        ws?.close();
      } else if (!disposed && ws?.readyState !== 1) {
        setRetry(value => value + 1);
      }
    });
    return () => {
      disposed = true;
      clearInterval(heartbeat.current);
      ws?.close();
      socket.current = null;
      subscription.remove();
    };
    // Room ID/status changes restart the connection; notice updates must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, room?.roomId, left, roomId, retry]);
  useEffect(() => {
    // Recover a missed automatic-close event without repeatedly reconnecting an expired socket.
    if (!focused || !detail?.closeAt || detail.status !== 'OPEN') {
      return;
    }
    const delay = Math.max(
      0,
      +new Date(`${detail.closeAt}+09:00`) - Date.now(),
    );
    const timeout = setTimeout(transition, Math.min(delay + 1000, 2147483647));
    return () => clearTimeout(timeout);
  }, [focused, detail?.closeAt, detail?.status, transition]);
  useEffect(() => {
    if (!anchorMessageId || !room?.roomId || !focused) {
      return;
    }
    let stopped = false;
    async function locate() {
      try {
        let page = (await chatApi.messages(roomId)).data;
        let all = page.messages;
        while (
          !all.some(
            message => String(message.messageId) === String(anchorMessageId),
          ) &&
          page.hasNext &&
          !stopped
        ) {
          page = (await chatApi.messages(roomId, page.nextCursorMessageId))
            .data;
          all = mergeMessages(page.messages, all);
        }
        if (!stopped) {
          setMessages(previous => mergeMessages(previous, all));
          setCursor(page.nextCursorMessageId);
          setHasNext(page.hasNext);
        }
      } catch (error) {
        if (!stopped) {
          showError(error);
        }
      }
    }
    locate();
    return () => {
      stopped = true;
    };
  }, [anchorMessageId, room?.roomId, roomId, focused, showError]);
  const sendFrame = frame => {
    if (socket.current?.readyState !== 1) {
      feedback.inform(t('companion.disconnected'));
      return false;
    }
    socket.current.send(JSON.stringify(frame));
    return true;
  };
  const send = () => {
    if (!content.trim()) {
      return;
    }
    const frame = {
      type: 'SEND_MESSAGE',
      contentKind: 'TEXT',
      content: content.trim(),
      clientMessageId: newIntentKey(),
    };
    if (sendFrame(frame)) {
      setMessages(previous =>
        mergeMessages(previous, [
          {
            ...frame,
            senderUserId: String(userId),
            sentAt: new Date().toISOString(),
            pending: true,
            frame,
          },
        ]),
      );
      setContent('');
      scroll.current?.scrollToEnd({animated: true});
    }
  };
  const sendPhoto = async camera => {
    setAttachment(false);
    try {
      const result = await (camera ? launchCamera : launchImageLibrary)({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (result.didCancel) {
        return;
      }
      if (!result.assets?.[0]) {
        throw new Error('IMAGE_PICK_FAILED');
      }
      const resized = await ImageResizer.createResizedImage(
        result.assets[0].uri,
        1600,
        1600,
        'JPEG',
        90,
      );
      const asset = {
        uri: resized.uri,
        fileName: `chat-${newIntentKey()}.jpg`,
        type: 'image/jpeg',
        fileSize: resized.size,
      };
      if (!asset.fileSize || asset.fileSize > 10 * 1024 * 1024) {
        feedback.inform(t('companion.chatImageLimit'));
        return;
      }
      const signed = (await chatApi.image(roomId, asset)).data;
      if (asset.fileSize > signed.maxSizeBytes) {
        feedback.inform(t('companion.chatImageLimit'));
        return;
      }
      await uploadBinary(
        signed.uploadUrl,
        asset.uri,
        signed.method,
        signed.uploadHeaders,
      );
      const frame = {
        type: 'SEND_MESSAGE',
        clientMessageId: newIntentKey(),
        contentKind: 'IMAGE',
        content: t('companion.photoMessage'),
        payload: {
          objectKey: signed.objectKey,
          publicUrl: signed.publicUrl,
          contentType: signed.contentType,
          sizeBytes: asset.fileSize,
        },
      };
      if (sendFrame(frame)) {
        setMessages(previous =>
          mergeMessages(previous, [
            {
              ...frame,
              senderUserId: String(userId),
              sentAt: new Date().toISOString(),
              pending: true,
              frame,
            },
          ]),
        );
      }
    } catch (error) {
      feedback.error(error);
    }
  };
  const apply = () =>
    task.run(
      `apply:${companionId}:${detail?.myRequestGeneration || 0}`,
      key => companionApi.apply(companionId, key),
      resource.reload,
    );
  const withdraw = () =>
    task.run(
      `withdraw:${companionId}:${detail.myRequestGeneration}`,
      key =>
        companionApi.withdraw(companionId, detail.myRequestGeneration, key),
      resource.reload,
    );
  const decide = accept => {
    if (!currentParticipant || !detail) {
      return;
    }
    const perform = () =>
      task.run(
        `decide:${currentParticipant.participationId}:${currentParticipant.requestGeneration}:${accept}`,
        key =>
          companionApi.decide(companionId, currentParticipant, accept, key),
        async result => {
          setCurrentParticipant({...currentParticipant, ...result.data});
          await transition();
        },
      );
    if (accept && detail.confirmedCount + 1 >= detail.capacity) {
      feedback.confirm(
        t('companion.acceptLastTitle'),
        t('companion.closeBody'),
        t('companion.acceptAndGroup'),
        perform,
      );
    } else {
      perform();
    }
  };
  const loadOlder = () =>
    task.run(
      `history:${cursor}`,
      () => chatApi.messages(roomId, cursor),
      result => {
        setMessages(previous => mergeMessages(previous, result.data.messages));
        setCursor(result.data.nextCursorMessageId);
        setHasNext(result.data.hasNext);
      },
    );
  return (
    <Screen
      title={room?.title || t('companion.chat')}
      right={
        <View style={s.row}>
          <TouchableOpacity
            accessibilityLabel={t('companion.search')}
            onPress={() =>
              navigation.navigate('CompanionChatSearch', {roomId, companionId})
            }>
            <SearchIcon width={22} height={22} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={t('companion.roomInfo')}
            onPress={() =>
              navigation.navigate('CompanionChatInfo', {roomId, companionId})
            }>
            <MenuIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      }>
      {resource.error && mayRejoin && (
        <View style={s.footer}>
          <Action
            label={t('companion.rejoin')}
            disabled={task.busy}
            onPress={() =>
              task.run(
                `rejoin:${roomId}`,
                () => chatApi.rejoin(roomId),
                () => setRetry(value => value + 1),
              )
            }
          />
        </View>
      )}
      <ResourceBody resource={resource} scroll={false}>
        <KeyboardAvoidingView
          style={s.grow}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scroll}
            contentContainerStyle={[s.content, {gap: 14}]}
            keyboardShouldPersistTaps="handled">
            {detail && !isGroup && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CompanionDetail', {companionId})
                }>
                <CompanionCard
                  item={detail}
                  onPress={() =>
                    navigation.navigate('CompanionDetail', {companionId})
                  }
                />
                <View style={[s.soft, {marginTop: 8}]}>
                  <Txt style={s.small}>{t('companion.directDeletion')}</Txt>
                </View>
              </TouchableOpacity>
            )}
            {!!room?.noticeContent && (
              <TouchableOpacity
                style={s.soft}
                onPress={() =>
                  navigation.navigate('CompanionChatNotice', {
                    roomId,
                    companionId,
                  })
                }>
                <Txt numberOfLines={2}>{room.noticeContent}</Txt>
              </TouchableOpacity>
            )}
            {hasNext && (
              <Action
                secondary
                label={t('companion.olderMessages')}
                disabled={task.busy}
                onPress={loadOlder}
              />
            )}
            {!messages.length && (
              <Txt style={[s.small, {textAlign: 'center'}]}>
                {t('companion.startConversation')}
              </Txt>
            )}
            {messages.map((message, index) => {
              const mine =
                message.mine ?? String(message.senderUserId) === String(userId);
              const previous = messages[index - 1];
              const day = displayDate(message.sentAt);
              const unread = message.unreadMemberCount || 0;
              return (
                <View
                  key={message.messageId || message.clientMessageId}
                  onLayout={event => {
                    if (String(message.messageId) === String(anchorMessageId)) {
                      anchorY.current = event.nativeEvent.layout.y;
                      scroll.current?.scrollTo({
                        y: anchorY.current,
                        animated: true,
                      });
                    }
                  }}
                  style={[
                    {gap: 8},
                    String(message.messageId) === String(anchorMessageId) &&
                      s.info,
                  ]}>
                  {(!previous || displayDate(previous.sentAt) !== day) && (
                    <Txt style={[s.small, {textAlign: 'center'}]}>{day}</Txt>
                  )}
                  <View style={[s.bubble, mine && s.mine]}>
                    {!mine && (
                      <Txt style={[s.small, s.blue]}>
                        {message.senderName ||
                          t('companion.memberId', {id: message.senderUserId})}
                      </Txt>
                    )}
                    <MessageContent message={message} roomId={roomId} />
                    <View style={s.wrap}>
                      <Txt style={s.small}>{displayTime(message.sentAt)}</Txt>
                      {mine && unread > 0 && (
                        <Txt style={[s.small, s.orange]}>
                          {countText(t, 'companion.unread', unread)}
                        </Txt>
                      )}
                      {message.pending && (
                        <TouchableOpacity
                          onPress={() =>
                            message.frame && sendFrame(message.frame)
                          }>
                          <Txt style={[s.small, s.orange]}>
                            {t('companion.sendPending')}
                          </Txt>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
            {detail?.myParticipationStatus === 'REJECTED' && (
              <View style={s.info}>
                <Title>{t('companion.rejectedTitle')}</Title>
                <Txt>{t('companion.rejectedBody')}</Txt>
                <Action
                  secondary
                  label={t('companion.find')}
                  onPress={() =>
                    navigation.navigate('MainTabs', {
                      screen: '커뮤니티',
                      params: {tab: 'COMPANION'},
                    })
                  }
                />
              </View>
            )}
            {!isGroup && own && currentParticipant?.status === 'REJECTED' && (
              <View style={s.info}>
                <Title>{t('companion.rejectedOrganizerTitle')}</Title>
                <Txt>{t('companion.rejectedOrganizerBody')}</Txt>
              </View>
            )}
            {!isGroup && own && currentParticipant?.status === 'ACCEPTED' && (
              <View style={s.info}>
                <Title>{t('companion.acceptedOrganizerTitle')}</Title>
                <Txt>{t('companion.acceptedBody')}</Txt>
              </View>
            )}
            {!isGroup && detail?.myParticipationStatus === 'ACCEPTED' && (
              <View style={s.info}>
                <Title>{t('companion.acceptedTitle')}</Title>
                <Txt>{t('companion.acceptedBody')}</Txt>
              </View>
            )}
            {!isGroup && own && (
              <Action
                secondary
                label={t('companion.manage')}
                onPress={() =>
                  navigation.navigate('CompanionManage', {companionId})
                }
              />
            )}
          </ScrollView>
          {connection !== 'CONNECTED' && (
            <View style={[s.soft, {borderRadius: 0}]}>
              <Txt style={s.small}>
                {t(`companion.connection.${connection}`)}
              </Txt>
              {connection !== 'CONNECTING' && (
                <Action
                  secondary
                  label={t('companion.reconnect')}
                  onPress={() => {
                    setRetry(value => value + 1);
                  }}
                />
              )}
            </View>
          )}
          {(left || (mayRejoin && connection === 'ERROR')) && isGroup && (
            <Action
              label={t('companion.rejoin')}
              onPress={() =>
                task.run(
                  `rejoin:${roomId}`,
                  () => chatApi.rejoin(roomId),
                  () => setRetry(value => value + 1),
                )
              }
              disabled={task.busy}
            />
          )}
          {!isGroup && detail?.status === 'OPEN' && (
            <View style={{paddingHorizontal: 20, paddingBottom: 8}}>
              {hasAction(detail, 'APPLY') && (
                <Action
                  label={t('companion.apply')}
                  onPress={apply}
                  disabled={task.busy || connection !== 'CONNECTED'}
                />
              )}
              {hasAction(detail, 'WITHDRAW') && (
                <Action
                  secondary
                  label={t('companion.withdraw')}
                  onPress={withdraw}
                  disabled={task.busy}
                />
              )}
              {own && currentParticipant?.status === 'PENDING' && (
                <View style={s.row}>
                  <Action
                    style={s.grow}
                    secondary
                    label={t('companion.reject')}
                    disabled={task.busy}
                    onPress={() => decide(false)}
                  />
                  <Action
                    style={s.grow}
                    label={t('companion.accept')}
                    disabled={task.busy}
                    onPress={() => decide(true)}
                  />
                </View>
              )}
            </View>
          )}
          <View style={[s.footer, s.row]}>
            <TouchableOpacity
              accessibilityLabel={t('companion.attach')}
              style={s.iconButton}
              disabled={connection !== 'CONNECTED'}
              onPress={() => setAttachment(true)}>
              <PlusIcon width={24} height={24} />
            </TouchableOpacity>
            <TextInput
              accessibilityLabel={t('companion.messagePlaceholder')}
              placeholder={t('companion.messagePlaceholder')}
              value={content}
              onChangeText={setContent}
              style={[s.input, s.grow, {maxHeight: 100}]}
              multiline
              maxLength={2000}
              editable={connection === 'CONNECTED'}
            />
            <TouchableOpacity
              style={[
                s.iconButton,
                {
                  backgroundColor:
                    connection === 'CONNECTED' && content.trim()
                      ? C.primary_orange
                      : C.grayscale_300,
                  borderRadius: 24,
                },
              ]}
              accessibilityLabel={t('companion.send')}
              onPress={send}
              disabled={connection !== 'CONNECTED' || !content.trim()}>
              <SendIcon
                width={22}
                height={22}
                style={{transform: [{rotate: '-90deg'}]}}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ResourceBody>
      <Modal
        visible={attachment}
        transparent
        onRequestClose={() => setAttachment(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: C.modal_background,
          }}>
          <View
            style={[
              s.content,
              {
                flexGrow: 0,
                backgroundColor: C.grayscale_0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            ]}>
            <Title>{t('companion.attachTitle')}</Title>
            <View style={s.between}>
              {[
                [PhotoIcon, 'companion.photo', () => sendPhoto(false)],
                [CameraIcon, 'companion.camera', () => sendPhoto(true)],
                [
                  PinIcon,
                  'companion.place',
                  () => {
                    setAttachment(false);
                    navigation.navigate('CompanionChatPlace', {
                      roomId,
                      companionId,
                    });
                  },
                ],
              ].map(([Icon, label, onPress]) => (
                <TouchableOpacity
                  key={label}
                  style={[s.soft, s.grow, {alignItems: 'center'}]}
                  onPress={onPress}>
                  <Icon width={24} height={24} />
                  <Txt>{t(label)}</Txt>
                </TouchableOpacity>
              ))}
            </View>
            <Action
              secondary
              label={t('common.close')}
              onPress={() => setAttachment(false)}
            />
          </View>
        </View>
      </Modal>
      {feedback.modal}
    </Screen>
  );
}

function InfoLink({Icon, label, onPress}) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.row, {paddingVertical: 16}]}>
      <Icon width={22} height={22} />
      <Txt style={s.grow}>{label}</Txt>
      <ChevronRight width={22} height={22} />
    </TouchableOpacity>
  );
}

export function CompanionChatInfo({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const resource = useResource(
    async isCurrent => {
      const [room, members, companion] = await Promise.all([
        chatApi.detail(roomId),
        chatApi.members(roomId),
        companionApi.detail(companionId),
      ]);
      return {
        room: room.data,
        members: members.data,
        companion: companion.data,
      };
    },
    [roomId, companionId],
  );
  const room = resource.data?.room;
  const leave = () =>
    feedback.confirm(
      t('companion.leaveTitle'),
      t('companion.leaveBody'),
      t('companion.leave'),
      () =>
        task.run(
          `leave:${roomId}`,
          () => chatApi.leave(roomId),
          () => navigation.replace('CompanionInbox'),
        ),
    );
  return (
    <Screen title={t('companion.roomInfo')}>
      <ResourceBody resource={resource}>
        {room && (
          <>
            <Title>{room.title}</Title>
            <Txt style={s.small}>
              {countText(t, 'companion.activeMembers', room.activeMemberCount)}
            </Txt>
            {resource.data.members.map(member => (
              <Person
                key={member.userId}
                name={
                  member.userName ||
                  member.nickname ||
                  t('companion.memberId', {id: member.userId})
                }
                subtitle={t(
                  member.role === 'OWNER'
                    ? 'companion.organizer'
                    : 'companion.confirmedMember',
                )}
              />
            ))}
            {room.roomType === 'COMPANION_GROUP' && (
              <InfoLink
                Icon={PinIcon}
                label={t('companion.notice')}
                onPress={() =>
                  navigation.navigate('CompanionChatNotice', {
                    roomId,
                    companionId,
                  })
                }
              />
            )}
            <InfoLink
              Icon={PhotoIcon}
              label={t('companion.shared')}
              onPress={() =>
                navigation.navigate('CompanionChatShared', {
                  roomId,
                  companionId,
                })
              }
            />
            <View style={s.between}>
              <BellIcon width={22} height={22} />
              <View style={s.grow}>
                <Title>{t('companion.notification')}</Title>
                <Txt style={s.small}>{t('companion.notificationBody')}</Txt>
              </View>
              <Switch
                accessibilityLabel={t('companion.notification')}
                value={room.notificationEnabled}
                thumbColor={C.grayscale_0}
                {...(Platform.OS === 'web'
                  ? {activeThumbColor: C.grayscale_0}
                  : {})}
                ios_backgroundColor={C.grayscale_200}
                disabled={task.busy}
                trackColor={{true: C.primary_orange, false: C.grayscale_200}}
                onValueChange={enabled =>
                  task.run(
                    `notification:${enabled}`,
                    () => chatApi.notification(roomId, enabled),
                    async () => {
                      await resource.reload();
                      feedback.inform(
                        t(
                          enabled
                            ? 'companion.notificationOn'
                            : 'companion.notificationOff',
                        ),
                      );
                    },
                  )
                }
              />
            </View>
            <InfoLink
              Icon={ReportIcon}
              label={t('companion.report')}
              onPress={() =>
                navigation.navigate('CompanionChatReport', {
                  roomId,
                  companionId,
                })
              }
            />
            {room.roomType === 'COMPANION_GROUP' && (
              <InfoLink
                Icon={ExitIcon}
                label={t('companion.leave')}
                onPress={leave}
                disabled={task.busy}
              />
            )}
          </>
        )}
      </ResourceBody>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionChatNotice({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const resource = useResource(
    async isCurrent => {
      const room = (await chatApi.detail(roomId)).data;
      if (isCurrent()) {
        setContent(room.noticeContent || '');
      }
      return room;
    },
    [roomId],
  );
  const own = resource.data?.myMemberRole === 'OWNER';
  return (
    <Screen
      title={t('companion.notice')}
      footer={
        own &&
        editing && (
          <Action
            label={t('companion.saveNotice')}
            disabled={task.busy}
            onPress={() =>
              task.run(
                `notice:${content}`,
                () => chatApi.notice(roomId, content),
                async () => {
                  setEditing(false);
                  await resource.reload();
                },
              )
            }
          />
        )
      }>
      <ResourceBody resource={resource}>
        {editing ? (
          <>
            <Txt>{t('companion.noticeHelp')}</Txt>
            <Field
              label={t('companion.noticeContent')}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
            />
          </>
        ) : (
          <>
            <Title>{t('companion.noticeHeading')}</Title>
            <View style={s.soft}>
              <Txt>
                {resource.data?.noticeContent || t('companion.noNotice')}
              </Txt>
            </View>
            <Txt style={s.small}>{t('companion.noticePinned')}</Txt>
            {own && (
              <Action
                secondary
                label={t('companion.editNotice')}
                onPress={() => setEditing(true)}
              />
            )}
            <Action
              label={t('companion.goChat')}
              onPress={() =>
                navigation.navigate('CompanionChat', {roomId, companionId})
              }
            />
          </>
        )}
      </ResourceBody>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionChatSearch({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [results, setResults] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [more, setMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const resource = useResource(
    async isCurrent => {
      if (!submitted) {
        return [];
      }
      const messages = (await chatApi.search(roomId, submitted, cursor)).data;
      if (!isCurrent()) {
        return null;
      }
      setResults(previous =>
        cursor ? mergeMessages(previous, messages) : messages,
      );
      setMore(messages.length === 20);
      setNextCursor(messages[messages.length - 1]?.messageId);
      return messages;
    },
    [roomId, submitted, cursor],
  );
  return (
    <Screen title={t('companion.search')}>
      <View style={{padding: 20, gap: 10}}>
        <Field
          label={t('companion.searchLabel')}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => {
            setCursor(null);
            setSubmitted(query.trim());
          }}
        />
        <Action
          label={t('companion.search')}
          disabled={!query.trim()}
          onPress={() => {
            setCursor(null);
            setSubmitted(query.trim());
          }}
        />
      </View>
      <ResourceBody resource={resource}>
        {results.map(message => (
          <TouchableOpacity
            style={s.soft}
            key={message.messageId}
            onPress={() =>
              navigation.navigate('CompanionChat', {
                roomId,
                companionId,
                anchorMessageId: message.messageId,
              })
            }>
            <Txt>{message.senderName}</Txt>
            <Txt style={s.small}>{displayDate(message.sentAt)}</Txt>
            <Txt>{message.content}</Txt>
          </TouchableOpacity>
        ))}
        {submitted && !results.length && <Txt>{t('companion.noResults')}</Txt>}
        {more && (
          <Action
            secondary
            label={t('companion.loadMore')}
            onPress={() => setCursor(nextCursor)}
          />
        )}
      </ResourceBody>
    </Screen>
  );
}

export function CompanionChatPlace({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const frame = useRef(null);
  const search = () =>
    task.run(
      `places:${query}`,
      () => naverPlaceApi.searchLocal({query}),
      result => {
        setResults(
          (result.data.items || [])
            .map(normalizePlaceSearchResult)
            .filter(
              place =>
                place &&
                Number.isFinite(place.latitude) &&
                Number.isFinite(place.longitude),
            ),
        );
        setSelected(null);
      },
    );
  const share = () =>
    task.run(
      `location:${selected.longitude}:${selected.latitude}`,
      async () => {
        const name = selected.placeName;
        if (
          !Number.isFinite(selected.latitude) ||
          !Number.isFinite(selected.longitude) ||
          Math.abs(selected.latitude) > 90 ||
          Math.abs(selected.longitude) > 180
        ) {
          throw new Error('INVALID_LOCATION');
        }
        if (
          !frame.current ||
          frame.current.payload.name !== name ||
          frame.current.payload.latitude !== selected.latitude ||
          frame.current.payload.longitude !== selected.longitude
        ) {
          frame.current = {
            type: 'SEND_MESSAGE',
            contentKind: 'LOCATION',
            clientMessageId: newIntentKey(),
            content: name,
            payload: {
              name,
              longitude: selected.longitude,
              latitude: selected.latitude,
            },
          };
        }
        const current = await companionApi.access(companionId);
        if (
          current.data.status !== 'READY' ||
          ![current.data.directRoomId, current.data.groupRoomId].some(
            id => String(id) === String(roomId),
          )
        ) {
          throw new Error('CHAT_UNAVAILABLE');
        }
        await new Promise((resolve, reject) => {
          let ws;
          const timer = setTimeout(() => {
            ws?.close();
            reject(new Error('SEND_TIMEOUT'));
          }, 12000);
          const finish = error => {
            clearTimeout(timer);
            ws?.close();
            error ? reject(error) : resolve();
          };
          ws = chatApi.connect(
            roomId,
            event => {
              if (
                event.type === 'ACK' &&
                event.payload?.clientMessageId === frame.current.clientMessageId
              ) {
                finish();
              } else if (event.type === 'ERROR') {
                finish(new Error('SEND_FAILED'));
              }
            },
            () => {
              clearTimeout(timer);
              reject(new Error('SEND_FAILED'));
            },
            () => ws.send(JSON.stringify(frame.current)),
          );
        });
      },
      () => navigation.navigate('CompanionChat', {roomId, companionId}),
    );
  return (
    <Screen
      title={t('companion.sharePlace')}
      footer={
        selected && (
          <Action
            label={t('companion.shareThisPlace')}
            disabled={task.busy}
            onPress={share}
          />
        )
      }>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}>
        <Field
          label={t('companion.placeSearch')}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
        />
        <Action
          label={t('companion.placeSearch')}
          disabled={task.busy || !query.trim()}
          onPress={search}
        />
        {results.map((place, index) => (
          <TouchableOpacity
            key={index}
            style={[s.soft, selected === place && s.info]}
            onPress={() => setSelected(place)}>
            <Txt>{place.placeName}</Txt>
            <Txt style={s.small}>
              {trimJejuPrefix(place.roadAddress || place.address)}
            </Txt>
          </TouchableOpacity>
        ))}
        {selected && (
          <View style={s.card}>
            <PinIcon width={24} height={24} />
            <Title>{selected.placeName}</Title>
            <Txt style={s.small}>
              {trimJejuPrefix(selected.roadAddress || selected.address)}
            </Txt>
          </View>
        )}
      </ScrollView>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionChatShared({route}) {
  const {t} = useTranslation();
  const {roomId} = route.params || {};
  const [cursor, setCursor] = useState(null);
  const [messages, setMessages] = useState([]);
  const resource = useResource(
    async isCurrent => {
      const result = (await chatApi.messages(roomId, cursor)).data;
      if (!isCurrent()) {
        return null;
      }
      setMessages(previous =>
        cursor ? mergeMessages(previous, result.messages) : result.messages,
      );
      return result;
    },
    [roomId, cursor],
  );
  const shared = messages.filter(message =>
    ['IMAGE', 'LOCATION'].includes(message.contentKind),
  );
  return (
    <Screen title={t('companion.shared')}>
      <ResourceBody resource={resource}>
        {shared.map(message => (
          <View style={s.soft} key={message.messageId}>
            <MessageContent message={message} roomId={roomId} />
          </View>
        ))}
        {!shared.length && <Txt>{t('companion.sharedEmpty')}</Txt>}
        {resource.data?.hasNext && (
          <Action
            secondary
            label={t('companion.loadMore')}
            onPress={() => setCursor(resource.data.nextCursorMessageId)}
          />
        )}
      </ResourceBody>
    </Screen>
  );
}

export function CompanionChatReport() {
  const {t} = useTranslation();
  const [reason, setReason] = useState('ABUSE');
  const [description, setDescription] = useState('');
  return (
    <Screen
      title={t('companion.report')}
      footer={<Action label={t('companion.submitReport')} disabled />}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}>
        <Title>{t('companion.reportHeading')}</Title>
        <Txt style={s.small}>{t('companion.reportPrivacy')}</Txt>
        <View style={s.soft}>
          <Txt>{t('companion.reportUnavailableBody')}</Txt>
        </View>
        {['ABUSE', 'SPAM', 'INAPPROPRIATE', 'OTHER'].map(value => (
          <TouchableOpacity
            key={value}
            accessibilityRole="radio"
            accessibilityState={{checked: reason === value}}
            onPress={() => setReason(value)}
            style={[s.row, s.soft]}>
            {reason === value ? (
              <RadioOn width={22} height={22} />
            ) : (
              <RadioOff width={22} height={22} />
            )}
            <Txt>{t(`companion.reportReason.${value}`)}</Txt>
          </TouchableOpacity>
        ))}
        <Field
          label={t('companion.reportDescription')}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={1000}
        />
      </ScrollView>
    </Screen>
  );
}
