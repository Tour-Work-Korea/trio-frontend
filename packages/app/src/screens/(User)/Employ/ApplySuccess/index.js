import {useCallback, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';

import LogoBlue from '@assets/images/wa_blue_apply.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const ApplySuccess = () => {
  const navigation = useNavigation();

  const navigateStaffRecruit = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: '커뮤니티',
              params: {tab: 'staff'},
            },
          },
        ],
      }),
    );
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateStaffRecruit();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigateStaffRecruit]);

  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoBlue width={168} />
          <View>
            <Text style={styles.titleText}>지원서 제출 완료!</Text>
            <Text style={styles.titleText}>다른 스탭 공고도 둘러볼까요?</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  signin: {
    backgroundColor: COLORS.grayscale_0,
    flex: 1,
    color: COLORS.grayscale_900,
  },
  logoParent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
    gap: 20,
  },
  titleText: {
    ...FONTS.fs_20_bold,
    textAlign: 'center',
  },
  view: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 0,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
});
export default ApplySuccess;
