import useUserStore from '@stores/userStore';
import {Alert} from 'react-native';
import {navigationRef} from './navigationService';
import {showErrorModal} from './loginModalHub';

import userEmployApi from './api/userEmployApi';
import userMeetApi from '@utils/api/userMeetApi';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import postApi from './api/postApi';

/**
 * 통합 즐겨찾기 토글
 * @param {'recruit'|'party'|'guesthouse'} type
 * @param {number} id
 * @param {boolean} isLiked
 * @param {Function|null} setList
 * @param {Function|null} setItem
 */

export const toggleFavorite = async ({
  type,
  id,
  isLiked,
  setList = null,
  setItem = null,
}) => {
  // 타입별 API 매핑
  const apiMap = {
    recruit: {
      like: () => userEmployApi.addLikeRecruitById(id),
      unlike: () => userEmployApi.deleteLikeRecruitById(id),
      listIdKey: 'recruitId',
    },
    party: {
      like: () => userMeetApi.addFavorite(id),
      unlike: () => userMeetApi.removeFavorite(id),
      listIdKey: 'partyId',
    },
    guesthouse: {
      like: () => userGuesthouseApi.favoriteGuesthouse(id),
      unlike: () => userGuesthouseApi.unfavoriteGuesthouse(id),
      listIdKey: 'guesthouseId',
    },
    post: {
      like: () => postApi.likeIntro(id),
      unlike: () => postApi.unlikeIntro(id),
      listIdKey: 'introId',
    },
  };
  const conf = apiMap[type];
  if (!conf) {
    console.warn(`Unsupported type: ${type}`);
    return;
  }

  const role = useUserStore.getState().userRole;

  // UI 먼저 토글
  if (setList) {
    const idKey = conf.listIdKey;
    setList(prev =>
      prev?.map(item =>
        String(item?.[idKey]) === String(id)
          ? {...item, isLiked: !isLiked}
          : item,
      ),
    );
  }
  if (setItem) {
    setItem(prev => {
      if (!prev) return prev;

      const hasIs = Object.prototype.hasOwnProperty.call(prev, 'isLiked');
      const hasLd = Object.prototype.hasOwnProperty.call(prev, 'liked');

      // 우선순위: isLiked → liked, 둘 다 없으면 isLiked 새로 생성
      const key = hasIs ? 'isLiked' : hasLd ? 'liked' : 'isLiked';
      const curr = Boolean(prev[key]); // 없으면 false로 간주
      return {...prev, [key]: !curr};
    });
  }

  try {
    // API 호출 (로그인 아니어도 시도 -> 실패 시 catch)
    if (isLiked) await conf.unlike();
    else await conf.like();
  } catch (error) {
    // 실패하면 롤백
    if (setList) {
      const idKey = conf.listIdKey;
      setList(prev =>
        prev?.map(item =>
          String(item?.[idKey]) === String(id) ? {...item, isLiked} : item,
        ),
      );
    }
    if (setItem) {
      setItem(prev => ({...prev, isLiked}));
    }

    // 로그인 유도 (role 확인, 401/403 등)
    const status = error?.response?.status;
    if (role !== 'USER' || status === 401 || status === 403) {
      showErrorModal({
        message: '좋아요 기능은\n 로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => {
          if (navigationRef.isReady?.()) navigationRef.navigate('Login');
        },
        onPress2: () => {},
      });
      return;
    }

    console.warn(
      'toggleFavorite error',
      error?.response?.data || error?.message,
    );
    Alert.alert('좋아요 처리 중 오류가 발생했습니다.');
  }
};
