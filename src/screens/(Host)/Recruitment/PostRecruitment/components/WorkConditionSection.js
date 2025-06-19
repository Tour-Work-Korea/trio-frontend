import {View, Text, TextInput} from 'react-native';
import styles from '../PostRecruitment.styles';

export default function WorkConditionSection({handleInputChange, formData}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>근무 조건</Text>
      <View style={styles.divider} />

      <View style={styles.formGroup}>
        <TextInput
          style={styles.textArea}
          placeholder="근무 형태를 입력해주세요. ex) 3인 2교대 4일 휴무"
          multiline={true}
          numberOfLines={4}
          value={formData.workType}
          onChangeText={text => handleInputChange('workType', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          placeholder="주요 업무를 작성해주세요."
          value={formData.workPart}
          onChangeText={text => handleInputChange('workPart', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          placeholder="복지를 입력해주세요"
          value={formData.welfare}
          onChangeText={text => handleInputChange('welfare', text)}
        />
      </View>
    </View>
  );
}
