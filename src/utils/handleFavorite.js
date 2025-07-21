import useUserStore from '@stores/userStore';
import userEmployApi from './api/userEmployApi';
import {Alert} from 'react-native';

const toggleLikeRecruit = async ({
  id,
  isLiked,
  setRecruitList = null,
  setRecruit = null,
  showErrorModal = null,
}) => {
  try {
    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      showErrorModal?.({
        title: '로그인이 필요해요',
        message: '좋아요 기능은\n로그인 후 사용해주세요',
        buttonText: '확인',
      });
      return;
    }

    if (isLiked) {
      await userEmployApi.deleteLikeRecruitById(id);
    } else {
      await userEmployApi.addLikeRecruitById(id);
    }
    if (setRecruitList != null) {
      setRecruitList(prev =>
        prev?.map(item =>
          item.recruitId === id ? {...item, isLiked: !isLiked} : item,
        ),
      );
    }
    if (setRecruit != null) {
      setRecruit(prev => {
        return {...prev, liked: !isLiked};
      });
    }
  } catch (error) {
    Alert.alert('좋아요 처리 중 오류가 발생했습니다.');
  }
};

export {toggleLikeRecruit};
