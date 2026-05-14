import React, {useState} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import Avatar from '@components/Avatar';
import styles from './Community.styles';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import HeartIcon from '@assets/images/heart_black.svg';
import CommentIcon from '@assets/images/chat_black.svg';

const sampleImage = require('@assets/images/exphoto.jpeg');

const sortChips = ['최신순', '등록순'];
const categoryChips = ['게하추천', '맛집', '카페', '동행', '스탭'];
const posts = [
  {
    id: 1,
    category: '게하추천',
    nickname: '게딱지',
    avatarUrl: 'https://picsum.photos/seed/community-avatar-1/120/120',
    time: '20h',
    title: '애월쪽 게하 추천좀',
    content: '이번에 애월로 여행을 갈 예정인데 게하 추천좀 해줘',
    images: [],
    likeCount: 66,
    commentCount: 38,
  },
  {
    id: 2,
    category: '게하추천',
    nickname: '게딱지',
    avatarUrl: 'https://picsum.photos/seed/community-avatar-1/120/120',
    time: '20h',
    title: '애월쪽 게하 추천좀',
    content:
      '이번에 애월로 여행을 갈 예정인데 게하 추천좀 해줘 어디가 제일 좋은 거 같애?',
    images: [],
    likeCount: 66,
    commentCount: 38,
  },
  {
    id: 3,
    category: '게하추천',
    nickname: '게딱지',
    avatarUrl: 'https://picsum.photos/seed/community-avatar-1/120/120',
    time: '20h',
    title: '애월쪽 게하 추천좀',
    content: '이번에 애월로 여행을 갈 예정인데 게하 추천좀 해줘',
    images: [sampleImage, sampleImage, sampleImage],
    likeCount: 66,
    commentCount: 38,
  },
  {
    id: 4,
    category: '게하추천',
    nickname: '게딱지',
    avatarUrl: 'https://picsum.photos/seed/community-avatar-1/120/120',
    time: '20h',
    title: '애월쪽 게하 추천좀',
    content: '이번에 애월로 여행을 갈 예정인데 게하 추천좀 해줘',
    images: [sampleImage],
    likeCount: 66,
    commentCount: 38,
  },
];

const Community = () => {
  const navigation = useNavigation();
  const [selectedSort, setSelectedSort] = useState(sortChips[0]);
  const [selectedCategory, setSelectedCategory] = useState(categoryChips[0]);
  const [sortVisible, setSortVisible] = useState(false);

  const handleSelectSort = sort => {
    setSelectedSort(sort);
    setSortVisible(false);
  };

  const renderPostImages = images => {
    if (!images.length) {
      return null;
    }

    if (images.length === 1) {
      return (
        <Image
          source={images[0]}
          style={styles.singlePostImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.multiImageContainer}>
        {images.map((image, index) => (
          <Image
            key={index}
            source={image}
            style={styles.multiPostImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    );
  };

  const renderPost = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.postContainer}
      onPress={() => navigation.navigate('CommunityDetail', {postId: item.id})}>
      <View style={styles.postHeader}>
        <Avatar uri={item.avatarUrl} size={30} iconSize={30} style={styles.avatar} />
        <Text style={[FONTS.fs_16_medium, styles.nickname]}>
          {item.nickname}
        </Text>
        <Text style={[FONTS.fs_14_regular, styles.time]}>{item.time}</Text>
      </View>

      <Text style={[FONTS.fs_16_medium, styles.postTitle]}>
        {item.title}
      </Text>
      <Text style={[FONTS.fs_16_regular, styles.postContent]}>
        {item.content}
      </Text>

      {renderPostImages(item.images)}

      <View style={styles.postActions}>
        <View style={styles.actionItem}>
          <HeartIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.actionText]}>
            {item.likeCount}
          </Text>
        </View>
        <View style={styles.actionItem}>
          <CommentIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.actionText]}>
            {item.commentCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={[FONTS.fs_20_semibold, styles.title]}>커뮤니티</Text>

            <View style={styles.filterRow}>
              <View style={styles.sortWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.sortChip}
                  onPress={() => setSortVisible(prev => !prev)}>
                  <Text style={[FONTS.fs_14_medium, styles.sortChipText]}>
                    {selectedSort}
                  </Text>
                  {sortVisible ? (
                    <ChevronUp width={16} height={16} />
                  ) : (
                    <ChevronDown width={16} height={16} />
                  )}
                </TouchableOpacity>

                {sortVisible && (
                  <View style={styles.sortMenu}>
                    {sortChips.map(sort => (
                      <TouchableOpacity
                        key={sort}
                        activeOpacity={0.8}
                        style={styles.sortMenuItem}
                        onPress={() => handleSelectSort(sort)}>
                        <Text
                          style={[
                            FONTS.fs_16_medium,
                            styles.sortMenuText,
                            selectedSort === sort && styles.selectedSortMenuText,
                          ]}>
                          {sort}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipContainer}>
                {categoryChips.map(chip => {
                  const selected = selectedCategory === chip;

                  return (
                    <TouchableOpacity
                      key={chip}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCategory(chip)}
                      style={[styles.chip, selected && styles.selectedChip]}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.chipText,
                          selected && styles.selectedChipText,
                        ]}>
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        }
      />

      <TouchableOpacity activeOpacity={0.8} style={styles.writeButton}>
        <PlusIcon width={20} height={20} />
        <Text style={[FONTS.fs_14_medium, styles.writeButtonText]}>글쓰기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Community;
