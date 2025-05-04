import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';

const mockData = [
  {
    id: '1',
    name: '로맨틱 게하',
    date: '2025/04/14',
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: '2',
    name: '서울 하우스',
    date: '2025/04/10',
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: '3',
    name: '한옥 게스트하우스',
    date: '2025/04/08',
    image: require('@assets/images/exphoto.jpeg'),
  },
];

const MyGuesthouseList = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={[FONTS.fs_h2_bold, styles.name]}>{item.name}</Text>
        <Text style={[FONTS.fs_body, styles.date]}>{item.date}</Text>
      </View>
      <View style={styles.cardBtnContainer}>
        <ButtonScarlet
          title="방관리"
          marginHorizontal={0}
          onPress={() => navigation.navigate('MyGuesthouseDetail', {
            id: item.id,
            name: item.name,
          })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="마이페이지" />
      <View style={styles.buttonContainer}>
        <ButtonScarlet title="게스트 하우스 등록" marginHorizontal="0" to="MyGuesthouseAddEdit"/>
      </View>
      <FlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default MyGuesthouseList;
