import {
  RecoveryScreen as Screen,
  RecoveryBody as ResourceBody,
  useCompanionBack,
  useCompanionNavigation,
  replaceCompanionScreen,
  RecoveryForm as GroupForm,
} from './recovery';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AppState,
  RefreshControl,
  Keyboard,
  Linking,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
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
import ChatSkeleton from './chatSkeleton';
import CompanionPlaceMap from './CompanionPlaceMap';
import {
  SkeletonPulse,
  SkeletonBlock,
} from '../../screens/_components/ContentSkeleton';
import BackIcon from '@assets/images/chevron_left_gray.svg';
import MoreIcon from '@assets/images/more_v_gray.svg';
import {
  ChatRecruitmentSummary,
  ParticipantRequestCard,
} from './participantChatUi';
import ChatBlueIcon from '@assets/images/chat_bubbles_blue.svg';
import SearchIcon from '@assets/images/search_black.svg';
import SearchUpIcon from '@assets/images/chevron_up_black.svg';
import SearchDownIcon from '@assets/images/chevron_down_black.svg';
import MenuIcon from '@assets/images/bullet_list_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import PhotoIcon from '@assets/images/add_image_black.svg';
import CameraIcon from '@assets/images/camera_black.svg';
import PinIcon from '@assets/images/map_pin_black.svg';
import RadioOn from '@assets/images/radio_button_enabled.svg';
import RadioOff from '@assets/images/radio_button_disabled.svg';
import BellIcon from '@assets/images/bell_black.svg';
import ReportIcon from '@assets/images/flag_report_black.svg';
import ExitIcon from '@assets/images/exit_chat_black.svg';
import NoticePinIcon from '@assets/images/pin_notice_black.svg';
import {chatApi, companionApi, newIntentKey, uploadBinary} from './api';
import {getChatProfile, peekChatProfile} from './chatProfileCache';
import {isCompanionNotification} from './notificationRouting';
import {subscribeForegroundNotification} from '@utils/notifications';
import {
  chatGeneration,
  invalidateChatToken,
  ensureChatToken,
  subscribeChatReset,
} from './chatAuth';
import {
  countText,
  displayDate,
  displayTime,
  hasAction,
  kstDate,
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
  Title,
  Txt,
  styles as s,
  useFeedback,
  useResource,
  useTask,
} from './ui';

function useChatResource(loader, deps = []) {
  const token = useUserStore(state => state.accessToken);
  const userId = useUserStore(state => state.userProfile?.userId);
  const [epoch, setEpoch] = useState(0);
  useEffect(() => subscribeChatReset(() => setEpoch(value => value + 1)), []);
  const result = useResource(
    async isCurrent => {
      if (!token) {
        return null;
      }
      const generation = chatGeneration();
      const current = () => isCurrent() && generation === chatGeneration();
      const data = await loader(current);
      if (!current()) {
        throw new Error('CHAT_SESSION_CHANGED');
      }
      return {payload: data, generation};
    },
    [token, userId, epoch, ...deps],
  );
  const data =
    token && result.data?.generation === chatGeneration()
      ? result.data.payload
      : null;
  return {...result, data, error: data ? null : result.error};
}

