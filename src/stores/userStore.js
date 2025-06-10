import {create} from 'zustand'; // zustand에서 create로 store 생성
import {persist, createJSONStorage} from 'zustand/middleware'; // 스토어 상태를 localStorage나 AsyncStorage에 저장할 수 있음
import AsyncStorage from '@react-native-async-storage/async-storage'; // 리액트 네이티브에서의 로컬 스토리지 (웹의 localStorage 역할)

const useUserStore = create(
  persist(
    // persist로 상태 유지
    set => ({
      // 초기 상태값
      accessToken: null,
      refreshToken: null,
      userRole: null,

      // 토큰 저장 함수
      setTokens: ({accessToken, refreshToken}) =>
        set({accessToken, refreshToken}),

      // 사용자 역할 저장 함수
      setUserRole: role => set({userRole: role}),

      // 전체 초기화 (로그아웃 시 사용)
      clearUser: () =>
        set({accessToken: null, refreshToken: null, userRole: null}),
    }),
    {
      name: 'user-store', // AsyncStorage에 저장될 key
      storage: createJSONStorage(() => AsyncStorage), // 사용할 저장소
    },
  ),
);

export default useUserStore;
