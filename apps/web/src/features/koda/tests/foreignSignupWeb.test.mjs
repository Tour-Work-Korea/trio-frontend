import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {countryOptions} from '../data/countryOptions.js';
import {kodaAuthReturnPlugin} from '../hosting/authReturnPlugin.js';

const require = createRequire(import.meta.url);
test('foreign profile web adapter does not replace unrelated registration screens', () => {
  const plugin = kodaAuthReturnPlugin('/repo/apps/web');
  assert.equal(plugin.resolveId('./(Common)/Register/ForeignRegisterProfile', '/repo/packages/app/src/screens/index.js'),
    '/repo/apps/web/src/features/koda/components/ForeignRegisterProfileWeb.jsx');
  assert.equal(plugin.resolveId('./(Common)/Register/RegisterProfile', '/repo/packages/app/src/screens/index.js'), undefined);
});
test('nationality options have unique ISO values with localized visible country names', () => {
  const en = countryOptions('en');
  assert.equal(en.length, 249);
  assert.equal(new Set(en.map(item => item.code)).size, 249);
  assert.ok(en.every(item => /^[A-Z]{2}$/.test(item.code)));
  assert.equal(en.find(item => item.code === 'US').name, 'United States');
  assert.equal(countryOptions('ko').find(item => item.code === 'KR').name, '대한민국');
});
for (const scenario of ['automatic', 'missing-credential', 'login-failed']) {
test(`English signup preserves fields and continues without another registration: ${scenario}`, async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'koda-foreign-signup-'));
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const previousWindow = globalThis.window;
  globalThis.__foreignSignupTest = {payload: null, nickname: null, scenario, signups: 0, logins: 0};
  globalThis.window = {sessionStorage: {getItem: () => JSON.stringify({target:'/koda/event/?id=party-3982&lang=en',createdAt:Date.now()})}, location: {replace: target => {globalThis.__foreignSignupTest.returnedTo = target;}}};
  let tree;
  try {
    const outfile = path.join(temp, 'screen.cjs');
    await build({
      stdin: {contents: `export {default} from ${JSON.stringify(new URL('../components/ForeignRegisterProfileWeb.jsx', import.meta.url).pathname)}; export {signupCredential} from ${JSON.stringify(new URL('../auth/signupCredential.js', import.meta.url).pathname)};`,resolveDir:process.cwd(),loader:'js'},
      outfile, bundle: true, platform: 'node', format: 'cjs', logLevel: 'silent',
      plugins: [{name: 'screen-boundaries', setup(builder) {
        builder.onResolve({filter: /^react$/}, () => ({path: require.resolve('react'), external: true}));
        builder.onResolve({filter: /^(react-native|react-i18next|@)/}, args => args.path === '@utils/validation/registerValidation'
          ? {path: path.resolve('packages/app/src/utils/validation/registerValidation.js')}
          : {path: args.path, namespace: 'mock'});
        builder.onLoad({filter: /.*/, namespace: 'mock'}, ({path: name}) => {
          let contents;
          if (name === 'react-native') contents = `export const Keyboard={dismiss(){}}; export const ScrollView='ScrollView',Text='Text',TextInput='TextInput',TouchableOpacity='TouchableOpacity',View='View';`;
          else if (name === 'react-i18next') contents = `export const useTranslation=()=>({t:key=>'English:'+key,i18n:{language:'en'}});`;
          else if (name === '@react-navigation/native') contents = `export const useNavigation=()=>({replace:(...args)=>{globalThis.__foreignSignupTest.navigation=args},navigate(){}});`;
          else if (name === '@data/agree') contents = `export const userRegisterAgrees=[{id:'TERMS_OF_SERVICE',isRequired:true,isAgree:false},{id:'MARKETING_NOTIFICATION',isRequired:false,isAgree:false}];`;
          else if (name === '@utils/api/authApi') contents = `export default {checkNickname:async name=>{globalThis.__foreignSignupTest.nickname=name;return {data:'Available'}},completeForeignSocialSignUp:async payload=>{globalThis.__foreignSignupTest.payload=payload;globalThis.__foreignSignupTest.signups++;return {data:{accessToken:'native-test',refreshToken:'native-test'}}},loginGoogle:async credential=>{const state=globalThis.__foreignSignupTest;state.logins++;state.credential=credential;if(state.scenario==='login-failed')throw new Error('login unavailable');return {data:{isNewUser:false,status:'LINKED',session:{role:'USER',email:'signup@example.test'}}}}};`;
          else if (name === '@utils/auth/login') contents = `export const storeWebSessionInfo=async data=>{globalThis.__foreignSignupTest.session=data};`;
          else if (name === '@utils/auth/lastLoginProvider') contents = `export const storeLastLoginProvider=async()=>{throw new Error('optional preference unavailable')};`;
          else if (name === '@constants/colors') contents = `export const COLORS={};`;
          else if (name.includes('ForeignRegisterProfile.styles')) contents = `export default {};`;
          else if (name === '@components/ButtonScarlet') contents = `export default 'ButtonScarlet';`;
          else contents = `export default 'Fixture';`;
          return {contents,loader:'js'};
        });
      }}],
    });
    const {default: Screen, signupCredential} = require(outfile);
    if (scenario !== 'missing-credential') signupCredential.remember('test-signup', 'google-test-credential');
    await act(async () => {tree = Renderer.create(React.createElement(Screen, {route:{params:{provider:'GOOGLE',socialSignupToken:'test-signup'}}}));});
    const inputs = () => tree.root.findAllByType('TextInput');
    await act(async () => {
      inputs()[0].props.onChangeText('Haneul');
      inputs()[1].props.onChangeText('Sky123');
      inputs()[2].props.onChangeText('19950520');
    });
    assert.deepEqual(inputs().map(input => input.props.value), ['Haneul','Sky123','1995-05-20']);
    const press = async key => {
      const button = tree.root.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(text => text.props.children === 'English:'+key));
      assert.ok(button, key);
      await act(async () => {await button.props.onPress();});
    };
    await press('common.confirm_468266');
    assert.equal(globalThis.__foreignSignupTest.nickname, 'Sky123');
    await press('auth.female');
    await press('language.english');
    await act(async () => tree.root.findByType('select').props.onChange({target:{value:'US'}}));
    await press('auth.agreeToAll');
    const submit = tree.root.findByType('ButtonScarlet');
    assert.equal(submit.props.disabled, false);
    const register = submit.props.onPress;
    await act(async () => {await register();});
    const payload=globalThis.__foreignSignupTest.payload;
    assert.deepEqual([payload.name,payload.nickname,payload.birthday,payload.gender,payload.nationalityCountryCode,payload.preferredLanguage], ['Haneul','Sky123','1995-05-20','F','US','EN']);
    assert.equal(payload.socialSignupToken, 'test-signup');
    const state=globalThis.__foreignSignupTest;
    assert.equal(payload.credential, undefined);
    assert.equal(state.signups, 1);
    assert.equal(state.logins, scenario === 'missing-credential' ? 0 : 1);
    if (scenario === 'automatic') {
      assert.equal(state.session.role, 'USER');
      assert.equal(state.session.accessToken, undefined);
      assert.equal(state.returnedTo, '/koda/event/?id=party-3982&lang=en');
    } else {
      assert.equal(state.session, undefined);
      assert.equal(tree.root.findAllByType('TextInput').length, 0);
      const next=tree.root.findByType('ButtonScarlet');
      assert.equal(next.props.title, 'Continue with Google');
      await act(async()=>next.props.onPress());
      assert.deepEqual(state.navigation, ['SocialLogin',{provider:'GOOGLE',koda:true}]);
    }
    await act(async()=>register());
    assert.equal(state.signups, 1, 'successful account creation is never repeated');
    assert.equal(signupCredential.take('test-signup'), null);

  } finally {
    if (tree) await act(async()=>tree.unmount());
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    globalThis.window = previousWindow;
    delete globalThis.__foreignSignupTest;
    await rm(temp,{recursive:true,force:true});
  }
});

}
