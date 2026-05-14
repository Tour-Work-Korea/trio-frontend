import React from 'react';
import {StyleSheet, View} from 'react-native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';

const Community = () => {
  return (
    <View style={styles.container}>
      <Header title="커뮤니티" showBackButton={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default Community;
