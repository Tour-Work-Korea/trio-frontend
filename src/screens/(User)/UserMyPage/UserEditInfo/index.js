import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import styles from './UserEditInfo.styles';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import AlertModal from '@components/modals/AlertModal';
import Phone from '@components/Certificate/UserPhone';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const UserEditInfo = () => {
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const [formData, setFormData] = useState({
    phone: userProfile.phone,
  });
  const [editPhone, setEditPhone] = useState(false);
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  const handleEditPhone = phone => {
    setEditPhone(false);
    setFormData(prev => ({...prev, phone}));
  };

  const updateMyInfo = async () => {
    try {
      const isPhoneChanged = formData.phone !== userProfile.phone;

      if (!isPhoneChanged) {
        navigation.goBack();
        return;
      }

      await userMyApi.updatePhone({phoneNumber: formData.phone});

      setUserProfile({
        ...userProfile,
        phone: formData.phone,
      });
      navigation.goBack();
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ?? '프로필 수정 중 오류가 발생했어요',
      });
    }
  };

  return (
    <>
      {!editPhone ? (
        <View style={styles.outContainer}>
          <Header title="회원 정보 수정" />
          <View style={styles.container}>
            <View
              style={{
                backgroundColor: COLORS.grayscale_0,
                borderRadius: 8,
                padding: 8,
              }}>
              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>연락처</Text>
                <TouchableOpacity onPress={() => setEditPhone(true)}>
                  <Text style={styles.input}>{formData.phone}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contentRowContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>비밀번호</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('FindIntro', {
                      find: 'password',
                      userRole: 'USER',
                      originPhone: formData.phone,
                    })
                  }>
                  <Text>비밀번호 변경하기</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <ButtonScarlet title={'적용하기'} onPress={updateMyInfo} />
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}

      {editPhone ? <Phone onPress={handleEditPhone} user="USER" /> : <></>}
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={'확인'}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default UserEditInfo;
