import {useTranslation} from 'react-i18next';
import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import RecruitCard from './RecruitCard';
import Loading from '@components/Loading';
import {toggleFavorite} from '@utils/toggleFavorite';

const ItemSeparator = () => <View style={styles.itemSeparator} />;

const RecruitList = ({
  data,
  onEndReached = null,
  loading = false,
  onJobPress,
  setRecruitList,
  scrollEnabled = true,
  ListFooterComponent = null,
  ListHeaderComponent = null,
  contentContainerStyle = null,
}) => {
  const {t} = useTranslation();
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading title={t('employ.loadingAnnouncements')} />
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      scrollEnabled={scrollEnabled}
      keyExtractor={item => item.recruitId.toString()}
      renderItem={({item}) => (
        <RecruitCard
          item={item}
          onPress={() => onJobPress(item.recruitId)}
          onToggleFavorite={() =>
            toggleFavorite({
              type: 'recruit',
              id: item.recruitId,
              isLiked: item.isLiked,
              setList: setRecruitList,
            })
          }
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={ItemSeparator}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={contentContainerStyle}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSeparator: {
    height: 16,
  },
});

export default RecruitList;
