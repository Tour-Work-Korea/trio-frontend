import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import Modal from '@components/modals/AdaptiveModal';
import DatePicker from '@components/Employ/DatePicker';
import AppImage from '@components/AppImage';
import communityApi from '@utils/api/communityApi';
import useUserStore from '@stores/userStore';
import {COLORS as C} from '@constants/colors';
import {formatNumber} from '@utils/localeFormat';
import ChatIcon from '@assets/images/chat_bubbles_black.svg';
import ChatBlueIcon from '@assets/images/chat_bubbles_blue.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';
import CloseIcon from '@assets/images/x_gray.svg';
import {
  companionApi,
  companionEnabled,
  newIntentKey,
  uploadPostImages,
} from './api';
import {
  ACTIVITIES,
  REGIONS,
  countText,
  dateKey,
  displayDate,
  displayTime,
  hasAction,
  kstDate,
  roomForAccess,
  validateDraft,
} from './model';
import {
  Action,
  Chip,
  CompanionCard,
  Field,
  LoginGate,
  Meta,
  Person,
  ResourceBody,
  Screen,
  Status,
  Title,
  Txt,
  styles as s,
  useFeedback,
  useResource,
  useTask,
} from './ui';

const goCompanions = navigation =>
  navigation.navigate('MainTabs', {
    screen: '커뮤니티',
    params: {tab: 'COMPANION'},
  });
export function ChatEntry({navigation, label}) {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      style={s.iconButton}
      accessibilityLabel={label || t('companion.inbox')}
      onPress={() => navigation.navigate('CompanionInbox')}>
      <ChatIcon width={24} height={24} />
    </TouchableOpacity>
  );
}
export function CompanionList({isActive = true}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [status, setStatus] = useState('OPEN');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const resource = useResource(
    async isCurrent => {
      if (!isActive) {
        return null;
      }
      const result = (
        await companionApi.list({
          status,
          ...(region ? {regionCode: region} : {}),
          page,
          size: 20,
        })
      ).data;
      if (!isCurrent()) {
        return null;
      }
      setItems(previous =>
        page
          ? [
              ...previous.filter(
                item =>
                  !result.content.some(
                    next => next.companionId === item.companionId,
                  ),
              ),
              ...result.content,
            ]
          : result.content,
      );
      return result;
    },
    [status, region, page, isActive],
  );
  return (
    <View style={s.screen}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{flexGrow: 0}}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          gap: 8,
        }}>
        {['OPEN', 'CLOSED'].map(value => (
          <Chip
            key={value}
            label={t(`companion.status.${value}`)}
            selected={status === value}
            onPress={() => {
              setPage(0);
              setStatus(value);
            }}
          />
        ))}
        <Chip
          label={t('common.all')}
          selected={!region}
          onPress={() => {
            setPage(0);
            setRegion('');
          }}
        />
        {REGIONS.map(value => (
          <Chip
            key={value}
            label={t(`companion.region.${value}`)}
            selected={region === value}
            onPress={() => {
              setPage(0);
              setRegion(value);
            }}
          />
        ))}
      </ScrollView>
      <ResourceBody resource={resource}>
        {items.length ? (
          items.map(item => (
            <CompanionCard
              key={item.companionId}
              item={item}
              onPress={() =>
                navigation.navigate('CompanionDetail', {
                  companionId: item.companionId,
                })
              }
            />
          ))
        ) : (
          <View style={s.empty}>
            <ChatBlueIcon width={48} height={48} />
            <Title>{t('companion.listEmpty')}</Title>
            <Txt style={s.muted}>{t('companion.listEmptyBody')}</Txt>
          </View>
        )}
        {resource.data?.last === false && (
          <Action
            secondary
            label={t('companion.loadMore')}
            disabled={resource.loading}
            onPress={() => setPage(value => value + 1)}
          />
        )}
      </ResourceBody>
    </View>
  );
}

