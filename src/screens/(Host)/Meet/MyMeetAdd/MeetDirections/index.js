import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import MeetMeetingPlaceModal from '@components/modals/HostMy/Meet/AddMeet/MeetMeetingPlaceModal';
import MeetTrafficInfoModal from '@components/modals/HostMy/Meet/AddMeet/MeetTrafficInfoModal';
import MeetParkingInfoModal from '@components/modals/HostMy/Meet/AddMeet/MeetParkingInfoModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

import styles from './MeetDirections.styles';

const normalizeInitial = (v = {}) => {
  const base = {
    meetingPlace: '',
    trafficInfo: [],   // [{title, content}]
    parkingInfo: [],   // [{title, content}]
    parkingTag: [],    // ["PARTY_PARKING", ...]
  };

  const merged = {...base, ...(v || {})};

  merged.meetingPlace = typeof merged.meetingPlace === 'string' ? merged.meetingPlace : '';

  merged.trafficInfo = Array.isArray(merged.trafficInfo)
    ? merged.trafficInfo
        .map(x => ({
          title: x?.title ?? '',
          content: x?.content ?? '',
        }))
        .filter(x => x.title.trim() !== '' || x.content.trim() !== '')
    : [];

  merged.parkingInfo = Array.isArray(merged.parkingInfo)
    ? merged.parkingInfo
        .map(x => ({
          title: x?.title ?? '',
          content: x?.content ?? '',
        }))
        .filter(x => x.title.trim() !== '' || x.content.trim() !== '')
    : [];

  merged.parkingTag = Array.isArray(merged.parkingTag)
    ? merged.parkingTag.filter(Boolean)
    : [];

  return merged;
};

const MeetDirections = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {initialValues, onSelect} = route.params || {};

  const [party, setParty] = useState(normalizeInitial(initialValues));

  // 페이지 재진입 시에도 항상 최신 initialValues 반영
  useEffect(() => {
    setParty(normalizeInitial(initialValues));
  }, [initialValues]);

  // 모달 상태
  const [meetingPlaceVisible, setMeetingPlaceVisible] = useState(false);
  const [trafficVisible, setTrafficVisible] = useState(false);
  const [parkingVisible, setParkingVisible] = useState(false);

  const isMeetingPlaceDone = useMemo(
    () => (party.meetingPlace ?? '').trim().length > 0,
    [party.meetingPlace],
  );

  const isTrafficDone = useMemo(() => {
    const list = Array.isArray(party.trafficInfo) ? party.trafficInfo : [];
    return list.some(x => (x?.title ?? '').trim() || (x?.content ?? '').trim());
  }, [party.trafficInfo]);

  const isParkingDone = useMemo(() => {
    const hasInfo = (Array.isArray(party.parkingInfo) ? party.parkingInfo : [])
      .some(x => (x?.title ?? '').trim() || (x?.content ?? '').trim());
    const hasTags = Array.isArray(party.parkingTag) && party.parkingTag.length > 0;
    return hasInfo || hasTags;
  }, [party.parkingInfo, party.parkingTag]);

  const isSubmitReady = true;

  const renderRightIcon = done =>
    done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;

  const handleSubmit = () => {
    try {
      onSelect?.({
        meetingPlace: party.meetingPlace ?? '',
        trafficInfo: Array.isArray(party.trafficInfo) ? party.trafficInfo : [],
        parkingInfo: Array.isArray(party.parkingInfo) ? party.parkingInfo : [],
        parkingTag: Array.isArray(party.parkingTag) ? party.parkingTag : [],
      });

      Toast.show({type: 'success', text1: '오시는 길 정보가 적용되었어요.'});
      navigation.goBack();
    } catch (e) {
      Toast.show({type: 'error', text1: '적용 중 오류가 발생했어요.'});
    }
  };

  return (
    <View style={styles.container}>
      <Header title="오시는 길" />

      <View style={styles.bodyContainer}>

        {/* 집합 장소 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setMeetingPlaceVisible(true)}
        >
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>
              집합 장소
            </Text>
          </View>
          {renderRightIcon(isMeetingPlaceDone)}
        </TouchableOpacity>

        {/* 음식·음료 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setTrafficVisible(true)}
        >
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>교통 정보</Text>
          </View>
          {renderRightIcon(isTrafficDone)}
        </TouchableOpacity>

        {/* 이용 규칙 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setParkingVisible(true)}
        >
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>주차 정보</Text>
          </View>
          {renderRightIcon(isParkingDone)}
        </TouchableOpacity>

        {/* <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          필수 항목을 입력하셔야 등록이 완료됩니다.
        </Text> */}

      </View>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitReady && styles.submitButtonDisabled,
          ]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}>
            적용하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24} />
          ) : (
            <CheckBlack width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 집합 장소 모달 */}
      <MeetMeetingPlaceModal
        visible={meetingPlaceVisible}
        onClose={() => setMeetingPlaceVisible(false)}
        initialMeetingPlace={party.meetingPlace}
        onSelect={({meetingPlace}) => {
          setParty(p => ({...p, meetingPlace: meetingPlace ?? ''}));
          setMeetingPlaceVisible(false);
        }}
      />

      {/* 교통 정보 모달 */}
      <MeetTrafficInfoModal
        visible={trafficVisible}
        onClose={() => setTrafficVisible(false)}
        initialTrafficInfo={party.trafficInfo}
        onSelect={({trafficInfo}) => {
          setParty(p => ({
            ...p,
            trafficInfo: Array.isArray(trafficInfo) ? trafficInfo : [],
          }));
          setTrafficVisible(false);
        }}
      />

      {/* 주차 정보 모달 */}
      <MeetParkingInfoModal
        visible={parkingVisible}
        onClose={() => setParkingVisible(false)}
        initialParkingInfo={party.parkingInfo}
        initialParkingTag={party.parkingTag}
        onSelect={({parkingInfo, parkingTag}) => {
          setParty(p => ({
            ...p,
            parkingInfo: Array.isArray(parkingInfo) ? parkingInfo : [],
            parkingTag: Array.isArray(parkingTag) ? parkingTag : [],
          }));
          setParkingVisible(false);
        }}
      />
    </View>
  );
};

export default MeetDirections;
