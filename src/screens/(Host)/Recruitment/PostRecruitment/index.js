import React, {useState} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './PostRecruitment.styles';
import Header from '@components/Header';

const PostRecruitment = () => {
  const [formData, setFormData] = useState({
    title: '',
    guesthouse: '',
    introduction: '',
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
    detailedInfo: '',
  });

  const [photos, setPhotos] = useState([]);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showArrivalDate, setShowArrivalDate] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
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

  const formatDate = date => {
    return date.toISOString().split('T')[0];
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (photos.length < 6) {
            setPhotos([...photos, uri]);
          } else {
            Alert.alert('사진 제한', '최대 6장까지 등록 가능합니다.');
          }
        }
      },
    );
  };

  const removePhoto = index => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
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

    console.log('Form Data:', formData);
    console.log('Photos:', photos);

    Alert.alert('성공', '공고가 등록되었습니다.');
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
        {/* 기본정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>기본정보</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="공고 제목"
              value={formData.title}
              onChangeText={text => handleInputChange('title', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() =>
                Alert.alert('알림', '게스트하우스 선택 기능은 구현 중입니다.')
              }>
              <Text style={styles.dropdownText}>
                {formData.guesthouse || '게스트하우스 선택'}
              </Text>
              <Ionicons name="chevron-down" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="공고 소개 (200자 이내)"
              multiline
              maxLength={200}
              value={formData.introduction}
              onChangeText={text => handleInputChange('introduction', text)}
            />
          </View>
        </View>

        {/* 모집조건 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>모집조건</Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateContainer}
              onPress={() => setShowStartDate(true)}>
              <Text style={styles.dateText}>
                시작일자: {formatDate(formData.startDate)}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateContainer}
              onPress={() => setShowEndDate(true)}>
              <Text style={styles.dateText}>
                마감일자: {formatDate(formData.endDate)}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#888" />
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
        </View>

        {/* 사진 업로드 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>근무지 사진</Text>
          <View style={styles.photoRow}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{uri}} style={styles.photo} />
                <TouchableOpacity
                  onPress={() => removePhoto(index)}
                  style={styles.removePhotoButton}>
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 6 && (
              <TouchableOpacity
                style={[styles.photoContainer, styles.addPhotoContainer]}
                onPress={pickImage}>
                <Ionicons name="add" size={40} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 상세정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>상세 소개</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="상세 내용을 작성해주세요."
              multiline
              numberOfLines={5}
              value={formData.detailedInfo}
              onChangeText={text => handleInputChange('detailedInfo', text)}
            />
          </View>
        </View>

        {/* 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>공고 등록</Text>
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
