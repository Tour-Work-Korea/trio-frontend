import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './StoreRegister.styles';
import Photo from '@assets/images/Photo.svg';
import {FONTS} from '../../../constants/fonts';

/*
 * 입점 등록 신청 페이지
 */

const StoreRegister = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.body}>
        {/* 입점 등록 안내 */}
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>입점 등록 신청</Text>
          <Text style={FONTS.fs_body}>입점신청 안내문구</Text>
        </View>

        {/* 사업자 등록 상호명, 법인명 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>사업자 등록 상호명/법인명</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="상호명 또는 법인명을 입력해주세요"
            />
          </View>
        </View>

        {/* 직원 수 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>직원 수</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="직원 수를 입력해주세요"
            />
          </View>
        </View>

        {/* 담당자 연락처 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>담당자 연락처</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="-없이 숫자만 입력해주세요"
            />
          </View>
        </View>

        {/* 사업자 주소 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>사업자 주소</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="주소를 입력해주세요"
            />
            <ButtonScarlet title="주소 검색" to="" />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="상세 주소를 입력해주세요"
            />
          </View>
        </View>

        {/* 사업자 등록증 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>사업자 등록증</Text>
          <Text style={FONTS.fs_body}>사업자 등록증 사진 등록 안내문구</Text>
          {/* 이미지 업로드 */}
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity style={styles.imageUploadBox}>
              <Photo width={100} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <ButtonScarlet title="신청하기" />
    </SafeAreaView>
  );
};

export default StoreRegister;
