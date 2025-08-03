import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import RightArrow from '@assets/images/arrow_right_white.svg';

// 사용 예시
// 사용할 페이지에서 import SearchEmpty from '@assets/images/search_empty.svg'; 불러오고
{/* <EmptyState
  icon={SearchEmpty}
  iconSize={{ width: 120, height: 120 }}
  title='즐겨찾는 게스트하우스가 없어요'
  description='마음에 드는 게스트 하우스를 찾으러 가볼까요?'
  buttonText='찾아보기'
/> */}

const EmptyState = ({
  icon: Icon,
  iconSize,
  title = '',
  description = '',
  buttonText = '',
  onPressButton = () => {},
}) => {
  return (
    <View style={styles.container}>
      {Icon && (
        <Icon width={iconSize.width} height={iconSize.height} />
      )}
      <Text style={[FONTS.fs_20_semibold, styles.title]}>{title}</Text>
      <Text style={[FONTS.fs_16_medium, styles.description]}>{description}</Text>

      {!!buttonText && (
        <TouchableOpacity style={styles.button} onPress={onPressButton}>
          <Text style={[FONTS.fs_14_medium, styles.buttonText]}>{buttonText}</Text>
          <RightArrow width={24} height={24}/>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    color: COLORS.grayscale_700,
    textAlign: 'center',
  },
  description: {
    marginTop: 4,
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    marginRight: 10,
  },
};

export default EmptyState;
