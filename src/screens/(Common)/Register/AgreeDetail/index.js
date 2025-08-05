import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import {useNavigation} from '@react-navigation/native';

export default function AgreeDetail({route}) {
  const {title, detail} = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.safeareaview}>
      <View style={{height: 40}}></View>
      <View style={styles.view}>
        <Text style={[styles.titleText]}>{title}</Text>
        <View style={[styles.container]}>
          <Text style={[styles.detailText]}>{detail}</Text>
        </View>
        <ButtonScarlet title="확인" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  safeareaview: {
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleText: {
    ...FONTS.fs_18_semibold,
    textAlign: 'center',
  },
  detailText: {
    ...FONTS.fs_14_regular,
  },
  container: {
    backgroundColor: COLORS.grayscale_200,
    flex: 1,

    alignSelf: 'stretch',
    alignItems: 'center',
  },

  view: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
