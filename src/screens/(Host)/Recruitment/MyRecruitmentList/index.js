import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import Person from '@assets/images/Person.svg';
import Trash from '@assets/images/Trash.svg';
import styles from './MyRecruitmentList.styles';
import {FONTS} from '@constants/fonts';
import hostEmployApi from '@utils/api/hostEmployApi';

const MyRecruitmentList = () => {
  const navigation = useNavigation();
  const [myRecruits, setMyRecruits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedRecruitId, setSelectedRecruitId] = useState(null);

  useEffect(() => {
    getMyRecruits();
  }, []);

  const getMyRecruits = async () => {
    try {
      const response = await hostEmployApi.getMyRecruits();
      setMyRecruits(response.data);
    } catch (error) {
      Alert.alert('내 공고 조회에 실패했습니다.');
    }
  };

  const handleViewDetail = recruitId => {
    navigation.navigate('RecruitmentDetail', {recruitId});
  };

  const handleViewApplicants = recruitId => {
    navigation.navigate('ApplicantList', {recruitId});
  };

  const handleDeletePosting = id => {
    setSelectedRecruitId(id);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (!cancelReason.trim()) {
      Alert.alert('취소 사유를 입력해주세요.');
      return;
    }
    Alert.alert(
      `Deleting posting ${selectedRecruitId} with reason: ${cancelReason}`,
    );
    const fetchDeleteRecruit = async () => {
      try {
        const response = await hostEmployApi.requestDeleteRecruit(
          selectedRecruitId,
          cancelReason,
        );
        Alert.alert('성공적으로 삭제 요청했습니다.');
      } catch (error) {
        Alert.alert('삭제 요청에 실패했습니다.');
      }
    };
    // fetchDeleteRecruit();
    setModalVisible(false);
    setCancelReason('');
  };

  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.recruitId)}>
      <View style={styles.postingCard}>
        <View style={styles.guestHouseTag}>
          <Text style={[styles.guestHouseText, FONTS.fs_body]}>
            {item.guesthouseName}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.recruitTitle}</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => handleViewApplicants(item.recruitId)}>
              <Person />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePosting(item.recruitId)}>
              <Trash />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 공고" />
      <View style={styles.body}>
        <ButtonScarlet title="새 공고" to="PostRecruitment" />
        <Text style={[styles.headerText, FONTS.fs_body]}>
          사람 아이콘을 누르면 해당 공고의 지원자를 확인할 수 있어요
        </Text>

        <FlatList
          data={myRecruits}
          renderItem={renderPostingItem}
          keyExtractor={item => item.recruitId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>공고를 취소하시겠습니까?</Text>
              <TextInput
                placeholder="취소 사유를 입력하세요"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={confirmDelete}>
                  <Text style={styles.modalButtonText}>제출</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MyRecruitmentList;
