import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatDate } from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';

export default function UserPastReservations({ data }) {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.guesthouseImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={FONTS.fs_h2_bold}>{item.guesthouseName}</Text>
        <Text style={FONTS.fs_body}>체크인: {formatDate(item.checkIn)}</Text>
        <Text style={FONTS.fs_body}>체크아웃: {formatDate(item.checkOut)}</Text>
        <Text style={FONTS.fs_body}>결제금액: ₩ {item.amount.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.reservationId.toString()}
      renderItem={renderItem}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : 'flex-start',
      }}
      ListEmptyComponent={
        <EmptyState
          icon={SearchEmpty}
          iconSize={{ width: 120, height: 120 }}
          title="예약내역이 없어요"
          description="게스트하우스를 예약하러 가볼까요?"
          buttonText="게스트하우스 찾아보기"
          onPressButton={() => navigation.navigate('MainTabs', { screen: '게하' })}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
});
