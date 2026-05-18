import React from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import GuesthouseIcon from '@assets/images/navigation_black.svg';
import GuesthouseIconFilled from '@assets/images/navigation_fill_black.svg';
import HomeIcon from '@assets/images/wa_home_gray.svg';
import HomeIconFilled from '@assets/images/wa_home_orange.svg';
import MeetIcon from '@assets/images/event_black.svg';
import MeetIconFilled from '@assets/images/event_black_filled.svg';
import MyIcon from '@assets/images/person_black.svg';
import MyIconFilled from '@assets/images/person_black_filled.svg';
import CommunityIcon from '@assets/images/community_black.svg';
import CommunityIconFilled from '@assets/images/community_black_filled.svg';

import {Community, Guesthouse, Home, Meet, My} from '@screens';
import {getDefaultGuesthouseListParams} from '@constants/guesthouseDefaults';
import {showErrorModal} from '@utils/loginModalHub';
import useUserStore from '@stores/userStore';

const Tab = createBottomTabNavigator();

const BottomTabs = () => (
  <View style={styles.container}>
    <Tab.Navigator
      initialRouteName="홈"
      backBehavior="initialRoute"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          const iconProps = {width: 24, height: 24};
          const map = {
            지도: focused ? GuesthouseIconFilled : GuesthouseIcon,
            커뮤니티: focused ? CommunityIconFilled : CommunityIcon,
            홈: focused ? HomeIconFilled : HomeIcon,
            콘텐츠: focused ? MeetIconFilled : MeetIcon,
            마이: focused ? MyIconFilled : MyIcon,
          };

          const Icon = map[route.name];
          return <Icon {...iconProps} />;
        },
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
        tabBarStyle: [
          Platform.OS === 'android' ? styles.tabBarAndroid : styles.tabBarIOS,
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarSafeAreaInset: {bottom: 0},
        headerShown: false,
      })}>
      <Tab.Screen name="홈" component={Home} />
      <Tab.Screen name="커뮤니티" component={Community} />
      <Tab.Screen
        name="지도"
        component={Guesthouse}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('지도', {
              screen: 'GuesthouseList',
              params: getDefaultGuesthouseListParams(),
            });
          },
        })}
      />
      <Tab.Screen name="콘텐츠" component={Meet} />
      <Tab.Screen
        name="마이"
        component={My}
        listeners={({navigation}) => ({
          tabPress: e => {
            const role = useUserStore.getState().userRole;
            if (role !== 'USER') {
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
        })}
      />
    </Tab.Navigator>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarAndroid: {
    position: 'relative',
    backgroundColor: COLORS.grayscale_0,
    height: 64,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
  },
  tabBarIOS: {
    position: 'relative',
    backgroundColor: COLORS.grayscale_0,
    height: 84,
    paddingTop: 6,
    paddingBottom: 18,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  label: {
    color: COLORS.grayscale_500,
    marginTop: 2,
  },
  labelFocused: {
    color: COLORS.grayscale_900,
  },
});

export default BottomTabs;
