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

      // 유저 프로필
      userProfile: {
        name: '',
        photoUrl: null,
        phone: '',
        email: '',
        mbti: '',
        instagramId: '',
      },
      // 사장 프로필
      hostProfile: {
        name: '',
        photoUrl: null,
        phone: '',
        email: '',
        businessNum: '',
      },

      // 토큰 저장 함수
      setTokens: ({accessToken, refreshToken}) =>
        set({accessToken, refreshToken}),

      // 사용자 역할 저장 함수
      setUserRole: role => set({userRole: role}),

      // 유저 프로필 저장 함수
      setUserProfile: profile => set({userProfile: profile}),

      //사장 프로필 저장 함수
      setHostProfile: profile => set({hostProfile: profile}),

      // 전체 초기화 (로그아웃 시 사용)
      clearUser: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userRole: null,
          userProfile: {
            name: '',
            photoUrl: null,
            phone: '',
            email: '',
            mbti: '',
            instagramId: '',
          },
          hostProfile: {
            name: '',
            photoUrl: null,
            phone: '',
            email: '',
            businessNum: '',
          },
        }),
    }),
    {
      name: 'user-store', // AsyncStorage에 저장될 key
      storage: createJSONStorage(() => AsyncStorage), // 사용할 저장소
    },
  ),
);

export default useUserStore;
