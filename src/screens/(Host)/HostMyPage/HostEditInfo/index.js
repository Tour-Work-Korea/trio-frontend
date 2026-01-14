import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import useUserStore from '@stores/userStore';
import hostMyApi from '@utils/api/hostMyApi';
import ButtonScarlet from '@components/ButtonScarlet';
import HostPhone from '@components/Certificate/HostPhone';
import AlertModal from '@components/modals/AlertModal';

import styles from './HostEditInfo.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const HostEditInfo = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [formData, setFormData] = useState({
    photoUrl: hostProfile.photoUrl,
    name: hostProfile.name,
    phoneNumber: hostProfile.phone,
    email: hostProfile.email,
    businessNum: hostProfile.businessNum,
  });
  const [editPhone, setEditPhone] = useState(false);
  const [errorModal, setErrorModal] = useState({
    title: '',
    onPress: null,
    buttonText: '',
    visible: '',
  });

  const handleEditPhone = phoneNumber => {
    setEditPhone(false);
    setFormData(prev => ({...prev, phoneNumber}));
  };

  const handleUpdateProfile = async () => {
    try {
      const isPhoneChanged = formData.phoneNumber !== hostProfile.phone;

      if (!isPhoneChanged) {
        navigation.goBack();
        return;
      }

      await hostMyApi.updatePhone({phoneNumber: formData.phoneNumber});

      setHostProfile({
        ...hostProfile,
        phone: formData.phoneNumber,
      });

      navigation.goBack();
    } catch (error) {
      setErrorModal({
        title:
          error?.response?.data?.message || '연락처 수정 중 오류가 발생했습니다',
        buttonText: '확인',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        visible: true,
      });
    }
  };

  return (
    <>
      {!editPhone ? (
        <View style={styles.outContainer}>
          <Header title="회원 정보 수정" />
          <View style={styles.container}>
            <View style={{backgroundColor: COLORS.grayscale_0, borderRadius: 8, padding: 8}}>
              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>연락처</Text>
                <TouchableOpacity onPress={() => setEditPhone(true)}>
                  <Text style={styles.input}>{formData.phoneNumber}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.contentRowContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>비밀번호</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('FindIntro', {
                      find: 'password',
                      userRole: 'HOST',
                      originPhone: formData.phoneNumber,
                    })
                  }>
                  <Text>비밀번호 변경하기</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <ButtonScarlet title={'적용하기'} onPress={handleUpdateProfile} />
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}

      {editPhone ? <HostPhone onPress={handleEditPhone} user="HOST" /> : <></>}
      <AlertModal
        title={errorModal.title}
        buttonText={errorModal.buttonText}
        onPress={errorModal.onPress}
        visible={errorModal.visible}
      />
    </>
  );
};

export default HostEditInfo;
