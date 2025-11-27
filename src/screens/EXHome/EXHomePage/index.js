import React from 'react';
import {View, Text} from 'react-native';
import Logo from '@assets/images/logo_orange.svg'; // svg이미지 불러오기
import styles from './Home.styles';
import ButtonScarlet from '@components/ButtonScarlet'; // 버튼 컴포넌트 불러오기
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header'; //헤더 컴포넌트 불러오기
import {FONTS} from '@constants/fonts'; // 폰트 크기, 볼드 지정해놓은거 불러오기
import {tryLogout} from '@utils/auth/login';
import Loading from '@components/Loading';

const EXHomePage = () => {
  return (
    <View style={styles.container}>
      {/* 헤더 불러오기 2가지 */}
      <Header />
      {/* <Header title="지원자 조회" /> */}
      <View style={styles.body}>
        <Logo width={100} height={100} /> {/* svg 이미지 */}
        <Text style={[FONTS.fs_18_medium, styles.text]}>
          이 홈 화면은 예시 화면
        </Text>{' '}
        {/* 텍스트 크기,볼드 지정한거 사용 예시 */}
        <Text style={FONTS.fs_14_semibold}>14pt Semibold 텍스트</Text>
        <Text style={FONTS.fs_18_regular}>18pt regular 텍스트</Text>
        <ButtonWhite title="딥링크 테스트" to="EXDeeplink" />
        <ButtonWhite title="이벤트 화면 테스트" to="MeetMain" />
        {/* 버튼 컴포넌트 사용 */}
      </View>
    </View>
  );
};

export default EXHomePage;
