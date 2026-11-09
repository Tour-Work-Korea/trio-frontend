import React, {useEffect, useRef, useState} from 'react';

export default function RegistrationChoice({
  language,
  prices,
  earlyBird,
  paypalDiscounts = [],
  canApply,
  paypalAvailable,
  busy,
  error,
  onApply,
  onClose,
}) {
  const dialog = useRef(null);
  const [participant, setParticipant] = useState('');
  const korean = language === 'ko';
  const foreign = participant === 'foreign';

  useEffect(() => {
    const modal = dialog.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof window.HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="le-registration-dialog"
      aria-labelledby="registration-choice-title"
      onCancel={onClose}>
      <button
        className="le-registration-close"
        type="button"
        onClick={onClose}
        aria-label={korean ? '닫기' : 'Close'}>
        ×
      </button>
      <h2 id="registration-choice-title">
        {korean ? '참가 신청' : 'Register for this meetup'}
      </h2>
      <fieldset>
        <legend>
          {korean
            ? '참가자 유형을 선택하면 결제 방법을 안내해 드려요.'
            : 'Please select your participant type to see payment options.'}
        </legend>
        <label>
          <input
            type="radio"
            name="participant"
            value="korean"
            checked={participant === 'korean'}
            disabled={busy}
            onChange={() => setParticipant('korean')}
          />
          <span>
            {korean ? '한국인' : 'Korean participant'}
            <small>
              {korean
                ? '국내 결제 수단으로 원화(KRW) 결제'
                : 'Pay in KRW using Korean payment methods.'}
            </small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            name="participant"
            value="foreign"
            checked={foreign}
            disabled={busy}
            onChange={() => setParticipant('foreign')}
          />
          <span>
            {korean ? '외국인' : 'International participant'}
            <small>
              {korean
                ? '구글폼 신청 후 PayPal로 미국 달러(USD) 결제'
                : 'Register via Google Forms, then pay in USD with PayPal.'}
            </small>
          </span>
        </label>
      </fieldset>
      {participant && (
        <>
          <p className="le-registration-fee">
            {earlyBird && <span className="le-early-bird-badge">{korean ? '얼리버드' : 'EARLY BIRD'}</span>}
            <strong>
              {earlyBird
                ? korean ? '얼리버드 참가비: ' : 'Early-bird admission: '
                : foreign
                ? korean
                  ? '기본 참가비: '
                  : 'Standard admission: '
                : korean
                ? '참가비: '
                : 'Participation fee: '}
              {foreign ? prices.en : prices.ko}
            </strong>
          </p>
          {earlyBird && (
            <p className="le-early-bird-note">
              {korean
                ? '11월 14일 23:59(KST)까지 얼리버드 요금이 적용됩니다. 다른 할인과 중복되지 않아요.'
                : 'Early-bird pricing ends Nov 14 at 11:59 PM KST. It cannot be combined with other discounts.'}
            </p>
          )}
          {foreign && paypalDiscounts.length > 0 && (
            <div className="le-paypal-discounts">
              <strong>{korean ? '할인 안내' : 'Discounts'}</strong>
              <ul>
                {paypalDiscounts.map(rate => (
                  <li key={rate.optionId}>
                    {rate.label[language]}: ${rate.usdAmount} USD
                  </li>
                ))}
              </ul>
              <p>
                {korean
                  ? '해당되는 요금 하나를 선택해 PayPal에 USD로 직접 입력해 주세요. 친구 동반 할인은 각자에게 적용되며 중복 할인은 불가합니다.'
                  : 'Enter the applicable amount in USD on PayPal. The friend discount applies to each participant. Discounts cannot be combined.'}
              </p>
            </div>
          )}
          <p id="registration-payment-note">
            {foreign
              ? !paypalAvailable
                ? korean
                  ? '외국인 신청 폼을 준비 중이에요. 잠시 후 다시 확인해 주세요.'
                  : 'International registration is being prepared. Please check back soon.'
                : korean
                  ? '구글폼을 작성한 뒤 폼에 있는 PayPal 링크로 결제해 주세요. 입금 확인 후 이메일로 참가를 확정해 드려요.'
                  : 'Complete the Google Form, then pay through its PayPal link. Your spot is confirmed by email after we verify payment.'
              : canApply
              ? korean
                ? '기존 신청 화면에서 참가 정보를 입력하고 국내 결제를 진행해 주세요.'
                : 'Continue to enter your details and pay with a Korean payment method.'
              : korean
              ? '현재 국내 결제 신청을 이용할 수 없어요.'
              : 'Korean checkout is currently unavailable.'}
          </p>
          {error && <p role="alert">{error}</p>}
          <button
            type="button"
            className={`le-registration-button${
              foreign ? ' le-paypal-button' : ''
            }`}
            aria-describedby="registration-payment-note"
            aria-busy={busy}
            disabled={busy || (foreign ? !paypalAvailable : !canApply)}
            onClick={() => onApply(foreign ? 'paypal' : 'card')}>
            {busy
              ? korean
                ? '확인 중…'
                : 'Checking…'
              : foreign
              ? korean ? '신청하고 PayPal로 결제하기' : 'Register & pay with PayPal'
              : korean
              ? '계속하기'
              : 'Continue'}
          </button>
        </>
      )}
    </dialog>
  );
}
