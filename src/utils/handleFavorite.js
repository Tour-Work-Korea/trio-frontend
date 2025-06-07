import userEmployApi from './api/userEmployApi';
import {Alert} from 'react-native';

const toggleLikeRecruit = async (id, isLiked, setRecruitList = null) => {
  try {
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
