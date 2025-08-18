import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Email} from '@components/Certificate/Email';

const EmailCertificate = ({route}) => {
  const {user = '', agreements = [], phoneNumber = ''} = route.params;
  const navigation = useNavigation();

  const handleEmailVerifiedSuccess = email => {
    if (user === 'USER') {
      navigation.navigate('UserRegisterInfo', {
        agreements,
        email,
        phoneNumber,
      });
    } else {
      navigation.navigate('HostRegisterInfo', {
        agreements,
        email,
        phoneNumber,
      });
    }
  };

  return <Email user={user} onPress={handleEmailVerifiedSuccess} />;
};

export default EmailCertificate;
