import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AppState,
  RefreshControl,
  Keyboard,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import {
  GroupForm,
  GroupDialog,
  GroupOption,
  parseNotice,
  noticeContent,
} from './groupChatUi';
import CheckIcon from '@assets/images/check_black.svg';
import {ChatSchedule} from './participantChatUi';
import {ChatReentryPrompt} from './chatReentryUi';
import {OrganizerRequestCard} from './organizerChatUi';
import {InboxRoom} from './inboxUi';
import BackIcon from '@assets/images/chevron_left_gray.svg';
import MoreIcon from '@assets/images/more_v_gray.svg';
import {
  ChatRecruitmentSummary,
  ParticipantRequestCard,
} from './participantChatUi';
import ChatBlueIcon from '@assets/images/chat_bubbles_blue.svg';
import SearchIcon from '@assets/images/search_black.svg';
import MenuIcon from '@assets/images/bullet_list_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const endedShown = useRef(false);
  useEffect(() => {
    if (route?.params?.ended && !endedShown.current) {
      endedShown.current = true;
      feedback.inform(t('companion.inquiryEnded'));
    }
  }, [route?.params?.ended, feedback, t]);
  const token = useUserStore(state => state.accessToken);
  const resource = useResource(
    async isCurrent => {
      if (!token) {
        return [];
      }
      const rooms = (await chatApi.list()).data;
      const result = [...rooms];
      let cursor = 0;
      await Promise.all(
        Array.from({length: Math.min(4, rooms.length)}, async () => {
          while (cursor < rooms.length && isCurrent()) {
            const index = cursor++;
            try {
              const detail = (await chatApi.detail(rooms[index].roomId)).data;
              result[index] = {
                ...rooms[index],
                myMemberRole: detail.myMemberRole,
                activeMemberCount: detail.activeMemberCount,
              };
            } catch {
              // Keep the room visible if supplementary role/count data is unavailable.
            }
          }
        }),
      );
      return result;
    },
    [token],
  );
  const rooms = resource.data || [];
  const filtered = rooms.filter(
    room =>
      (!role ||
        (role === 'ORGANIZER'
          ? room.myMemberRole === 'OWNER'
          : room.myMemberRole && room.myMemberRole !== 'OWNER')) &&
      (!query.trim() ||
        `${room.title || ''} ${room.lastMessagePreview || ''}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())),
  );
  const findCompanions = () =>
    navigation.navigate('MainTabs', {
      screen: '커뮤니티',
      params: {tab: 'COMPANION'},
    });
  return (
    <View style={s.screen}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 10,
        }}>
        <TouchableOpacity
          accessibilityLabel={t('companion.chat.back')}
          onPress={() => navigation.goBack()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Title style={s.grow}>{t('companion.inbox')}</Title>
        {rooms.length > 0 && (
          <TouchableOpacity
            accessibilityLabel={t('companion.search')}
            onPress={() => setSearchOpen(value => !value)}>
            <SearchIcon width={24} height={24} />
          </TouchableOpacity>
        )}
      </View>
      <LoginGate navigation={navigation}>
        {rooms.length > 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 4,
              paddingBottom: 18,
              gap: 12,
            }}>
            <View style={s.wrap}>
              {['', 'ORGANIZER', 'PARTICIPANT'].map(value => (
                <Chip
                  key={value}
                  label={t(value ? `companion.role.${value}` : 'common.all')}
                  selected={value === role}
                  onPress={() => setRole(value)}
                />
              ))}
            </View>
            {searchOpen && (
              <TextInput
                accessibilityLabel={t('companion.inbox.searchPlaceholder')}
                placeholder={t('companion.inbox.searchPlaceholder')}
                placeholderTextColor={C.grayscale_400}
                value={query}
                onChangeText={setQuery}
                style={[
                  s.input,
                  {backgroundColor: C.grayscale_100, borderWidth: 0},
                ]}
                returnKeyType="search"
              />
            )}
          </View>
        )}
        <ResourceBody resource={resource} scroll={false}>
          {!rooms.length ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 30,
                paddingBottom: 90,
                gap: 22,
              }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: C.secondary_blue,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ChatBlueIcon width={40} height={40} />
              </View>
              <Title style={{textAlign: 'center'}}>
                {t('companion.inboxEmpty')}
              </Title>
              <Txt style={[s.muted, {textAlign: 'center', marginBottom: 14}]}>
                {t('companion.inboxEmptyBody')}
              </Txt>
              <Action
                style={{width: '100%', maxWidth: 240}}
                label={t('companion.find')}
                onPress={findCompanions}
              />
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 4,
                paddingBottom: 30,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={resource.loading}
                  onRefresh={resource.reload}
                />
              }>
              {filtered.map(room => (
                <InboxRoom
                  key={room.roomId}
                  room={room}
                  onPress={() =>
                    navigation.navigate('CompanionChat', {
                      roomId: room.roomId,
                      companionId: room.companionId,
                    })
                  }
                />
              ))}
              {!filtered.length && (
                <Txt
                  style={[s.small, {paddingVertical: 40, textAlign: 'center'}]}>
                  {t('companion.inbox.noMatches')}
                </Txt>
              )}
            </ScrollView>
          )}
        </ResourceBody>
      </LoginGate>
      {feedback.modal}
    </View>
  );
}

function PrivateImage({message, roomId, compact = false}) {
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
      style={{
        width: compact ? 120 : 200,
        maxWidth: '100%',
        height: compact ? 80 : 160,
        borderRadius: 8,
      }}
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
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            Linking.openURL(
              `https://map.naver.com/p/search/${encodeURIComponent(
                payload.name || message.content || '',
              )}`,
            )
          }>
          <Txt style={[s.small, s.orange]}>
            {t('companion.group.viewPlace')}
          </Txt>
        </TouchableOpacity>
      </View>
    );
  }
  return <Txt>{message.content}</Txt>;
}

export function CompanionChat({navigation, route}) {
  const {t} = useTranslation();
  const keyboardFrame = useRef(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const {roomId, companionId, participant, mayRejoin} = route.params || {};
  const feedback = useFeedback({horizontalButtons: true});
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
    if (Platform.OS !== 'ios') {
      return;
    }
    const show = Keyboard.addListener('keyboardWillShow', () =>
      setKeyboardVisible(true),
    );
    const shown = Keyboard.addListener('keyboardDidShow', () =>
      scroll.current?.scrollToEnd({animated: true}),
    );
    const hide = Keyboard.addListener('keyboardWillHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      shown.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    setMessages([]);
    setCursor(null);
    setHasNext(false);
    readBy.current = {};
  }, [roomId]);
  const resource = useResource(
    async isCurrent => {
      const detail = await companionApi.detail(companionId);
      let room;
      try {
        room = await chatApi.detail(roomId);
      } catch (error) {
        if (
          mayRejoin &&
          error.response?.status === 403 &&
          detail.data.status === 'CLOSED'
        ) {
          const access = (await companionApi.access(companionId)).data;
          if (
            access.status === 'READY' &&
            String(access.groupRoomId) === String(roomId)
          ) {
            return {rejoinRequired: true, detail: detail.data};
          }
        }
        throw error;
      }
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
    [roomId, companionId, retry, navigation, userId, mayRejoin],
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
    if (!focused || !room || isGroup || left) {
      return;
    }
    let disposed = false;
    let checking = false;
    const timer = setInterval(async () => {
      if (checking || disposed) {
        return;
      }
      checking = true;
      try {
        const [current, access] = await Promise.all([
          companionApi.detail(companionId),
          companionApi.access(companionId),
        ]);
        const next = roomForAccess(access.data, current.data);
        if (
          !disposed &&
          ((next && String(next) !== String(roomId)) ||
            current.data.status !== detail?.status ||
            current.data.myParticipationStatus !==
              detail?.myParticipationStatus)
        ) {
          transition();
        }
      } catch {
      } finally {
        checking = false;
      }
    }, 5000);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [
    focused,
    room?.roomId,
    isGroup,
    left,
    companionId,
    roomId,
    detail?.status,
    detail?.myParticipationStatus,
    transition,
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
                  {...payload, mine: true, sentAt: payload.acceptedAt},
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
            senderUserId: userId == null ? undefined : String(userId),
            mine: true,
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
              senderUserId: userId == null ? undefined : String(userId),
              mine: true,
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
  const participantDirect = !isGroup && !own;
  const findOthers = () =>
    navigation.navigate('MainTabs', {
      screen: '커뮤니티',
      params: {tab: 'COMPANION'},
    });
  if (resource.data?.rejoinRequired) {
    return (
      <Screen title={t('companion.groupChat')}>
        <ChatReentryPrompt
          busy={task.busy}
          onRejoin={() =>
            task.run(
              `rejoin:${roomId}`,
              () => chatApi.rejoin(roomId),
              () => setRetry(value => value + 1),
            )
          }
          onMyCompanions={() => navigation.navigate('MyCompanions')}
        />
        {feedback.modal}
      </Screen>
    );
  }
  return (
    <View
      ref={keyboardFrame}
      collapsable={false}
      style={s.screen}
      onLayout={() => {
        if (Platform.OS === 'ios') {
          keyboardFrame.current?.measureInWindow((x, y) =>
            setKeyboardOffset(y),
          );
        }
      }}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
          }}>
          <TouchableOpacity
            accessibilityLabel={t('companion.chat.back')}
            onPress={() => navigation.goBack()}
            style={{padding: 4}}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <View style={s.grow}>
            <Txt numberOfLines={1} style={{fontWeight: '600'}}>
              {(!isGroup && own && currentParticipant?.userName) ||
                room?.title ||
                t('companion.chat')}
            </Txt>
            {isGroup && (
              <Txt style={s.small}>
                {countText(
                  t,
                  'companion.chat.groupMembers',
                  room?.activeMemberCount || 0,
                )}
              </Txt>
            )}
          </View>
          {isGroup && (
            <TouchableOpacity
              accessibilityLabel={t('companion.search')}
              onPress={() =>
                navigation.navigate('CompanionChatSearch', {
                  roomId,
                  companionId,
                })
              }>
              <SearchIcon width={22} height={22} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            accessibilityLabel={t('companion.roomInfo')}
            onPress={() =>
              navigation.navigate('CompanionChatInfo', {roomId, companionId})
            }>
            {isGroup ? (
              <MenuIcon width={24} height={24} />
            ) : (
              <MoreIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>
        <ResourceBody resource={resource} scroll={false}>
          {isGroup && !!room?.noticeContent && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CompanionChatNotice', {
                  roomId,
                  companionId,
                })
              }
              style={{
                marginHorizontal: 20,
                marginBottom: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: C.grayscale_100,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <PinIcon width={16} height={16} />
              <Txt numberOfLines={2} style={[s.small, s.grow]}>
                {room.noticeContent}
              </Txt>
            </TouchableOpacity>
          )}

          <View style={{flex: 1}}>
            <ScrollView
              ref={scroll}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 20,
                gap: 16,
                flexGrow: 1,
              }}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled">
              {detail && !isGroup && (
                <ChatRecruitmentSummary
                  item={detail}
                  onPress={() =>
                    navigation.navigate('CompanionDetail', {companionId})
                  }
                />
              )}
              {!isGroup && !!room?.noticeContent && (
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
              {participantDirect &&
                detail?.myParticipationStatus === 'REJECTED' && (
                  <ParticipantRequestCard item={detail} onFind={findOthers} />
                )}
              {!isGroup && own && currentParticipant?.status === 'REJECTED' && (
                <OrganizerRequestCard
                  item={detail}
                  person={currentParticipant}
                />
              )}
              {messages.map((message, index) => {
                const mine =
                  userId != null && message.senderUserId != null
                    ? String(message.senderUserId) === String(userId)
                    : message.mine === true;
                const previous = messages[index - 1];
                const day = displayDate(message.sentAt);
                const unread = message.unreadMemberCount || 0;
                return (
                  <View
                    key={message.messageId || message.clientMessageId}
                    onLayout={event => {
                      if (
                        String(message.messageId) === String(anchorMessageId)
                      ) {
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
                    {isGroup && index === 0 && (
                      <Txt style={[s.small, {textAlign: 'center'}]}>
                        {t('companion.chat.groupOpened')}
                      </Txt>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: mine ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end',
                        gap: 8,
                      }}>
                      {!mine && <Avatar size={28} />}
                      {mine && !isGroup && (
                        <Txt style={[s.small, {fontSize: 10}]}>
                          {displayTime(message.sentAt)}
                        </Txt>
                      )}
                      <View style={{maxWidth: '78%', gap: 4}}>
                        {!mine && isGroup && (
                          <Txt style={s.small}>
                            {String(message.senderUserId) ===
                            String(detail?.organizerId)
                              ? t('companion.group.organizerSender', {
                                  name:
                                    message.senderName ||
                                    t('companion.memberId', {
                                      id: message.senderUserId,
                                    }),
                                })
                              : message.senderName ||
                                t('companion.memberId', {
                                  id: message.senderUserId,
                                })}
                          </Txt>
                        )}
                        <View
                          style={{
                            backgroundColor: mine
                              ? C.secondary_orange
                              : C.grayscale_100,
                            borderRadius: 14,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}>
                          <MessageContent message={message} roomId={roomId} />
                        </View>
                        {isGroup && (
                          <View
                            style={[
                              s.row,
                              mine && {justifyContent: 'flex-end'},
                            ]}>
                            {mine && unread > 0 && (
                              <Txt style={[s.small, s.orange]}>
                                {countText(t, 'companion.unread', unread)}
                              </Txt>
                            )}
                            <Txt style={[s.small, mine && s.orange]}>
                              {displayTime(message.sentAt)}
                            </Txt>
                          </View>
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
                      {!mine && !isGroup && (
                        <Txt style={[s.small, {fontSize: 10}]}>
                          {displayTime(message.sentAt)}
                        </Txt>
                      )}
                    </View>
                  </View>
                );
              })}
              {participantDirect &&
                detail?.myParticipationStatus === 'PENDING' && (
                  <ParticipantRequestCard
                    item={detail}
                    busy={task.busy}
                    onWithdraw={withdraw}
                  />
                )}
              {participantDirect &&
                ['INQUIRING', 'WITHDRAWN'].includes(
                  detail?.myParticipationStatus,
                ) && (
                  <View
                    style={{
                      backgroundColor: C.grayscale_100,
                      borderRadius: 6,
                      padding: 12,
                    }}>
                    <Txt style={{fontSize: 12, lineHeight: 19}}>
                      {t('companion.chat.requestHint')}
                    </Txt>
                  </View>
                )}
              {participantDirect &&
                detail?.myParticipationStatus === 'REJECTED' && (
                  <View
                    style={{
                      backgroundColor: C.grayscale_100,
                      borderRadius: 6,
                      padding: 12,
                    }}>
                    <Txt style={s.small}>
                      {t('companion.chat.deletionHint')}
                    </Txt>
                  </View>
                )}
              {!isGroup &&
                own &&
                ['PENDING', 'ACCEPTED'].includes(
                  currentParticipant?.status,
                ) && (
                  <OrganizerRequestCard
                    item={detail}
                    person={currentParticipant}
                    busy={task.busy}
                    onReject={() => decide(false)}
                    onAccept={() => decide(true)}
                  />
                )}
              {!isGroup && detail?.myParticipationStatus === 'ACCEPTED' && (
                <View style={s.info}>
                  <Title>{t('companion.acceptedTitle')}</Title>
                  <Txt>{t('companion.acceptedBody')}</Txt>
                </View>
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
            {!isGroup &&
              !own &&
              detail?.status === 'OPEN' &&
              hasAction(detail, 'APPLY') && (
                <View style={{paddingHorizontal: 20, paddingBottom: 8}}>
                  {hasAction(detail, 'APPLY') && (
                    <Action
                      label={t('companion.apply')}
                      onPress={apply}
                      disabled={task.busy || connection !== 'CONNECTED'}
                    />
                  )}
                  {own && hasAction(detail, 'WITHDRAW') && (
                    <Action
                      secondary
                      label={t('companion.withdraw')}
                      onPress={withdraw}
                      disabled={task.busy}
                    />
                  )}
                </View>
              )}
            <View
              style={[
                s.row,
                {
                  paddingHorizontal: 16,
                  paddingTop: 10,
                  paddingBottom:
                    Platform.OS === 'ios' ? (keyboardVisible ? 10 : 30) : 12,
                  borderTopWidth: 1,
                  borderColor: C.grayscale_100,
                },
              ]}>
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
                style={[
                  s.grow,
                  {
                    borderWidth: 1,
                    borderColor: C.grayscale_200,
                    borderRadius: 24,
                    backgroundColor: C.grayscale_0,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    minHeight: 40,
                    maxHeight: 100,
                    color: C.grayscale_800,
                  },
                ]}
                placeholderTextColor={C.grayscale_400}
                onFocus={() => scroll.current?.scrollToEnd({animated: true})}
                multiline
                maxLength={2000}
                editable={connection === 'CONNECTED'}
              />
              <TouchableOpacity
                style={{
                  padding: 4,
                  borderRadius: 12,
                  backgroundColor: 'transparent',
                  opacity:
                    connection === 'CONNECTED' && content.trim() ? 1 : 0.4,
                }}
                accessibilityLabel={t('companion.send')}
                onPress={send}
                disabled={connection !== 'CONNECTED' || !content.trim()}>
                <Txt style={[s.small, s.orange]}>{t('companion.send')}</Txt>
              </TouchableOpacity>
            </View>
          </View>
        </ResourceBody>
        <Modal
          visible={attachment}
          transparent
          onRequestClose={() => setAttachment(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: 20,
              backgroundColor: C.modal_background,
            }}>
            <View
              style={[
                s.content,
                {
                  flexGrow: 0,
                  backgroundColor: C.grayscale_0,
                  borderRadius: 20,
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
              <Txt style={s.small}>{t('companion.group.attachmentHelp')}</Txt>
              <Action
                secondary
                label={t('common.close')}
                onPress={() => setAttachment(false)}
              />
            </View>
          </View>
        </Modal>
        {feedback.modal}
      </KeyboardAvoidingView>
    </View>
  );
}

export function CompanionChatInfo({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const myId = useUserStore(state => state.userProfile?.userId);
  const myEmail = useUserStore(state => state.userProfile?.email);
  const feedback = useFeedback({horizontalButtons: true});
  const task = useTask(feedback, () => resource.reload());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sharedOpen, setSharedOpen] = useState(false);
  const resource = useResource(async () => {
    const [room, members, companion] = await Promise.all([
      chatApi.detail(roomId),
      chatApi.members(roomId),
      companionApi.detail(companionId),
    ]);
    const visible = members.data.filter(
      member => member.membershipStatus === 'ACTIVE',
    );
    const enriched = [...visible];
    let cursor = 0;
    await Promise.all(
      Array.from({length: Math.min(4, visible.length)}, async () => {
        while (cursor < visible.length) {
          const index = cursor++;
          try {
            const {data} = await chatApi.profile(visible[index].userId);
            enriched[index] = {
              ...visible[index],
              displayName: data.displayName,
              profileImageUrl: data.profileImageUrl,
              isMe: !!myEmail && data.email === myEmail,
            };
          } catch {}
        }
      }),
    );
    return {room: room.data, members: enriched, companion: companion.data};
  }, [roomId, companionId, myEmail]);
  const shared = useResource(
    async () => (sharedOpen ? (await chatApi.messages(roomId)).data : null),
    [roomId, sharedOpen],
  );
  const room = resource.data?.room;
  const group = room?.roomType === 'COMPANION_GROUP';
  const notify = enabled =>
    task.run(
      `notification:${enabled}`,
      () => chatApi.notification(roomId, enabled),
      async () => {
        setNotificationOpen(false);
        await resource.reload();
        feedback.inform(
          t(
            enabled
              ? 'companion.notificationOn'
              : 'companion.group.notificationOffTitle',
          ),
          t('companion.group.notificationResult'),
        );
      },
    );
  const leave = () =>
    feedback.confirm(
      t('companion.leaveTitle'),
      t('companion.leaveBody'),
      t('companion.leave'),
      () =>
        task.run(
          `leave:${roomId}`,
          () => chatApi.leave(roomId),
          () =>
            navigation.reset({
              index: 1,
              routes: [
                {
                  name: 'MainTabs',
                  params: {screen: '커뮤니티', params: {tab: 'COMPANION'}},
                },
                {name: 'CompanionInbox'},
              ],
            }),
        ),
    );
  return (
    <View style={s.screen}>
      <Screen title={t('companion.roomInfo')}>
        <ResourceBody resource={resource}>
          {room && (
            <>
              <Title>{room.title}</Title>
              <ChatSchedule
                item={resource.data.companion}
                includePlace={false}
              />
              <Txt>
                {countText(
                  t,
                  'companion.group.membersHeading',
                  room.activeMemberCount,
                )}
              </Txt>
              {resource.data.members.map(member => (
                <Person
                  key={member.userId}
                  uri={member.profileImageUrl}
                  name={
                    String(member.userId) === String(myId) || member.isMe
                      ? t('companion.group.me', {
                          name:
                            member.displayName ||
                            t('companion.memberId', {id: member.userId}),
                        })
                      : member.displayName ||
                        t('companion.memberId', {id: member.userId})
                  }
                  subtitle={t(
                    member.role === 'OWNER'
                      ? 'companion.organizer'
                      : group
                      ? 'companion.confirmedMember'
                      : 'companion.role.PARTICIPANT',
                  )}
                />
              ))}
              <View style={{marginTop: 8}}>
                {group && (
                  <GroupOption
                    Icon={PinIcon}
                    title={t('companion.notice')}
                    subtitle={room.noticeContent || t('companion.noNotice')}
                    onPress={() =>
                      navigation.navigate('CompanionChatNotice', {
                        roomId,
                        companionId,
                      })
                    }
                  />
                )}
                <GroupOption
                  Icon={PhotoIcon}
                  title={t('companion.shared')}
                  onPress={() => setSharedOpen(true)}
                />
                <GroupOption
                  Icon={BellIcon}
                  title={t('companion.notification')}
                  subtitle={t('companion.notificationBody')}
                  value={t(
                    room.notificationEnabled
                      ? 'companion.group.on'
                      : 'companion.group.off',
                  )}
                  onPress={() => setNotificationOpen(true)}
                />
                <GroupOption
                  Icon={ReportIcon}
                  title={t('companion.report')}
                  onPress={() =>
                    navigation.navigate('CompanionChatReport', {
                      roomId,
                      companionId,
                    })
                  }
                />
                {group && (
                  <GroupOption
                    Icon={ExitIcon}
                    title={t('companion.leave')}
                    danger
                    disabled={task.busy}
                    onPress={leave}
                  />
                )}
              </View>
            </>
          )}
        </ResourceBody>
      </Screen>
      <GroupDialog
        visible={notificationOpen}
        title={t('companion.notification')}
        onClose={() => setNotificationOpen(false)}>
        <Txt style={s.small}>{t('companion.notificationBody')}</Txt>
        <Action
          secondary
          label={t('companion.group.enableNotifications')}
          disabled={task.busy}
          onPress={() => notify(true)}
        />
        <Action
          secondary
          label={t('companion.group.disableNotifications')}
          disabled={task.busy}
          onPress={() => notify(false)}
        />
      </GroupDialog>
      <GroupDialog
        visible={sharedOpen}
        title={t('companion.shared')}
        onClose={() => setSharedOpen(false)}>
        <ScrollView style={{maxHeight: 380}}>
          <ResourceBody resource={shared}>
            {(shared.data?.messages || [])
              .filter(message =>
                ['IMAGE', 'LOCATION'].includes(message.contentKind),
              )
              .map(message => (
                <View key={message.messageId} style={s.soft}>
                  {message.contentKind === 'IMAGE' ? (
                    <PrivateImage message={message} roomId={roomId} compact />
                  ) : (
                    <MessageContent message={message} roomId={roomId} />
                  )}
                </View>
              ))}
            {!shared.data?.messages?.some(message =>
              ['IMAGE', 'LOCATION'].includes(message.contentKind),
            ) && <Txt style={s.small}>{t('companion.sharedEmpty')}</Txt>}
            {shared.data?.hasNext && (
              <Action
                secondary
                label={t('companion.group.viewAllShared')}
                onPress={() => {
                  setSharedOpen(false);
                  navigation.navigate('CompanionChatShared', {
                    roomId,
                    companionId,
                  });
                }}
              />
            )}
          </ResourceBody>
        </ScrollView>
      </GroupDialog>
      {feedback.modal}
    </View>
  );
}

export function CompanionChatNotice({navigation, route}) {
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({time: '', place: '', body: ''});
  const resource = useResource(
    async isCurrent => {
      const {data} = await chatApi.detail(roomId);
      if (isCurrent()) {
        setDraft(parseNotice(data.noticeContent));
      }
      return data;
    },
    [roomId],
  );
  const own = resource.data?.myMemberRole === 'OWNER';
  const notice = parseNotice(resource.data?.noticeContent);
  const showPlace = place =>
    Linking.openURL(
      `https://map.naver.com/p/search/${encodeURIComponent(place)}`,
    );
  return (
    <View style={s.screen}>
      <GroupForm
        title={t(
          editing ? 'companion.group.editNoticeTitle' : 'companion.notice',
        )}
        footer={
          <Action
            label={t(editing ? 'companion.saveNotice' : 'companion.goChat')}
            disabled={
              task.busy ||
              (editing &&
                (!draft.body.trim() || noticeContent(draft).length > 2000))
            }
            onPress={
              editing
                ? () =>
                    task.run(
                      `notice:${noticeContent(draft)}`,
                      () => chatApi.notice(roomId, noticeContent(draft)),
                      async () => {
                        setEditing(false);
                        await resource.reload();
                      },
                    )
                : () =>
                    navigation.navigate('CompanionChat', {roomId, companionId})
            }
          />
        }>
        {resource.loading && !resource.data ? (
          <Txt>{t('companion.loading')}</Txt>
        ) : resource.error ? (
          <Action label={t('companion.retry')} onPress={resource.reload} />
        ) : editing ? (
          <>
            <Txt>{t('companion.noticeHelp')}</Txt>
            <Field
              label={t('companion.group.meetingTime')}
              maxLength={120}
              value={draft.time}
              onChangeText={time => setDraft(previous => ({...previous, time}))}
              style={{backgroundColor: C.grayscale_100, borderWidth: 0}}
            />
            <Field
              label={t('companion.group.meetingPlace')}
              maxLength={255}
              value={draft.place}
              onChangeText={place =>
                setDraft(previous => ({...previous, place}))
              }
              style={{backgroundColor: C.grayscale_100, borderWidth: 0}}
            />
            <Field
              label={t('companion.noticeContent')}
              value={draft.body}
              onChangeText={body => setDraft(previous => ({...previous, body}))}
              multiline
              maxLength={Math.max(
                0,
                2000 - draft.time.length - draft.place.length - 3,
              )}
              style={{backgroundColor: C.grayscale_100, borderWidth: 0}}
            />
            <Txt style={s.small}>{t('companion.noticePinned')}</Txt>
          </>
        ) : (
          <>
            <Title>{t('companion.noticeHeading')}</Title>
            {(notice.time || notice.place) && (
              <View style={[s.soft, {padding: 16, gap: 16}]}>
                {!!notice.time && (
                  <View style={s.row}>
                    <PinIcon width={20} height={20} />
                    <Txt style={s.grow}>{notice.time}</Txt>
                  </View>
                )}
                {!!notice.place && (
                  <View style={s.row}>
                    <PinIcon width={20} height={20} />
                    <Txt style={s.grow}>{trimJejuPrefix(notice.place)}</Txt>
                  </View>
                )}
              </View>
            )}
            <Txt>{notice.body || t('companion.noNotice')}</Txt>
            {!!notice.place && (
              <Action
                secondary
                label={t('companion.group.viewPlace')}
                onPress={() => showPlace(notice.place)}
              />
            )}
            <Txt style={s.small}>{t('companion.noticePinned')}</Txt>
            {own && (
              <Action
                secondary
                label={t('companion.editNotice')}
                onPress={() => setEditing(true)}
              />
            )}
          </>
        )}
      </GroupForm>
      {feedback.modal}
    </View>
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
        <View
          style={[
            s.row,
            {
              backgroundColor: C.grayscale_100,
              borderRadius: 12,
              paddingHorizontal: 12,
            },
          ]}>
          <SearchIcon width={20} height={20} />
          <TextInput
            style={[s.grow, {minHeight: 48, color: C.grayscale_800}]}
            accessibilityLabel={t('companion.searchLabel')}
            placeholder={t('companion.searchLabel')}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              setCursor(null);
              setSubmitted(query.trim());
            }}
          />
        </View>
      </View>
      <ResourceBody resource={resource}>
        {!!submitted && (
          <Txt style={s.small}>
            {countText(t, 'companion.group.searchCount', results.length)}
          </Txt>
        )}
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
            <Txt style={{fontWeight: '600'}}>
              {t('companion.group.searchSender', {
                name:
                  message.senderName ||
                  t('companion.memberId', {id: message.senderUserId}),
                time: displayTime(message.sentAt),
              })}
            </Txt>
            <Txt>{message.content}</Txt>
          </TouchableOpacity>
        ))}
        {!!results.length && (
          <Txt style={s.small}>{t('companion.group.searchHint')}</Txt>
        )}
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
              address: trimJejuPrefix(
                selected.roadAddress || selected.address || '',
              ),
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
    <GroupForm
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
      <View
        style={[
          s.row,
          {
            backgroundColor: C.grayscale_100,
            borderRadius: 12,
            paddingHorizontal: 12,
          },
        ]}>
        <SearchIcon width={20} height={20} />
        <TextInput
          accessibilityLabel={t('companion.placeSearch')}
          placeholder={t('companion.placeSearch')}
          placeholderTextColor={C.grayscale_400}
          style={[s.grow, {minHeight: 48, color: C.grayscale_800}]}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={search}
        />
      </View>
      <Txt>{t('companion.group.searchResults')}</Txt>
      {results.map((place, index) => (
        <TouchableOpacity
          key={index}
          style={s.soft}
          onPress={() => setSelected(place)}>
          <Txt>{place.placeName}</Txt>
          <Txt style={s.small}>
            {trimJejuPrefix(place.roadAddress || place.address)}
          </Txt>
          {selected === place && <CheckIcon width={20} height={20} />}
        </TouchableOpacity>
      ))}
      {selected && (
        <Txt style={s.small}>{t('companion.group.selectedPlace')}</Txt>
      )}
      {selected && (
        <View style={s.soft}>
          <PinIcon width={24} height={24} />
          <Title>{selected.placeName}</Title>
          <Txt style={s.small}>
            {trimJejuPrefix(selected.roadAddress || selected.address)}
          </Txt>
        </View>
      )}

      {feedback.modal}
    </GroupForm>
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

