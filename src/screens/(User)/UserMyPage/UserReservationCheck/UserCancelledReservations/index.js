import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatDate } from '@utils/formatDate';

export default function UserCancelledReservations({ data }) {
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
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          취소된 예약이 없습니다.
        </Text>
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
