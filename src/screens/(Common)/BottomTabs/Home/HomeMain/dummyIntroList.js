// dummyIntroList.js
export const DUMMY_INTRO_LIST = Array.from({length: 30}).map((_, i) => ({
  introId: i + 1,
  guesthouseId: i + 1,
  title: [
    '제주 곳곳의 감각적인 게스트하우스',
    '여행자들이 가장 편하게 지낼 수 있는 곳',
    '조천 읍 최고의 바다뷰를 자랑하는 게스트하우스',
    '따뜻한 대화와 포틀럭이 있는 집',
    '혼자 와도 금방 친구가 생기는 공간',
  ][i % 5],
  thumbnailUrl:
    'https://media.istockphoto.com/id/1317323736/ko/%EC%82%AC%EC%A7%84/%EB%82%98%EB%AC%B4-%EB%B0%A9%ED%96%A5%EC%9C%BC%EB%A1%9C-%ED%95%98%EB%8A%98%EB%A1%9C-%EB%B0%94%EB%9D%BC%EB%B3%B4%EB%8A%94-%EA%B2%BD%EC%B9%98.jpg?s=612x612&w=0&k=20&c=0xTghmMTXJ5ITCZ-LKTABbaPIK_1kWNf0FSFl_GL_7I=',
  guesthouseName: `비제티 게스트하우스111111 ${i + 1}`,
  hostProfileImageUrl:
    'https://media.istockphoto.com/id/1317323736/ko/%EC%82%AC%EC%A7%84/%EB%82%98%EB%AC%B4-%EB%B0%A9%ED%96%A5%EC%9C%BC%EB%A1%9C-%ED%95%98%EB%8A%98%EB%A1%9C-%EB%B0%94%EB%9D%BC%EB%B3%B4%EB%8A%94-%EA%B2%BD%EC%B9%98.jpg?s=612x612&w=0&k=20&c=0xTghmMTXJ5ITCZ-LKTABbaPIK_1kWNf0FSFl_GL_7I=',
  likeCount: 10 + ((i * 3) % 120),
  isLiked: i % 4 === 0, // 로그인 가정 더미
}));

// Page<IntroListResponse> mock
export const mockFetchIntroPage = async ({page = 0, size = 6}) => {
  // 네트워크 흉내
  await new Promise(r => setTimeout(r, 250));

  const start = page * size;
  const end = start + size;
  const content = DUMMY_INTRO_LIST.slice(start, end);

  const totalElements = DUMMY_INTRO_LIST.length;
  const totalPages = Math.ceil(totalElements / size);

  return {
    content,
    number: page,
    size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
  };
};