export function CompanionChatReport({navigation, route}) {
  const {t} = useTranslation();
  const roomId = route.params?.roomId;
  const companionId = route.params?.companionId;
  const myId = useUserStore(state => state.userProfile?.userId);
  const myEmail = useUserStore(state => state.userProfile?.email);
  const feedback = useFeedback();
  const task = useTask(feedback);
  const [reason, setReason] = useState('ABUSE');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState(route.params?.targetUserId || null);
  const [done, setDone] = useState(false);
  const members = useResource(async () => {
    const [membersResponse, roomResponse, companionResponse] =
      await Promise.all([
        chatApi.members(roomId),
        chatApi.detail(roomId),
        companionApi.detail(companionId),
      ]);
    const room = roomResponse.data;
    const ownId =
      myId ??
      (room.myMemberRole === 'OWNER'
        ? companionResponse.data.organizerId
        : room.roomType === 'COMPANION_DIRECT'
        ? room.inquirerUserId
        : null);
    const others = membersResponse.data.filter(member =>
      ownId != null
        ? String(member.userId) !== String(ownId)
        : myEmail
        ? true
        : member.role === 'OWNER',
    );
    const results = await Promise.all(
      others.map(async member => {
        try {
          const {data: profile} = await chatApi.profile(member.userId);
          if (myEmail && profile.email === myEmail) return null;
          return {...member, displayName: profile.displayName};
        } catch {
          return myId != null ? member : null;
        }
      }),
    );
    return results.filter(Boolean);
  }, [roomId, companionId, myId, myEmail]);
  return (
    <View style={s.screen}>
      <GroupForm
        title={t('companion.report')}
        footer={
          <Action
            label={t('companion.submitReport')}
            disabled={task.busy || !target}
            onPress={() =>
              task.run(
                `report:${target}:${reason}:${description}`,
                () =>
                  chatApi.report({
                    targetUserId: target,
                    roomId,
                    reasonType: reason === 'INAPPROPRIATE' ? 'OTHER' : reason,
                    description: description.trim() || null,
                  }),
                () => setDone(true),
              )
            }
          />
        }>
        <Title>{t('companion.reportHeading')}</Title>
        <Txt style={s.small}>{t('companion.reportPrivacy')}</Txt>
        <Txt>{t('companion.group.reportTarget')}</Txt>
        <ResourceBody resource={members} scroll={false}>
          {members.data?.map(member => (
            <TouchableOpacity
              key={member.userId}
              accessibilityRole="radio"
              accessibilityState={{
                checked: String(target) === String(member.userId),
              }}
              onPress={() => setTarget(member.userId)}
              style={[
                s.row,
                {
                  padding: 12,
                  backgroundColor:
                    String(target) === String(member.userId)
                      ? C.grayscale_100
                      : C.grayscale_0,
                  borderRadius: 12,
                },
              ]}>
              {String(target) === String(member.userId) ? (
                <RadioOn width={20} height={20} />
              ) : (
                <RadioOff width={20} height={20} />
              )}
              <Txt>
                {member.displayName ||
                  t('companion.memberId', {id: member.userId})}
              </Txt>
            </TouchableOpacity>
          ))}
        </ResourceBody>
        {['ABUSE', 'SPAM', 'INAPPROPRIATE', 'OTHER'].map(value => (
          <TouchableOpacity
            key={value}
            accessibilityRole="radio"
            accessibilityState={{checked: reason === value}}
            onPress={() => setReason(value)}
            style={[
              s.row,
              {
                padding: 14,
                borderRadius: 12,
                backgroundColor:
                  reason === value ? C.grayscale_100 : C.grayscale_0,
              },
            ]}>
            {reason === value ? (
              <RadioOn width={20} height={20} />
            ) : (
              <RadioOff width={20} height={20} />
            )}
            <Txt>{t(`companion.reportReason.${value}`)}</Txt>
          </TouchableOpacity>
        ))}
        <View style={[s.soft, {gap: 8}]}>
          <Txt>{t('companion.reportDescription')}</Txt>
          <TextInput
            accessibilityLabel={t('companion.reportDescription')}
            placeholder={t('companion.group.reportPlaceholder')}
            placeholderTextColor={C.grayscale_400}
            style={{
              minHeight: 60,
              color: C.grayscale_800,
              textAlignVertical: 'top',
            }}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
          />
        </View>
      </GroupForm>
      <GroupDialog
        visible={done}
        title={t('companion.group.reportDone')}
        onClose={() => {
          setDone(false);
          navigation.goBack();
        }}>
        <CheckIcon width={24} height={24} />
        <Txt style={s.small}>{t('companion.group.reportDoneBody')}</Txt>
        <Action
          label={t('common.confirm')}
          onPress={() => {
            setDone(false);
            navigation.goBack();
          }}
        />
      </GroupDialog>
      {feedback.modal}
    </View>
  );
}
