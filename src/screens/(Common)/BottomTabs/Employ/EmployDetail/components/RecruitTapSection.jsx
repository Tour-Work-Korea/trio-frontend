import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from '../EmployDetail.styles';

export default function RecruitTapSection({recruit}) {
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
              <Text style={styles.infoValue}>
                {recruit.recruitStart?.split('T')[0]}~{' '}
                {recruit.recruitEnd?.split('T')[0]}
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

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>2025.01.25 전후</Text>
            </View> */}

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>초보 가능, 밝은신 분 환영</Text>
            </View> */}
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
                {recruit.workStartDate?.split('T')[0]} ~{' '}
                {recruit.workEndDate?.split('T')[0]}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>{recruit.recruitCondition}</Text>
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
                <Image
                  key={idx}
                  source={require('@assets/images/exphoto.jpeg')} //item.recruitImageUrl
                  style={styles.workplacePhoto}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <Text>{recruit.location}</Text>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {' '}
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
    </>
  );
}
