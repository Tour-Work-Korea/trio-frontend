// (Common)
// 탭
export {default as BottomTabs} from './(Common)/BottomTabs';
// 일자리
export {default as Employ} from './(Common)/BottomTabs/Employ';
export {default as EmployIntro} from './(Common)/BottomTabs/Employ/EmployIntro';
export {default as EmploySearchList} from './(Common)/BottomTabs/Employ/EmploySearchList';
export {default as EmploySearchResult} from './(Common)/BottomTabs/Employ/EmploySearchResult';
export {default as EmployMap} from './(Common)/BottomTabs/Employ/EmployMap';
export {default as EmployDetail} from './(Common)/Employ/EmployDetail';
export {default as ApplySuccess} from './(User)/Employ/ApplySuccess';
// 게하
export {default as Guesthouse} from './(Common)/BottomTabs/Guesthouse';
export {default as GuesthouseDetail} from './(Common)/Guesthouse/GuesthouseDetail';
export {default as GuesthouseList} from './(Common)/BottomTabs/Guesthouse/GuesthouseList';
export {default as GuesthouseMap} from './(Common)/BottomTabs/Guesthouse/GuesthouseMap';
export {default as GuesthouseReview} from './(Common)/BottomTabs/Guesthouse/GuesthouseReview';
export {default as GuesthouseSearch} from './(Common)/BottomTabs/Guesthouse/GuesthouseSearch';
export {default as RoomDetail} from './(Common)/Guesthouse/RoomDetail';
export {default as GuesthousePayment} from './(Common)/Guesthouse/GuesthousePayment';
export {default as GuesthousePaymentSuccess} from './(Common)/Guesthouse/GuesthousePayment/GuesthousePaymentSuccess';
export {default as GuesthouseReservation} from './(Common)/Guesthouse/GuesthouseReservation';
// 홈
export {default as Home} from './(Common)/BottomTabs/Home';
export {default as HomeMain} from './(Common)/BottomTabs/Home/HomeMain';
export {default as PopularGuesthouseList} from './(Common)/BottomTabs/Home/PopularGuesthouseList';
// 동행
export {default as Meet} from './(Common)/BottomTabs/Meet';
export {default as MeetMain} from './(Common)/BottomTabs/Meet/MeetMain';
export {default as MeetSearch} from './(Common)/BottomTabs/Meet/MeetSearch';
export {default as MeetDetail} from './(Common)/Meet/MeetDetail';
export {default as MeetReservation} from './(Common)/Meet/MeetReservation';
export {default as MeetPaymentSuccess} from './(Common)/Meet/MeetPayment/MeetPaymentSuccess';
// 마이페이지
export {default as My} from './(Common)/BottomTabs/My';
export {default as Setting} from './(Common)/Setting';
export {default as Terms} from './(Common)/Setting/Terms';

//로그인, 회원가입
export {default as Register} from './(Common)/Register';
export {default as AgreeDetail} from './(Common)/Register/AgreeDetail';
export {default as EmailCertificate} from './(Common)/Register/EmailCertificate';
export {default as PhoneCertificate} from './(Common)/Register/PhoneCertificate';
export {default as RegisterAgree} from './(Common)/Register/RegisterAgree';
export {default as RegisterIntro} from './(Common)/Register/RegisterIntro';
export {default as Result} from './(Common)/Register/Result';
export {default as Login} from './(Common)/Login';
export {default as LoginIntro} from './(Common)/Login/LoginIntro';
export {default as LoginByEmail} from './(Common)/Login/LoginByEmail';
export {default as VerifyPhone} from './(Common)/Login/VerifyPhone';
export {default as FindIntro} from './(Common)/Login/FindIntro';
export {default as FindId} from './(Common)/Login/FindId';
export {default as FindPassword} from './(Common)/Login/FindPassword';

// (Host)

