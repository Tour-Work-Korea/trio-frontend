import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import MyGuesthouseIcon from '@assets/images/host-my-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/host-reservation-check-icon.svg';
import ReservationCalendarIcon from '@assets/images/host-reservation-calendar-icon.svg';
import RoomManageIcon from '@assets/images/host-room-manage-icon.svg';
import NotificationSettingIcon from '@assets/images/host-notification-setting-icon.svg';
import GuesthouseReviewIcon from '@assets/images/host-guesthouse-review-icon.svg';
import TodayGuesthouseIcon from '@assets/images/host-today-guesthouse-icon.svg';
import StoreApplyIcon from '@assets/images/host-store-apply-icon.svg';
import MyPostIcon from '@assets/images/host-my-post-icon.svg';
import ApplicationCheckIcon from '@assets/images/host-application-check-icon.svg';
import MyMeetIcon from '@assets/images/host-my-meet-icon.svg';
import MeetReservationCheckIcon from '@assets/images/host-meet-reservation-icon.svg';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import SettingIcon from '@assets/images/settings_gray.svg';
import BellIcon from '@assets/images/bell_gray.svg';

import styles from './HostMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import Avatar from '@components/Avatar';

const HostMyPage = () => {
  const navigation = useNavigation();

  //저장된 호스트 프로필 호출-> 추후 수정
  const host = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedProfileId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(host?.guesthouseProfiles) && host.guesthouseProfiles.length > 0
        ? host.guesthouseProfiles.map((item, index) => ({
            id: String(item.guesthouseId ?? `guesthouse-${index}`),
            name: item.guesthouseName || '이름 없음',
            photoUrl: item.profileImageUrl || null,
            noticeCount: 0,
          }))
        : [],
    [host?.guesthouseProfiles],
  );

  const selectedGuesthouse = useMemo(
    () =>
      guesthouseProfiles.find(item => item.id === selectedProfileId) ||
      guesthouseProfiles[0] ||
      null,
    [guesthouseProfiles, selectedProfileId],
  );
  const selectedGuesthousePhotoUrl = selectedGuesthouse?.photoUrl ?? null;

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      setSelectedProfileId(null);
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => profile.id === selectedProfileId,
    );
    if (!hasSelected) {
      setSelectedProfileId(guesthouseProfiles[0].id);
    }
  }, [guesthouseProfiles, selectedProfileId, setSelectedProfileId]);

  const renderHeaderContent = () => (
    <>
      <TouchableOpacity
        style={styles.profileEditButton}
        onPress={() => navigation.navigate('HostProfilePage', {isHostMy: true})}
      >
        <Text style={[FONTS.fs_14_medium, styles.profileEditBtnText]}>미리보기</Text>
      </TouchableOpacity>

      {/* 프로필 영역 */}
      <View style={styles.profileWrap}>
        <View style={styles.profileImageWrap}>
          <Avatar uri={selectedGuesthousePhotoUrl} size={80} iconSize={32} />
        </View>

        <Text style={[FONTS.fs_18_semibold, styles.guesthouseNameText]}>
          {selectedGuesthouse?.name || '게하 이름'}
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.view}>
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          style={styles.guesthouseSelectorButton}
          onPress={() => setIsGuesthouseListVisible(prev => !prev)}
          activeOpacity={0.8}>
          <Text
            style={[FONTS.fs_16_semibold, styles.topBarTitle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedGuesthouse?.name}
          </Text>
          {isGuesthouseListVisible ? (
            <ChevronUp width={16} height={16} />
          ) : (
            <ChevronDown width={16} height={16} />
          )}
        </TouchableOpacity>

        <View style={styles.topBarRightIcons}>
          <TouchableOpacity
            style={styles.topBarIconButton}
            onPress={() => {}}
            activeOpacity={0.8}>
            <BellIcon width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarIconButton}
            onPress={() => navigation.navigate('Setting')}
            activeOpacity={0.8}>
            <SettingIcon width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.outContainer}>
        {/* 사장 프로필 */}
        <View style={[styles.headerBg, styles.headerBgFallback]}>
          {renderHeaderContent()}
        </View>

        <View style={styles.container}>
          <View style={styles.bottomSection}>
            {/* 예약·객실 관리 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                예약・객실 관리
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={ReservationCheckIcon}
                  label="예약 관리"
                  onPress={() => navigation.navigate('MyGuesthouseReservation')}
                />
                <MenuItem
                  IconComponent={ReservationCalendarIcon}
                  label="예약 캘린더"
                  onPress={() => navigation.navigate('MyGuesthouseReservationCalendar')}
                />
                <MenuItem
                  IconComponent={RoomManageIcon}
                  label="방 관리"
                  onPress={() => navigation.navigate('MyRoomManage')}
                />
                <MenuItem
                  IconComponent={NotificationSettingIcon}
                  label="고객 알림 설정"
                  onPress={() => navigation.navigate('CustomerNotificationSettings')}
                />
              </View>
            </View>

            {/* 숙박 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                숙소 관리
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyGuesthouseIcon}
                  label="나의 게스트하우스"
                  onPress={() => navigation.navigate('MyGuesthouseList')}
                />
                <MenuItem
                  IconComponent={GuesthouseReviewIcon}
                  label="리뷰 관리"
                  onPress={() => navigation.navigate('MyGuesthouseReview')}
                />
                <MenuItem
                  IconComponent={StoreApplyIcon}
                  label="입점 정보·계약"
                  onPress={() => navigation.navigate('StoreRegisterList')}
                />
              </View>
            </View>

            {/* 노출・홍보 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                노출・홍보
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={TodayGuesthouseIcon}
                  label="오늘의 게스트하우스"
                  onPress={() => navigation.navigate('MyGuesthouseIntroList')}
                />
              </View>
            </View>

            {/* 이벤트 섹션 */}
            <View style={[styles.section]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                이벤트 관리
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyMeetIcon}
                  label="나의 이벤트"
                  onPress={() => navigation.navigate('MyMeetList')}
                />
                <MenuItem
                  IconComponent={MeetReservationCheckIcon}
                  label="이벤트 예약 관리"
                  // onPress={() => navigation.navigate('ApplicantList')}
                />
              </View>
            </View>

            {/* 공고 섹션 */}
            <View style={[styles.section]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                알바 관리
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyPostIcon}
                  label="나의 공고"
                  onPress={() => navigation.navigate('MyRecruitmentList')}
                />
                <MenuItem
                  IconComponent={ApplicationCheckIcon}
                  label="지원자 관리"
                  onPress={() => navigation.navigate('ApplicantList')}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {isGuesthouseListVisible ? (
        <Pressable
          style={styles.profileListOverlay}
          onPress={() => setIsGuesthouseListVisible(false)}>
          <Pressable
            style={styles.profileListWrap}
            onPress={event => event.stopPropagation()}>
            <GuesthouseProfileList
              items={guesthouseProfiles}
              selectedId={selectedProfileId}
              onSelect={item => {
                setSelectedProfileId(item.id);
                setIsGuesthouseListVisible(false);
              }}
              onAdd={() => {
                setIsGuesthouseListVisible(false);
              }}
            />
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
};

const MenuItem = ({IconComponent, label, onPress}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.menuItemIconContainer}>
        <IconComponent width={20} height={20} />
      </View>
      <Text style={[styles.menuLabel, FONTS.fs_16_regular]}>{label}</Text>
    </View>
    <RightArrow width={24} height={24} />
  </TouchableOpacity>
);

export default HostMyPage;
