import React from 'react';
import {userRegisterAgrees} from '@data/agree';
import {getAgreementDocument} from '@data/agreeContents';
import i18n from '@trio/app/src/i18n';

export const signupAgreements = userRegisterAgrees;

export default function SignupTerms({agreements, onChange, onNext, ko}) {
  const t = i18n.getFixedT(ko ? 'ko' : 'en');
  const all = signupAgreements.every(item => agreements[item.id]);
  const required = signupAgreements
    .filter(item => item.isRequired)
    .every(item => agreements[item.id]);
  return (
    <div>
      <p className="le-signup-note">{t('signup.sharedAccountNotice')}</p>
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
          {t('signup.agreeAll')}
          <small>{t('signup.includesOptional')}</small>
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
                  {t(item.isRequired ? 'signup.required' : 'signup.optional')}
                </small>
                {t(item.titleKey)}
              </span>
            </label>
            <details>
              <summary>{t('signup.readTerms')}</summary>
              <iframe
                title={t(item.titleKey)}
                sandbox=""
                srcDoc={`<!doctype html><html lang="${
                  ko ? 'ko' : 'en'
                }"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px/1.7 system-ui;color:#20211f;padding:12px;margin:0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:5px}img{max-width:100%}</style><body>${
                  getAgreementDocument(item.id, ko ? 'ko' : 'en')?.detailHtml ||
                  ''
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
        {t('signup.agreeContinue')} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
