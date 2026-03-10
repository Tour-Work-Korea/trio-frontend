import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 28,
  },

  // 검색
  topContent: {
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  contentTitle: {
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  contentSubTitle: {
    color: COLORS.grayscale_500,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  searchPlaceholder: {
    color: COLORS.grayscale_600,
  },

  // 검색 필터
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  conditionText: {
    color: COLORS.grayscale_900,
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_100,
  },
  filterText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
  quickTagScroll: {
    paddingHorizontal: 8,
    gap: 8,
  },
  quickTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTagText: {
    color: COLORS.primary_blue,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    padding: 10,
  },
  sortText: {
    marginLeft: 8,
    color: COLORS.grayscale_700,
  },

  // 게하 카드
  guesthouseSection: {
    paddingTop: 6,
    paddingBottom: 18,
  },
  guesthouseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  guesthouseName: {
    color: COLORS.grayscale_900,
    flex: 1,
    marginRight: 10,
  },
  moveGuesthouseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moveGuesthouseText: {
    color: COLORS.primary_blue,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  countChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 26,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyCountChip: {
    backgroundColor: COLORS.primary_orange,
  },
  partyCountText: {
    color: COLORS.grayscale_0,
  },
  eventCountText: {
    color: COLORS.grayscale_700,
  },
  partyList: {
    gap: 12,
  },

  // 파티 카드
  partyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  partyThumb: {
    width: 88,
    height: 88,
    borderRadius: 6,
    backgroundColor: COLORS.grayscale_200,
  },
  partyInfo: {
    flex: 1,
    height: 88,
  },
  partyTopInfo: {
    gap: 4,
  },
  partyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  partyTitle: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  partyPeopleRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  partyPeople: {
    color: COLORS.grayscale_400,
  },
  partyTime: {
    color: COLORS.primary_orange,
    textAlign: 'right',
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyText: {
    color: COLORS.grayscale_500,
  },
});

export default styles;
