import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },

  bodyContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flex: 1,
  },

  // 날짜
  sectionHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionHeaderText: {
    color: COLORS.grayscale_900,
  },
  sectionHeaderSuffix: {
    color: COLORS.primary_orange,
  },
  calendarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
  },

  // 모임 카드
  card: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 모임 정보
  cardInfo: {
    flexDirection: 'column',
    marginBottom: 6,
    gap: 4,
  },
  // 게하 이름
  ghName: {
    color: COLORS.grayscale_600,
  },
  // 모임 이름
  title: {
    color: COLORS.grayscale_800,
  },
  // 시간
  time: {
    color: COLORS.grayscale_900,
  },
  // 주소
  location: {
    color: COLORS.grayscale_500,
  },

  // 카드 버튼(참여 인원수, 취소)
  actionRow: {
    justifyContent: 'center',
    gap: 10,
  },
  // 참여 인원수
  capacityBadge: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  capacityText: {
    color: COLORS.grayscale_0,
  },
  // 삭제
  deleteBtn: {
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  deleteText: {
    color: COLORS.grayscale_400,
  },

  // 모임 추가하기 버튼
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary_orange,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fabText: {
    color: COLORS.white,
  },

  
});

export default styles;