export function CompanionInbox({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const back = useCompanionBack();
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
  const userId = useUserStore(state => state.userProfile?.userId);
  const myEmail = useUserStore(state => state.userProfile?.email);
  const focused = useIsFocused();
  const [roomMetadata, setRoomMetadata] = useState({});
  const metadataCache = useRef({});
  useEffect(() => {
    metadataCache.current = {};
    setRoomMetadata({});
    return subscribeChatReset(() => {
      metadataCache.current = {};
      setRoomMetadata({});
    });
  }, [token, userId]);
  const resource = useChatResource(
    async () => (token ? (await chatApi.list()).data : []),
    [token, userId],
  );
  const reloadRooms = resource.reload;
  useEffect(() => {
    if (!focused || !token) {
      return;
    }
    let timer;
    const unsubscribe = subscribeForegroundNotification(message => {
      if (!isCompanionNotification(message?.data)) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(reloadRooms, 150);
    });
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        reloadRooms();
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
      subscription.remove();
    };
  }, [focused, token, reloadRooms]);
  useEffect(() => {
    if (!focused || !token || !resource.data) {
      return;
    }
    let disposed = false;
    const generation = chatGeneration();
    const cache = metadataCache.current;
    const current = () =>
      !disposed &&
      generation === chatGeneration() &&
      cache === metadataCache.current;
    const pending = resource.data.filter(
      room => !cache[room.roomId] || Date.now() - cache[room.roomId].at > 30000,
    );
    let cursor = 0;
    Promise.all(
      Array.from({length: Math.min(3, pending.length)}, async () => {
        while (cursor < pending.length && current()) {
          const room = pending[cursor++];
          const [detail, members] = await Promise.allSettled([
            chatApi.detail(room.roomId),
            chatApi.members(room.roomId),
          ]);
          if (!current()) {
            return;
          }
          const metadata = {...cache[room.roomId]?.data};
          if (detail.status === 'fulfilled') {
            metadata.myMemberRole = detail.value.data.myMemberRole;
            metadata.activeMemberCount = detail.value.data.activeMemberCount;
          }
          // Publish role/count immediately; photos must never delay room navigation.
          setRoomMetadata(previous => ({...previous, [room.roomId]: metadata}));
          if (members.status === 'fulfilled') {
            const candidates = members.value.data.filter(
              member =>
                member.membershipStatus === 'ACTIVE' &&
                (userId == null || String(member.userId) !== String(userId)),
            );
            const avatarProfiles = [];
            for (const member of candidates) {
              if (!current()) {
                return;
              }
              try {
                const profile = await getChatProfile(member.userId);
                const isMe =
                  userId != null
                    ? String(member.userId) === String(userId)
                    : !!myEmail && profile.email === myEmail;
                if (!isMe) {
                  avatarProfiles.push(profile);
                }
              } catch {}
              if (
                avatarProfiles.length >=
                (room.roomType === 'COMPANION_GROUP' ? 2 : 1)
              ) {
                break;
              }
            }
            metadata.avatarProfiles = avatarProfiles;
          }
          if (metadata.avatarProfiles === undefined) {
            metadata.avatarProfiles = [];
          }
          if (current()) {
            cache[room.roomId] = {at: Date.now(), data: metadata};
            setRoomMetadata(previous => ({
              ...previous,
              [room.roomId]: metadata,
            }));
          }
        }
      }),
    );
    return () => {
      disposed = true;
    };
  }, [resource.data, focused, token, userId, myEmail]);
  const rooms = (resource.data || []).map(room => ({
    ...room,
    ...roomMetadata[room.roomId],
    avatarsLoading: roomMetadata[room.roomId]?.avatarProfiles === undefined,
  }));
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
          onPress={back}>
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
        {resource.loading && !resource.data ? (
          <ChatSkeleton inbox />
        ) : (
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
                    style={[
                      s.small,
                      {paddingVertical: 40, textAlign: 'center'},
                    ]}>
                    {t('companion.inbox.noMatches')}
                  </Txt>
                )}
              </ScrollView>
            )}
          </ResourceBody>
        )}
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
  const imageActive = useRef(false);
  const payload = parsePayload(message);
  const load = useCallback(async () => {
    const generation = chatGeneration();
    try {
      const response = await chatApi.download(roomId, payload.publicUrl);
      if (!imageActive.current || generation !== chatGeneration()) {
        return;
      }
      setUri(response.data.downloadUrl);
      setFailed(false);
    } catch {
      if (imageActive.current && generation === chatGeneration()) {
        setFailed(true);
      }
    }
  }, [roomId, payload.publicUrl]);
  useEffect(() => {
    imageActive.current = true;
    setUri(null);
    setFailed(false);
    load();
    const unsubscribe = subscribeChatReset(() => {
      imageActive.current = false;
      setUri(null);
    });
    return () => {
      imageActive.current = false;
      unsubscribe();
    };
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
    <SkeletonPulse title={t('companion.loading')}>
      <SkeletonBlock
        style={{
          width: compact ? 120 : 200,
          maxWidth: '100%',
          height: compact ? 80 : 160,
          borderRadius: 8,
        }}
      />
    </SkeletonPulse>
  );
}
function MessageContent({message, roomId}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const payload = parsePayload(message);
  if (message.contentKind === 'IMAGE') {
    if (message.pending && message.localImageUri) {
      return (
        <AppImage
          uri={message.localImageUri}
          style={{width: 200, maxWidth: '100%', height: 160, borderRadius: 8}}
        />
      );
    }
    return <PrivateImage message={message} roomId={roomId} />;
  }
  if (message.contentKind === 'LOCATION') {
    return (
      <View style={{gap: 6}}>
        <CompanionPlaceMap
          compact
          latitude={payload.latitude}
          longitude={payload.longitude}
        />
        <PinIcon width={20} height={20} />
        <Txt>{payload.name || message.content}</Txt>
        {payload.address && (
          <Txt style={s.small}>{trimJejuPrefix(payload.address)}</Txt>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            payload.latitude != null && payload.longitude != null &&
            Number.isFinite(Number(payload.latitude)) && Number.isFinite(Number(payload.longitude)) &&
            Math.abs(Number(payload.latitude)) <= 90 && Math.abs(Number(payload.longitude)) <= 180
              ? navigation.navigate('CommunityLocationMap', {
                  placeName: payload.name || message.content,
                  address: payload.address,
                  latitude: Number(payload.latitude),
                  longitude: Number(payload.longitude),
                })
              : Linking.openURL(
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

export function CompanionChat({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const back = useCompanionBack();
  const {t} = useTranslation();
  const keyboardFrame = useRef(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const {roomId, companionId, participant, mayRejoin} = route.params || {};
  const feedback = useFeedback({horizontalButtons: true});
  const acceptFeedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const focused = useIsFocused();
  const userId = useUserStore(state => state.userProfile?.userId);
  const myEmail = useUserStore(state => state.userProfile?.email);
  const [messages, setMessages] = useState([]);
  const [senderProfiles, setSenderProfiles] = useState({});
  const profileCache = useRef({});
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [content, setContent] = useState('');
  const [connection, setConnection] = useState('CONNECTING');
  const [attachment, setAttachment] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoFrame, setPhotoFrame] = useState(null);
  const photoPicking = useRef(false);
  const pendingPhotoPicker = useRef(null);
  const photoOperation = useRef(0);
  useEffect(
    () => () => {
      photoOperation.current += 1;
      pendingPhotoPicker.current = null;
    },
    [],
  );
  const [retry, setRetry] = useState(0);
  const latestMessages = useRef(messages);
  latestMessages.current = messages;
  const [historyLoading, setHistoryLoading] = useState(true);
  const anchorY = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchMore, setSearchMore] = useState(false);
  const searchVersion = useRef(0);
  useEffect(
    () => () => {
      searchVersion.current += 1;
    },
    [],
  );
  const messagePositions = useRef({});
  const searchActive = useRef(false);
  searchActive.current = searchOpen;
  const anchorMessageId = searchOpen
    ? searchResults[searchIndex]?.messageId
    : route.params?.anchorMessageId;
  const clearSearch = () => {
    searchVersion.current += 1;
    setSearchQuery('');
    setSearchResults([]);
    setSearchIndex(-1);
    setSearchBusy(false);
    setSearchSubmitted(false);
    setSearchMore(false);
  };
  const runSearch = async (older = false) => {
    const query = searchQuery.trim();
    if (!query || searchBusy) {
      return;
    }
    const version = ++searchVersion.current;
    const generation = chatGeneration();
    setSearchBusy(true);
    if (!older) {
      setSearchResults([]);
      setSearchIndex(-1);
    }
    try {
      const found = (
        await chatApi.search(
          roomId,
          query,
          older
            ? searchResults[searchResults.length - 1]?.messageId
            : undefined,
        )
      ).data;
      if (
        version !== searchVersion.current ||
        generation !== chatGeneration()
      ) {
        return;
      }
      const additional = older
        ? found.filter(
            item =>
              !searchResults.some(
                existing =>
                  String(existing.messageId) === String(item.messageId),
              ),
          )
        : found;
      setSearchResults(previous =>
        older ? [...previous, ...additional] : found,
      );
      setSearchIndex(
        older
          ? searchResults.length - (additional.length ? 0 : 1)
          : found.length
          ? 0
          : -1,
      );
      setSearchMore(found.length === 20 && additional.length > 0);
      setSearchSubmitted(true);
    } catch (error) {
      if (
        version === searchVersion.current &&
        generation === chatGeneration()
      ) {
        feedback.error(error);
      }
    } finally {
      if (version === searchVersion.current) {
        setSearchBusy(false);
      }
    }
  };
  const [currentParticipant, setCurrentParticipant] = useState(participant);
  const socket = useRef(null);
  const heartbeat = useRef(null);
  const scroll = useRef(null);
  const pendingSendScroll = useRef(null);
  const nearLatest = useRef(true);
  const pendingIncomingScroll = useRef(false);
  const scrollAfterSend = useCallback(
    (layoutComplete = false) => {
      if (
        pendingSendScroll.current &&
        messages.some(
          message => message.clientMessageId === pendingSendScroll.current,
        ) &&
        scroll.current
      ) {
        scroll.current.scrollToEnd({animated: true});
        if (layoutComplete) {
          pendingSendScroll.current = null;
        }
      }
    },
    [messages],
  );
  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollAfterSend());
    return () => cancelAnimationFrame(frame);
  }, [scrollAfterSend]);
  const initiallyScrolled = useRef(false);
  const scrollToLatestInitially = useCallback(() => {
    if (
      initiallyScrolled.current ||
      historyLoading ||
      !messages.length ||
      !scroll.current
    ) {
      return;
    }
    initiallyScrolled.current = true;
    if (!anchorMessageId && !searchOpen) {
      scroll.current.scrollToEnd({animated: false});
    }
  }, [historyLoading, messages.length, anchorMessageId, searchOpen]);
  useEffect(() => {
    const frame = requestAnimationFrame(scrollToLatestInitially);
    return () => cancelAnimationFrame(frame);
  }, [scrollToLatestInitially]);
  const ending = useRef(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    const show = Keyboard.addListener('keyboardWillShow', () =>
      setKeyboardVisible(true),
    );
    const shown = Keyboard.addListener(
      'keyboardDidShow',
      () =>
        !searchActive.current && scroll.current?.scrollToEnd({animated: true}),
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
    photoOperation.current += 1;
    pendingPhotoPicker.current = null;
    photoPicking.current = false;
    setPhotoBusy(false);
    setPhotoFrame(null);
    clearSearch();
    setSearchOpen(false);
    messagePositions.current = {};
    initiallyScrolled.current = false;
    pendingSendScroll.current = null;
    nearLatest.current = true;
    pendingIncomingScroll.current = false;
    setMessages([]);
    latestMessages.current = [];
    profileCache.current = {};
    setSenderProfiles({});
    setCursor(null);
    setHasNext(false);
    setContent('');
    setHistoryLoading(true);
  }, [roomId, userId]);
  useEffect(
    () =>
      subscribeChatReset(() => {
        photoOperation.current += 1;
        pendingPhotoPicker.current = null;
        photoPicking.current = false;
        setPhotoBusy(false);
        setPhotoFrame(null);
        clearSearch();
        setSearchOpen(false);
        initiallyScrolled.current = false;
        pendingSendScroll.current = null;
        setMessages([]);
        profileCache.current = {};
        setSenderProfiles({});
        setContent('');
        setCursor(null);
        setHasNext(false);
        socket.current?.close(1000);
        clearInterval(heartbeat.current);
        setConnection('DISCONNECTED');
      }),
    [],
  );
  const senderIdsKey = JSON.stringify(
    [
      ...new Set(
        messages
          .map(message => message.senderUserId)
          .filter(id => id != null && String(id) !== String(userId))
          .map(String),
      ),
    ].sort(),
  );
  useEffect(() => {
    if (!focused) {
      return;
    }
    let disposed = false;
    const generation = chatGeneration();
    const cache = profileCache.current;
    const ids = JSON.parse(senderIdsKey).filter(id => !(id in cache));
    let next = 0;
    const current = () =>
      !disposed &&
      generation === chatGeneration() &&
      cache === profileCache.current;
    Promise.all(
      Array.from({length: Math.min(4, ids.length)}, async () => {
        while (next < ids.length && current()) {
          const id = ids[next++];
          let profile = null;
          try {
            profile = await getChatProfile(id);
          } catch {}
          if (current()) {
            cache[id] = profile;
            setSenderProfiles({...cache});
          }
        }
      }),
    );
    return () => {
      disposed = true;
    };
  }, [senderIdsKey, roomId, userId, focused]);
  const resource = useChatResource(
    async isCurrent => {
      const [detail, roomResult] = await Promise.all([
        companionApi.detail(companionId),
        chatApi.detail(roomId).then(
          value => ({value}),
          error => ({error}),
        ),
      ]);
      let room;
      try {
        if (roomResult.error) {
          throw roomResult.error;
        }
        room = roomResult.value;
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
        replaceCompanionScreen(navigation, 'CompanionInbox');
        return null;
      }
      if (
        room.data.roomType === 'COMPANION_DIRECT' &&
        detail.data.status !== 'OPEN'
      ) {
        const confirmed =
          room.data.myMemberRole === 'OWNER' ||
          String(detail.data.organizerId) === String(userId) ||
          detail.data.myParticipationStatus === 'ACCEPTED';
        replaceCompanionScreen(
          navigation,
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
  const directPeerId = !isGroup
    ? own ? room?.inquirerUserId : detail?.organizerId
    : null;
  useEffect(() => {
    if (!focused || directPeerId == null) {
      return;
    }
    let disposed = false;
    const generation = chatGeneration();
    const cache = profileCache.current;
    getChatProfile(directPeerId).then(profile => {
      if (!disposed && generation === chatGeneration() && cache === profileCache.current) {
        cache[String(directPeerId)] = profile;
        setSenderProfiles({...cache});
      }
    }).catch(() => {});
    return () => { disposed = true; };
  }, [directPeerId, roomId, focused]);
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
        replaceCompanionScreen(navigation, 'CompanionChat', {
          roomId: next,
          companionId,
        });
        return;
      }
      if (
        current.data.status === 'CLOSED' &&
        (own || String(current.data.organizerId) === String(userId) ||
          current.data.myParticipationStatus === 'ACCEPTED') &&
        current.data.confirmedCount > 0 &&
        !isGroup
      ) {
        replaceCompanionScreen(navigation, 'CompanionChatAccess', {
          companionId,
        });
        return;
      }
      if (
        current.data.status === 'CANCELLED' ||
        (!isGroup && current.data.status !== 'OPEN') ||
        current.data.myParticipationStatus === 'REMOVED'
      ) {
        replaceCompanionScreen(navigation, 'CompanionInbox', {
          ended: current.data.status === 'CLOSED',
        });
        return;
      }
      reloadResource();
    } catch (error) {
      if ([403, 404].includes(error.response?.status)) {
        replaceCompanionScreen(navigation, 'CompanionInbox');
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
    own,
    navigation,
    reloadResource,
    roomId,
    userId,
  ]);
  useEffect(() => {
    if (!focused || !room?.roomId || isGroup || left) {
      return;
    }
    let disposed = false;
    let checking = false;
    const timer = setInterval(async () => {
      if (
        checking ||
        disposed ||
        (AppState.currentState && AppState.currentState !== 'active')
      ) {
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
    let reconnectTimer;
    let connectionTimeout;
    let attempts = 0;
    let policyRecovered = false;
    let connecting = false;
    let suspended = false;
    let connectionVersion = 0;
    const generation = chatGeneration();
    const current = () => !disposed && generation === chatGeneration();
    const active = () =>
      current() &&
      !suspended &&
      (Platform.OS !== 'web' ||
        typeof document === 'undefined' ||
        !document.hidden) &&
      (Platform.OS !== 'web' ||
        typeof navigator === 'undefined' ||
        navigator.onLine !== false);
    const syncHistory = async () => {
      // Capture the last known message before fetching, while live events continue merging.
      const known = new Set(
        latestMessages.current
          .filter(message => message.messageId != null)
          .map(message => String(message.messageId)),
      );
      const seenCursors = new Set();
      let nextCursor;
      let first = true;
      while (current()) {
        const history = (await chatApi.messages(roomId, nextCursor)).data;
        if (!current()) {
          return;
        }
        if (
          first &&
          known.size &&
          nearLatest.current &&
          !searchActive.current &&
          history.messages.some(
            message =>
              message.messageId != null &&
              !known.has(String(message.messageId)),
          )
        ) {
          pendingIncomingScroll.current = true;
        }
        setMessages(previous => mergeMessages(previous, history.messages));
        if (first && !known.size) {
          setCursor(history.nextCursorMessageId);
          setHasNext(history.hasNext);
        }
        first = false;
        if (
          !known.size ||
          history.messages.some(message =>
            known.has(String(message.messageId)),
          ) ||
          !history.hasNext ||
          history.nextCursorMessageId == null ||
          seenCursors.has(String(history.nextCursorMessageId))
        ) {
          break;
        }
        nextCursor = history.nextCursorMessageId;
        seenCursors.add(String(nextCursor));
      }
      if (current()) {
        setHistoryLoading(false);
      }
    };
    const schedule = (policy = false) => {
      if (!active() || reconnectTimer) {
        return;
      }
      if ((policy && policyRecovered) || (!policy && attempts >= 5)) {
        setConnection('ERROR');
        return;
      }
      if (policy) {
        policyRecovered = true;
      }
      const delay = policy
        ? 0
        : Math.min(1000 * 2 ** attempts++, 16000) * (0.8 + Math.random() * 0.4);
      reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        if (!active()) {
          return;
        }
        try {
          if (policy) {
            invalidateChatToken();
            await ensureChatToken();
            const access = (await companionApi.access(companionId)).data;
            if (!current()) {
              return;
            }
            if (
              access.status !== 'READY' ||
              ![access.directRoomId, access.groupRoomId].some(
                id => id != null && String(id) === String(roomId),
              )
            ) {
              throw new Error('CHAT_UNAVAILABLE');
            }
          }
          await chatApi.detail(roomId);
          if (active()) {
            connect();
          }
        } catch (error) {
          if (!current()) {
            return;
          }
          setConnection('ERROR');
          if (
            !policy &&
            ![401, 403, 404, 409].includes(error.response?.status) &&
            error.message !== 'CHAT_AUTH_REQUIRED'
          ) {
            schedule();
          } else {
            feedback.error(error);
          }
        }
      }, delay);
    };
    setConnection('CONNECTING');
    // ACK and read events contain no authoritative unread counts. Refresh only
    // the latest slice, coalescing bursts and preserving older loaded messages.
    let refreshingCounts = false;
    let countsDirty = false;
    const refreshReadCounts = async () => {
      countsDirty = true;
      if (refreshingCounts) {
        return;
      }
      refreshingCounts = true;
      try {
        while (countsDirty && active()) {
          countsDirty = false;
          const {data} = await chatApi.messages(roomId);
          if (!active()) {
            return;
          }
          setMessages(previous => mergeMessages(previous, data.messages));
        }
      } catch {
        // Reconnection history sync also restores read counts after failures.
      } finally {
        refreshingCounts = false;
      }
    };
    const markRead = lastReadMessageId =>
      chatApi.read(roomId, lastReadMessageId).catch(() => {});
    const connect = async () => {
      if (!active() || connecting) {
        return;
      }
      connecting = true;
      const version = ++connectionVersion;
      setConnection('CONNECTING');
      try {
        if (!active() || version !== connectionVersion) {
          return;
        }
        ws = await chatApi.connect(
          roomId,
          event => {
            if (!current()) {
              return;
            }
            const payload = event.payload || {};
            if (event.type === 'MESSAGE') {
              pendingIncomingScroll.current =
                nearLatest.current && !searchActive.current;
              setMessages(previous => mergeMessages(previous, [payload]));
              markRead(payload.messageId);
              if (isGroup && payload.unreadMemberCount == null) {
                refreshReadCounts();
              }
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
              refreshReadCounts();
            } else if (event.type === 'ROOM_READ_UPDATED') {
              const isMyRead =
                userId != null
                  ? String(payload.userId) === String(userId)
                  : !!myEmail &&
                    peekChatProfile(payload.userId)?.email === myEmail;
              if (!isMyRead) {
                refreshReadCounts();
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
          event => {
            clearTimeout(connectionTimeout);
            clearInterval(heartbeat.current);
            if (!current()) {
              return;
            }
            setConnection('DISCONNECTED');
            if (event.code === 1008) {
              schedule(true);
            } else if ([1006, 1011, 1012, 1013].includes(event.code)) {
              schedule();
            } else if (event.code !== 1000) {
              setConnection('ERROR');
            }
          },
          () => {
            if (!current()) {
              ws.close();
              return;
            }
            clearTimeout(connectionTimeout);
            setConnection('CONNECTED');
            markRead();
            // Fill the initial history/socket gap and all reconnect gaps.
            syncHistory().catch(error => {
              if (current()) {
                feedback.error(error);
              }
            });
            clearInterval(heartbeat.current);
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
          () => active() && version === connectionVersion,
        );
        if (!ws || !active() || version !== connectionVersion) {
          ws?.close(1000);
          return;
        }
        socket.current = ws;
        connectionTimeout = setTimeout(() => {
          if (
            current() &&
            version === connectionVersion &&
            ws.readyState === 0
          ) {
            ws.close(1000);
            setConnection('DISCONNECTED');
            schedule();
          }
        }, 10000);
        ws.onerror = () => {
          if (current()) {
            setConnection('ERROR');
          }
        };
      } catch (error) {
        if (current()) {
          setHistoryLoading(false);
          setConnection('ERROR');
          feedback.error(error);
          if (
            ![401, 403, 404, 409].includes(error.response?.status) &&
            error.message !== 'CHAT_AUTH_REQUIRED'
          ) {
            schedule();
          }
        }
      } finally {
        connecting = false;
      }
    };
    connect();
    const pause = () => {
      suspended = true;
      connectionVersion += 1;
      clearTimeout(reconnectTimer);
      clearTimeout(connectionTimeout);
      reconnectTimer = null;
      clearInterval(heartbeat.current);
      ws?.close(1000);
    };
    const resume = () => {
      suspended = false;
      if (
        active() &&
        !connecting &&
        ws?.readyState !== 1 &&
        ws?.readyState !== 0
      ) {
        schedule();
      }
    };
    const subscription = AppState.addEventListener('change', state => {
      state === 'active' ? resume() : pause();
    });
    const visibility = () => (document.hidden ? pause() : resume());
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('online', resume);
      window.addEventListener('offline', pause);
      document.addEventListener('visibilitychange', visibility);
    }
    return () => {
      disposed = true;
      connectionVersion += 1;
      clearTimeout(reconnectTimer);
      clearTimeout(connectionTimeout);
      clearInterval(heartbeat.current);
      ws?.close(1000);
      if (socket.current === ws) {
        socket.current = null;
      }
      subscription.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('online', resume);
        window.removeEventListener('offline', pause);
        document.removeEventListener('visibilitychange', visibility);
      }
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
    const position = messagePositions.current[String(anchorMessageId)];
    if (position != null) {
      scroll.current?.scrollTo({y: Math.max(0, position - 16), animated: true});
      return;
    }
    let stopped = false;
    const generation = chatGeneration();
    async function locate() {
      try {
        let page = (await chatApi.messages(roomId)).data;
        let all = page.messages;
        while (
          !all.some(
            message => String(message.messageId) === String(anchorMessageId),
          ) &&
          page.hasNext &&
          !stopped &&
          generation === chatGeneration()
        ) {
          page = (await chatApi.messages(roomId, page.nextCursorMessageId))
            .data;
          all = mergeMessages(page.messages, all);
        }
        if (!stopped && generation === chatGeneration()) {
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
    if (
      socket.current?.readyState !== 1 ||
      (Number.isFinite(socket.current?.chatExpiresAt) &&
        socket.current.chatExpiresAt <= Date.now())
    ) {
      if (socket.current?.readyState === 1) {
        socket.current.close(1000);
        setRetry(value => value + 1);
      }
      feedback.inform(t('companion.disconnected'));
      return false;
    }
    socket.current.send(JSON.stringify(frame));
    if (frame.type === 'SEND_MESSAGE') {
      pendingSendScroll.current = frame.clientMessageId;
      nearLatest.current = true;
    }
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
    }
  };
  // Native pickers can suspend the app and close the room socket. Keep the
  // uploaded frame until the room reconnects, retaining its id for safe retries.
  useEffect(() => {
    if (!photoFrame || !focused || connection !== 'CONNECTED') {
      return;
    }
    if (sendFrame(photoFrame)) {
      setPhotoFrame(null);
    } else {
      setRetry(value => value + 1);
    }
    // sendFrame reads the current socket; only retry on frame/connection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoFrame, connection, focused]);
  const sendPhoto = async camera => {
    const operation = ++photoOperation.current;
    const generation = chatGeneration();
    const current = () =>
      operation === photoOperation.current && generation === chatGeneration();
    setPhotoBusy(true);
    try {
      if (camera && Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (!current()) {
          return;
        }
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          feedback.inform(t('companion.chatPhoto.cameraPermission'));
          return;
        }
      }
      const result = await (camera ? launchCamera : launchImageLibrary)({
        mediaType: 'photo',
        selectionLimit: 1,
        ...(camera ? {saveToPhotos: false} : {}),
      });
      if (!current()) {
        return;
      }
      if (result.errorCode) {
        feedback.inform(
          t(
            result.errorCode === 'permission'
              ? 'companion.chatPhoto.cameraPermission'
              : 'companion.chatPhoto.pickerFailed',
          ),
        );
        return;
      }
      if (result.didCancel) {
        return;
      }
      if (!result.assets?.[0]?.uri) {
        feedback.inform(t('companion.chatPhoto.pickerFailed'));
        return;
      }
      const resized = await ImageResizer.createResizedImage(
        result.assets[0].uri,
        1600,
        1600,
        'JPEG',
        90,
      );
      if (!current()) {
        return;
      }
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
      if (!current()) {
        return;
      }
      if (asset.fileSize > signed.maxSizeBytes) {
        feedback.inform(t('companion.chatImageLimit'));
        return;
      }
      await uploadBinary(signed.uploadUrl, asset.uri, signed.method, {
        'Content-Type': signed.contentType || asset.type,
        ...signed.uploadHeaders,
      });
      if (!current()) {
        return;
      }
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
      setMessages(previous =>
        mergeMessages(previous, [
          {
            ...frame,
            senderUserId: userId == null ? undefined : String(userId),
            mine: true,
            sentAt: new Date().toISOString(),
            pending: true,
            localImageUri: asset.uri,
            frame,
          },
        ]),
      );
      setPhotoFrame(frame);
    } catch (error) {
      if (current()) {
        feedback.error(error);
      }
    } finally {
      if (current()) {
        photoPicking.current = false;
        setPhotoBusy(false);
      }
    }
  };
  const openPhotoPicker = camera => {
    if (photoPicking.current || photoFrame) {
      return;
    }
    photoPicking.current = true;
    Keyboard.dismiss();
    if (Platform.OS === 'ios') {
      // Present only after the native attachment modal has finished dismissing.
      pendingPhotoPicker.current = camera;
      setAttachment(false);
    } else {
      setAttachment(false);
      sendPhoto(camera);
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
      acceptFeedback.confirm(
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
          {searchOpen ? (
            <>
              <View
                style={[
                  s.row,
                  s.grow,
                  {
                    backgroundColor: C.grayscale_100,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                  },
                ]}>
                <SearchIcon width={20} height={20} />
                <TextInput
                  autoFocus
                  style={[
                    s.grow,
                    {minHeight: 44, color: C.grayscale_800, paddingVertical: 8},
                  ]}
                  accessibilityLabel={t('companion.chatSearch.placeholder')}
                  placeholder={t('companion.chatSearch.placeholder')}
                  placeholderTextColor={C.grayscale_400}
                  value={searchQuery}
                  onChangeText={value => {
                    clearSearch();
                    setSearchQuery(value);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={() => runSearch()}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  clearSearch();
                  setSearchOpen(false);
                  Keyboard.dismiss();
                }}
                style={{paddingVertical: 12}}>
                <Txt>{t('common.cancel')}</Txt>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                accessibilityLabel={t('companion.chat.back')}
                onPress={back}
                style={{padding: 4}}>
                <BackIcon width={24} height={24} />
              </TouchableOpacity>
              <View style={s.grow}>
                <Txt numberOfLines={1} style={{fontWeight: '600'}}>
                  {(!isGroup && own && currentParticipant?.userName) ||
                    (!isGroup && senderProfiles[String(directPeerId)]?.displayName) ||
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
                  onPress={() => {
                    setAttachment(false);
                    setSearchOpen(true);
                  }}>
                  <SearchIcon width={22} height={22} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                accessibilityLabel={t('companion.roomInfo')}
                onPress={() =>
                  navigation.navigate('CompanionChatInfo', {
                    roomId,
                    companionId,
                  })
                }>
                {isGroup ? (
                  <MenuIcon width={24} height={24} />
                ) : (
                  <MoreIcon width={24} height={24} />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
        {resource.loading && !resource.data ? (
          <ChatSkeleton />
        ) : (
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
                onContentSizeChange={() => {
                  scrollToLatestInitially();
                  scrollAfterSend(true);
                  if (
                    pendingIncomingScroll.current &&
                    !searchOpen &&
                    !anchorMessageId
                  ) {
                    scroll.current?.scrollToEnd({animated: true});
                    pendingIncomingScroll.current = false;
                  }
                }}
                onScroll={event => {
                  const {contentOffset, contentSize, layoutMeasurement} =
                    event.nativeEvent;
                  nearLatest.current =
                    contentSize.height -
                      contentOffset.y -
                      layoutMeasurement.height <
                    80;
                }}
                scrollEventThrottle={100}
                onScrollBeginDrag={() => {
                  pendingSendScroll.current = null;
                  pendingIncomingScroll.current = false;
                }}
                onLayout={() => {
                  scrollToLatestInitially();
                  const position =
                    messagePositions.current[String(anchorMessageId)];
                  if (searchOpen && position != null) {
                    scroll.current?.scrollTo({
                      y: Math.max(0, position - 16),
                      animated: true,
                    });
                  }
                }}
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
                {historyLoading && !messages.length && <ChatSkeleton />}
                {!historyLoading && !messages.length && (
                  <Txt style={[s.small, {textAlign: 'center'}]}>
                    {t('companion.startConversation')}
                  </Txt>
                )}
                {participantDirect &&
                  detail?.myParticipationStatus === 'REJECTED' && (
                    <ParticipantRequestCard item={detail} onFind={findOthers} />
                  )}
                {!isGroup &&
                  own &&
                  currentParticipant?.status === 'REJECTED' && (
                    <OrganizerRequestCard
                      item={detail}
                      person={currentParticipant}
                    />
                  )}
                {messages.map((message, index) => {
                  const senderProfile =
                    senderProfiles[String(message.senderUserId)] ??
                    peekChatProfile(message.senderUserId);
                  const mine =
                    userId != null && message.senderUserId != null
                      ? String(message.senderUserId) === String(userId)
                      : message.mine === true ||
                        (!!myEmail && senderProfile?.email === myEmail);
                  const previous = messages[index - 1];
                  const sameMinuteAndSender = other => {
                    if (
                      !other ||
                      !message.sentAt ||
                      !other.sentAt ||
                      message.messageType === 'SYSTEM' ||
                      other.messageType === 'SYSTEM'
                    ) {
                      return false;
                    }
                    const sender =
                      message.senderUserId ?? (message.mine ? userId : null);
                    const otherSender =
                      other.senderUserId ?? (other.mine ? userId : null);
                    const minute = Math.floor(+kstDate(message.sentAt) / 60000);
                    const otherMinute = Math.floor(
                      +kstDate(other.sentAt) / 60000,
                    );
                    return (
                      sender != null &&
                      otherSender != null &&
                      String(sender) === String(otherSender) &&
                      Number.isFinite(minute) &&
                      minute === otherMinute
                    );
                  };
                  const showTime = !sameMinuteAndSender(messages[index + 1]);
                  const continuesGroup = sameMinuteAndSender(previous);
                  const day = displayDate(message.sentAt);
                  const unread = message.unreadMemberCount || 0;
                  const isSearchTarget =
                    anchorMessageId != null &&
                    message.messageId != null &&
                    String(message.messageId) === String(anchorMessageId);
                  return (
                    <View
                      key={message.messageId || message.clientMessageId}
                      onLayout={event => {
                        messagePositions.current[String(message.messageId)] =
                          event.nativeEvent.layout.y;
                        if (isSearchTarget) {
                          anchorY.current = event.nativeEvent.layout.y;
                          scroll.current?.scrollTo({
                            y: anchorY.current,
                            animated: true,
                          });
                        }
                      }}
                      style={[
                        {gap: 8, marginTop: continuesGroup ? -8 : 0},
                        isSearchTarget && s.info,
                      ]}>
                      {(!previous || displayDate(previous.sentAt) !== day) && (
                        <Txt style={[s.small, {textAlign: 'center'}]}>
                          {day}
                        </Txt>
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
                        {!mine &&
                          (continuesGroup ? (
                            <View style={{width: 28}} />
                          ) : message.senderUserId != null &&
                            senderProfiles[String(message.senderUserId)] ===
                              undefined ? (
                            <SkeletonPulse
                              decorative
                              style={{alignSelf: 'flex-start'}}>
                              <SkeletonBlock
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                }}
                              />
                            </SkeletonPulse>
                          ) : (
                            <Avatar
                              size={28}
                              uri={
                                senderProfiles[String(message.senderUserId)]
                                  ?.profileImageUrl
                              }
                              style={{alignSelf: 'flex-start'}}
                            />
                          ))}
                        {mine && (unread > 0 || showTime) && (
                          <View
                            style={{
                              alignItems: 'flex-end',
                              gap: 2,
                              paddingBottom: 2,
                              flexShrink: 1,
                            }}>
                            {unread > 0 && (
                              <Txt
                                accessibilityLabel={countText(
                                  t,
                                  'companion.unread',
                                  unread,
                                )}
                                style={{
                                  fontSize: 11,
                                  lineHeight: 14,
                                  color: C.primary_orange,
                                }}>
                                {formatNumber(unread)}
                              </Txt>
                            )}
                            {showTime && (
                              <Txt
                                style={{
                                  fontSize: 10,
                                  lineHeight: 14,
                                  color: C.grayscale_500,
                                }}>
                                {displayTime(message.sentAt)}
                              </Txt>
                            )}
                          </View>
                        )}
                        <View style={{maxWidth: '78%', gap: 4}}>
                          {!mine && isGroup && !continuesGroup && (
                            <Txt style={s.small}>
                              {String(message.senderUserId) ===
                              String(detail?.organizerId)
                                ? t('companion.group.organizerSender', {
                                    name:
                                      senderProfiles[
                                        String(message.senderUserId)
                                      ]?.displayName ||
                                      message.senderName ||
                                      t('companion.memberId', {
                                        id: message.senderUserId,
                                      }),
                                  })
                                : senderProfiles[String(message.senderUserId)]
                                    ?.displayName ||
                                  message.senderName ||
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
                        {!mine && (showTime || (isGroup && unread > 0)) && (
                          <View
                            style={{
                              alignItems: 'flex-start',
                              gap: 2,
                              paddingBottom: 2,
                              flexShrink: 1,
                            }}>
                            {isGroup && unread > 0 && (
                              <Txt
                                accessibilityLabel={countText(
                                  t,
                                  'companion.unread',
                                  unread,
                                )}
                                style={{
                                  fontSize: 11,
                                  lineHeight: 14,
                                  color: C.primary_orange,
                                }}>
                                {formatNumber(unread)}
                              </Txt>
                            )}
                            {showTime && (
                              <Txt
                                style={{
                                  fontSize: 10,
                                  lineHeight: 14,
                                  color: C.grayscale_500,
                                }}>
                                {displayTime(message.sentAt)}
                              </Txt>
                            )}
                          </View>
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
              {photoBusy && (
                <SkeletonPulse
                  title={t('companion.chatPhoto.uploading')}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    alignItems: 'flex-end',
                  }}>
                  <SkeletonBlock
                    style={{width: 200, height: 160, borderRadius: 8}}
                  />
                </SkeletonPulse>
              )}
              {searchOpen ? (
                <View
                  style={[
                    s.row,
                    {
                      paddingHorizontal: 20,
                      paddingTop: 12,
                      paddingBottom:
                        Platform.OS === 'ios'
                          ? keyboardVisible
                            ? 12
                            : 30
                          : 12,
                      borderTopWidth: 1,
                      borderColor: C.grayscale_100,
                    },
                  ]}>
                  <View style={s.grow}>
                    {searchBusy ? (
                      <SkeletonPulse>
                        <SkeletonBlock
                          style={{width: 120, height: 16, borderRadius: 4}}
                        />
                      </SkeletonPulse>
                    ) : (
                      <Txt style={s.small}>
                        {searchSubmitted
                          ? searchResults.length
                            ? t('companion.chatSearch.position', {
                                current: searchIndex + 1,
                                count: searchResults.length,
                              })
                            : t('companion.noResults')
                          : t('companion.chatSearch.hint')}
                      </Txt>
                    )}
                  </View>
                  {[
                    [
                      SearchUpIcon,
                      'companion.chatSearch.older',
                      searchBusy ||
                        !searchResults.length ||
                        (searchIndex === searchResults.length - 1 &&
                          !searchMore),
                      () => {
                        if (searchIndex < searchResults.length - 1) {
                          setSearchIndex(value => value + 1);
                        } else {
                          runSearch(true);
                        }
                      },
                    ],
                    [
                      SearchDownIcon,
                      'companion.chatSearch.newer',
                      searchBusy || searchIndex <= 0,
                      () => setSearchIndex(value => value - 1),
                    ],
                  ].map(([Icon, label, disabled, onPress]) => (
                    <TouchableOpacity
                      key={label}
                      accessibilityLabel={t(label)}
                      accessibilityState={{disabled}}
                      disabled={disabled}
                      onPress={onPress}
                      style={{
                        padding: 10,
                        borderRadius: 24,
                        backgroundColor: C.grayscale_100,
                        opacity: disabled ? 0.35 : 1,
                      }}>
                      <Icon width={24} height={24} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    s.row,
                    {
                      paddingHorizontal: 16,
                      paddingTop: 10,
                      paddingBottom:
                        Platform.OS === 'ios'
                          ? keyboardVisible
                            ? 10
                            : 30
                          : 12,
                      borderTopWidth: 1,
                      borderColor: C.grayscale_100,
                    },
                  ]}>
                  <TouchableOpacity
                    accessibilityLabel={t('companion.attach')}
                    style={s.iconButton}
                    disabled={
                      connection !== 'CONNECTED' || photoBusy || !!photoFrame
                    }
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
                    onFocus={() =>
                      scroll.current?.scrollToEnd({animated: true})
                    }
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
              )}
            </View>
          </ResourceBody>
        )}
        <Modal
          visible={attachment}
          onDismiss={() => {
            const camera = pendingPhotoPicker.current;
            pendingPhotoPicker.current = null;
            if (camera !== null) {
              sendPhoto(camera);
            }
          }}
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
                  [PhotoIcon, 'companion.photo', () => openPhotoPicker(false)],
                  [CameraIcon, 'companion.camera', () => openPhotoPicker(true)],
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
                    accessibilityRole="button"
                    accessibilityLabel={t(label)}
                    style={[
                      s.soft,
                      s.grow,
                      {
                        flexBasis: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 8,
                        paddingVertical: 16,
                        gap: 8,
                      },
                    ]}
                    onPress={onPress}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Icon width={24} height={Icon === CameraIcon ? 20 : 24} />
                    </View>
                    <Txt
                      style={{
                        textAlign: 'center',
                        width: '100%',
                        minHeight: 22,
                      }}>
                      {t(label)}
                    </Txt>
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
        {acceptFeedback.modal}
      </KeyboardAvoidingView>
    </View>
  );
}

function ChatNotificationIcon({width, height}) {
  return (
    <View
      style={{width, height, alignItems: 'center', justifyContent: 'center'}}>
      <BellIcon width={18} height={18} />
    </View>
  );
}

export function CompanionChatInfo({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const myId = useUserStore(state => state.userProfile?.userId);
  const myEmail = useUserStore(state => state.userProfile?.email);
  const feedback = useFeedback({horizontalButtons: true});
  const task = useTask(feedback, () => resource.reload());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const resource = useChatResource(async () => {
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
            const data = await getChatProfile(visible[index].userId);
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
                    Icon={NoticePinIcon}
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
                  Icon={ChatNotificationIcon}
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
      {feedback.modal}
    </View>
  );
}

export function CompanionChatNotice({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({time: '', place: '', body: ''});
  const resource = useChatResource(
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
                : () => {
                    if (Platform.OS !== 'web' && navigation.popTo) {
                      navigation.popTo('CompanionChat', {roomId, companionId});
                    } else {
                      replaceCompanionScreen(navigation, 'CompanionChat', {roomId, companionId});
                    }
                  }
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

export function CompanionChatSearch({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [results, setResults] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [more, setMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  useEffect(
    () =>
      subscribeChatReset(() => {
        setQuery('');
        setSubmitted('');
        setResults([]);
        setCursor(null);
        setMore(false);
        setNextCursor(null);
      }),
    [],
  );
  const resource = useChatResource(
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

export function CompanionChatPlace({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const {t} = useTranslation();
  const {roomId, companionId} = route.params || {};
  const feedback = useFeedback();
  const task = useTask(feedback);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const placeFocused = useIsFocused();
  const placeActive = useRef(placeFocused);
  placeActive.current = placeFocused;
  const pendingSend = useRef(null);
  useEffect(() => {
    if (!placeFocused) {
      pendingSend.current?.();
    }
    return () => pendingSend.current?.();
  }, [placeFocused]);
  useEffect(
    () =>
      subscribeChatReset(() => {
        pendingSend.current?.();
        frame.current = null;
        setResults([]);
        setSelected(null);
      }),
    [],
  );
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
          let finished = false;
          const timer = setTimeout(() => {
            finished = true;
            ws?.close();
            reject(new Error('SEND_TIMEOUT'));
          }, 12000);
          const finish = error => {
            if (finished) {
              return;
            }
            finished = true;
            pendingSend.current = null;
            clearTimeout(timer);
            ws?.close();
            error ? reject(error) : resolve();
          };
          pendingSend.current = () => finish(new Error('CHAT_SESSION_CHANGED'));
          chatApi
            .connect(
              roomId,
              event => {
                if (
                  event.type === 'ACK' &&
                  event.payload?.clientMessageId ===
                    frame.current.clientMessageId
                ) {
                  finish();
                } else if (event.type === 'ERROR') {
                  finish(new Error('SEND_FAILED'));
                }
              },
              () => finish(new Error('SEND_FAILED')),
              () => ws?.send(JSON.stringify(frame.current)),
              () => !finished && placeActive.current,
            )
            .then(connected => {
              ws = connected;
              if (finished) {
                ws?.close(1000);
              }
            })
            .catch(finish);
        });
      },
      () => {
        if (Platform.OS !== 'web' && navigation.popTo) {
          navigation.popTo('CompanionChat', {roomId, companionId});
        } else {
          replaceCompanionScreen(navigation, 'CompanionChat', {roomId, companionId});
        }
      },
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
      {selected && (
        <Txt style={s.small}>{t('companion.group.selectedPlace')}</Txt>
      )}
      {selected && (
        <View style={s.soft}>
          <CompanionPlaceMap
            key={`${selected.latitude}:${selected.longitude}`}
            latitude={selected.latitude}
            longitude={selected.longitude}
          />
          <PinIcon width={24} height={24} />
          <Title>{selected.placeName}</Title>
          <Txt style={s.small}>
            {trimJejuPrefix(selected.roadAddress || selected.address)}
          </Txt>
        </View>
      )}
      <Txt>{t('companion.group.searchResults')}</Txt>
      {task.busy && !results.length && !selected && (
        <SkeletonPulse title={t('companion.loading')} style={{gap: 16}}>
          {[0, 1, 2].map(index => (
            <View key={index} style={[s.soft, {gap: 12}]}>
              <SkeletonBlock style={{width: '65%', height: 20, borderRadius: 4}} />
              <SkeletonBlock style={{width: '90%', height: 16, borderRadius: 4}} />
            </View>
          ))}
        </SkeletonPulse>
      )}
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


      {feedback.modal}
    </GroupForm>
  );
}

export function CompanionChatShared({route}) {
  const {t} = useTranslation();
  const {roomId} = route.params || {};
  const [cursor, setCursor] = useState(null);
  const [messages, setMessages] = useState([]);
  useEffect(
    () =>
      subscribeChatReset(() => {
        setMessages([]);
        setCursor(null);
      }),
    [],
  );
  const resource = useChatResource(
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

export function CompanionChatReport({navigation: screenNavigation, route}) {
  const navigation = useCompanionNavigation(screenNavigation);
  const back = useCompanionBack();
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
  const members = useChatResource(async () => {
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
          const profile = await getChatProfile(member.userId);
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
          back();
        }}>
        <CheckIcon width={24} height={24} />
        <Txt style={s.small}>{t('companion.group.reportDoneBody')}</Txt>
        <Action
          label={t('common.confirm')}
          onPress={() => {
            setDone(false);
            back();
          }}
        />
      </GroupDialog>
      {feedback.modal}
    </View>
  );
}
