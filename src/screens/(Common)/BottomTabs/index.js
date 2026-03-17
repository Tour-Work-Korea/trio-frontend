import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import GuesthouseIcon from '@assets/images/search_black.svg';
import GuesthouseIconFilled from '@assets/images/search_fill_black.svg';
import EmployIcon from '@assets/images/work_black.svg';
import EmployIconFilled from '@assets/images/work_black_filled.svg';
import HomeIcon from '@assets/images/wa_home_gray.svg';
import HomeIconFilled from '@assets/images/wa_home_orange.svg';
import MeetIcon from '@assets/images/event_black.svg';
import MeetIconFilled from '@assets/images/event_black_filled.svg';
import MyIcon from '@assets/images/person_black.svg';
import MyIconFilled from '@assets/images/person_black_filled.svg';
import HeartIcon from '@assets/images/heart_black.svg';
import HeartIconFilled from '@assets/images/heart_fill_black.svg';
import Avatar from '@components/Avatar';

import {Guesthouse, Home, Meet, My, Favorite} from '@screens';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const userRole = useUserStore(state => state.userRole);
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedProfileId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedProfileId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile.guesthouseProfiles) &&
      hostProfile.guesthouseProfiles.length > 0
        ? hostProfile.guesthouseProfiles.map((item, index) => ({
            id: String(item.guesthouseId ?? `guesthouse-${index}`),
            name: item.guesthouseName || '이름 없음',
            photoUrl: item.profileImageUrl || null,
            noticeCount: 0,
          }))
        : [],
    [hostProfile.guesthouseProfiles],
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

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="홈"
        backBehavior="initialRoute"
        screenOptions={({route}) => ({
          // 1) 아이콘만 반환
          tabBarIcon: ({focused}) => {
            const iconProps = {width: 24, height: 24};
            const map = {
              검색: focused ? GuesthouseIconFilled : GuesthouseIcon,
              스탭: focused ? EmployIconFilled : EmployIcon,
              찜: focused ? HeartIconFilled : HeartIcon,
              홈: focused ? HomeIconFilled : HomeIcon,
              콘텐츠: focused ? MeetIconFilled : MeetIcon,
              마이: focused ? MyIconFilled : MyIcon,
            };
            const hasHostProfileImage = Boolean(
              typeof selectedGuesthousePhotoUrl === 'string' &&
                selectedGuesthousePhotoUrl.trim() &&
                selectedGuesthousePhotoUrl !== '사진을 추가해주세요',
            );

            if (route.name === '마이' && userRole === 'HOST') {
              return (
                <Avatar
                  uri={selectedGuesthousePhotoUrl}
                  size={28}
                  iconSize={16}
                  style={[
                    styles.hostProfileImage,
                    !hasHostProfileImage && styles.hostProfilePlaceholder,
                    focused && styles.hostProfileImageFocused,
                  ]}
                />
              );
            }

            const Icon = map[route.name];
            return <Icon {...iconProps} />;
          },

          // 2) 내장 라벨 사용 + 스타일링
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.label,
                focused && styles.labelFocused,
              ]}
              numberOfLines={1}
              allowFontScaling={false}>
              {route.name === '마이' && userRole === 'HOST'
                ? '나의 게하'
                : route.name}
            </Text>
          ),

          // 3) 탭바 레이아웃 안정화
          tabBarStyle: [
            Platform.OS === 'android' ? styles.tabBarAndroid : styles.tabBarIOS,
          ],
          tabBarItemStyle: styles.tabBarItem,
          tabBarSafeAreaInset: {bottom: 0},
          headerShown: false,
        })}>
        <Tab.Screen name="홈" component={Home} />
        <Tab.Screen name="콘텐츠" component={Meet} />
        <Tab.Screen
          name="검색"
          component={Guesthouse}
          listeners={({navigation}) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('검색', {screen: 'GuesthouseSearch'});
            },
          })}
        />
        {/* <Tab.Screen name="스탭" component={Employ} /> */}
        <Tab.Screen
          name="찜"
          component={Favorite}
          listeners={() => ({
            tabPress: e => {
              const role = useUserStore.getState().userRole;
              if (role === 'HOST') {
                e.preventDefault();
                showErrorModal({
                  message: '찜 목록은\n유저 계정으로 로그인 후 사용해주세요',
                });
              }
            },
          })}
        />
        <Tab.Screen
          name="마이"
          component={My}
          listeners={({navigation}) => ({
            tabPress: e => {
              const role = useUserStore.getState().userRole;
              if (role !== 'USER' && role !== 'HOST') {
                e.preventDefault();
                showErrorModal({
                  message: '마이페이지는\n 로그인 후 사용해주세요',
                  buttonText2: '취소',
                  buttonText: '로그인하기',
                  onPress: () => navigation.navigate('Login'),
                  onPress2: () => navigation.navigate('MainTabs', {screen: '홈'}),
                });
              }
            },
            tabLongPress: () => {
              const role = useUserStore.getState().userRole;
              if (role === 'HOST') {
                setIsProfileModalVisible(true);
              }
            },
          })}
        />
      </Tab.Navigator>

      <Modal
        visible={isProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsProfileModalVisible(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={event => event.stopPropagation()}>
            <GuesthouseProfileList
              items={guesthouseProfiles}
              selectedId={selectedProfileId}
              onSelect={item => {
                setSelectedProfileId(item.id);
                setIsProfileModalVisible(false);
              }}
              onAdd={() => {
                setIsProfileModalVisible(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarAndroid: {
    position: 'relative',
    backgroundColor: COLORS.grayscale_0,
    height: 64, // 고정 높이
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
  },
  tabBarIOS: {
    position: 'relative',
    height: 92,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  tabBarItem: {
    paddingVertical: 0, // 아이템 자체 여백 제거
  },
  label: {
    marginTop: 2,
    includeFontPadding: false, // Android 폰트 여백 제거
    color: COLORS.grayscale_700,
  },
  labelFocused: {
    color: COLORS.grayscale_900,
  },
  hostProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
  },
  hostProfileImageFocused: {
    borderColor: COLORS.primary_orange,
  },
  hostProfilePlaceholder: {
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContent: {
    width: '100%',
  },
});

export default BottomTabs;
