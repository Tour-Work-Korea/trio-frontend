import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Phone from '@components/Certificate/Phone';

const PhoneCertificate = ({route}) => {
  const {user, agreements} = route.params;
  const navigation = useNavigation();

  const handlePhoneVerifiedSuccess = phoneNumber => {
    navigation.navigate('EmailCertificate', {
      user,
      agreements,
      phoneNumber,
    });
  };

  return <Phone user={user} onPress={handlePhoneVerifiedSuccess} />;
};

export default PhoneCertificate;
