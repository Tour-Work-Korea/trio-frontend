import styles from '../PostRecruitment/PostRecruitment.styles';
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
import Header from '@components/Header';

const ApplicantList = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="지원자 상세 페이지" />
      <View style={styles.body}>지원자 상세 페이지</View>
    </SafeAreaView>
  );
};
export default ApplicantList;
