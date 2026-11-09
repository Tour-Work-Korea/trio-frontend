import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {kodaAuthReturnPlugin} from '../hosting/authReturnPlugin.js';

const require=createRequire(import.meta.url);
test('signup origin selection uses the scrollable web adapter only at the shared export',()=>{
  const plugin=kodaAuthReturnPlugin('/repo/apps/web');
  assert.equal(plugin.resolveId('./(Common)/Register/SocialOriginSelect','/repo/packages/app/src/screens/index.js'),
    '/repo/apps/web/src/features/koda/components/SocialOriginSelectWeb.jsx');
  assert.equal(plugin.resolveId('./(Common)/Register/SocialOriginSelect','/repo/other.js'),undefined);
});
test('both choices and Next stay inside one growing scroll flow and preserve signup parameters',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'koda-scroll-'));
  const previousAct=globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  globalThis.__signupNavigation=null;
  let tree;
  try {
    const outfile=path.join(temp,'screen.cjs');
    await build({entryPoints:[new URL('../components/SocialOriginSelectWeb.jsx',import.meta.url).pathname],outfile,
      bundle:true,platform:'node',format:'cjs',logLevel:'silent',plugins:[{name:'screen-boundaries',setup(builder){
        builder.onResolve({filter:/^react$/},()=>({path:require.resolve('react'),external:true}));
        builder.onResolve({filter:/^(react-native|react-i18next|@)/},args=>({path:args.path,namespace:'mock'}));
        builder.onLoad({filter:/.*/,namespace:'mock'},({path:name})=>{
          let contents;
          if(name==='react-native') contents="export const ScrollView='ScrollView',Text='Text',View='View',TouchableOpacity='TouchableOpacity';";
          else if(name==='react-i18next') contents="export const useTranslation=()=>({t:key=>'English:'+key});";
          else if(name==='@react-navigation/native') contents="export const useNavigation=()=>({navigate:(...args)=>{globalThis.__signupNavigation=args}});";
          else if(name.includes('SocialOriginSelect.styles')) contents="export default {};";
          else if(name==='@components/ButtonScarlet') contents="export default 'ButtonScarlet';";
          else contents="export default 'Fixture';";
          return {contents,loader:'js'};
        });
      }}]});
    const Screen=require(outfile).default;
    await act(async()=>{tree=Renderer.create(React.createElement(Screen,{route:{params:{provider:'GOOGLE',socialSignupToken:'signup-test'}}}));});
    const scroll=tree.root.findByType('ScrollView');
    assert.equal(scroll.props.style.minHeight,0);
    assert.equal(scroll.props.contentContainerStyle.flexGrow,1);
    assert.equal(scroll.props.contentContainerStyle.flex,undefined);
    assert.ok(scroll.props.contentContainerStyle.paddingBottom>=40);
    const choices=scroll.findAllByType('TouchableOpacity');
    assert.equal(choices.length,2);
    assert.equal(scroll.findByType('ButtonScarlet').props.disabled,true);
    for(const [index,target,isForeign] of [[1,'ForeignRegisterProfile',true],[0,'RegisterAgree',false]]) {
      await act(async()=>choices[index].props.onPress());
      assert.equal(scroll.findByType('ButtonScarlet').props.disabled,false);
      await act(async()=>scroll.findByType('ButtonScarlet').props.onPress());
      const [route,params]=globalThis.__signupNavigation;
      assert.equal(route,target);
      assert.equal(params.isForeign,isForeign);
      assert.equal(params.socialSignupToken,'signup-test');
      assert.equal(params.provider,'GOOGLE');
    }
  } finally {
    if(tree) await act(async()=>tree.unmount());
    globalThis.IS_REACT_ACT_ENVIRONMENT=previousAct;
    delete globalThis.__signupNavigation;
    await rm(temp,{recursive:true,force:true});
  }
});