export function CompanionDetail({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const resource = useResource(
    async () => (await companionApi.detail(id)).data,
    [id],
  );
  const item = resource.data;
  const post = useResource(
    async () =>
      item?.postId
        ? (await communityApi.getPostDetail(item.postId)).data
        : null,
    [item?.postId],
  );
  const own =
    String(item?.organizerId) ===
    String(useUserStore(state => state.userProfile?.userId));
  const openChat = () =>
    navigation.navigate('CompanionChatAccess', {companionId: id});
  const inquire = () => {
    if (!useUserStore.getState().accessToken) {
      navigation.navigate('Login');
      return;
    }
    task.run(`inquire:${id}`, key => companionApi.inquire(id, key), openChat);
  };
  return (
    <Screen
      title={t('companion.title')}
      right={<ChatEntry navigation={navigation} />}
      footer={
        item && (
          <>
            {item.status === 'OPEN' && !own && (
              <Action
                label={t(
                  hasAction(item, 'OPEN_INQUIRY') ||
                    !useUserStore.getState().accessToken
                    ? 'companion.chat'
                    : 'companion.goChat',
                )}
                disabled={
                  task.busy ||
                  (!hasAction(item, 'OPEN_INQUIRY') &&
                    ![
                      'INQUIRING',
                      'PENDING',
                      'ACCEPTED',
                      'WITHDRAWN',
                      'REJECTED',
                    ].includes(item.myParticipationStatus) &&
                    !!useUserStore.getState().accessToken)
                }
                onPress={
                  hasAction(item, 'OPEN_INQUIRY') ||
                  !useUserStore.getState().accessToken
                    ? inquire
                    : openChat
                }
              />
            )}
            {own && (
              <Action
                label={t('companion.manage')}
                onPress={() =>
                  navigation.navigate('CompanionManage', {companionId: id})
                }
              />
            )}
            {item.status === 'CLOSED' &&
              (own || item.myParticipationStatus === 'ACCEPTED') &&
              item.confirmedCount > 0 && (
                <Action label={t('companion.groupChat')} onPress={openChat} />
              )}
          </>
        )
      }>
      <ResourceBody resource={resource}>
        {item && (
          <>
            <View style={s.wrap}>
              <Status item={item} />
              <Txt style={s.small}>
                {t(`companion.activity.${item.activityType}`, {
                  defaultValue: item.activityType,
                })}
              </Txt>
            </View>
            {post.data?.author?.nickname && (
              <Person
                name={post.data.author.nickname}
                uri={post.data.author.profileImageUrl}
                subtitle={t('companion.organizer')}
              />
            )}
            <Title>{item.title}</Title>
            <Txt>{item.description}</Txt>
            {post.data?.images?.map((image, index) => (
              <AppImage
                key={image.imageId || index}
                uri={image.imageUrl}
                style={{width: '100%', height: 220, borderRadius: 12}}
              />
            ))}
            <View style={s.soft}>
              <Title>{t('companion.info')}</Title>
              <Meta item={item} total />
            </View>
            {item.status === 'OPEN' && (
              <View style={s.soft}>
                <Txt>
                  {t('companion.closesAt', {
                    date: displayDate(item.closeAt),
                    time: displayTime(item.closeAt),
                  })}
                </Txt>
                <Txt style={s.small}>{t('companion.closesEarly')}</Txt>
              </View>
            )}
            {item.myParticipationStatus && (
              <Txt style={s.blue}>
                {t(`companion.participation.${item.myParticipationStatus}`)}
              </Txt>
            )}
            {item.status === 'CLOSED' && !item.confirmedCount && (
              <Txt style={s.muted}>{t('companion.noGroup')}</Txt>
            )}
          </>
        )}
      </ResourceBody>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionWrite({navigation, route}) {
  const {t} = useTranslation();
  const editing = route.params?.companion;
  const feedback = useFeedback();
  const task = useTask(feedback);
  const showError = feedback.error;
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(() => ({
    title: editing?.title || '',
    description: editing?.description || '',
    activityType: editing?.activityType || '',
    regionCode: editing?.regionCode || '',
    meetingPlace: editing?.meetingPlace || '',
    startDate: editing?.startDate || '',
    endDate: editing?.endDate || '',
    capacity: editing?.capacity || 1,
  }));
  const [images, setImages] = useState([]);
  const [editReady, setEditReady] = useState(!editing);
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null);
  const [dateField, setDateField] = useState(null);
  const transaction = useRef(null);
  const changed = Object.keys(draft).some(key => draft[key] !== editing?.[key]);
  const set = (key, value) =>
    setDraft(previous => ({...previous, [key]: value}));
  useEffect(() => {
    let disposed = false;
    if (editing) {
      communityApi
        .getPostDetail(editing.postId)
        .then(({data}) => {
          if (disposed) {
            return;
          }
          // Do not infer S3 keys, sizes or versions from display URLs.
          if (
            !data.updatedAt ||
            !Array.isArray(data.images) ||
            data.images.some(image => !image.objectKey || !image.fileSizeBytes)
          ) {
            throw new Error('EDIT_IMAGES_UNAVAILABLE');
          }
          setImages(
            data.images.map(image => ({
              ...image,
              uri: image.imageUrl,
              isExisting: true,
            })),
          );
          setExpectedUpdatedAt(data.updatedAt);
          setEditReady(true);
        })
        .catch(error => {
          if (!disposed) {
            showError(error);
          }
        });
    }
    return () => {
      disposed = true;
    };
  }, [editing, showError]);
  const addImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5 - images.length,
      });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        throw new Error('IMAGE_PICK_FAILED');
      }
      const assets = await Promise.all(
        (result.assets || []).slice(0, 5 - images.length).map(async asset => {
          const resized = await ImageResizer.createResizedImage(
            asset.uri,
            1600,
            1600,
            'JPEG',
            90,
          );
          return {
            uri: resized.uri,
            fileName: `companion-${newIntentKey()}.jpg`,
            fileSize: resized.size,
            type: 'image/jpeg',
          };
        }),
      );
      if (
        assets.some(
          asset => !asset.fileSize || asset.fileSize > 20 * 1024 * 1024,
        )
      ) {
        feedback.inform(t('companion.imageLimit'));
        return;
      }
      setImages(previous => [...previous, ...assets]);
    } catch (error) {
      feedback.error(error);
    }
  };
  const submit = (confirmedClose = false) => {
    if (
      editing?.confirmedCount > 0 &&
      draft.capacity === editing.confirmedCount &&
      !confirmedClose
    ) {
      feedback.confirm(
        t('companion.closeTitle'),
        t('companion.closeBody'),
        t('companion.closeAndGroup'),
        () => submit(true),
      );
      return;
    }
    const invalid = validateDraft(draft, new Date(), !editing);
    if (invalid) {
      feedback.inform(t(invalid));
      return;
    }
    const snapshot = JSON.stringify({draft, images});
    task.run(
      snapshot,
      async key => {
        const body = {
          ...draft,
          title: draft.title.trim(),
          description: draft.description.trim(),
          meetingPlace: draft.meetingPlace.trim() || null,
        };
        if (editing) {
          if (!editReady) {
            throw new Error('EDIT_IMAGES_UNAVAILABLE');
          }
          const uploaded = await uploadPostImages(editing.postId, images);
          const {startDate, endDate, ...updateBody} = body;
          return (
            await companionApi.update(editing.companionId, {
              ...updateBody,
              expectedUpdatedAt,
              images: uploaded,
            })
          ).data;
        }
        // Once a draft is created, retry only its upload/publish. Never create a second draft after an upload failure.
        if (transaction.current && transaction.current.snapshot !== snapshot) {
          throw new Error('DRAFT_PENDING');
        }
        if (!transaction.current) {
          transaction.current = {
            snapshot,
            draftKey: key,
            publishKey: newIntentKey(),
          };
        }
        const tx = transaction.current;
        if (!tx.ids) {
          try {
            tx.ids = (await companionApi.draft(body, tx.draftKey)).data;
          } catch (error) {
            if (error.response?.status >= 400 && error.response?.status < 500) {
              transaction.current = null;
            }
            throw error;
          }
        }
        if (!tx.uploaded) {
          tx.uploaded = await uploadPostImages(tx.ids.postId, images);
        }
        return (
          await companionApi.publish(
            tx.ids.companionId,
            tx.uploaded,
            tx.publishKey,
          )
        ).data;
      },
      result =>
        navigation.replace(
          result.status === 'CLOSED' && result.confirmedCount > 0
            ? 'CompanionChatAccess'
            : 'CompanionDetail',
          {
            companionId: result.companionId,
          },
        ),
    );
  };
  const next = () => {
    const invalid = validateDraft({...draft, description: '0123456789'});
    if (invalid && !editing) {
      feedback.inform(t(invalid));
      return;
    }
    if (!draft.title.trim() || !draft.activityType || !draft.regionCode) {
      feedback.inform(t('companion.validation'));
      return;
    }
    setStep(2);
  };
  const back = () => {
    if (step === 2 && !task.busy) {
      setStep(1);
      return;
    }
    if (changed || images.length) {
      feedback.confirm(
        t('companion.discardTitle'),
        t('companion.discardBody'),
        t('companion.discard'),
        () => navigation.goBack(),
      );
    } else {
      navigation.goBack();
    }
  };
  return (
    <Screen
      title={t(editing ? 'companion.edit' : 'companion.write')}
      onBack={back}
      footer={
        <Action
          label={t(
            step === 1
              ? 'common.next'
              : editing
              ? 'companion.save'
              : 'companion.publish',
          )}
          disabled={
            task.busy ||
            !editReady ||
            !companionEnabled ||
            !useUserStore.getState().accessToken
          }
          onPress={step === 1 ? next : () => submit()}
        />
      }>
      <LoginGate navigation={navigation}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}>
          <View style={s.between}>
            <Txt style={s.orange}>
              {t(step === 1 ? 'companion.stepSchedule' : 'companion.stepIntro')}
            </Txt>
            <Txt style={s.small}>{t('companion.stepValue', {step})}</Txt>
          </View>
          <View style={{height: 3, backgroundColor: C.grayscale_200}}>
            <View
              style={{
                height: 3,
                width: step === 1 ? '50%' : '100%',
                backgroundColor: C.primary_orange,
              }}
            />
          </View>
          {step === 1 ? (
            <>
              <Field
                label={t('companion.titleLabel')}
                value={draft.title}
                onChangeText={value => set('title', value)}
                maxLength={120}
                editable={!task.busy && !transaction.current}
                placeholder={t('companion.titlePlaceholder')}
              />
              <Txt>{t('companion.activityLabel')}</Txt>
              <View style={s.wrap}>
                {ACTIVITIES.map(activity => (
                  <Chip
                    key={activity}
                    label={t(`companion.activity.${activity}`)}
                    selected={draft.activityType === activity}
                    onPress={() =>
                      !editing?.confirmedCount &&
                      !task.busy &&
                      !transaction.current &&
                      set('activityType', activity)
                    }
                  />
                ))}
              </View>
              <Txt>{t('companion.regionLabel')}</Txt>
              <View style={s.wrap}>
                {REGIONS.map(region => (
                  <Chip
                    key={region}
                    label={t(`companion.region.${region}`)}
                    selected={draft.regionCode === region}
                    onPress={() =>
                      !editing?.confirmedCount &&
                      !task.busy &&
                      !transaction.current &&
                      set('regionCode', region)
                    }
                  />
                ))}
              </View>
              <Field
                label={t('companion.placeLabel')}
                placeholder={t('companion.placePlaceholder')}
                value={draft.meetingPlace}
                maxLength={255}
                editable={!task.busy && !transaction.current}
                onChangeText={value => set('meetingPlace', value)}
              />
              <Txt>{t('companion.dateLabel')}</Txt>
              <View style={s.row}>
                {['startDate', 'endDate'].map(key => (
                  <View style={s.grow} key={key}>
                    <Action
                      secondary
                      label={
                        draft[key]
                          ? displayDate(draft[key])
                          : t(`companion.${key}`)
                      }
                      disabled={!!editing || task.busy || !!transaction.current}
                      onPress={() => setDateField(key)}
                    />
                  </View>
                ))}
              </View>
              <Txt style={s.small}>
                {t(editing ? 'companion.dateLocked' : 'companion.deadlineRule')}
              </Txt>
              <Txt>{t('companion.capacityLabel')}</Txt>
              <View style={s.between}>
                <TouchableOpacity
                  disabled={
                    draft.capacity <=
                      Math.max(1, editing?.confirmedCount || 0) ||
                    task.busy ||
                    !!transaction.current
                  }
                  onPress={() => set('capacity', draft.capacity - 1)}
                  style={s.iconButton}
                  accessibilityLabel={t('companion.decrease')}>
                  <MinusIcon width={24} height={24} />
                </TouchableOpacity>
                <Title>
                  {countText(t, 'companion.people', draft.capacity)}
                </Title>
                <TouchableOpacity
                  disabled={
                    draft.capacity >= 100 || task.busy || !!transaction.current
                  }
                  onPress={() => set('capacity', draft.capacity + 1)}
                  style={s.iconButton}
                  accessibilityLabel={t('companion.increase')}>
                  <PlusIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
              {!!editing?.confirmedCount && (
                <Txt style={s.small}>{t('companion.acceptedEditRule')}</Txt>
              )}
            </>
          ) : (
            <>
              <Field
                label={t('companion.descriptionLabel')}
                placeholder={t('companion.descriptionPlaceholder')}
                value={draft.description}
                onChangeText={value => set('description', value)}
                maxLength={1000}
                multiline
                editable={!task.busy && !transaction.current}
              />
              <Txt style={s.small}>
                {t('companion.descriptionCount', {
                  count: formatNumber(draft.description.length),
                })}
              </Txt>
              <Txt>{t('companion.photosLabel')}</Txt>
              <View style={s.wrap}>
                {images.map((image, index) => (
                  <View key={image.uri} style={{width: 84, height: 84}}>
                    <AppImage
                      uri={image.uri}
                      style={{width: 84, height: 84, borderRadius: 8}}
                    />
                    <TouchableOpacity
                      accessibilityLabel={t('companion.removePhoto', {
                        index: index + 1,
                      })}
                      disabled={task.busy || !!transaction.current}
                      onPress={() =>
                        setImages(previous =>
                          previous.filter((_, position) => position !== index),
                        )
                      }
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        backgroundColor: C.grayscale_0,
                        borderRadius: 12,
                      }}>
                      <CloseIcon width={24} height={24} />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity
                    style={[s.soft, {alignItems: 'center'}]}
                    onPress={addImages}
                    disabled={task.busy || !!transaction.current}
                    accessibilityLabel={t('companion.addPhoto')}>
                    <PlusIcon width={24} height={24} />
                    <Txt style={s.small}>
                      {t('companion.photoCount', {count: images.length})}
                    </Txt>
                  </TouchableOpacity>
                )}
              </View>
              <Txt style={s.small}>{t('companion.imageLimit')}</Txt>
              {transaction.current && (
                <Txt style={s.small}>{t('companion.publishRetry')}</Txt>
              )}
            </>
          )}
        </ScrollView>
      </LoginGate>
      <Modal
        visible={!!dateField}
        transparent
        onRequestClose={() => setDateField(null)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 20,
            backgroundColor: C.modal_background,
          }}>
          <DatePicker
            label={t(`companion.${dateField || 'startDate'}`)}
            value={draft[dateField] ? kstDate(draft[dateField]) : undefined}
            minDate={
              dateField === 'endDate' && draft.startDate
                ? kstDate(draft.startDate)
                : new Date(
                    Date.now() +
                      (new Date().getTime() >=
                      new Date(
                        `${dateKey(new Date())}T18:00:00+09:00`,
                      ).getTime()
                        ? 2
                        : 1) *
                        86400000,
                  )
            }
            onChange={date => {
              const value = dateKey(date);
              setDraft(previous => ({
                ...previous,
                [dateField]: value,
                ...(dateField === 'startDate' &&
                (!previous.endDate || previous.endDate < value)
                  ? {endDate: value}
                  : {}),
              }));
              setDateField(null);
            }}
          />
          <Action
            secondary
            label={t('common.cancel')}
            onPress={() => setDateField(null)}
          />
        </View>
      </Modal>
      {feedback.modal}
    </Screen>
  );
}

