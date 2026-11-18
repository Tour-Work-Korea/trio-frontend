import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import useUserStore from '@stores/userStore';
import {COLORS as C} from '@constants/colors';
import UpIcon from '@assets/images/chevron_up_gray.svg';
import DownIcon from '@assets/images/chevron_down_gray.svg';
import PersonIcon from '@assets/images/person20_blue.svg';
import CheckIcon from '@assets/images/check_orange.svg';
import CalendarIcon from '@assets/images/calendar_400gray.svg';
import {ChatSchedule} from './participantChatUi';
import {countText} from './model';
import {
  SkeletonPulse,
  SkeletonBlock,
} from '../../screens/_components/ContentSkeleton';
import useNoticeExpanded from './useNoticeExpanded';
import {Action, Txt, styles as s} from './ui';

export default function ChatParticipationBanner({roomId, ...props}) {
  const userId = useUserStore(state => state.userProfile?.userId);
  const email = useUserStore(state => state.userProfile?.email);
  const accountId = email?.trim()
    ? `email:${email.trim().toLowerCase()}`
    : userId;
  const storageKey =
    accountId != null && roomId != null
      ? `chat-participation-expanded:v1:${accountId}:${roomId}`
      : null;
  return (
    <ParticipationBanner
      key={storageKey ?? 'unidentified'}
      storageKey={storageKey}
      {...props}
    />
  );
}

function ParticipationBanner({
  storageKey,
  title,
  accepted = false,
  item,
  own,
  busy,
  onWithdraw,
  onAccept,
  onReject,
}) {
  const {t} = useTranslation();
  const {expanded, ready, toggle} = useNoticeExpanded(storageKey);
  const ToggleIcon = expanded ? UpIcon : DownIcon;
  const StatusIcon = accepted ? CheckIcon : PersonIcon;
  if (!ready) {
    return (
      <SkeletonPulse
        title={t('companion.loading')}
        style={{marginHorizontal: 20, marginBottom: 8}}>
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: C.grayscale_200,
            borderRadius: 14,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}>
          <SkeletonBlock style={{width: 28, height: 28, borderRadius: 8}} />
          <SkeletonBlock style={{height: 16, width: '65%', borderRadius: 4}} />
        </View>
      </SkeletonPulse>
    );
  }
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 8,
        maxHeight: 280,
        flexShrink: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.grayscale_200,
        backgroundColor: C.grayscale_0,
        overflow: 'hidden',
      }}>
      <TouchableOpacity
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={t(
          expanded
            ? 'companion.collapseParticipation'
            : 'companion.expandParticipation',
        )}
        accessibilityState={{expanded}}
        style={{
          minHeight: 52,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: accepted ? C.secondary_orange : C.secondary_blue,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <StatusIcon width={18} height={18} />
        </View>
        <Txt
          numberOfLines={expanded ? 2 : 1}
          ellipsizeMode="tail"
          style={[
            s.grow,
            {
              fontSize: 13,
              lineHeight: 20,
              fontWeight: '600',
              color: C.grayscale_700,
            },
          ]}>
          {title}
        </Txt>
        <ToggleIcon width={18} height={18} />
      </TouchableOpacity>
      {expanded && (
        <ScrollView
          style={{flexGrow: 0, flexShrink: 1}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{paddingHorizontal: 14, paddingBottom: 14, gap: 12}}>
            <View style={{height: 1, backgroundColor: C.grayscale_100}} />
            {(!own || accepted) && (
              <Txt style={[s.small, {lineHeight: 20}]}>
                {t(
                  accepted
                    ? 'companion.acceptedBody'
                    : 'companion.chat.waitingBody',
                )}
              </Txt>
            )}
            <View
              style={{
                backgroundColor: C.grayscale_100,
                padding: 10,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <CalendarIcon width={16} height={16} />
              <View style={s.grow}>
                <ChatSchedule item={item} includePlace={accepted} />
                {own && (
                  <Txt style={s.small}>
                    {countText(
                      t,
                      'companion.chat.confirmedNow',
                      item.confirmedCount + 1,
                    )}
                  </Txt>
                )}
              </View>
            </View>
            {!accepted && (!own || item.status === 'OPEN') && (
              <View style={{flexDirection: 'row', gap: 8}}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{disabled: busy}}
                  disabled={busy}
                  onPress={own ? onReject : onWithdraw}
                  style={{
                    flex: 1,
                    minHeight: 40,
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: C.grayscale_200,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: busy ? 0.5 : 1,
                  }}>
                  <Txt style={{fontSize: 13, color: C.grayscale_600}}>
                    {t(own ? 'companion.reject' : 'companion.withdraw')}
                  </Txt>
                </TouchableOpacity>
                {own && (
                  <Action
                    style={{flex: 2}}
                    label={t('companion.accept')}
                    disabled={busy}
                    onPress={onAccept}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
