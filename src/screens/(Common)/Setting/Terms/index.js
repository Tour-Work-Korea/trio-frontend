import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const Terms = () => {
  const navigation = useNavigation();

  return (
    <View style={{flex: 1, backgroundColor: COLORS.grayscale_100}}>
      <Header title={'이용약관'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingVertical: 16}}>
        <View style={styles.menuContainer}>
          <Text style={[styles.h2, {marginTop: 16}]}>
            2장. 이용계약의 성립 및 회원정보에 관한 권리의무
          </Text>

          <Text style={styles.h3}>제5조 (이용계약의 성립)</Text>
          <Text style={styles.p}>
            ① 회사의 서비스 이용계약(이하 “이용계약”)은 회원이 되고자 하는
            자(이하 “가입신청자”)가 회사가 정한 가입 양식에 따라 회원정보를
            기입하여 회원가입 신청을 한 후 회사가 이를 승낙함으로써 성립합니다.
            회원가입 신청 시 본 약관과 개인정보처리방침을 읽고 동의 또는 확인
            버튼을 누른 경우 본 약관에 동의한 것으로 간주합니다.
          </Text>
          <Text style={styles.p}>
            ② 전 항의 신청에 있어 회사는 회원의 종류에 따라 전문기관을 통한
            실명확인 및 본인인증을 요청할 수 있으며, 회원은 본인인증에 필요한
            이름, 생년월일, 연락처 등을 제공하여야 합니다.
          </Text>

          <Text style={styles.h3}>제6조 (회원가입 신청의 승낙과 제한)</Text>
          <Text style={styles.p}>
            ① 회사는 다음 각 호에 해당하는 경우 회원가입 신청을 승낙을 거절할 수
            있으며 이용계약 성립 후에 밝혀진 경우 이용계약을 해지할 수 있습니다.
          </Text>
          <Text style={styles.li}>
            1. 회원정보를 허위로 기재하거나 누락, 오기가 있는 경우
          </Text>
          <Text style={styles.li}>
            2. 타인의 명의 또는 이메일, 연락처 등의 개인정보를 도용한 경우
          </Text>
          <Text style={styles.li}>
            3. 관계법령에 위배되거나 사회의 안녕질서 또는 미풍양속을 저해할
            목적으로 신청한 경우
          </Text>
          <Text style={styles.li}>
            4. 본 약관에 의하여 5년 내에 회원자격을 상실한 적이 있는 경우(재가입
            승낙 시 제외)
          </Text>
          <Text style={styles.li}>
            5. 이미 가입된 회원과 회원정보가 동일한 경우
          </Text>
          <Text style={styles.li}>
            6. 만 14세 미만의 아동이 신청하는 경우(법정대리인 동의가 있더라도
            승낙 거절 가능)
          </Text>
          <Text style={styles.p}>
            ② 회사는 다음 각 호에 해당하는 경우 각 사유가 해소될 때까지 신청에
            대한 승낙을 유보할 수 있습니다.
          </Text>
          <Text style={styles.li}>
            1. 회사의 설비에 현실적인 여유가 없는 경우
          </Text>
          <Text style={styles.li}>
            2. 서비스를 제공하기에 기술상 지장이 있는 경우
          </Text>
          <Text style={styles.li}>
            3. 제5조 제2항에 따른 실명확인 및 본인인증 절차가 진행 중인 경우
          </Text>

          <Text style={styles.h3}>제7조 (회원정보의 관리)</Text>
          <Text style={styles.p}>
            ① 회원은 서비스 내 정보수정 기능이나 고객센터 등을 통해 개인정보를
            열람 및 수정할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ② 회원은 등록한 회원정보가 변경된 경우 해당 정보를 수정해야 합니다.
            이를 수정하지 않아 발생하는 불이익은 회원이 부담하며 회사의 고의
            또는 중과실이 없는 한 회사는 그 불이익에 대하여 책임지지 않습니다.
          </Text>
          <Text style={styles.p}>
            ③ 회원의 이력서는 작성 및 수정 시 희망한 형태로 등록 및 제공됩니다.
          </Text>

          <Text style={styles.h3}>제8조 (회원정보의 수집과 보호)</Text>
          <Text style={styles.p}>
            ① 회사는 서비스를 제공함에 있어 개인정보 관련 법령을 준수하고 그에
            따라 회원정보를 수집·이용·보관·제공합니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 회원이 직접 제공한 정보 외에도 관련 법령에서 정한 절차에
            따라 그 밖의 정보를 수집 및 이용 또는 제3자에게 제공할 수 있습니다.
            이 경우 필요한 동의를 받거나 법령상 절차를 준수합니다.
          </Text>
          <Text style={styles.p}>
            ③ 회사는 개인정보 보호 관련 법령이 정하는 바에 따라 회원의
            개인정보를 보호하기 위해 노력하며, 회사의 개인정보 처리에 관한
            자세한 사항은 개인정보처리방침을 통해 확인할 수 있습니다.
          </Text>

          <Text style={styles.h2}>3장. 서비스 이용</Text>

          <Text style={styles.h3}>제9조 (서비스의 이용)</Text>
          {/* 원문에 구체 내용이 없는 조항은 제목만 표기 */}

          <Text style={styles.h3}>제10조 (서비스의 내용)</Text>
          <Text style={styles.p}>
            ① 회사는 제2조 제1항의 서비스를 제공하며, 그 내용은 다음 각 호와
            같습니다(생략).
          </Text>
          <Text style={styles.p}>
            ② 회사는 필요한 경우 서비스의 내용을 추가 또는 변경할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ③ 회사는 원활한 서비스 제공의 곤란, 수익성 악화, 운영상 또는 기술상
            필요에 의하거나 제12조 제2항 각 호의 사유에 해당되는 경우 제공하고
            있는 서비스의 전부 또는 일부를 중단할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ④ 제2항과 제3항의 경우 회사는 추가·변경 내용, 중단 사유 등을 앱 내
            공지사항을 통해 회원에게 공지하여야 합니다.
          </Text>
          <Text style={styles.p}>
            ⑤ 서비스 이용에 관한 세부적 안내나 정보는 서비스 운영정책이나 개별
            페이지 등을 통해 제공합니다.
          </Text>
          <Text style={styles.p}>
            ⑥ 서비스의 전부 또는 일부를 종료하거나 중단하는 경우 다음 각 호의
            경우를 제외하고는 회원에게 별도의 보상을 하지 않습니다.
          </Text>
          <Text style={styles.li}>
            1. 관련 법령 또는 개별 약관, 정책에 별도의 규정이 있는 경우
          </Text>
          <Text style={styles.li}>
            2. 회사의 귀책사유로 인해 서비스 종료 전 발생한 예약이 취소되는 경우
          </Text>

          <Text style={styles.h3}>제11조 (서비스의 요금)</Text>
          {/* 내용 생략(원문 구조 유지) */}

          <Text style={styles.h3}>제12조 (서비스의 변경 및 중지)</Text>
          <Text style={styles.p}>
            ① 회사는 변경될 서비스의 내용 및 적용일자를 제10조에서 정한 바에
            따라 통지하고 서비스를 추가하거나 변경하여 제공할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 중단할
            수 있습니다.
          </Text>
          <Text style={styles.li}>
            1. 시스템 정기점검, 서버 증설·교체 등 시스템 운영상 필요한 경우
          </Text>
          <Text style={styles.li}>
            2. 설비 장애, 이용 폭주, 기간통신사업자 서비스 중지 등 정상 제공이
            어려운 경우
          </Text>
          <Text style={styles.li}>3. 천재지변, 국가비상사태 등 불가항력</Text>
          <Text style={styles.li}>
            4. 기타 중대한 사유로 지속이 부적절하다고 인정되는 경우
          </Text>
          <Text style={styles.p}>
            ③ 전 항에 의하여 서비스를 중단하는 경우 회사는 제10조에서 정한
            방법으로 통지합니다. 다만 회사가 통제할 수 없는 사유로 통지가
            불가능한 경우에는 예외로 합니다.
          </Text>
          <Text style={styles.p}>
            ④ 회사는 제2항의 사유 중 회사의 고의 또는 과실 없이 발생한 중단으로
            인한 문제에 대해 책임지지 않습니다.
          </Text>

          <Text style={styles.h3}>제13조 (정보 제공 및 광고 게재)</Text>
          {/* 내용 생략 */}

          <Text style={styles.h3}>제14조 (권리의 귀속)</Text>
          <Text style={styles.p}>
            ① 서비스에 대한 저작권 및 지식재산권은 회사에게 귀속됩니다.
          </Text>
          <Text style={styles.p}>
            ② 회사가 제공하는 서비스의 디자인, 고유 텍스트, 그래픽,
            상표·마크·로고 등 일체의 권리는 회사가 보유하거나 사용권을
            보유합니다.
          </Text>
          <Text style={styles.p}>
            ③ 이용자가 서비스 이용 중 얻은 정보를 회사의 사전 승낙 없이 영리
            목적으로 이용하거나 제3자에게 이용하게 할 경우 책임을 물을 수
            있습니다.
          </Text>

          <Text style={styles.h2}>4장. 회사 및 이용자의 의무</Text>

          <Text style={styles.h3}>제15조 (회사의 의무)</Text>
          <Text style={styles.p}>
            ① 회사는 관련법에 금지되는 행위를 하지 않으며 약관에 따라 안정적인
            서비스를 제공하기 위해 노력합니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 개인정보보호를 위한 시스템을 갖추고 개인정보처리방침을
            준수하며, 이용자의 개인정보를 승낙 없이 제3자에게 누설하거나
            배포하지 않습니다.
          </Text>
          <Text style={styles.p}>
            ③ 이용자로부터 정당한 의견이 접수되는 경우 필요한 조치를 취합니다.
          </Text>
          <Text style={styles.p}>
            ④ 회사의 고의나 중과실로 이용자에게 손해가 발생한 경우에 한하여
            책임을 부담합니다.
          </Text>
          <Text style={styles.p}>
            ⑤ 이용자 간 분쟁이 발생한 경우, 관련 법령에 따라 조치하고 처리
            방안을 안내합니다.
          </Text>

          <Text style={styles.h3}>제16조 (이용자의 의무)</Text>
          <Text style={styles.p}>
            ① 회원은 법령, 본 약관, 회사가 통지한 사항을 준수하고 회사 업무를
            방해하는 행위를 해서는 안 됩니다.
          </Text>
          <Text style={styles.p}>
            ② 결제 전 상세 내용과 거래 조건을 확인해야 하며, 확인하지 않아
            발생한 손해에 대해 회사는 책임지지 않습니다.
          </Text>
          <Text style={styles.p}>
            ③ 신용카드 비밀번호 등 정보유실 방지는 회원이 관리합니다(서비스
            결함으로 인한 경우 회사 책임).
          </Text>
          <Text style={styles.p}>
            ④ 서비스 이용권한·지위를 타인에게 양도·증여하거나 담보로 제공할 수
            없습니다.
          </Text>
          <Text style={styles.p}>
            ⑤ 회원은 다음 각 호의 행위를 해서는 안 됩니다.
          </Text>
          <Text style={styles.li}>
            1. 본인인증 등 과정에서 허위 내용 기재·전송
          </Text>
          <Text style={styles.li}>2. 타인의 정보를 도용하여 서비스 이용</Text>
          <Text style={styles.li}>
            3. 고의로 회사 및 게스트하우스 회원과 연락을 두절하는 행위
          </Text>
          <Text style={styles.li}>
            4. 타인의 개인정보를 동의 없이 수집·저장·공개
          </Text>
          <Text style={styles.li}>5. 범죄를 목적으로 하거나 관련된 행위</Text>
          <Text style={styles.li}>6. 타 회원의 명예를 훼손·모욕하는 행위</Text>
          <Text style={styles.li}>
            7. 회사의 지적재산권 등 권리를 침해하는 행위
          </Text>
          <Text style={styles.li}>8. 해킹행위 또는 바이러스 유포</Text>
          <Text style={styles.li}>
            9. 서비스 안정적 운영에 지장을 주는 행위
          </Text>
          <Text style={styles.li}>
            10. 사이트 정보·서비스를 이용한 영리 행위
          </Text>
          <Text style={styles.li}>
            11. 회사 직원, 관리자, 운영자를 사칭하는 행위
          </Text>
          <Text style={styles.li}>
            12. 기타 선량한 풍속·사회질서 해하거나 법령 위반
          </Text>

          <Text style={styles.h3}>제17조 (서비스 이용 해지)</Text>
          <Text style={styles.p}>
            ① 회원은 안내된 해지방법에 따라 해지를 신청할 수 있습니다.
          </Text>
          <Text style={styles.p}>
            ② 회사는 해지신청이 접수되면 해당 회원의 이용계약을 해지합니다.
          </Text>
          <Text style={styles.p}>
            ③ 회원은 해지 신청 전 모든 예약 및 이용을 완료하여야 하며, 완료 전
            해지 시 예약을 철회 또는 취소하여야 합니다. 이 경우 발생하는
            불이익은 회원이 부담합니다.
          </Text>
          <Text style={styles.p}>
            ④ 회사는 다음 각 호에 해당하는 경우 사전 동의 없이 이용계약 해지
            또는 이력서 삭제 조치를 할 수 있습니다.
          </Text>
          <Text style={styles.li}>1. 회원의 의무 불이행</Text>
          <Text style={styles.li}>2. 유료서비스 요금 미납</Text>
          <Text style={styles.li}>
            3. 서비스 목적에 맞지 않은 정보 활용으로 사회적 물의 발생
          </Text>
          <Text style={styles.li}>
            4. 등록 정보가 사실과 다르거나 조작된 경우
          </Text>
          <Text style={styles.li}>5. 회사 또는 제3자의 명예를 훼손한 경우</Text>
          <Text style={styles.li}>6. 기타 위 각호에 준하는 사유</Text>
          <Text style={styles.li}>
            7. 허위 기재 또는 타인 명의 이용으로 확인된 경우
          </Text>
          <Text style={styles.li}>
            8. 만 14세 미만의 아동 정보로 확인된 경우
          </Text>
          <Text style={styles.p}>
            ⑤ 계약 해지 시 관련법 및 개인정보처리방침에 따라 보유 가능한 경우를
            제외하고, 회원의 개인정보는 해지일로부터 7일 경과 후 삭제됩니다.
          </Text>

          <Text style={styles.h3}>제18조 (손해배상)</Text>
          <Text style={styles.p}>
            ① 회사가 약관 위반 등 책임 있는 사유로 회원에게 손해를 입힌 경우 그
            손해를 배상합니다.
          </Text>
          <Text style={styles.p}>
            ② 회사가 책임 있는 사유로 제공한 정보가 사실과 달라 회원이 손해를
            입은 경우 그 손해를 배상합니다.
          </Text>
          <Text style={styles.p}>
            ③ 회원이 약관 위반 등 책임 있는 사유로 회사 및 제3자에게 손해를 입힌
            경우 회원은 그 손해를 배상합니다.
          </Text>
          <Text style={styles.p}>
            ④ 다른 회원의 귀책사유로 손해가 발생한 경우 회사는 이에 대한 배상
            책임이 없습니다.
          </Text>

          <Text style={styles.h3}>제19조 (회원의 개인정보보호)</Text>
          <Text style={styles.p}>
            회사는 회원의 개인정보보호를 위하여 노력하며, 관련 법령과
            개인정보처리방침을 따릅니다.
          </Text>

          <Text style={styles.h3}>제20조 (신용정보의 제공·활용 동의)</Text>
          <Text style={styles.p}>
            ① 회사가 회원의 개인신용정보를 타인에게 제공·활용하고자 할 때에는
            관련 법령에 따라 사전에 사유 및 대상 기관 등을 밝히고 회원의 동의를
            얻어야 합니다.
          </Text>
          <Text style={styles.p}>
            ② 회원이 동의한 경우, 회사는 신용정보사업자 또는 집중기관 등에
            정보를 제공하여 신용 판단 자료나 공공기관의 정책자료로 활용될 수
            있습니다.
          </Text>

          <Text style={styles.h3}>제21조 (분쟁의 해결)</Text>
          <Text style={styles.p}>
            ① 회사와 회원은 서비스와 관련된 분쟁을 원만히 해결하기 위해
            노력합니다.
          </Text>
          <Text style={styles.p}>
            ② 동 분쟁에 관한 소송은 회사의 주소지 관할법원으로 합니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20},
  menuContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  h2: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 8,
  },
  h3: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
    marginTop: 12,
    marginBottom: 6,
  },
  p: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginBottom: 6,
  },
  li: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_700,
    lineHeight: 20,
    marginLeft: 12,
    marginBottom: 4,
  },
});

export default Terms;