// 마이 페이지
export {default as HostMyPage} from './(Host)/HostMyPage';
// 프로필
export {default as HostEditProfile} from './(Host)/HostMyPage/HostEditProfile';
//
export {default as HostRegisterInfo} from './(Host)/HostRegisterInfo';
// 게하 목록 & 수정 & 등록
export {default as MyGuesthouseDetail} from './(Host)/Guesthouse/MyGuesthouseDetail';
export {default as MyRoomDetail} from './(Host)/Guesthouse/MyRoomDetail';
export {default as MyGuesthouseList} from './(Host)/Guesthouse/MyGuesthouseList';
export {default as MyGuesthouseEdit} from './(Host)/Guesthouse/MyGuesthouseEdit';
export {default as MyGuesthouseAdd} from './(Host)/Guesthouse/MyGuesthouseAdd';
// 게하 숙박 리뷰
export {default as MyGuesthouseReview} from './(Host)/Guesthouse/MyGuesthouseReview';
// 게하 예약 내역
export {default as MyGuesthouseReservation} from './(Host)/Guesthouse/MyGuesthouseReservation';
export {default as MyGuesthouseReservationStatus} from './(Host)/Guesthouse/MyGuesthouseReservationStatus';
//
export {default as MyRecruitmentDetail} from './(Host)/MyRecruitmentDetail';
export {default as MyRecruitmentList} from './(Host)/MyRecruitmentList';
export {default as RecruitmentForm} from './(Host)/RecruitmentForm';
export {default as ApplicantList} from './(Host)/ApplicantList';
export {default as ApplicantListByRecruit} from './(Host)/ApplicantListByRecruit';

//
export {default as StoreRegister} from './(Host)/StoreRegister';
export {default as StoreRegisterForm1} from './(Host)/StoreRegister/StoreRegisterForm/StoreRegisterForm1';
export {default as StoreRegisterForm2} from './(Host)/StoreRegister/StoreRegisterForm/StoreRegisterForm2';
export {default as StoreRegisterForm} from './(Host)/StoreRegister/StoreRegisterForm';
export {default as StoreRegisterList} from './(Host)/StoreRegister/StoreRegisterList';

// (User)
export {default as ApplicantForm} from './(User)/Employ/ApplicantForm';
export {default as MyApplicantList} from './(User)/UserMyPage/MyApplicantList';
export {default as MyLikeRecruitList} from './(User)/UserMyPage/MyLikeRecruitList';
export {default as ResumeDetail} from './(Common)/Employ/ResumeDetail';
export {default as MyResumeList} from './(User)/UserMyPage/MyResumeList';
export {default as ProfileUpdate} from './(User)/Employ/ProfileUpdate';
// 마이 페이지
export {default as UserMyPage} from './(User)/UserMyPage';
// 프로필
export {default as UserEditProfile} from './(User)/UserMyPage/UserEditProfile';
// 좋아하는 게하 숙박
export {default as UserFavoriteGuesthouse} from './(User)/UserMyPage/UserFavoriteGuesthouse';
// 게하 예약 목록
export {default as UserReservationCheck} from './(User)/UserMyPage/UserReservationCheck';
// 게하 리뷰
export {default as UserGuesthouseReview} from './(User)/UserMyPage/UserGuesthouseReview';
export {default as UserGuesthouseReviewForm} from './(User)/Guesthouse/UserGuesthouseReviewForm';
//
export {default as SocialLogin} from './(User)/UserRegister/SocialLogin';
//
export {default as UserRegisterInfo} from './(User)/UserRegister/UserRegisterInfo';
export {default as UserRegisterProfile} from './(User)/UserRegister/UserRegisterProfile';
// 좋아하는 모임
export {default as UserFavoriteMeet} from './(User)/UserMyPage/UserFavoriteMeet';
// 모임 예약내역
export {default as UserMeetReservationCheck} from './(User)/UserMyPage/UserMeetReservationCheck';

// 예시 화면들
export {default as EXDeeplink} from './EXDeeplink';
export {default as EXHome} from './EXHome';
export {default as EXHomePage} from './EXHome/EXHomePage';
