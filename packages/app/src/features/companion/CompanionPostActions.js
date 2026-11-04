import React, {useCallback, useRef} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {create} from 'zustand';
import AdaptiveText from '@components/AdaptiveText';
import useUserStore from '@stores/userStore';
import communityApi from '@utils/api/communityApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import {showErrorModal} from '@utils/loginModalHub';
import {formatNumber} from '@utils/localeFormat';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Heart from '@assets/images/like_fill_300.svg';
import LikedHeart from '@assets/images/Fill_Heart.svg';
import Comment from '@assets/images/companion_chat_gray.svg';

// Keep card actions in sync across the main carousel and all companion lists.
const usePostActions = create(() => ({posts: {}, pending: {}}));
const summary = post => ({
  isLiked: Boolean(post.isLiked),
  likeCount: Number(post.likeCount) || 0,
  commentCount: Number(post.commentCount) || 0,
});

export default function CompanionPostActions({item}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const viewer = useUserStore(state =>
    state.accessToken ? String(state.userProfile?.userId ?? 'user') : 'guest',
  );
  const postId = item.postId ?? item.post?.postId;
  const key = `${viewer}:${postId}`;
  const cached = usePostActions(state => state.posts[key]);
  const busy = usePostActions(state => Boolean(state.pending[key]));
  const post = cached ?? summary(item.post || {});
  const latest = useRef({post, postId, key});
  latest.current = {post, postId, key};
  const visited = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // The feed already supplies the initial summary. Refresh after returning
      // from detail so likes and newly submitted comments stay current.
      if (!visited.current) {
        visited.current = true;
        return;
      }
      let active = true;
      const current = {...latest.current, key};
      const beforeRequest = usePostActions.getState().posts[current.key];
      if (current.postId && !usePostActions.getState().pending[current.key]) {
        communityApi
          .getPostDetail(current.postId, {commentSize: 1})
          .then(({data}) => {
            if (
              active &&
              !usePostActions.getState().pending[current.key] &&
              usePostActions.getState().posts[current.key] === beforeRequest
            ) {
              usePostActions.setState(state => ({
                posts: {...state.posts, [current.key]: summary(data)},
              }));
            }
          })
          .catch(() => {});
      }
      return () => {
        active = false;
      };
    }, [key]),
  );

  const like = async event => {
    event.stopPropagation();
    if (!postId || usePostActions.getState().pending[key]) {return;}
    const previous = usePostActions.getState().posts[key] ?? post;
    usePostActions.setState(state => ({
      pending: {...state.pending, [key]: true},
    }));
    try {
      await toggleFavorite({
        type: 'communityPost',
        id: postId,
        isLiked: previous.isLiked,
        setItem: update =>
          usePostActions.setState(state => {
            const current = state.posts[key] ?? previous;
            const next = update(current);
            return {
              posts: {
                ...state.posts,
                [key]: {
                  ...next,
                  likeCount: Math.max(
                    0,
                    current.likeCount +
                      Number(next.isLiked) -
                      Number(current.isLiked),
                  ),
                },
              },
            };
          }),
      });
    } finally {
      usePostActions.setState(state => ({
        pending: {...state.pending, [key]: false},
      }));
    }
  };
  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t(
          post.isLiked ? 'companion.card.unlike' : 'companion.card.like',
        )}
        accessibilityState={{selected: post.isLiked, disabled: busy || !postId}}
        disabled={busy || !postId}
        hitSlop={8}
        style={styles.action}
        onPress={like}>
        {post.isLiked ? (
          <LikedHeart width={16} height={16} />
        ) : (
          <Heart width={16} height={16} />
        )}
        <AdaptiveText style={styles.count}>
          {formatNumber(post.likeCount)}
        </AdaptiveText>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('companion.card.writeComment')}
        disabled={!postId}
        hitSlop={8}
        style={styles.action}
        onPress={event => {
          event.stopPropagation();
          const {accessToken, userRole} = useUserStore.getState();
          if (!accessToken || !['USER', 'ADMIN'].includes(userRole)) {
            showErrorModal({
              message: t('common.pleaseLogInToWriteAComment'),
              buttonText: t('common.logIn'),
              buttonText2: t('common.cancel'),
              onPress: () => navigation.navigate('Login'),
              onPress2: () => {},
            });
            return;
          }
          if (item.companionId) {
            navigation.navigate('CompanionDetail', {
              companionId: item.companionId,
              focusCommentInput: true,
            });
          } else {
            navigation.navigate('CommunityDetail', {
              postId,
              sourceTab: 'COMPANION',
              focusCommentInput: true,
            });
          }
        }}>
        <Comment width={16} height={16} />
        <AdaptiveText style={styles.count}>
          {formatNumber(post.commentCount)}
        </AdaptiveText>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  count: {...FONTS.fs_14_regular, fontSize: 12, color: COLORS.grayscale_400},
});
