import {Alert} from 'react-native';
import useUserStore from '@stores/userStore';

export const verifyUserPermission = async () => {
  const role = useUserStore.getState().userRole;
  return role === 'USER';
};

export const verifyHostPermission = async () => {
  const role = useUserStore.getState().userRole;
  return role === 'HOST';
};

export const checkUserPermission = async navigation => {
  const hasPermission = await verifyUserPermission();

  if (!hasPermission) {
    Alert.alert('권한 없음', '일반 회원 로그인 후 이용해주세요', [
      {
        text: '확인',
        onPress: () => navigation.goBack(),
      },
      {
        text: '로그인하러 가기',
        onPress: () => navigation.navigate('EXLogin'),
      },
    ]);
  }
  return true;
};

export const checkHostPermission = async navigation => {
  const hasPermission = await verifyHostPermission();

  if (!hasPermission) {
    Alert.alert('권한 없음', '사장님 로그인 후 이용해주세요', [
      {
        text: '확인',
        onPress: () => navigation.goBack(),
      },
      {
        text: '로그인하러 가기',
        onPress: () => navigation.navigate('EXLogin'),
      },
    ]);
  }
};
