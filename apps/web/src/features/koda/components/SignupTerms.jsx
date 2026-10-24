import React from 'react';
import {userRegisterAgrees} from '@data/agree';
import {AGREEMENT_CONTENT} from '@data/agreeContents';

const englishTitles = {
  TERMS_OF_SERVICE: 'Terms of service',
  AGE_OVER_14_CONFIRMATION: 'I am at least 14 years old',
  PRIVACY_POLICY: 'Collection and use of personal information',
  LOCATION_BASED_SERVICE: 'Location-based services',
  MARKETING_NOTIFICATION: 'Marketing notifications',
};

export const signupAgreements = userRegisterAgrees;

export default function SignupTerms({agreements, onChange, onNext, ko}) {
  const all = signupAgreements.every(item => agreements[item.id]);
  const required = signupAgreements
    .filter(item => item.isRequired)
    .every(item => agreements[item.id]);
  return (
    <div>
      <p className="le-signup-note">
        {ko
          ? 'KODA는 게딱지 계정을 함께 사용해요. 기존 서비스 약관을 확인해 주세요.'
          : 'KODA uses your Ddakji account. Please review the shared service terms.'}
      </p>
      <label className="le-signup-agree-all">
        <input
          type="checkbox"
          checked={all}
          onChange={() =>
            onChange(
              Object.fromEntries(signupAgreements.map(item => [item.id, !all])),
            )
          }
        />
        <span>
          {ko ? '전체 동의' : 'Agree to all'}
          <small>{ko ? '선택 항목 포함' : 'Includes optional items'}</small>
        </span>
      </label>
      <div className="le-signup-agreements">
        {signupAgreements.map(item => (
          <div key={item.id} className="le-signup-agreement">
            <label>
              <input
                type="checkbox"
                checked={!!agreements[item.id]}
                onChange={event =>
                  onChange({...agreements, [item.id]: event.target.checked})
                }
              />
              <span>
                <small>
                  {item.isRequired
                    ? ko
                      ? '필수'
                      : 'Required'
                    : ko
                    ? '선택'
                    : 'Optional'}
                </small>
                {ko ? item.title : englishTitles[item.id] || item.title}
              </span>
            </label>
            <details>
              <summary>{ko ? '내용 보기' : 'Read terms'}</summary>
              {!ko && (
                <p className="le-signup-note">
                  The original service terms below are in Korean.
                </p>
              )}
              <iframe
                title={ko ? item.title : englishTitles[item.id]}
                sandbox=""
                srcDoc={`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px/1.7 system-ui;color:#20211f;padding:12px;margin:0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:5px}img{max-width:100%}</style><body>${
                  AGREEMENT_CONTENT.USER[item.id]?.detailHtml || ''
                }</body></html>`}
              />
            </details>
          </div>
        ))}
      </div>
      <button
        className="le-signup-primary"
        type="button"
        disabled={!required}
        onClick={onNext}>
        {ko ? '동의하고 다음' : 'Agree and continue'}{' '}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
