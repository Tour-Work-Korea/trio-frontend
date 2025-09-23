import React, {useEffect, useState} from 'react';

import useUserStore from '@stores/userStore';
import ErrorModal from '@components/modals/ErrorModal';
import {useNavigation} from '@react-navigation/native';

const My = () => {
  const userRole = useUserStore(state => state.userRole);
  const [errorModal, setErrorModal] = useState({visible: false});
  const navigation = useNavigation();

  useEffect(() => {
    if (userRole === 'HOST') {
      navigation.replace('HostMyPage');
    } else if (userRole === 'USER') {
      navigation.replace('UserMyPage');
    } else {
      setErrorModal({visible: true});
    }
  }, [userRole, navigation]);

  return (
    <>
      <ErrorModal
        visible={errorModal.visible}
        title={'로그인 후 이용할 수 있어요'}
        buttonText={'로그인하기'}
        buttonText2={'취소'}
        onPress={() => navigation.navigate('Login')}
        onPress2={() => navigation.navigate('MainTabs', {screen: '홈'})}
      />
    </>
  );
};

export default My;
