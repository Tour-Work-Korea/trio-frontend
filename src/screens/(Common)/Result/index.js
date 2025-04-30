import {View, Text, SafeAreaView} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './Result.styles';
import {FONTS} from '@constants/fonts';

//text: 화면 중앙에 뜨는 메세지
//to: 하단에 버튼 클릭 시 이동할 페이지
//성공이나, 실패 메세지 띄우는 화면입니다.
// 다음은 사용 예시입니다.
// navigation.navigate('Result', {
//     text: '성공적으로 가입되었습니다!',
//     to: 'ExHome',
//   });

const Result = ({route}) => {
  const {text = '성공', to = ''} = route.params || {};
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={[styles.body]}>
        <Text style={FONTS.fs_h1_bold}>{text}</Text>
        <Text style={FONTS.fs_h1_bold}>{to}</Text>
      </View>
      <ButtonScarlet title="다음" to={to} />
    </SafeAreaView>
  );
};
export default Result;
