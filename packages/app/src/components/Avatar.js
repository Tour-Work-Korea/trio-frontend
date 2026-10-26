import {useTranslation} from 'react-i18next';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {COLORS} from '@constants/colors';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';
import AppImage from '@components/AppImage';

const Avatar = ({
  uri,
  size = 80,
  iconSize,
  borderRadius,
  style,
  imageStyle,
  IconComponent = EmptyImage,
}) => {
  const {t} = useTranslation();
  const fallbackIconSize = iconSize ?? Math.round(size * 0.4);
  const imageUri =
    typeof uri === 'string' && uri.trim() && uri !== t('common.pleaseAddAPhoto')
      ? uri
      : null;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius ?? size / 2,
        },
        style,
      ]}>
      {imageUri ? (
        <AppImage uri={imageUri} style={[styles.image, imageStyle]} />
      ) : (
        <IconComponent width={fallbackIconSize} height={fallbackIconSize} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
