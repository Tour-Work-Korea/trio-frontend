import communityApi from '@utils/api/communityApi';
import {companionApi} from './api';

// The companion summary omits the author, introduction and meeting place.
// Join the public detail contracts for each visible page, with bounded concurrency.
export async function loadCompanionFeedPage(page, isCurrent = () => true) {
  const slices = await Promise.all(
    ['OPEN', 'CLOSED'].map(status =>
      companionApi.list({status, page, size: 5}),
    ),
  );
  const summaries = slices.flatMap(slice => slice.data.content || []);
  const unique = [
    ...new Map(summaries.map(item => [item.companionId, item])).values(),
  ];
  const content = new Array(unique.length);
  let cursor = 0;
  await Promise.all(
    Array.from({length: Math.min(4, unique.length)}, async () => {
      while (cursor < unique.length && isCurrent()) {
        const index = cursor++;
        const summary = unique[index];
        const [detail, post] = await Promise.all([
          companionApi.detail(summary.companionId),
          communityApi.getPostDetail(summary.postId, {commentSize: 1}),
        ]);
        content[index] = {...summary, ...detail.data, post: post.data};
      }
    }),
  );
  return {
    content: content.filter(Boolean),
    last: slices.every(slice => slice.data.last),
  };
}
