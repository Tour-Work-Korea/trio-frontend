import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {COLORS as C} from '@constants/colors';
import PinIcon from '@assets/images/pin_notice_black.svg';
import UpIcon from '@assets/images/chevron_up_gray.svg';
import DownIcon from '@assets/images/chevron_down_gray.svg';
import {Txt, styles as s} from './ui';
import useUserStore from '@stores/userStore';
import useNoticeExpanded from './useNoticeExpanded';
import {parseNotice} from './groupChatUi';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';
import {
  SkeletonPulse,
  SkeletonBlock,
} from '../../screens/_components/ContentSkeleton';

export default function ChatNoticeBanner({roomId, ...props}) {
  const userId = useUserStore(state => state.userProfile?.userId);
  const email = useUserStore(state => state.userProfile?.email);
  // The profile API may omit userId; chat already uses email in that case.
  const accountId = email?.trim()
    ? `email:${email.trim().toLowerCase()}`
    : userId;
  const storageKey =
    accountId != null && roomId != null
      ? `chat-notice-expanded:v1:${accountId}:${roomId}`
      : null;
  const previousStorageKey =
    userId != null && roomId != null
      ? `chat-notice-expanded:v1:${userId}:${roomId}`
      : null;
  return (
    <NoticeBanner
      key={storageKey ?? 'unidentified'}
      storageKey={storageKey}
      previousStorageKey={previousStorageKey}
      {...props}
    />
  );
}

function NoticeBanner({content, onPress, storageKey, previousStorageKey}) {
  const {t} = useTranslation();
  const {expanded, ready, toggle} = useNoticeExpanded(
    storageKey,
    previousStorageKey,
  );
  const ToggleIcon = expanded ? UpIcon : DownIcon;
  const notice = parseNotice(content);
  const collapsedTitle = (
    notice.place ? trimJejuPrefix(notice.place) : notice.body
  )
    .replace(/\s+/g, ' ')
    .trim();
  if (!ready) {
    return (
      <SkeletonPulse
        title={t('companion.loading')}
        style={{marginHorizontal: 20, marginBottom: 8}}>
        <SkeletonBlock style={{height: 46, width: '100%', borderRadius: 10}} />
      </SkeletonPulse>
    );
  }
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 8,
        paddingLeft: 12,
        backgroundColor: C.secondary_yellow,
        borderWidth: 1,
        borderColor: C.secondary_brown,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onPress}
        style={{
          flex: 1,
          minHeight: 44,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <PinIcon width={16} height={16} />
        {expanded ? (
          <Txt style={[s.small, s.grow, {color: C.grayscale_600}]}>
            {content}
          </Txt>
        ) : (
          <View
            style={[
              s.grow,
              {flexDirection: 'row', alignItems: 'center', gap: 8},
            ]}>
            {!!notice.time && (
              <Txt
                numberOfLines={1}
                style={[s.small, {flexShrink: 0, color: C.grayscale_600}]}>
                {notice.time}
              </Txt>
            )}
            <Txt
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[s.small, s.grow, {color: C.grayscale_700}]}>
              {collapsedTitle}
            </Txt>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t(
          expanded ? 'companion.collapseNotice' : 'companion.expandNotice',
        )}
        accessibilityState={{expanded}}
        onPress={toggle}
        style={{
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ToggleIcon width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
}