export function MyCompanions({navigation}) {
  const {t} = useTranslation();
  const [role, setRole] = useState('ORGANIZER');
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const token = useUserStore(state => state.accessToken);
  const resource = useResource(
    async isCurrent => {
      if (!token) {
        return {last: true};
      }
      const result = (await companionApi.mine({role, page, size: 20})).data;
      // /me summaries do not include participation status: hydrate participant cards.
      const cards =
        role === 'PARTICIPANT'
          ? await Promise.all(
              result.content.map(
                async item =>
                  (
                    await companionApi.detail(item.companionId)
                  ).data,
              ),
            )
          : result.content;
      if (!isCurrent()) {
        return null;
      }
      setItems(previous =>
        page
          ? [
              ...previous,
              ...cards.filter(
                card =>
                  !previous.some(item => item.companionId === card.companionId),
              ),
            ]
          : cards,
      );
      return result;
    },
    [role, page, token],
  );
  return (
    <Screen
      title={t('companion.my')}
      right={<ChatEntry navigation={navigation} />}>
      <LoginGate navigation={navigation}>
        <View style={[s.wrap, {paddingHorizontal: 20}]}>
          {['ORGANIZER', 'PARTICIPANT'].map(value => (
            <Chip
              key={value}
              label={t(`companion.role.${value}`)}
              selected={value === role}
              onPress={() => {
                setPage(0);
                setRole(value);
              }}
            />
          ))}
        </View>
        <ResourceBody resource={resource}>
          <View style={s.soft}>
            <Txt style={s.small}>{t('companion.myDescription')}</Txt>
          </View>
          {items.map(item => (
            <CompanionCard
              key={item.companionId}
              item={item}
              onPress={() =>
                navigation.navigate('CompanionDetail', {
                  companionId: item.companionId,
                })
              }>
              {item.myParticipationStatus && (
                <Txt style={[s.small, s.blue]}>
                  {t(`companion.participation.${item.myParticipationStatus}`)}
                </Txt>
              )}
              <View style={s.wrap}>
                {role === 'ORGANIZER' && (
                  <Action
                    secondary
                    label={t('companion.manage')}
                    onPress={() =>
                      navigation.navigate('CompanionManage', {
                        companionId: item.companionId,
                      })
                    }
                  />
                )}
                <Action
                  label={t(
                    item.status === 'CLOSED'
                      ? 'companion.groupChat'
                      : role === 'ORGANIZER'
                      ? 'companion.inquiries'
                      : 'companion.goChat',
                  )}
                  disabled={
                    item.status === 'CANCELLED' ||
                    (item.status === 'CLOSED' &&
                      (!item.confirmedCount ||
                        (role === 'PARTICIPANT' &&
                          item.myParticipationStatus !== 'ACCEPTED')))
                  }
                  onPress={() =>
                    navigation.navigate(
                      role === 'ORGANIZER' && item.status === 'OPEN'
                        ? 'CompanionManage'
                        : 'CompanionChatAccess',
                      {companionId: item.companionId},
                    )
                  }
                />
              </View>
            </CompanionCard>
          ))}
          {!items.length && (
            <View style={s.empty}>
              <Title>{t('companion.myEmpty')}</Title>
              <Action
                label={t('companion.find')}
                onPress={() => goCompanions(navigation)}
              />
            </View>
          )}
          {resource.data?.last === false && (
            <Action
              secondary
              label={t('companion.loadMore')}
              onPress={() => setPage(value => value + 1)}
              disabled={resource.loading}
            />
          )}
        </ResourceBody>
      </LoginGate>
    </Screen>
  );
}

