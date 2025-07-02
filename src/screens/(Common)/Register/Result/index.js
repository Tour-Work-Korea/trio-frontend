import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ButtonScarlet from '@components/ButtonScarlet';
import styles from '../RegisterIntro/Intro.styles';
import LogoBlue from '@assets/images/logo_blue_smile.svg';
import {FONTS} from '@constants/fonts';

const Result = ({route}) => {
  const {
    to = '',
    buttonTitle = '시작하기',
    nickname,
    role,
  } = route.params || {};
  return (
    <SafeAreaView style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoBlue width={168} />
          <View>
            <Text style={styles.titleText}>반가워요, {nickname}님!</Text>
            <Text style={styles.titleText}>
              workaway
              {role === 'USER'
                ? '하러 가볼까요?'
                : '와 함께 해주셔서 감사합니다.'}
            </Text>
          </View>
        </View>
        <ButtonScarlet title={buttonTitle} to={to} />
      </View>
    </SafeAreaView>
  );
};
export default Result;
