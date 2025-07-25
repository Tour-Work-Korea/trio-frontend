import React from 'react';
import {FlatList, View, Text} from 'react-native';
import RecruitCard from './RecruitCard';

const RecruitList = ({
  data,
  onEndReached = null,
  loading = false,
  onJobPress,
  onToggleFavorite,
  setRecruitList,
  scrollEnabled = true,
  showErrorModal,
}) => {
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
            onToggleFavorite({
              id: item.recruitId,
              isLiked: item.isLiked,
              setRecruitList,
              showErrorModal,
            })
          }
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading && (
          <View style={{padding: 16}}>
            <Text style={{textAlign: 'center'}}>불러오는 중...</Text>
          </View>
        )
      }
      ItemSeparatorComponent={() => <View style={{height: 16}} />}
    />
  );
};

export default RecruitList;
