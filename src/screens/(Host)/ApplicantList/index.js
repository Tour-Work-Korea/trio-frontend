// 기존 import 문은 동일하게 유지합니다

import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {View, ScrollView, SafeAreaView, FlatList, Alert} from 'react-native';
import styles from './ApplicantList.styles';
import hostEmployApi from '@utils/api/hostEmployApi';
import Header from '@components/Header';
import DropDownPicker from 'react-native-dropdown-picker';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Filter from './Filter';
import ApplicantItem from './ApplicantItem';
import {COLORS} from '@constants/colors';

const ApplicantList = () => {
  const route = useRoute();
  const guesthouseId = route.params ?? null;
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [applicants, setApplicants] = useState();
  const [selectedGuesthouse, setSelectedGuesthouse] = useState('all');
  const [guesthouseOpen, setGuesthouseOpen] = useState(false);
  const [guesthouseList, setGuesthouseList] = useState([
    {label: '전체 게스트하우스', value: 'all'},
  ]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (guesthouseId) {
        await handleSelectedGuesthouse(guesthouseId);
      } else {
        await handleSelectedGuesthouse('all');
      }
    };
    const fetchMyGuestHouse = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthouses();
        const options = response.data.map(g => ({
          label: g.guesthouseName,
          value: g.id,
        }));
        setGuesthouseList(prev => [...prev, ...options]);
      } catch (error) {
        Alert.alert('나의 게스트하우스 조회에 실패했습니다.');
      }
    };
    fetchMyGuestHouse();
    fetchApplicants();
  }, []);

  const handleSelectedGuesthouse = async value => {
    try {
      let response;
      if (value === 'all') {
        response = await hostEmployApi.getAllApplicants();
        setSelectedGuesthouse('all');
      } else {
        response = await hostEmployApi.getApplicantsByGuesthouse(value);
        setSelectedGuesthouse(value);
      }
      setApplicants(response.data);
    } catch (error) {
      Alert.alert('지원서 조회에 실패했습니다.');
    }
  };

  const handleApplicantPress = id => {
    navigation.navigate('ResumeDetail', {id, role: 'HOST'});
  };

  const parseYears = str => {
    const matched = str.match(/(\d+)년/);
    return matched ? parseInt(matched[1], 10) : 0;
  };

  const filteredApplicants = applicants?.filter(applicant => {
    switch (selectedFilter) {
      case 'career1':
        return parseYears(applicant.totalExperience) >= 1;
      case 'age20':
        return applicant.age >= 20 && applicant.age < 30;
      case 'age30':
        return applicant.age >= 30 && applicant.age < 40;
      case 'genderF':
        return applicant.gender === 'F';
      case 'genderM':
        return applicant.gender === 'M';
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="지원자 조회" />
      <View style={styles.body}>
        <Filter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        <View style={{zIndex: 1000}}>
          <DropDownPicker
            open={guesthouseOpen}
            value={selectedGuesthouse}
            items={guesthouseList}
            setOpen={setGuesthouseOpen}
            setValue={callback => {
              const value = callback();
              handleSelectedGuesthouse(value);
            }}
            setItems={setGuesthouseList}
            zIndex={1000}
            zIndexInverse={3000}
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdown}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          <FlatList
            data={filteredApplicants}
            renderItem={({item}) => (
              <ApplicantItem
                item={item}
                handleApplicantPress={handleApplicantPress}
              />
            )}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{gap: 8}}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ApplicantList;
