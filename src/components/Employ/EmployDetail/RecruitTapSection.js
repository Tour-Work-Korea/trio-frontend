import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ImageModal from '@components/modals/ImageModal';
import {formatLocalDateTimeToDotAndTime} from '@utils/formatDate';

export default function RecruitTapSection({recruit}) {
  const [activeTab, setActiveTab] = useState('모집조건');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(0);

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
              <Text style={styles.infoValue}>
                {formatLocalDateTimeToDotAndTime(recruit.recruitStart).date}~{' '}
                {formatLocalDateTimeToDotAndTime(recruit.recruitEnd).date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집인원</Text>
              <Text style={styles.infoValue}>
                여 {recruit.recruitNumberFemale}명, 남{' '}
                {recruit.recruitNumberMale}명
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>
                {recruit.recruitMinAge} ~ {recruit.recruitMaxAge}세
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>
                {formatLocalDateTimeToDotAndTime(recruit.workStartDate).date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>{recruit.recruitCondition}</Text>
            </View>
          </View>
        );
      case '근무조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무형태</Text>
              <Text style={styles.infoValue}>{recruit.workType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주요업무</Text>
              <Text style={styles.infoValue}>{recruit.workPart}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무기간</Text>
              <Text style={styles.infoValue}>
                {formatLocalDateTimeToDotAndTime(recruit.workStartDate).date} ~{' '}
                {formatLocalDateTimeToDotAndTime(recruit.workEndDate).date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>{recruit.welfare}</Text>
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
              {recruit?.recruitImages?.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedImageId(idx);
                    setImageModalVisible(true);
                  }}>
                  <Image
                    source={{
                      uri: item.recruitImageUrl,
                    }}
                    style={styles.workplacePhoto}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <Text style={{...FONTS.fs_14_medium, color: COLORS.grayscale_800}}>
              {recruit.location}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <>
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
        </TouchableOpacity>
      </View>
      {/* 탭 내용 */}
      {renderTabContent()}
      {/* 이미지 선택 모달 */}
      <ImageModal
        visible={imageModalVisible}
        title={recruit.guesthouseName}
        images={recruit?.recruitImages?.map((item, idx) => ({
          id: idx,
          imageUrl: item.recruitImageUrl,
        }))}
        selectedImageIndex={selectedImageId}
        onClose={() => setImageModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingBottom: 4,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary_blue,
  },
  tabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
  },
  activeTabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.primary_blue,
  },
  //탭 상세 내용
  tabContent: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'column',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
  },
  infoLabel: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
    width: 60,
  },
  infoValue: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
  },
  divider: {
    height: 0,
    backgroundColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
  },
  photoScroll: {
    marginBottom: 12,
  },
  workplacePhoto: {
    width: 85,
    height: 85,
    borderRadius: 6,
    marginRight: 4,
  },
  mapContainer: {
    height: 134,
    borderRadius: 6,
    backgroundColor: COLORS.grayscale_200,
  },
});
