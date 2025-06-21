import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Alert} from 'react-native';
import styles from '../../../screens/(Host)/Recruitment/RecruitmentForm/RecruitmentForm';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import DropDownPicker from 'react-native-dropdown-picker';

const BasicInfoSection = ({isUpdate, handleInputChange, formData}) => {
  const [guesthouses, setGuesthouses] = useState([]);
  const [guesthouseOpen, setGuesthouseOpen] = useState(false);

  useEffect(() => {
    if (!isUpdate) {
      fetchMyGuestHouse();
    }
  }, []);

  //나의 게스트하우스 리스트 조회
  const fetchMyGuestHouse = async () => {
    try {
      const response = await hostGuesthouseApi.getMyGuesthouses();
      const options = response.data.map(g => ({
        label: g.guesthouseName,
        value: g.id,
      }));
      setGuesthouses(options);
    } catch (error) {
      Alert.alert('나의 게스트하우스 조회에 실패했습니다.');
    }
  };

  return (
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
      {!isUpdate && (
        <View style={{zIndex: 1000}}>
          <DropDownPicker
            open={guesthouseOpen}
            value={formData.guesthouseId}
            items={guesthouses}
            setOpen={setGuesthouseOpen}
            setValue={val => handleInputChange('guesthouseId', val())}
            setItems={setGuesthouses}
            placeholder="공고를 등록할 게스트하우스를 선택해주세요."
            zIndex={1000}
            zIndexInverse={3000}
            listMode="SCROLLVIEW"
          />
        </View>
      )}

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
  );
};

export default BasicInfoSection;
