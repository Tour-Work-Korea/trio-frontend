import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import styles from '../RegisterIntro/Intro.styles';
import LogoBlue from '@assets/images/logo_blue_smile.svg';

const Result = ({route}) => {
  const {t} = useTranslation();
  const {
    to = null,
    onPress = null,
    buttonTitle = t('auth.gettingStarted'),
    nickname,
    role,
  } = route.params || {};

  return (
    <View style={styles.signin}>
      <View style={styles.view}>
        <View style={styles.logoParent}>
          <LogoBlue width={168} />
          <View>
            <Text style={styles.titleText}>
              {t('auth.niceToMeetYou')}
              {nickname}
              {t('auth.sir')}
            </Text>
            <Text style={styles.titleText}>
              workaway
              {role === 'USER'
                ? t('auth.shallWeGoDoIt')
                : t('auth.thankYouForJoiningUs')}
            </Text>
          </View>
        </View>
        <ButtonScarlet title={buttonTitle} to={to} onPress={onPress} />
      </View>
    </View>
  );
};
export default Result;
