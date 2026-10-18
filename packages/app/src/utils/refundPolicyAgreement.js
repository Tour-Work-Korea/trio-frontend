import i18n from '@trio/app/src/i18n';
const isValidRefundPolicy = policy =>
  Number.isFinite(Number(policy?.daysBeforeCheckin)) &&
  Number.isFinite(Number(policy?.refundRate));

const formatDaysBeforeCheckin = days => {
  const numericDays = Number(days);
  return numericDays === 0
    ? i18n.t('common.onTheDayOfCheckIn')
    : i18n.t('common.checkInValueDaysAgo', {numericDays: numericDays});
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
              <td>${i18n.t('refund.percentageOfTotal', {
                rate: policy.refundRate,
              })}</td>
            </tr>`,
    )
    .join('');
  const sameDayNonRefundableRow = `
            <tr>
              <td>${i18n.t('common.onTheDayOfCheckIn')}</td>
              <td>${i18n.t('refund.noCancellationOrRefund')}</td>
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