export function CompanionManage({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const [page, setPage] = useState(0);
  const [people, setPeople] = useState([]);
  const resource = useResource(
    async isCurrent => {
      const [detail, management] = await Promise.all([
        companionApi.detail(id),
        companionApi.management(id, page),
      ]);
      if (!isCurrent()) {
        return null;
      }
      setPeople(previous =>
        page
          ? [
              ...previous,
              ...management.data.applications.content.filter(
                person =>
                  !previous.some(
                    item => item.participationId === person.participationId,
                  ),
              ),
            ]
          : management.data.applications.content,
      );
      return {item: detail.data, ...management.data};
    },
    [id, page],
  );
  const item = resource.data?.item;
  const refresh = () => {
    if (page) {
      setPage(0);
    } else {
      resource.reload();
    }
  };
  const close = () =>
    feedback.confirm(
      t('companion.closeTitle'),
      t(
        item.confirmedCount
          ? 'companion.closeBody'
          : 'companion.closeEmptyBody',
      ),
      t(item.confirmedCount ? 'companion.closeAndGroup' : 'companion.close'),
      () =>
        task.run(
          `close:${id}`,
          key => companionApi.close(id, key),
          result => {
            refresh();
            if (result.data.confirmedCount) {
              navigation.navigate('CompanionChatAccess', {companionId: id});
            } else {
              feedback.inform(
                t('companion.closedDone'),
                t('companion.noGroup'),
              );
            }
          },
        ),
    );
  const decide = async (person, accept) => {
    const perform = () =>
      task.run(
        `decide:${id}:${person.participationId}:${person.requestGeneration}:${accept}`,
        key => companionApi.decide(id, person, accept, key),
        async () => {
          refresh();
          const current = (await companionApi.detail(id)).data;
          if (current.status === 'CLOSED' && current.confirmedCount) {
            navigation.navigate('CompanionChatAccess', {companionId: id});
          }
        },
      );
    if (accept && item.confirmedCount + 1 >= item.capacity) {
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
  return (
    <Screen
      title={t('companion.manage')}
      footer={
        item?.status === 'CLOSED' &&
        item.confirmedCount > 0 && (
          <Action
            label={t('companion.groupChat')}
            onPress={() =>
              navigation.navigate('CompanionChatAccess', {companionId: id})
            }
          />
        )
      }>
      <ResourceBody resource={resource}>
        {item && (
          <>
            <Status item={item} />
            <Title>{item.title}</Title>
            <Meta item={item} />
            <View style={[s.soft, s.between]}>
              {['inquiryCount', 'pendingCount', 'confirmedCount'].map(key => (
                <View key={key} style={[s.grow, {alignItems: 'center'}]}>
                  <Title>
                    {key === 'confirmedCount'
                      ? t('companion.ratio', {
                          confirmed: resource.data.summary[key],
                          capacity: item.capacity,
                        })
                      : formatNumber(resource.data.summary[key])}
                  </Title>
                  <Txt style={s.small}>{t(`companion.metric.${key}`)}</Txt>
                </View>
              ))}
            </View>
            {item.status === 'OPEN' && (
              <View style={s.row}>
                <Action
                  style={s.grow}
                  secondary
                  label={t('companion.edit')}
                  disabled={task.busy}
                  onPress={() =>
                    navigation.navigate('CompanionWrite', {companion: item})
                  }
                />
                <Action
                  style={s.grow}
                  secondary
                  label={t('companion.close')}
                  disabled={task.busy}
                  onPress={close}
                />
              </View>
            )}
            <Title>{t('companion.requests')}</Title>
            {people
              .filter(person => person.status !== 'ACCEPTED')
              .map(person => (
                <View key={person.participationId} style={s.soft}>
                  <Person
                    name={person.userName}
                    subtitle={t(`companion.participation.${person.status}`)}
                  />
                  {item.status === 'OPEN' && person.directRoomId && (
                    <Action
                      secondary
                      label={t('companion.viewConversation')}
                      onPress={() =>
                        navigation.navigate('CompanionChat', {
                          roomId: person.directRoomId,
                          companionId: id,
                          participant: person,
                        })
                      }
                    />
                  )}
                  {item.status === 'OPEN' && person.status === 'PENDING' && (
                    <View style={s.row}>
                      <Action
                        style={s.grow}
                        secondary
                        disabled={task.busy}
                        label={t('companion.reject')}
                        onPress={() => decide(person, false)}
                      />
                      <Action
                        style={s.grow}
                        disabled={task.busy}
                        label={t('companion.accept')}
                        onPress={() => decide(person, true)}
                      />
                    </View>
                  )}
                </View>
              ))}
            <Title>{t('companion.confirmed')}</Title>
            {people
              .filter(person => person.status === 'ACCEPTED')
              .map(person => (
                <Person
                  key={person.participationId}
                  name={person.userName}
                  subtitle={t('companion.participation.ACCEPTED')}
                />
              ))}
            <Txt style={s.small}>{t('companion.peoplePolicy')}</Txt>
            {resource.data.applications.last === false && (
              <Action
                secondary
                label={t('companion.loadMore')}
                disabled={resource.loading}
                onPress={() => setPage(value => value + 1)}
              />
            )}
          </>
        )}
      </ResourceBody>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionChatAccess({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const [state, setState] = useState('PENDING');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    let stopped = false;
    let timer;
    let count = 0;
    async function check() {
      try {
        const [detail, access] = await Promise.all([
          companionApi.detail(id),
          companionApi.access(id),
        ]);
        if (stopped) {
          return;
        }
        const roomId = roomForAccess(access.data, detail.data);
        if (roomId) {
          navigation.replace('CompanionChat', {
            roomId,
            companionId: id,
            mayRejoin: detail.data.status === 'CLOSED',
          });
          return;
        }
        setState(access.data.status);
        if (access.data.status === 'PENDING' && count++ < 8) {
          timer = setTimeout(check, Math.min(1000 * 1.5 ** count, 8000));
        } else if (access.data.status === 'PENDING') {
          setState('TIMEOUT');
        }
      } catch (cause) {
        if (!stopped) {
          setError(cause);
        }
      }
    }
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, attempt, navigation]);
  return (
    <Screen title={t('companion.chat')}>
      <View style={s.empty}>
        <ChatBlueIcon width={48} height={48} />
        <Title>
          {t(error ? 'companion.chatUnavailable' : `companion.access.${state}`)}
        </Title>
        <Txt style={s.muted}>{t('companion.accessHelp')}</Txt>
        <Action
          label={t('companion.retry')}
          onPress={() => {
            setError(null);
            setState('PENDING');
            setAttempt(value => value + 1);
          }}
        />
        <Action
          secondary
          label={t('companion.inbox')}
          onPress={() => navigation.replace('CompanionInbox')}
        />
      </View>
    </Screen>
  );
}
