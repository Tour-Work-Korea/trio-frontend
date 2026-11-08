import {Platform} from 'react-native';
import {openAppOrStoreFromWeb, APP_STORE_URLS} from '../../../packages/app/src/utils/webOpenApp';
import vm from 'node:vm';

jest.mock('../../../packages/app/src/i18n', () => ({
  resolvedLanguage: 'ko',
  t: key => key,
}));

const originalPlatform = Platform.OS;
const originalWindow = global.window;
const originalDocument = global.document;

function events(target = {}) {
  const listeners = new Map();
  return Object.assign(target, {
    addEventListener: jest.fn((type, fn) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type).add(fn);
    }),
    removeEventListener: jest.fn((type, fn) => listeners.get(type)?.delete(fn)),
    emit: type => [...(listeners.get(type) || [])].forEach(fn => fn()),
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  Platform.OS = 'web';
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  Platform.OS = originalPlatform;
  global.window = originalWindow;
  global.document = originalDocument;
});

function open(mode, os) {
  const doc = events({visibilityState: 'visible'});
  const win = events({
    navigator: {userAgent: os === 'ios' ? 'iPhone' : 'Android'},
    location: {href: '', replace: jest.fn()},
    setTimeout,
    clearTimeout,
  });
  global.window = win;
  global.document = doc;
  let html;
  if (mode === 'popup') {
    win.open = jest.fn(() => ({
      document: {open: jest.fn(), write: value => {html = value;}, close: jest.fn()},
    }));
  } else {
    win.open = jest.fn(() => null);
  }
  expect(openAppOrStoreFromWeb('ddakji://party/1804', {sameWindow: mode === 'same-window'})).toBe(true);
  if (mode === 'popup') {
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    vm.runInNewContext(script, {window: win, document: doc, setTimeout, clearTimeout, Date});
  }
  if (mode === 'same-window') expect(win.open).not.toHaveBeenCalled();
  expect(win.location.href).toBe('ddakji://party/1804');
  return {win, doc, storeUrl: APP_STORE_URLS[os]};
}

for (const mode of ['popup', 'blocked', 'same-window']) {
  for (const os of ['ios', 'android']) {
    test(`${mode}/${os}: unopened app falls back to the correct store`, () => {
      const {win, storeUrl} = open(mode, os);
      jest.advanceTimersByTime(1399);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      if (mode === 'popup') {
        expect(win.location.replace).toHaveBeenCalledWith(storeUrl);
      } else {
        expect(win.location.href).toBe(storeUrl);
      }
    });
    test(`${mode}/${os}: returning from the app never opens the store`, () => {
      const {win, doc} = open(mode, os);
      doc.visibilityState = 'hidden';
      doc.emit('visibilitychange');
      doc.visibilityState = 'visible';
      doc.emit('visibilitychange');
      win.emit('focus');
      jest.advanceTimersByTime(10000);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
    });
    test(`${mode}/${os}: delayed native confirmation allows app visibility to settle`, () => {
      const {win, doc} = open(mode, os);
      jest.setSystemTime(Date.now() + 10000);
      jest.advanceTimersByTime(1400);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
      doc.visibilityState = 'hidden';
      doc.emit('visibilitychange');
      doc.visibilityState = 'visible';
      win.emit('focus');
      jest.advanceTimersByTime(10000);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
    });
    test(`${mode}/${os}: store fallback waits while the browser is unfocused`, () => {
      const {win, storeUrl} = open(mode, os);
      win.emit('blur');
      jest.advanceTimersByTime(10000);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
      win.emit('focus');
      jest.advanceTimersByTime(1400);
      if (mode === 'popup') {
        expect(win.location.replace).toHaveBeenCalledWith(storeUrl);
      } else {
        expect(win.location.href).toBe(storeUrl);
      }
    });
    test(`${mode}/${os}: pagehide cancels the install fallback`, () => {
      const {win} = open(mode, os);
      win.emit('pagehide');
      jest.advanceTimersByTime(10000);
      expect(win.location.href).toBe('ddakji://party/1804');
      expect(win.location.replace).not.toHaveBeenCalled();
    });
  }
}
