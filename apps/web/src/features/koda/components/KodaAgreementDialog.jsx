import React, {useEffect, useRef} from 'react';
import {getAgreementDocument} from '@data/agreeContents';
import '../styles/koda-agreement.css';

export default function KodaAgreementDialog({id, language, onClose}) {
  const dialog = useRef(null);
  const ko = language === 'ko';
  const document = getAgreementDocument(id, ko ? 'ko' : 'en');
  const title = document?.title || (ko ? '이용약관' : 'Terms and conditions');

  useEffect(() => {
    const opener = window.document.activeElement;
    const previousOverflow = window.document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    window.document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      window.document.body.style.overflow = previousOverflow;
      if (opener instanceof window.HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="le-agreement-dialog"
      aria-labelledby="koda-agreement-title"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}>
      <div className="le-agreement-content">
        <header className="le-agreement-header">
          <h2 id="koda-agreement-title">{title}</h2>
          <button type="button" onClick={onClose}>
            {ko ? '닫기' : 'Close'}
          </button>
        </header>
        <iframe
          title={title}
          sandbox=""
          srcDoc={`<!doctype html><html lang="${
            ko ? 'ko' : 'en'
          }"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px/1.7 system-ui;color:#20211f;padding:20px;margin:0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:5px}img{max-width:100%}</style><body>${
            document?.detailHtml || ''
          }</body></html>`}
        />
      </div>
    </dialog>
  );
}
