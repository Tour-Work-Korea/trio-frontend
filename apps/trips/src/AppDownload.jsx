import React, {useState} from 'react';
import {APP_STORE_URLS, storeForDevice} from './appStores.js';
import './trips-account.css';

export default function AppDownload({completed = false}) {
  const [showStores, setShowStores] = useState(false);
  const storeUrl = storeForDevice(
    navigator.userAgent,
    navigator.maxTouchPoints,
  );
  return (
    <section className="nm-app-download" aria-label="게딱지 앱 안내">
      <img
        src="/trips-assets/ddakji-app-icon.png"
        width="80"
        height="80"
        alt="게딱지"
        loading="lazy"
      />
      <h2>
        {completed ? '다음 여행도 게딱지에서' : '이번 여행이 마음에 들었다면'}
      </h2>
      <p>
        {completed ? (
          '예약 내역을 확인하고, 다음 여행도 찾아보세요.'
        ) : (
          <>
            게딱지에서 더 많은 프로그램과
            <br />
            게스트하우스를 만나보세요.
          </>
        )}
      </p>
      {storeUrl ? (
        <a className="nm-account-primary" href={storeUrl}>
          {completed ? '게딱지 앱 다운로드' : '게딱지 앱에서 더 보기'} ↗
        </a>
      ) : (
        <>
          <button
            type="button"
            className="nm-account-primary"
            aria-expanded={showStores}
            onClick={() => setShowStores(value => !value)}>
            {completed ? '게딱지 앱 다운로드' : '게딱지 앱에서 더 보기'} ↗
          </button>
          {showStores && (
            <div className="nm-store-links">
              <a
                href={APP_STORE_URLS.ios}
                target="_blank"
                rel="noopener noreferrer">
                App Store ↗
              </a>
              <a
                href={APP_STORE_URLS.android}
                target="_blank"
                rel="noopener noreferrer">
                Google Play ↗
              </a>
            </div>
          )}
        </>
      )}
    </section>
  );
}
