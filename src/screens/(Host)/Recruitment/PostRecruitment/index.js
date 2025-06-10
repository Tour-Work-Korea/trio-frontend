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
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from './PostRecruitment.styles';
import Header from '@components/Header';
import Gray_ImageAdd from '@assets/images/Gray_ImageAdd.svg';
import Calendar from '@assets/images/Calendar.svg';
import hostEmployApi from '@utils/api/hostEmployApi';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation, useRoute} from '@react-navigation/native';

function formatDateToLocalISOString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  const seconds = `${d.getSeconds()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const PostRecruitment = () => {
  const [formData, setFormData] = useState({
    recruitTitle: 'title1',
    recruitShortDescription: 'descrip1',
    recruitStart: null,
    recruitEnd: null,
    recruitNumberMale: 1,
    recruitNumberFemale: 1,
    location: 'address1',
    recruitCondition: 'prefer1',
    recruitMinAge: 20,
    recruitMaxAge: 30,
    workType: 'workType1',
    workStartDate: null,
    workEndDate: null,
    workPart: 'work1',
    welfare: 'welfare1',
    recruitDetail: 'descrip1',
    recruitImage: [
      {
        recruitImageUrl:
          'file:///data/user/0/com.triofrontendapp/cache/rn_image_picker_lib_temp_6153ff11-b8df-49b9-98ba-da32d49a8d08.jpg',
        isThumbnail: true,
      },
    ],
    hashtags: [11, 13, 18],
    guesthouseId: 29,
  });
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [showRecruitStart, setShowRecruitStart] = useState(false);
  const [showRecruitEnd, setShowRecruitEnd] = useState(false);
  const [showWorkStartDate, setShowWorkStartDate] = useState(false);
  const [showWorkEndDate, setShowWorkEndDate] = useState(false);
  const [guesthouseOpen, setGuesthouseOpen] = useState(false);
  const [hashtags, setHashtags] = useState();

  const route = useRoute();
  const recruit = route.params ?? null;
  const navigation = useNavigation();

  useEffect(() => {
    // 수정인 경우, 기존 데이터
    if (recruit) {
      setFormData(prev => ({
        recruitTitle: recruit.recruitTitle,
        recruitShortDescription: recruit.recruitShortDescription,
        recruitStart: new Date(recruit.recruitStart),
        recruitEnd: new Date(recruit.recruitEnd),
        workStartDate: new Date(recruit.workStartDate),
        workEndDate: new Date(recruit.workEndDate),
        recruitNumberFemale: recruit.recruitNumberFemale,
        recruitNumberMale: recruit.recruitNumberMale,
        recruitMinAge: recruit.recruitMinAge,
        recruitMaxAge: recruit.recruitMaxAge,
        recruitCondition: recruit.recruitCondition,
        workType: recruit.workType,
        workPart: recruit.workPart,
        welfare: recruit.welfare,
        location: recruit.location,
        recruitImage:
          recruit.recruitImage?.map(img => ({
            recruitImageUrl: img.recruitImageUrl,
            isThumbnail: img.isThumbnail || false,
          })) || [],
        recruitDetail: recruit.recruitDetail,
        hashtags: recruit.hashtags?.map(tag => tag.id) || [],
        // guesthouseId: recruit.guesthouseId,
      }));
    }

    //해시태그 조회
    const fetchHostHashtags = async () => {
      try {
        const response = await hostEmployApi.getHostHashtags();
        setHashtags(response.data);
      } catch (error) {
        Alert.alert('해시태그 조회에 실패했습니다.');
      }
    };

    //나의 게스트하우스 리스트 조회
    const fetchMyGuestHouse = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthouses();
        const options = response.data.map(g => ({
          label: g.guesthouseName,
          value: g.id,
        }));
        setGuesthouseList(options);
      } catch (error) {
        Alert.alert('나의 게스트하우스 조회에 실패했습니다.');
      }
    };
    fetchMyGuestHouse();
    fetchHostHashtags();
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
      [field]: parseInt(numericValue) || 0,
    });
  };

  const handleTagToggle = tagId => {
    const isSelected = formData.hashtags.includes(tagId);

    // 선택되지 않았고 이미 3개라면 막기
    if (!isSelected && formData.hashtags.length >= 3) {
      Alert.alert('알림', '태그는 최대 3개까지 선택할 수 있어요.');
      return;
    }

    const updatedHashtags = isSelected
      ? formData.hashtags.filter(hashtagId => hashtagId !== tagId)
      : [...formData.hashtags, tagId];

    setFormData(prev => ({
      ...prev,
      hashtags: updatedHashtags,
    }));
  };

  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || formData[dateField];

    if (dateField === 'recruitStart') setShowRecruitStart(false);
    if (dateField === 'recruitEnd') setShowRecruitEnd(false);
    if (dateField === 'workStartDate') setShowWorkStartDate(false);
    if (dateField === 'workEndDate') setShowWorkEndDate(false);

    setFormData(prev => ({
      ...prev,
      [dateField]: currentDate,
    }));
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
          if (formData.recruitImage.length < 6) {
            const newImage = {
              recruitImageUrl: uri,
              isThumbnail: formData.recruitImage.length === 0, // 첫 번째 이미지를 썸네일로 설정
            };
            setFormData({
              ...formData,
              recruitImage: [...formData.recruitImage, newImage],
            });
          } else {
            Alert.alert('사진 제한', '최대 6장까지 등록 가능합니다.');
          }
        }
      },
    );
  };

  const removePhoto = index => {
    const newImage = [...formData.recruitImage];
    newImage.splice(index, 1);

    // 썸네일이었던 이미지를 삭제한 경우, 첫 번째 이미지를 썸네일로 설정
    if (newImage.length > 0 && index === 0) {
      newImage[0].isThumbnail = true;
    }

    setFormData({
      ...formData,
      recruitImage: newImage,
    });
  };

  const handleSubmit = () => {
    if (!formData.recruitTitle) {
      Alert.alert('입력 오류', '공고 제목을 입력해주세요.');
      return;
    }

    if (!formData.guesthouseId) {
      Alert.alert('입력 오류', '게스트하우스를 선택해주세요.');
      return;
    }

    const payload = {
      ...formData,
      recruitStart: formatDateToLocalISOString(formData.recruitStart),
      recruitEnd: formatDateToLocalISOString(formData.recruitEnd),
      workStartDate: formatDateToLocalISOString(formData.workStartDate),
      workEndDate: formatDateToLocalISOString(formData.workEndDate),
    };

    const fetchNewRecruit = async () => {
      try {
        await hostEmployApi.createRecruit(payload);
        Alert.alert('새로운 공고를 등록했습니다.');
        navigation.navigate('MyRecruitmentList');
      } catch (error) {
        Alert.alert('새로운 공고를 등록에 실패했습니다.');
      }
    };

    const fetchUpdateRecruit = async updatedRecruitId => {
      try {
        await hostEmployApi.updateRecruit(updatedRecruitId, payload);
        Alert.alert('공고를 성공적으로 수정했습니다.');
        navigation.navigate('MyRecruitmentList');
      } catch (error) {
        Alert.alert('공고 수정에 실패했습니다.');
      }
    };

    if (recruit?.recruitId != null) {
      fetchUpdateRecruit(recruit.recruitId);
    } else {
      fetchNewRecruit();
    }
  };

  const handleTemporarySave = () => {
    console.log('Temporary saved:', formData);
    Alert.alert('임시 저장', '공고가 임시 저장되었습니다.');
  };

  const handlePreview = () => {
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
              value={formData.recruitTitle}
              onChangeText={text => handleInputChange('recruitTitle', text)}
            />
          </View>
          <View style={{zIndex: 1000}}>
            <DropDownPicker
              open={guesthouseOpen}
              value={formData.guesthouseId}
              items={guesthouseList}
              setOpen={setGuesthouseOpen}
              setValue={val => handleInputChange('guesthouseId', val())}
              setItems={setGuesthouseList}
              placeholder="공고를 등록할 게스트하우스를 선택해주세요."
              zIndex={1000}
              zIndexInverse={3000}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="간략하게 들어갈 공고 소개를 200자 이내로 작성해주세요."
              multiline={true}
              numberOfLines={4}
              value={formData.recruitShortDescription}
              onChangeText={text =>
                handleInputChange('recruitShortDescription', text)
              }
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
            {hashtags?.map(tag => {
              const isSelected = formData.hashtags?.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    isSelected && styles.tagButtonSelected,
                  ]}
                  onPress={() => handleTagToggle(tag.id)}>
                  <Text
                    style={[
                      styles.tagButtonText,
                      isSelected && styles.tagButtonTextSelected,
                    ]}>
                    {tag.hashtag}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
              onPress={() => setShowRecruitStart(true)}>
              <Text style={styles.dateLabel}>
                {formData.recruitStart
                  ? new Date(formData.recruitStart).toLocaleDateString('ko-KR')
                  : '시작일자'}
              </Text>
              <Calendar />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowRecruitEnd(true)}>
              <Text style={styles.dateLabel}>
                {formData.recruitEnd
                  ? new Date(formData.recruitEnd).toLocaleDateString('ko-KR')
                  : '마감일자'}
              </Text>
              <Calendar />
            </TouchableOpacity>
          </View>

          {showRecruitStart && (
            <DateTimePicker
              value={formData.recruitStart ?? new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'recruitStart')
              }
            />
          )}

          {showRecruitEnd && (
            <DateTimePicker
              value={formData.recruitEnd ?? new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'recruitEnd')
              }
            />
          )}

          <Text style={styles.subsectionTitle}>근무기간</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowWorkStartDate(true)}>
              <Text style={styles.dateLabel}>
                {formData.workStartDate
                  ? new Date(formData.workStartDate).toLocaleDateString('ko-KR')
                  : '근무 시작일'}
              </Text>
              <Calendar />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowWorkEndDate(true)}>
              <Text style={styles.dateLabel}>
                {formData.workEndDate
                  ? new Date(formData.workEndDate).toLocaleDateString('ko-KR')
                  : '근무 종료일'}
              </Text>
              <Calendar />
            </TouchableOpacity>
          </View>

          {showWorkStartDate && (
            <DateTimePicker
              value={formData.workStartDate ?? new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'workStartDate')
              }
            />
          )}

          {showWorkEndDate && (
            <DateTimePicker
              value={formData.workEndDate ?? new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, 'workEndDate')
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
                value={formData.recruitNumberFemale.toString()}
                onChangeText={text =>
                  handleNumericInput('recruitNumberFemale', text)
                }
              />
            </View>

            <View style={styles.countItem}>
              <Text style={styles.countLabel}>남자</Text>
              <TextInput
                style={styles.countInput}
                placeholder="명"
                keyboardType="numeric"
                value={formData.recruitNumberMale.toString()}
                onChangeText={text =>
                  handleNumericInput('recruitNumberMale', text)
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
                value={formData.recruitMinAge.toString()}
                onChangeText={text => handleNumericInput('recruitMinAge', text)}
              />
            </View>

            <View style={styles.ageItem}>
              <Text style={styles.ageLabel}>최대 연령</Text>
              <TextInput
                style={styles.ageInput}
                placeholder="최대 연령"
                keyboardType="numeric"
                value={formData.recruitMaxAge.toString()}
                onChangeText={text => handleNumericInput('recruitMaxAge', text)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="우대조건"
              multiline={true}
              numberOfLines={4}
              value={formData.recruitCondition}
              onChangeText={text => handleInputChange('recruitCondition', text)}
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
              placeholder="근무 형태를 입력해주세요. ex) 3인 2교대 4일 휴무"
              multiline={true}
              numberOfLines={4}
              value={formData.workType}
              onChangeText={text => handleInputChange('workType', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="주요 업무를 작성해주세요."
              value={formData.workPart}
              onChangeText={text => handleInputChange('workPart', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="복지를 입력해주세요"
              value={formData.welfare}
              onChangeText={text => handleInputChange('welfare', text)}
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
              {formData.recruitImage.map((imageObj, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image
                    source={{uri: imageObj.recruitImageUrl}}
                    style={styles.photo}
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}>
                    <Text style={styles.removePhotoText}>X</Text>
                  </TouchableOpacity>
                  {imageObj.isThumbnail && (
                    <View style={styles.thumbnailBadge}>
                      <Text style={styles.thumbnailText}>대표</Text>
                    </View>
                  )}
                </View>
              ))}

              {formData.recruitImage.length < 6 && (
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
              value={formData.recruitDetail}
              onChangeText={text => handleInputChange('recruitDetail', text)}
            />
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {recruit ? '공고 수정하기' : '공고 등록하기'}
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
