import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import styles from './PostRecruitment.styles';

/*
 * 공고 등록 페이지
 */

const PostRecruitment = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 기본정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>기본정보</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="공고 제목을 입력해주세요."
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>
                공고를 등록할 게스트하우스를 선택해주세요.
              </Text>
              {/* 드롭다운 아이콘 */}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="간략하게 들어갈 공고 소개를 200자 이내로 작성해주세요."
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>모집 파트 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 모집조건 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>모집조건</Text>
          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateContainer}>
              <Text style={styles.dateText}>시작일자</Text>
              {/* 캘린더 아이콘 */}
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.dateContainer}>
              <Text style={styles.dateText}>마감일자</Text>
              {/* 캘린더 아이콘 */}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dateContainer}>
              <Text style={styles.dateText}>입도 날짜</Text>
              {/* 캘린더 아이콘 */}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>모집 인원</Text>
          <View style={styles.countRow}>
            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>여자</Text>
              <TextInput
                style={styles.input}
                placeholder="명"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.spacer} />
            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>남자</Text>
              <TextInput
                style={styles.input}
                placeholder="명"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.spacer} />
            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>성별 무관</Text>
              <TextInput
                style={styles.input}
                placeholder="명"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.sectionHeader}>나이</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageContainer}>
              <Text style={styles.ageLabel}>최소 연령</Text>
              <TextInput
                style={styles.input}
                placeholder="최소 연령"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.spacer} />
            <View style={styles.ageContainer}>
              <Text style={styles.ageLabel}>최대 연령</Text>
              <TextInput
                style={styles.input}
                placeholder="최대 연령"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="우대조건"
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>

        {/* 근무 조건 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>근무 조건</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="근무 환경을 입력해주세요. ex) 3인 2교대 4일 휴무"
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>주요 업무를 작성해주세요.</Text>
              {/* 드롭다운 아이콘 */}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>
                최소 근무 기간을 작성해주세요.
              </Text>
              {/* 드롭다운 아이콘 */}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>복지를 입력해주세요</Text>
              {/* 드롭다운 아이콘 */}
            </TouchableOpacity>
          </View>
        </View>

        {/* 근무지 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>근무지 정보</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="근무지 위치" />
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>근무지 사진</Text>
            <Text style={styles.photoLabel}>
              게스트하우스 및 객실 사진을 추가해주세요.
            </Text>
            <View style={styles.photoRow}>
              <View style={styles.photoContainer}>{/* 방 이미지 */}</View>
              <View style={styles.photoContainer}>{/* 방 이미지 */}</View>
              <View style={styles.photoContainer}>{/* 방 이미지 */}</View>
            </View>
          </View>
        </View>

        {/* 상세 소개글 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>상세 소개글</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="공고에 대한 상세 정보를 입력해주세요."
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>공고 등록하기</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>임시 저장</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>미리 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostRecruitment;
