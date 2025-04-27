import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Header from '@components/Header';
import styles from './MyRecruitmentList.styles';
import Person from '@assets/images/Person.svg';
import Trash from '@assets/images/Trash.svg';
import {BottomTabBar} from '@react-navigation/bottom-tabs';
import {FONTS} from '../../../../constants/fonts';

/*
 * 공고 목록 페이지
 */

const MyRecruitmentList = () => {
  // 샘플 데이터
  const postings = [
    {
      id: '1',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '2',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '3',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '4',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
  ];

  const renderPostingItem = ({item}) => (
    <View style={styles.postingCard}>
      <View style={styles.guestHouseTag}>
        <Text style={[styles.guestHouseText, FONTS.fs_body]}>
          {item.guestHouseName}
        </Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={[FONTS.fs_h2_bold]}>{item.title}</Text>
        <View style={styles.iconsContainer}>
          <TouchableOpacity>
            <Person />
          </TouchableOpacity>
          <TouchableOpacity>
            <Trash />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={[styles.dateLabel, FONTS.fs_body]}>최종수정일</Text>
        <Text style={[styles.date, FONTS.fs_body]}>{item.lastModified}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 공고" />
      <View style={styles.body}>
        <Text style={[styles.headerText, FONTS.fs_body]}>
          사람 아이콘을 누르면 해당 공고의 지원자를 확인할 수 있어요
        </Text>
        <ScrollView>
          <FlatList
            data={postings}
            renderItem={renderPostingItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MyRecruitmentList;
