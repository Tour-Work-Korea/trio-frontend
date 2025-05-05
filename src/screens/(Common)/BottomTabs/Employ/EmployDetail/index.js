import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Share from '@assets/images/Share.svg';

const {width} = Dimensions.get('window');

const RecruitmentDetail = () => {
  const [activeTab, setActiveTab] = useState('모집조건');

  const handleTabPress = tabName => {
    setActiveTab(tabName);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '모집조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집기간</Text>
              <Text style={styles.infoValue}>2025.01.22(토) ~ 채용시 마감</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집인원</Text>
              <Text style={styles.infoValue}>여 1명, 남 1명</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>22 ~ 33세 (93년생까지)</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>2025.01.25 전후</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>초보 가능, 밝은신 분 환영</Text>
            </View>
          </View>
        );
      case '근무조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무형태</Text>
              <Text style={styles.infoValue}>주 4일 근무, 3일 휴무</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주요업무</Text>
              <Text style={styles.infoValue}>예약 관리 보조, 객실 청소</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무기간</Text>
              <Text style={styles.infoValue}>1달 이상</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>
                자원금 매달 00만원, 숙식 제공
              </Text>
            </View>
          </View>
        );
      case '근무지정보':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>근무지 사진</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}>
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
                }}
                style={styles.workplacePhoto}
              />
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
                }}
                style={styles.workplacePhoto}
              />
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
                }}
                style={styles.workplacePhoto}
              />
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
                }}
                style={styles.workplacePhoto}
              />
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <View style={styles.mapContainer}>
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
                }}
                style={styles.mapImage}
                resizeMode="cover"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <Text style={styles.headerButtonText}>게스트하우스 이름</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Share width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* 메인 이미지 */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pilyElr2PU6pIfuYKpfqAqxJ5EMeUx.png',
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* 공고 제목 및 정보 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>공고 제목</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>#해시태그1</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>#해시태그2</Text>
            </View>
          </View>
          <Text style={styles.location}>근무지 위치</Text>
          <Text style={styles.description}>공고 요약</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              업체 리뷰 평점(4.8) 리뷰개수 {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === '모집조건' && styles.activeTab]}
            onPress={() => handleTabPress('모집조건')}>
            <Text
              style={[
                styles.tabText,
                activeTab === '모집조건' && styles.activeTabText,
              ]}>
              모집조건
            </Text>
            {activeTab === '모집조건' && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === '근무조건' && styles.activeTab]}
            onPress={() => handleTabPress('근무조건')}>
            <Text
              style={[
                styles.tabText,
                activeTab === '근무조건' && styles.activeTabText,
              ]}>
              근무조건
            </Text>
            {activeTab === '근무조건' && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === '근무지정보' && styles.activeTab]}
            onPress={() => handleTabPress('근무지정보')}>
            <Text
              style={[
                styles.tabText,
                activeTab === '근무지정보' && styles.activeTabText,
              ]}>
              근무지정보
            </Text>
            {activeTab === '근무지정보' && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* 탭 내용 */}
        {renderTabContent()}

        {/* 상세 정보 */}
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>상세 정보</Text>
          <Text style={styles.detailContent}>상세 정보</Text>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerButtonText: {
    ...FONTS.fs_body_small,
    color: COLORS.black,
  },
  shareButton: {
    padding: 8,
  },
  mainImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  title: {
    ...FONTS.fs_h1_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    ...FONTS.fs_body_small,
    color: COLORS.scarlet,
  },
  location: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 8,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    ...FONTS.fs_body_small,
    color: COLORS.gray,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.scarlet,
  },
  tabText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  activeTabText: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.scarlet,
  },
  tabContent: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    flex: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  photoScroll: {
    marginBottom: 24,
  },
  workplacePhoto: {
    width: 150,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  detailTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  detailContent: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  bottomButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.stroke_gray,
  },
  applyButton: {
    backgroundColor: COLORS.scarlet,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
});

export default RecruitmentDetail;
