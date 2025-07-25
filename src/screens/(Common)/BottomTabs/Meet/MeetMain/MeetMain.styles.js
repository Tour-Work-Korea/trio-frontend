import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: COLORS.grayscale_800,
  },
  searchIcon: {
    position: 'absolute',
    right: 0,
  },

  // 배너
  bannerContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  bannerImage: {
    alignSelf: 'center',
    height: 120,
    width: '80%',
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayscale_200,
    marginHorizontal: 8,
  },
  dotActive: {
    backgroundColor: COLORS.grayscale_400,
  },

  // 모임 일정 캘린더
  meetListContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  },
  // 날짜
  dateTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dateTab: {
    width: 40,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dateTabSelected: {
    backgroundColor: COLORS.grayscale_100,
  },
  dateTabTop: {
    color: COLORS.grayscale_400,
  },
  dateTabTopSelected: {
    color: COLORS.grayscale_600,
  },
  dateTabDayNum: {
    color: COLORS.grayscale_800,
  },
  dateTabDayNumSelected: {
    color: COLORS.grayscale_900,
  },

  // 필터/정렬 바
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  // 필터
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
  },
  filterText: {
    color: COLORS.grayscale_800,
    marginLeft: 8,
  },
  // 태그
  tagChipsContainer: {
    paddingHorizontal: 8,
    gap: 8,
  },
  tagChip: {
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagChipText: {
    color: COLORS.primary_blue,
  },
  // 정렬
  sortRight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  sortText: {
    color: COLORS.grayscale_700,
    marginLeft: 8,
  },

  // 리스트
  listContent: {
    gap: 16,
  },
  meetItemContainer: {
  },
  // 주소, 시간 제외
  meetTopContainer: {
    flexDirection: 'row',
  }, 
  meetThumb: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  meetInfo: {
    flex: 1,
  },
  meetTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 게하 이름
  meetPlace: {
    color: COLORS.grayscale_600,
  },
  // 글 제목
  meetTitle: {
    color: COLORS.grayscale_800,
    marginTop: 4,
  },
  // 인원수
  capacityText: {
    color: COLORS.grayscale_400,
  },
  // 가격
  meetBottomRow: {
    position: 'absolute',
    bottom: 0,
    right: 0,    
  },
  price: {
    color: COLORS.grayscale_800,
  },
  // 주소, 시간
  meetBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  meetAddress: {
    color: COLORS.grayscale_500,
  },
  timeText: {
    color: COLORS.primary_orange,
  },

  // 모임 없을 때
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
});

export default styles;