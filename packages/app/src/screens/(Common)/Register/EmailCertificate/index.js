import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Email} from '@components/Certificate/Email';

const EmailCertificate = ({route}) => {
  const {user = '', agreements = []} = route.params;
  const navigation = useNavigation();

  const handleEmailVerifiedSuccess = email => {
    navigation.navigate('PhoneCertificate', {
      user,
      agreements,
      email,
    });
  };

  return <Email user={user} onPress={handleEmailVerifiedSuccess} />;
};

export default EmailCertificate;
