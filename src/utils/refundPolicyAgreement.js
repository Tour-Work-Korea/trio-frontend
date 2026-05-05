const isValidRefundPolicy = policy =>
  Number.isFinite(Number(policy?.daysBeforeCheckin)) &&
  Number.isFinite(Number(policy?.refundRate));

const formatDaysBeforeCheckin = days => {
  const numericDays = Number(days);
  return numericDays === 0 ? '체크인 당일' : `체크인 ${numericDays}일 전`;
};

export const normalizeRefundPolicies = refundPolicies => {
  if (!Array.isArray(refundPolicies)) {
    return [];
  }

  return refundPolicies
    .filter(isValidRefundPolicy)
    .map(policy => ({
      daysBeforeCheckin: Number(policy.daysBeforeCheckin),
      refundRate: Number(policy.refundRate),
    }))
    .filter(policy => policy.daysBeforeCheckin > 0)
    .sort((a, b) => b.daysBeforeCheckin - a.daysBeforeCheckin);
};

export const buildRefundPolicyTableHtml = refundPolicies => {
  const normalizedPolicies = normalizeRefundPolicies(refundPolicies);

  if (normalizedPolicies.length === 0) {
    return '';
  }

  const policyRows = normalizedPolicies
    .map(
      policy => `
            <tr>
              <td>${formatDaysBeforeCheckin(policy.daysBeforeCheckin)}</td>
              <td>총 결제금액의 ${policy.refundRate}% 환불</td>
            </tr>`,
    )
    .join('');
  const sameDayNonRefundableRow = `
            <tr>
              <td>체크인 당일</td>
              <td>취소 및 환불 불가</td>
            </tr>`;

  return `
        <table>
          <tbody>${policyRows}${sameDayNonRefundableRow}
          </tbody>
        </table>`;
};

export const applyRefundPoliciesToAgreementHtml = (
  agreementHtml,
  refundPolicies,
) => {
  const refundPolicyTableHtml = buildRefundPolicyTableHtml(refundPolicies);

  if (!agreementHtml || !refundPolicyTableHtml) {
    return agreementHtml;
  }

  return agreementHtml.replace(
    /<table>[\s\S]*?<\/table>/,
    refundPolicyTableHtml,
  );
};
