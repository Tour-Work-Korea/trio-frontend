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
import BottomTabs from '../../../(Common)/BottomTabs';

const RecruitmentDetail = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 공고" />
      <View style={styles.body}></View>
      <BottomTabs />
    </SafeAreaView>
  );
};
export default RecruitmentDetail;
