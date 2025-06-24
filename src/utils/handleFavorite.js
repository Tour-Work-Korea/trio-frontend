import useUserStore from '@stores/userStore';
import userEmployApi from './api/userEmployApi';
import {Alert} from 'react-native';

const toggleLikeRecruit = async (id, isLiked, setRecruitList = null) => {
  try {
    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      return Alert.alert('로그인 후 이용할 수 있습니다.');
    }
    if (isLiked) {
      await userEmployApi.deleteLikeRecruitById(id);
    } else {
      await userEmployApi.addLikeRecruitById(id);
    }
    if (setRecruitList != null) {
      setRecruitList(prev =>
        prev.map(item =>
          item.recruitId === id ? {...item, isLiked: !isLiked} : item,
        ),
      );
    }
  } catch (error) {
    Alert.alert('좋아요 처리 중 오류가 발생했습니다.');
  }
};

export {toggleLikeRecruit};
