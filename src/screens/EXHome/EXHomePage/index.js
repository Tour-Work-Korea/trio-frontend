import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Logo from '@assets/images/logo_orange.svg'; // svg이미지 불러오기
import styles from './Home.styles';
import ButtonScarlet from '@components/ButtonScarlet'; // 버튼 컴포넌트 불러오기
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header'; //헤더 컴포넌트 불러오기
import {FONTS} from '@constants/fonts'; // 폰트 크기, 볼드 지정해놓은거 불러오기
import {tryLogout} from '@utils/auth/login';
import Loading from '@components/Loading';

const EXHomePage = () => {
  /** 로딩창 사용 예시
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 10000);
  }, []);
  if (loading) {
    return <Loading title="로딩 중....!" />;
  }
  */
  return (
    <SafeAreaView style={styles.container}>
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
      </View>
      <ButtonWhite title="딥링크 테스트" to="EXDeeplink" />
      <ButtonScarlet title="회원가입 페이지로 이동" to="Register" />
      <ButtonScarlet
        title="로그아웃"
        onPress={() => {
          tryLogout();
        }}
      />
      <ButtonWhite title="예시 로그인 & 저장 페이지로 이동" to="EXLogin" />
      {/* 버튼 컴포넌트 사용 */}
      <ButtonWhite title="하단바 있는 페이지로 이동" to="BottomTabs" />
    </SafeAreaView>
  );
};

export default EXHomePage;
