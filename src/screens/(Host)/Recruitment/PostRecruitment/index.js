import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './PostRecruitment.styles';
import Header from '@components/Header';
import Gray_ImageAdd from '@assets/images/Gray_ImageAdd.svg';
import Calendar from '@assets/images/Calendar.svg';
import hostEmployApi from '@utils/api/hostEmployApi';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import RNPickerSelect from 'react-native-picker-select';
import {useNavigation, useRoute} from '@react-navigation/native';

const dummyData = {
  recruitTitle: '0524 테스트 여름 시즌 게스트하우스 스태프 모집',
  recruitShortDescription:
    '바다 근처 게스트하우스에서 즐겁게 일하실 분을 모집합니다!',
  recruitStart: '2025-11-23T10:00:00',
  recruitEnd: '2025-11-25T23:59:00',
  recruitNumberMale: 2,
  recruitNumberFemale: 2,
  location: '강원도 속초시 해변로 123',
  recruitCondition: '숙식 제공, 주 1회 휴무, 유니폼 제공',
  recruitMinAge: 20,
  recruitMaxAge: 30,
  workType: '풀타임',
  workStartDate: '2025-12-01T09:00:00',
  workEndDate: '2025-12-15T18:00:00',
  workPart: '청소 및 손님 응대',
  welfare: '숙식 제공, 워케이션 환경, 바다 근처 활동 가능',
  recruitDetail:
    '속초 바닷가 바로 앞에 위치한 게스트하우스에서 여름 시즌을 함께 보낼 스태프를 모집합니다. 숙식이 제공되며, 일과 후에는 다양한 해양 활동을 즐길 수 있습니다.',
  recruitImage: [
    {
      recruitImageUrl: 'https://example.com/image1.jpg',
      isThumbnail: 1,
    },
    {
      recruitImageUrl: 'https://example.com/image2.jpg',
      isThumbnail: 0,
    },
  ],
  hashtags: [
    {
      hashtag: '파티',
      hashtagType: 'RECRUIT_HASHTAG',
    },
    {
      hashtag: '투어가능',
      hashtagType: 'RECRUIT_HASHTAG',
    },
  ],
  guesthouseId: 1,
};
const guesthouseListDummy = [
  {label: '게스트하우스 1', value: '게스트하우스 1 (id: 1)'},
  {label: '게스트하우스 2', value: '게스트하우스 2 (id: 2)'},
  {label: '게스트하우스 3', value: '게스트하우스 3 (id: 3)'},
];
const PostRecruitment = () => {
  const [formData, setFormData] = useState({
    title: '',
    guesthouse: '',
    introduction: '',
    tags: {
      파티: false,
      바다전망: false,
      동반입장: false,
      파티X: false,
      야외공간X: false,
      객실샤워X: false,
      옥상정원: false,
      루프탑: false,
      즉시입도: false,
    },
    startDate: new Date(),
    endDate: new Date(),
    arrivalDate: new Date(),
    femaleCount: '',
    maleCount: '',
    anyGenderCount: '',
    minAge: '',
    maxAge: '',
    preferences: '',
    workEnvironment: '',
    mainDuties: '',
    minWorkPeriod: '',
    benefits: '',
    location: '',
    photos: [],
    detailedInfo: '',
  });
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showArrivalDate, setShowArrivalDate] = useState(false);
  const route = useRoute();
  const recruit = route.params?.recruit ?? null;
  const navigation = useNavigation();

  useEffect(() => {
    //하나씩 치기 귀찮아서 더미 데이터 설정
    if (recruit) {
      setFormData(prev => ({
        ...prev,
        title: recruit.recruitTitle,
        guesthouse: '게스트하우스 이름 (id: ' + recruit.guesthouseId + ')',
        introduction: recruit.recruitShortDescription,
        tags: recruit.hashtags.reduce((acc, cur) => {
          acc[cur.hashtag] = true;
          return acc;
        }, {}),
        startDate: new Date(recruit.recruitStart),
        endDate: new Date(recruit.recruitEnd),
        arrivalDate: new Date(recruit.workStartDate),
        femaleCount: recruit.recruitNumberFemale.toString(),
        maleCount: recruit.recruitNumberMale.toString(),
        minAge: recruit.recruitMinAge.toString(),
        maxAge: recruit.recruitMaxAge.toString(),
        preferences: recruit.recruitCondition,
        workEnvironment: recruit.workType,
        mainDuties: recruit.workPart,
        minWorkPeriod: `${recruit.workStartDate} ~ ${recruit.workEndDate}`,
        benefits: recruit.welfare,
        location: recruit.location,
        photos: recruit.recruitImage.map(img => img.recruitImageUrl),
        detailedInfo: recruit.recruitDetail,
      }));
    }

    //나의 게스트하우스 리스트 조회
    const fetchMyGuestHouse = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthouse();
        const options = response.data.map(g => ({
          label: g.guesthouseName,
          value: `${g.id}`,
        }));
        setGuesthouseList(options);
      } catch (error) {
        Alert.alert('나의 게스트하우스 조회에 실패했습니다.');
      }
    };
    // fetchMyGuestHouse();
    setGuesthouseList(guesthouseListDummy);
    setFormData(prev => ({
      ...prev,
      guesthouse: '초기값',
    }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNumericInput = (field, value) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      [field]: numericValue,
    });
  };

  const handleTagToggle = tag => {
    // Count selected tags
    const selectedTagsCount = Object.values(formData.tags).filter(
      Boolean,
    ).length;
    if (!formData.tags[tag] && selectedTagsCount >= 3) {
      Alert.alert('태그 제한', '최대 3개까지 선택 가능합니다.');
      return;
    }

    setFormData({
      ...formData,
      tags: {
        ...formData.tags,
        [tag]: !formData.tags[tag],
      },
    });
  };
  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || formData[dateField];

    if (dateField === 'startDate') setShowStartDate(false);
    if (dateField === 'endDate') setShowEndDate(false);
    if (dateField === 'arrivalDate') setShowArrivalDate(false);

    setFormData({
      ...formData,
      [dateField]: currentDate,
    });
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (formData.photos.length < 6) {
            setFormData({
              ...formData,
              photos: [...formData.photos, uri],
            });
          } else {
            Alert.alert('사진 제한', '최대 6장까지 등록 가능합니다.');
          }
        }
      },
    );
  };

  const removePhoto = index => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData({
      ...formData,
      photos: newPhotos,
    });
  };

  const handleSubmit = () => {
    if (!formData.title) {
      Alert.alert('입력 오류', '공고 제목을 입력해주세요.');
      return;
    }

    if (!formData.guesthouse) {
      Alert.alert('입력 오류', '게스트하우스를 선택해주세요.');
      return;
    }

    const fetchNewRecruit = async () => {
      try {
        const response = await hostEmployApi.createRecruit(formData);
        Alert.alert('새로운 공고를 등록했습니다.');
        navigation.navigate('MyRecruitmentList');
      } catch (error) {
        Alert.alert('새로운 공고를 등록에 실패했습니다.');
      }
    };
    const fetchUpdateRecruit = async updatedRecruitId => {
      try {
        const response = await hostEmployApi.updateRecruit(
          updatedRecruitId,
          formData,
        );
        Alert.alert('공고를 성공적으로 수정했습니다.');
        navigation.navigate('MyRecruitmentList');
      } catch (error) {
        Alert.alert('공고 수정에 실패했습니다.');
      }
    };

    if (recruit?.recruitId != null) {
      // fetchUpdateRecruit(recruit.recruitId);
    } else {
      // fetchNewRecruit();
    }
  };

  // Handle temporary save
  const handleTemporarySave = () => {
    // Save to local storage or state management solution
    console.log('Temporary saved:', formData);
    Alert.alert('임시 저장', '공고가 임시 저장되었습니다.');
  };

  // Handle preview
  const handlePreview = () => {
    // Navigate to preview screen with current form data
    console.log('Preview:', formData);
    Alert.alert('미리 보기', '미리 보기 기능은 아직 구현 중입니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="구인공고" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 기본정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본정보</Text>
          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="공고제목을 입력해주세요."
              value={formData.title}
              onChangeText={text => handleInputChange('title', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <RNPickerSelect
              value={formData.guesthouse}
              onValueChange={value => handleInputChange('guesthouse', value)}
              items={guesthouseList}
              placeholder={{
                label: '공고를 등록할 게스트하우스를 선택해주세요.',
                value: '',
              }}
              style={{
                inputIOS: styles.dropdownText,
                inputAndroid: styles.dropdownText,
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="간략하게 들어갈 공고 소개를 200자 이내로 작성해주세요."
              multiline={true}
              numberOfLines={4}
              value={formData.introduction}
              onChangeText={text => handleInputChange('introduction', text)}
              maxLength={200}
            />
          </View>
        </View>

        {/* 태그 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <View style={styles.divider} />

          <Text style={styles.tagDescription}>
            태그로 공고를 눈에 띄게 나타내보세요! (최대 3개 선택가능)
          </Text>

          <View style={styles.tagGrid}>
            <View style={styles.tagRow}>
              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('파티')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['파티'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['파티'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>파티</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('바다전망')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['바다전망'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['바다전망'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>바다전망</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('동반입장')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['동반입장'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['동반입장'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>동반입장</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('파티X')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['파티X'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['파티X'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>파티X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('야외공간X')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['야외공간X'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['야외공간X'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>야외공간X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('객실샤워X')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['객실샤워X'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['객실샤워X'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>객실샤워X</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagRow}>
              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('옥상정원')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['옥상정원'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['옥상정원'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>옥상정원</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('루프탑')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['루프탑'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['루프탑'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>루프탑</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tagOption}
                onPress={() => handleTagToggle('즉시입도')}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags['즉시입도'] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags['즉시입도'] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>즉시입도</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.addTagButton}>
          <Text style={styles.addTagButtonText}>모집 파트 추가</Text>
        </TouchableOpacity>

        {/* 모집조건 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>모집조건</Text>
          <View style={styles.divider} />

          <Text style={styles.subsectionTitle}>모집기간</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartDate(true)}>
              <Text style={styles.dateLabel}>시작일자</Text>
              <Calendar />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndDate(true)}>
              <Text style={styles.dateLabel}>마감일자</Text>
              <Calendar />
            </TouchableOpacity>
          </View>

          {showStartDate && (
            <DateTimePicker
              value={formData.startDate}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'startDate')
              }
            />
          )}

          {showEndDate && (
            <DateTimePicker
              value={formData.endDate}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'endDate')
              }
            />
          )}

          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowArrivalDate(true)}>
              <Text style={styles.dateLabel}>입도 날짜</Text>
              <Calendar />
            </TouchableOpacity>
          </View>

          {showArrivalDate && (
            <DateTimePicker
              value={formData.arrivalDate}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'arrivalDate')
              }
            />
          )}

          <Text style={styles.subsectionTitle}>모집 인원</Text>
          <View style={styles.countRow}>
            <View style={styles.countItem}>
              <Text style={styles.countLabel}>여자</Text>
              <TextInput
                style={styles.countInput}
                placeholder="명"
                keyboardType="numeric"
                value={formData.femaleCount}
                onChangeText={text => handleNumericInput('femaleCount', text)}
              />
            </View>

            <View style={styles.countItem}>
              <Text style={styles.countLabel}>남자</Text>
              <TextInput
                style={styles.countInput}
                placeholder="명"
                keyboardType="numeric"
                value={formData.maleCount}
                onChangeText={text => handleNumericInput('maleCount', text)}
              />
            </View>

            <View style={styles.countItem}>
              <Text style={styles.countLabel}>성별 무관</Text>
              <TextInput
                style={styles.countInput}
                placeholder="명"
                keyboardType="numeric"
                value={formData.anyGenderCount}
                onChangeText={text =>
                  handleNumericInput('anyGenderCount', text)
                }
              />
            </View>
          </View>

          <Text style={styles.subsectionTitle}>나이</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageItem}>
              <Text style={styles.ageLabel}>최소 연령</Text>
              <TextInput
                style={styles.ageInput}
                placeholder="최소 연령"
                keyboardType="numeric"
                value={formData.minAge}
                onChangeText={text => handleNumericInput('minAge', text)}
              />
            </View>

            <View style={styles.ageItem}>
              <Text style={styles.ageLabel}>최대 연령</Text>
              <TextInput
                style={styles.ageInput}
                placeholder="최대 연령"
                keyboardType="numeric"
                value={formData.maxAge}
                onChangeText={text => handleNumericInput('maxAge', text)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="우대조건"
              multiline={true}
              numberOfLines={4}
              value={formData.preferences}
              onChangeText={text => handleInputChange('preferences', text)}
            />
          </View>
        </View>

        {/* 근무 조건 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근무 조건</Text>
          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="근무 환경을 입력해주세요. ex) 3인 2교대 4일 휴무"
              multiline={true}
              numberOfLines={4}
              value={formData.workEnvironment}
              onChangeText={text => handleInputChange('workEnvironment', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="주요 업무를 작성해주세요."
              value={formData.mainDuties}
              onChangeText={text => handleInputChange('mainDuties', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="최소 근무 기간을 작성해주세요."
              value={formData.minWorkPeriod}
              onChangeText={text => handleInputChange('minWorkPeriod', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="복지를 입력해주세요"
              value={formData.benefits}
              onChangeText={text => handleInputChange('benefits', text)}
            />
          </View>
        </View>

        {/* 근무지 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근무지 정보</Text>
          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="지역을 입력해주세요"
              value={formData.location}
              onChangeText={text => handleInputChange('location', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.photoSectionTitle}>근무지 사진</Text>
            <Text style={styles.photoDescription}>
              게스트하우스 및 객실 사진을 추가해주세요.
            </Text>

            <View style={styles.photoGrid}>
              {formData.photos.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{uri}} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}>
                    <Text style={styles.removePhotoText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {formData.photos.length < 6 && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={pickImage}>
                  <Gray_ImageAdd />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* 상세 소개글 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 소개글</Text>
          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="공고에 대한 상세 정보를 입력해주세요."
              multiline={true}
              numberOfLines={4}
              value={formData.detailedInfo}
              onChangeText={text => handleInputChange('detailedInfo', text)}
            />
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {!recruit ? '공고 수정하기' : '공고 등록하기'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleTemporarySave}>
              <Text style={styles.secondaryButtonText}>임시 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePreview}>
              <Text style={styles.secondaryButtonText}>미리 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostRecruitment;
