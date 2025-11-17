import React from 'react';
import {FlatList, View} from 'react-native';
import RecruitCard from './RecruitCard';
import Loading from '@components/Loading';
import {toggleFavorite} from '@utils/toggleFavorite';

const RecruitList = ({
  data,
  onEndReached = null,
  loading = false,
  onJobPress,
  setRecruitList,
  scrollEnabled = true,
  ListFooterComponent = null,
  ListHeaderComponent = null,
}) => {
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Loading title={'공고를 불러오는 중입니다'} />
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
      ItemSeparatorComponent={() => <View style={{height: 16}} />}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

export default RecruitList;
