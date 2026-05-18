import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  postContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    marginRight: 8,
  },
  nickname: {
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  time: {
    color: COLORS.grayscale_400,
  },
  postTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  postContent: {
    color: COLORS.grayscale_900,
    lineHeight: 21,
  },
  multiImageContainer: {
    gap: 12,
    marginTop: 14,
    paddingRight: 20,
  },
  multiPostImage: {
    width: 160,
    height: 220,
    borderRadius: 12,
  },
  singlePostImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 14,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.grayscale_900,
  },
  emptyText: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
    marginTop: 80,
  },
  footerLoading: {
    marginVertical: 16,
  },
});

export default styles;
