import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import {useNavigation} from '@react-navigation/native';

export default function AgreeDetail({route}) {
  const {title, detail} = route.params;
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeareaview}>
      <View style={styles.view}>
        <Text style={[styles.titleText]}>{title}</Text>
        <View style={[styles.container]}>
          <Text style={[styles.detailText]}>{detail}</Text>
        </View>
        <ButtonScarlet title="확인" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeareaview: {
    backgroundColor: COLORS.white,
    flex: 1,
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
    position: 'absolute',
    top: 80,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
