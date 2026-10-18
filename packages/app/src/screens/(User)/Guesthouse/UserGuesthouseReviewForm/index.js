import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './UserGuesthouseReviewForm.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import {uploadMultiImage} from '@utils/imageUploadHandler';
import ReviewConfirmModal from '@components/modals/UserMy/Guesthouse/ReviewConfirmModal';
import ReviewSuccessModal from '@components/modals/UserMy/Guesthouse/ReviewSuccessModal';
import AppImage from '@components/AppImage';
import userMyApi from '@utils/api/userMyApi';

import StarFilled from '@assets/images/star_filled.svg';
import StarHalf from '@assets/images/star_half.svg';
import StarEmpty from '@assets/images/star_empty.svg';
import PlusImg from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import ReviewPointIcon from '@assets/images/review_point_orange.svg';

const noticeList = [
  i18n.t('guesthouse.anyoneCanViewYourReviewAlongWithYourNicknameAnd'),
  i18n.t('guesthouse.honestReviewsAreOfGreatHelpToGuesthouseGuestsHowever'),
  i18n.t('guesthouse.responsibilityForTheReviewLiesWithTheAuthorAndWalkaway'),
];

const MIN_REVIEW_LENGTH = 10;

const UserGuesthouseReviewForm = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();

  const {
    reviewType,
    guesthouseId,
    reservationId,
    guesthouseName,
    roomName,
    guesthouseAddress,
    checkInFormatted,
    checkOutFormatted,
    partyId,
    partyReservationId,
    partyTitle,
  } = route.params;
  const isPartyReview = reviewType === 'party';
  const [images, setImages] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // 확인 모달
  const [successModalVisible, setSuccessModalVisible] = useState(false); // 성공 모달
  const trimmedReviewLength = reviewText.trim().length;
  const isReviewTooShort =
    trimmedReviewLength > 0 && trimmedReviewLength < MIN_REVIEW_LENGTH;
  const isSubmitDisabled =
    rating === 0 || trimmedReviewLength < MIN_REVIEW_LENGTH;

  // 별점 터치
  const starSize = 40; // 별 아이콘 가로 크기(px)
  const starSpacing = 8; // 별 사이 간격(px)
  const totalStars = 5;
  const [rating, setRating] = useState(0);

  const [containerX, setContainerX] = useState(0);
  const ratingContainerRef = useRef(null);

  // 별점 터치 위치 계산 로직
  const handleRatingFromTouch = touchX => {
    // ratingContainer의 X좌표 기준으로, 터치한 지점이 얼마나 떨어져 있는지 계산
    // containerX: 별점 전체 컨테이너의 화면상 X 좌표
    const relativeX = touchX - containerX;
    // 터치 위치를 기준으로 별의 개수를 계산
    // (별 하나의 크기 + 간격)으로 나누어 몇 번째 별까지 눌렀는지 비율로 구함
    let rawStars = relativeX / (starSize + starSpacing);
    rawStars = Math.max(0, Math.min(rawStars, totalStars));
    // 0.5 단위로 반올림
    const newRating = Math.round(rawStars * 2) / 2;
    // 화면에 표시되는 별 갱신
    setRating(newRating);
  };

  // PanResponder: 드래그와 터치 모두 대응
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: evt => {
      // 터치 시작 지점의 X 좌표로 별점 계산
      handleRatingFromTouch(evt.nativeEvent.pageX);
    },
    onPanResponderMove: evt => {
      // 드래그 중인 위치의 X 좌표로 별점 실시간 계산
      handleRatingFromTouch(evt.nativeEvent.pageX);
    },
  });

  const renderStars = () => {
    const stars = [];
    // 꽉 찬 별의 개수 계산 (정수 부분)
    const fullStars = Math.floor(rating);
    // 반 별 여부 체크 (0.5 점 있는지 확인)
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < totalStars; i++) {
      if (i < fullStars) {
        stars.push(<StarFilled key={i} width={starSize} height={starSize} />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<StarHalf key={i} width={starSize} height={starSize} />);
      } else {
        stars.push(<StarEmpty key={i} width={starSize} height={starSize} />);
      }
    }
    return stars;
  };

  // 사진 업로드
  const handleAddImage = async () => {
    if (images.length >= 5) {
      Alert.alert(t('guesthouse.youCanUploadUpTo5Photos'));
      return;
    }

    // 남은 슬롯 수 계산
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) return; // 안전 처리

    // 여러 장 업로드
    const uploadedUrls = await uploadMultiImage(remainingSlots);
    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View style={styles.container}>
        <Header title={t('guesthouse.writeAReview')} />

        <ScrollView
          contentContainerStyle={styles.infoContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled>
          {/* 숙소 또는 콘텐츠 정보 */}
          <View style={styles.infoBox}>
            <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
              {isPartyReview ? partyTitle : guesthouseName}
            </Text>
            {!isPartyReview && (
              <>
                <Text style={[FONTS.fs_14_medium, styles.roomText]}>
                  {roomName}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.adressText]}>
                  {guesthouseAddress}
                </Text>
              </>
            )}
            <View style={styles.dateContent}>
              <View style={styles.dateContainer}>
                <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                  {checkInFormatted.date}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                  {checkInFormatted.time}
                </Text>
              </View>
              <Text style={[FONTS.fs_14_medium, styles.devideText]}>~</Text>
              <View style={styles.dateContainer}>
                <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                  {checkOutFormatted.date}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                  {checkOutFormatted.time}
                </Text>
              </View>
            </View>
          </View>

          {/* 콘텐츠 리뷰 포인트 정책 확정 전까지 게하 리뷰에만 노출 */}
          {!isPartyReview && (
            <View style={styles.pointNoticeRow}>
              <ReviewPointIcon width={28} height={28} />
              <View style={styles.pointNoticeTextRow}>
                <Text style={[FONTS.fs_14_medium, styles.pointNoticeText1]}>
                  {t('guesthouse.earn1000pForPhotoReviewsAnd300pForArticle')}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.pointNoticeText2]}>
                  {t('guesthouse.getPointsWithVividReviews')}
                </Text>
              </View>
            </View>
          )}

          {/* 별점 */}
          <View style={styles.reviewRow}>
            <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>
              {isPartyReview
                ? t('guesthouse.satisfactionWithActivity')
                : t('guesthouse.satisfactionWithTheGuesthouse')}
            </Text>
            <View
              ref={ratingContainerRef}
              style={styles.ratingContainer}
              onLayout={e => setContainerX(e.nativeEvent.layout.x)}
              {...panResponder.panHandlers}>
              {renderStars()}
            </View>
          </View>

          {/* 사진 업로드 */}
          <View style={styles.reviewRow}>
            <View style={styles.rowTitleContainer}>
              <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>
                {t('guesthouse.uploadPhoto')}
              </Text>
              <Text style={[FONTS.fs_12_light, styles.imageText]}>
                <Text style={[{color: COLORS.primary_orange}]}>
                  {images.length}
                </Text>
                /5
              </Text>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageContainer}
              directionalLockEnabled>
              {images.length < 5 && (
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.uploadBtn}
                  onPress={handleAddImage}>
                  <PlusImg width={28} height={28} />
                </TouchableOpacity>
              )}
              {images.map((img, idx) => (
                <View key={idx} pointerEvents="box-none">
                  <AppImage
                    pointerEvents="none"
                    uri={img}
                    style={styles.reviewImage}
                  />

                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.xbutton}
                    onPress={() => {
                      setImages(prev => prev.filter((_, i) => i !== idx));
                    }}>
                    <XBtn width={18} height={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 리뷰 입력 */}
          <View style={styles.reviewRow}>
            <View style={styles.rowTitleContainer}>
              <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>
                {isPartyReview
                  ? t('guesthouse.aboutActivity')
                  : t('guesthouse.aboutTheGuesthouse')}
              </Text>
              <Text style={[FONTS.fs_12_light, styles.imageText]}>
                <Text style={[{color: COLORS.primary_orange}]}>
                  {reviewText.length}
                </Text>
                /1,000
              </Text>
            </View>
            <TextInput
              style={[
                FONTS.fs_14_regular,
                styles.textArea,
                isReviewTooShort && styles.textAreaError,
              ]}
              placeholder={t('guesthouse.pleaseWriteAReviewAboutValue', {
                value1: isPartyReview
                  ? t('common.activity')
                  : t('common.guestHouse'),
              })}
              placeholderTextColor={COLORS.grayscale_400}
              multiline
              maxLength={1000}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setReviewText('')}>
              <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>
                {t('common.rewrite')}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                FONTS.fs_12_light,
                styles.reviewLengthGuide,
                isReviewTooShort && styles.reviewLengthGuideError,
              ]}>
              {t('guesthouse.minimum')}
              {MIN_REVIEW_LENGTH}
              {t('guesthouse.pleaseWriteAtLeastTwoCharacters')}
            </Text>
          </View>

          <Text
            style={[
              FONTS.fs_12_light,
              {color: COLORS.grayscale_600, marginTop: 4},
            ]}>
            {t('guesthouse.ratingsAndReviewsAreRequiredFields')}
          </Text>

          {/* 안내 문구 */}
          <View style={styles.noticeWrapper}>
            {noticeList.map((text, idx) => (
              <Text key={idx} style={[FONTS.fs_12_light, styles.noticeText]}>
                {'\u2022'}{' '}
                {isPartyReview
                  ? text.replaceAll(
                      t('common.guestHouse'),
                      t('common.activity'),
                    )
                  : text}
              </Text>
            ))}
          </View>

          {/* 버튼 */}
          <View style={styles.submitBtn}>
            <ButtonScarlet
              disabled={isSubmitDisabled}
              title={t('guesthouse.registerAReview')}
              onPress={() => setModalVisible(true)}
            />
          </View>

          {/* 리뷰 등록 확인 모달 */}
          <ReviewConfirmModal
            visible={modalVisible}
            onCancel={() => setModalVisible(false)}
            guesthouseId={guesthouseId}
            onConfirm={
              isPartyReview
                ? () =>
                    userMyApi.createPartyReview(partyId, {
                      rating,
                      detail: reviewText.trim(),
                      imageUrls: images,
                      partyReservationId,
                    })
                : undefined
            }
            data={{
              rating,
              detail: reviewText.trim(),
              imageUrls: images,
              isJobReview: false,
              reservationId,
            }}
            onSuccess={() => {
              setModalVisible(false);
              setSuccessModalVisible(true);
            }}
          />

          {/* 리뷰 등록 성공 모달 */}
          <ReviewSuccessModal
            visible={successModalVisible}
            hasPhotoReview={images.length > 0}
            showPointReward={!isPartyReview}
            onClose={() => {
              setSuccessModalVisible(false);
              navigation.goBack();
            }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UserGuesthouseReviewForm;
