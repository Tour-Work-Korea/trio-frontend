import {View, Text, StyleSheet} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import LogoBlue from '@assets/images/wa_blue_apply.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {useNavigation} from '@react-navigation/native';

const ApplySuccess = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoBlue width={168} />
          <View>
            <Text style={styles.titleText}>지원서 제출 완료!</Text>
            <Text style={styles.titleText}>다른 게하들도 둘러볼까요?</Text>
          </View>
        </View>
        <ButtonScarlet
          title="더 둘러볼래요"
          onPress={() => navigation.navigate('MainTabs', {screen: '채용'})}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  signin: {
    backgroundColor: COLORS.white,
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
