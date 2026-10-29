import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import api from '@utils/api/userGuesthouseApi';
import GuesthouseReview from '@screens/(Common)/BottomTabs/Guesthouse/GuesthouseReview';

jest.mock('react-i18next', () => ({useTranslation: () => ({t: key => key})}));
jest.mock('@utils/api/userGuesthouseApi', () => ({
  getGuesthouseReviews: jest.fn(),
}));
jest.mock('@components/Avatar', () => 'Avatar');
jest.mock('@components/modals/ImageModal', () => 'ImageModal');
jest.mock('@screens/_components/ContentImage', () => 'ContentImage');
jest.mock(
  '@screens/(Common)/BottomTabs/Guesthouse/GuesthouseReview/LoadingSkeleton',
  () => 'ReviewLoadingSkeleton',
);

const review = (id, isJobReview = false) => ({
  id,
  isJobReview,
  nickname: `guest-${id}`,
  reviewDetail: `review-${id}`,
  reviewRating: 5,
});
const page = (content, last = true) => ({data: {content, last}});
const pending = () => {
  let resolve;
  let reject;
  const promise = new Promise((success, failure) => {
    resolve = success;
    reject = failure;
  });
  return {promise, resolve, reject};
};
let screen;
const text = () => JSON.stringify(screen.toJSON());
const mount = async props =>
  act(async () => {
    screen = Renderer.create(<GuesthouseReview guesthouseId={1} {...props} />);
  });
const update = async props =>
  act(async () => {
    screen.update(<GuesthouseReview guesthouseId={1} {...props} />);
  });

beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  screen = null;
});

it('shows review skeletons until the initial response arrives', async () => {
  const request = pending();
  api.getGuesthouseReviews.mockReturnValueOnce(request.promise);
  await mount();
  expect(text()).toContain('ReviewLoadingSkeleton');
  await act(async () => request.resolve(page([review(1)])));
  expect(text()).toContain('review-1');
  expect(text()).not.toContain('ReviewLoadingSkeleton');
});

it('appends the next page without hiding existing cards and stops at the final page', async () => {
  const request = pending();
  api.getGuesthouseReviews
    .mockResolvedValueOnce(page([review(1)], false))
    .mockReturnValueOnce(request.promise);
  await mount();
  await update({loadMoreSignal: 1});
  expect(api.getGuesthouseReviews).toHaveBeenLastCalledWith({
    guesthouseId: 1,
    page: 1,
    size: 10,
    sort: 'id',
  });
  expect(text()).toContain('review-1');
  expect(text()).toContain('ReviewLoadingSkeleton');
  await act(async () => request.resolve(page([review(1), review(2)])));
  expect(text()).toContain('review-2');
  await update({loadMoreSignal: 2});
  expect(api.getGuesthouseReviews).toHaveBeenCalledTimes(2);
});

it('continues across a staff-only page using the public review API', async () => {
  api.getGuesthouseReviews
    .mockResolvedValueOnce(page([review(1, true)], false))
    .mockResolvedValueOnce(page([review(2)]));
  await mount();
  expect(api.getGuesthouseReviews).toHaveBeenCalledTimes(2);
  expect(text()).not.toContain('review-1');
  expect(text()).toContain('review-2');
});

it('ignores a late response from the previously displayed guesthouse', async () => {
  const old = pending();
  api.getGuesthouseReviews
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce(page([review(2)]));
  await mount();
  await update({guesthouseId: 2});
  await act(async () => old.resolve(page([review(1)])));
  expect(text()).toContain('review-2');
  expect(text()).not.toContain('review-1');
});

it('keeps loaded cards on failure and retries the same page on the next signal', async () => {
  api.getGuesthouseReviews
    .mockResolvedValueOnce(page([review(1)], false))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(page([review(2)]));
  await mount();
  await update({loadMoreSignal: 1});
  expect(text()).toContain('review-1');
  await update({loadMoreSignal: 2});
  expect(api.getGuesthouseReviews).toHaveBeenLastCalledWith({
    guesthouseId: 1,
    page: 1,
    size: 10,
    sort: 'id',
  });
  expect(text()).toContain('review-2');
});

it('keeps existing cards while a changed review count refreshes the first page', async () => {
  const request = pending();
  api.getGuesthouseReviews
    .mockResolvedValueOnce(page([review(1)]))
    .mockReturnValueOnce(request.promise);
  await mount({totalCount: 1});
  await update({totalCount: 2});
  expect(text()).toContain('review-1');
  await act(async () => request.resolve(page([review(2)])));
  expect(text()).toContain('review-2');
  expect(text()).not.toContain('review-1');
});
