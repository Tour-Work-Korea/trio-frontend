import React from 'react';
import { StyleSheet, Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '@constants/colors';

import GuesthouseIcon from '@assets/images/Guesthouse.svg';
import EmployIcon from '@assets/images/Employ.svg';
import HomeIcon from '@assets/images/Home.svg';
import PartyIcon from '@assets/images/Party.svg';
import MyIcon from '@assets/images/My.svg';

import {
  Guesthouse,
  Employ,
  Home,
  Party,
  My,
} from '@screens';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const iconProps = {
            width: 32,
            height: 32,
            style: focused ? styles.shadow : null,
          };

          let IconComponent;
          switch (route.name) {
            case '게하':
              IconComponent = GuesthouseIcon;
              break;
            case '채용':
              IconComponent = EmployIcon;
              break;
            case '홈':
              IconComponent = HomeIcon;
              break;
            case '파티':
              IconComponent = PartyIcon;
              break;
            case 'MY':
              IconComponent = MyIcon;
              break;
          }

          return (
            <View style={styles.iconWrapper}>
              <IconComponent {...iconProps} />
              <Text
                style={[
                  styles.label,
                  { color: focused ? COLORS.scarlet : COLORS.gray },
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="게하" component={Guesthouse} />
      <Tab.Screen name="채용" component={Employ} />
      <Tab.Screen name="홈" component={Home} />
      <Tab.Screen name="파티" component={Party} />
      <Tab.Screen name="MY" component={My} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    height: 55,
    paddingTop: 10,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.scarlet,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default BottomTabs;
