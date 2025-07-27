import React from 'react';
import {FlatList, View, Text} from 'react-native';
import RecruitCard from './RecruitCard';
import Loading from '@components/Loading';
import {COLORS} from '@constants/colors';

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
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Loading title={'공고를 불러오는 중입니다'} />
          </View>
        )
      }
      ItemSeparatorComponent={() => <View style={{height: 16}} />}
    />
  );
};

export default RecruitList;
