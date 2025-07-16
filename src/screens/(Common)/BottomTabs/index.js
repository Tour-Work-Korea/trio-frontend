import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
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

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          const iconProps = {
            width: 24,
            height: 24,
          };

          let IconComponent;

          switch (route.name) {
            case '게하':
              IconComponent = focused ? GuesthouseIconFilled : GuesthouseIcon;
              break;
            case '채용':
              IconComponent = focused ? EmployIconFilled : EmployIcon;
              break;
            case '홈':
              IconComponent = focused ? HomeIconFilled : HomeIcon;
              break;
            case '모임':
              IconComponent = focused ? MeetIconFilled : MeetIcon;
              break;
            case '마이':
              IconComponent = focused ? MyIconFilled : MyIcon;
              break;
          }

          return (
            <View style={styles.iconWrapper}>
              <IconComponent {...iconProps} />
              <Text style={[FONTS.fs_12_medium, styles.label]}>
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}>
      <Tab.Screen 
        name="게하" 
        component={Guesthouse} 
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // 기본 동작 막기
            e.preventDefault();

            // '게하' 스택에서 GuesthouseSearch로 이동
            navigation.navigate('게하', {
              screen: 'GuesthouseSearch',
            });
          },
        })}
      />
      <Tab.Screen name="채용" component={Employ} />
      <Tab.Screen name="홈" component={Home} />
      <Tab.Screen name="모임" component={Meet} />
      <Tab.Screen name="마이" component={My} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.grayscale_0,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
  },
});

export default BottomTabs;
