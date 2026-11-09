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
test('English profile inputs retain edits and submit selected ISO nationality through the existing signup contract', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'koda-foreign-signup-'));
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.__foreignSignupTest = {payload: null, nickname: null};
  let tree;
  try {
    const outfile = path.join(temp, 'screen.cjs');
    await build({
      entryPoints: [new URL('../components/ForeignRegisterProfileWeb.jsx', import.meta.url).pathname],
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
          else if (name === '@react-navigation/native') contents = `export const useNavigation=()=>({replace(){},navigate(){}});`;
          else if (name === '@data/agree') contents = `export const userRegisterAgrees=[{id:'TERMS_OF_SERVICE',isRequired:true,isAgree:false},{id:'MARKETING_NOTIFICATION',isRequired:false,isAgree:false}];`;
          else if (name === '@utils/api/authApi') contents = `export default {checkNickname:async name=>{globalThis.__foreignSignupTest.nickname=name;return {data:'Available'}},completeForeignSocialSignUp:async payload=>{globalThis.__foreignSignupTest.payload=payload;return {data:{accessToken:'test',refreshToken:'test'}}}};`;
          else if (name === '@utils/auth/login') contents = `export const storeLoginTokens=async()=>{};`;
          else if (name === '@utils/auth/lastLoginProvider') contents = `export const storeLastLoginProvider=async()=>{};`;
          else if (name === '@constants/colors') contents = `export const COLORS={};`;
          else if (name.includes('ForeignRegisterProfile.styles')) contents = `export default {};`;
          else if (name === '@components/ButtonScarlet') contents = `export default 'ButtonScarlet';`;
          else contents = `export default 'Fixture';`;
          return {contents,loader:'js'};
        });
      }}],
    });
    const Screen = require(outfile).default;
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
    await act(async () => {await submit.props.onPress();});
    const payload=globalThis.__foreignSignupTest.payload;
    assert.deepEqual([payload.name,payload.nickname,payload.birthday,payload.gender,payload.nationalityCountryCode,payload.preferredLanguage], ['Haneul','Sky123','1995-05-20','F','US','EN']);
    assert.equal(payload.socialSignupToken, 'test-signup');
  } finally {
    if (tree) await act(async()=>tree.unmount());
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    delete globalThis.__foreignSignupTest;
    await rm(temp,{recursive:true,force:true});
  }
});
