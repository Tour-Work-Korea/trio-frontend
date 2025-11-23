import React from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import GuesthouseIcon from '@assets/images/guesthouse_black.svg';
import GuesthouseIconFilled from '@assets/images/guesthouse_black_filled.svg';
import EmployIcon from '@assets/images/work_black.svg';
import EmployIconFilled from '@assets/images/work_black_filled.svg';
import HomeIcon from '@assets/images/wa_home_gray.svg';
import HomeIconFilled from '@assets/images/wa_home_orange.svg';
import MeetIcon from '@assets/images/meet_black.svg';
import MeetIconFilled from '@assets/images/meet_black_filled.svg';
import MyIcon from '@assets/images/person_black.svg';
import MyIconFilled from '@assets/images/person_black_filled.svg';

import {Guesthouse, Employ, Home, Meet, My} from '@screens';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      backBehavior="initialRoute"
      screenOptions={({route}) => ({
        // 1) 아이콘만 반환
        tabBarIcon: ({focused}) => {
          const iconProps = {width: 24, height: 24};
          const map = {
            게하: focused ? GuesthouseIconFilled : GuesthouseIcon,
            스탭: focused ? EmployIconFilled : EmployIcon,
            홈: focused ? HomeIconFilled : HomeIcon,
            모임: focused ? MeetIconFilled : MeetIcon,
            마이: focused ? MyIconFilled : MyIcon,
          };
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
            {route.name}
          </Text>
        ),

        // 3) 탭바 레이아웃 안정화
        tabBarStyle: [
          // styles.tabBarBase,
          Platform.OS === 'android' ? styles.tabBarAndroid : styles.tabBarIOS,
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarSafeAreaInset: {bottom: 0}, // SafeArea 중복 방지
        headerShown: false,
      })}>
      <Tab.Screen
        name="게하"
        component={Guesthouse}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('게하', {screen: 'GuesthouseSearch'});
          },
        })}
      />
      <Tab.Screen name="모임" component={Meet} />
      <Tab.Screen name="홈" component={Home} />
      <Tab.Screen name="스탭" component={Employ} />
      <Tab.Screen
        name="마이"
        component={My}
        listeners={({navigation}) => ({
          tabPress: e => {
            const role = useUserStore.getState().userRole;
            if (role !== 'USER' && role !== 'HOST') {
              e.preventDefault();
              showErrorModal({
                message: '마이페이지는\n알바 로그인 후 사용해주세요',
                buttonText2: '취소',
                buttonText: '로그인하기',
                onPress: () => navigation.navigate('Login'),
                onPress2: () => navigation.navigate('MainTabs', {screen: '홈'}),
              });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarAndroid: {
    backgroundColor: COLORS.grayscale_0,
    height: 64, // 고정 높이
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
  },
  tabBarIOS: {
    height: 92,
    paddingTop: 12,
    paddingHorizontal: 36,
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
});

export default BottomTabs;
