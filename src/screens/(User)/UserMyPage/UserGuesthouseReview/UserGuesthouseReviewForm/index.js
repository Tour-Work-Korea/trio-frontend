import React, { useState, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, TextInput, ScrollView, PanResponder, 
  Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import styles from './UserGuesthouseReviewForm.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import { uploadMultiImage } from '@utils/imageUploadHandler';

import StarFilled from '@assets/images/star_filled.svg';
import StarHalf from '@assets/images/star_half.svg';
import StarEmpty from '@assets/images/star_empty.svg';
import PlusImg from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';

const noticeList = [
  '작성한 리뷰는 닉네임, 프로필 이미지와 함께 누구나 볼 수 있습니다.\n리뷰 내용에 개인정보가 포함되지 않도록 조심해주세요.',
  '솔직한 리뷰는 게스트하우스 이용객 분들께 큰 도움이 됩니다.\n다만 허위사실이나 명예훼손, 비방, 모욕 글 등 선량한 게스트하우스 사장님이나 제 3자의 권리를 침해하는 게시물은 서비스 이용약관이나 관련 법률에 따라 제재를 받을 수 있습니다.',
  '리뷰에 따른 책임은 작성자에게 있고, 워커웨이는 이에 대한 법적 책임을 지지 않습니다.'
];

const UserGuesthouseReviewForm = () => {
  const route = useRoute();
  const { guesthouseId } = route.params;
  const [images, setImages] = useState([]);
  const [reviewText, setReviewText] = useState('');

  // 별점 터치
  const starSize = 40; // 별 아이콘 가로 크기(px)
  const starSpacing = 8; // 별 사이 간격(px)
  const totalStars = 5;
  const [rating, setRating] = useState(0);

  const [containerX, setContainerX] = useState(0);
  const ratingContainerRef = useRef(null);

  // 별점 터치 위치 계산 로직
  const handleRatingFromTouch = (touchX) => {
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
    onPanResponderGrant: (evt) => {
      // 터치 시작 지점의 X 좌표로 별점 계산
      handleRatingFromTouch(evt.nativeEvent.pageX);
    },
    onPanResponderMove: (evt) => {
      // 드래그 중인 위치의 X 좌표로 별점 실시간 계산
      handleRatingFromTouch(evt.nativeEvent.pageX);
    }
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
      Alert.alert('최대 5장까지 업로드할 수 있습니다.');
      return;
    }

    // 남은 슬롯 수 계산
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) return; // 안전 처리

    // 여러 장 업로드
    const uploadedUrls = await uploadMultiImage(remainingSlots);
    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Header title="리뷰작성" />

      <ScrollView contentContainerStyle={styles.infoContainer}>
        {/* 숙소 정보 */}
        <View style={styles.infoBox}>
          <Text style={[FONTS.fs_16_semibold, styles.nameText]}>김군빌리지 게스트하우스</Text>
          <Text style={[FONTS.fs_14_medium, styles.roomText]}>4인실 여자</Text>
          <Text style={[FONTS.fs_12_medium, styles.adressText]}>
            제주시 애월리 12312312
          </Text>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> 2025.04.15 (화) </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> 16:00 </Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.devideText]}>~</Text>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> 2025.04.16 (수) </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> 11:00 </Text>
            </View>
          </View>
        </View>

        {/* 별점 */}
        <View style={styles.reviewRow}>
          <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>게스트하우스에 대한 만족도</Text>
          <View
            ref={ratingContainerRef}
            style={styles.ratingContainer}
            onLayout={(e) => setContainerX(e.nativeEvent.layout.x)}
            {...panResponder.panHandlers}
          >
            {renderStars()}
          </View>
        </View>

        {/* 사진 업로드 */}
        <View style={styles.reviewRow}>
          <View style={styles.rowTitleContainer}>
            <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>사진 업로드</Text>
            <Text style={[FONTS.fs_12_light, styles.imageText]}>
              <Text style={[{color: COLORS.primary_orange}]}>{images.length}</Text>/5
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {images.length < 5 && (
              <TouchableOpacity style={styles.uploadBtn} onPress={handleAddImage}>
                <PlusImg width={28} height={28} />
              </TouchableOpacity>
            )}
            {images.map((img, idx) => (
              <View>
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={styles.reviewImage}
                />
                <TouchableOpacity 
                  style={styles.xbutton}
                  onPress={() => {
                    setImages(prev => prev.filter((_, i) => i !== idx));
                  }}
                >
                  <XBtn width={18} height={18}/>
                </TouchableOpacity>
              </View>    
            ))}
          </ScrollView>
        </View>

        {/* 리뷰 입력 */}
        <View style={styles.reviewRow}>
          <View style={styles.rowTitleContainer}>
            <Text style={[FONTS.fs_14_medium, styles.rowTitle]}>게스트하우스에 대해</Text>
            <Text style={[FONTS.fs_12_light, styles.imageText]}>
              <Text style={[{color: COLORS.primary_orange}]}>{reviewText.length}</Text>/1,000
            </Text>
          </View>
          <TextInput
            style={[FONTS.fs_14_regular, styles.textArea]}
            placeholder="게스트하우스에 대한 리뷰를 작성해주세요"
            placeholderTextColor={COLORS.grayscale_400}
            multiline
            maxLength={1000}
            value={reviewText}
            onChangeText={setReviewText}
          />
          <TouchableOpacity onPress={() => setReviewText('')}>
            <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 문구 */}
        <View style={styles.noticeWrapper}>
          {noticeList.map((text, idx) => (
            <Text key={idx} style={[FONTS.fs_12_light, styles.noticeText]}>
              {'\u2022'} {text}
            </Text>
          ))}
        </View>

        {/* 버튼 */}
        <View style={styles.submitBtn}>
          <ButtonScarlet
           title={'리뷰 등록하기'}
          />
        </View>
      </ScrollView>
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UserGuesthouseReviewForm;
