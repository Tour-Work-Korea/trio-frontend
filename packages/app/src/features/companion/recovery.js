import React, {useCallback, useEffect, useMemo} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '@components/Header';
import {ResourceBody, Screen, styles as s} from './ui';

const companionList = {
  name: 'MainTabs',
  params: {screen: '커뮤니티', params: {tab: 'COMPANION'}},
};

// Access screens redirect to a room on focus, so returning to them can trap
// the user in a room/access loop (the web navigator retains replace history).
const isTransient = name => name === 'CompanionChatAccess';

export function useCompanionNavigation(navigation) {
  const {name: currentName, params: currentParams} = useRoute();
  return useMemo(() => {
    if (Platform.OS !== 'web') {
      return navigation;
    }
    return {
      ...navigation,
      companionRoute: {name: currentName, params: currentParams},
      navigate: (name, params) => {
        if (
          typeof name === 'string' &&
          (name.startsWith('Companion') || name === 'MyCompanions')
        ) {
          navigation.navigate(name, {
            ...params,
            __webBackRoute: {name: currentName, params: currentParams},
          });
        } else {
          navigation.navigate(name, params);
        }
      },
    };
  }, [navigation, currentName, currentParams]);
}

export function useCompanionBack({hardware = true, onBack} = {}) {
  const navigation = useNavigation();
  const route = useRoute();
  const focused = useIsFocused();
  const back = useCallback(() => {
    const chatChild =
      route.name?.startsWith('CompanionChat') &&
      !['CompanionChat', 'CompanionChatAccess'].includes(route.name);
    const fallback =
      chatChild && route.params?.roomId && route.params?.companionId
        ? {
            name: 'CompanionChat',
            params: {
              roomId: route.params.roomId,
              companionId: route.params.companionId,
            },
          }
        : route.name?.startsWith('CompanionChat')
        ? {name: 'CompanionInbox'}
        : companionList;
    let webPrevious = route.params?.__webBackRoute;
    if (isTransient(webPrevious?.name) || webPrevious?.name === route.name) {
      while (
        webPrevious &&
        (isTransient(webPrevious.name) || webPrevious.name === route.name)
      ) {
        webPrevious = webPrevious.params?.__webBackRoute;
      }
      const target = webPrevious || fallback;
      navigation.reset({index: 0, routes: [target]});
      return;
    }
    const state = navigation.getState?.();
    if (isTransient(state?.routes?.[state.index - 1]?.name)) {
      const routes = state.routes.slice(0, state.index - 1);
      navigation.reset({
        index: Math.max(0, routes.length - 1),
        routes: routes.length ? routes : [fallback],
      });
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Reset also works on web, where replace is implemented as navigate.
      navigation.reset({index: 0, routes: [fallback]});
    }
  }, [navigation, route.name, route.params]);
  useEffect(() => {
    if (Platform.OS !== 'android' || !focused || !hardware) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      (onBack || back)();
      return true;
    });
    return () => subscription.remove();
  }, [back, focused, hardware, onBack]);
  return back;
}

export function replaceCompanionScreen(navigation, name, params) {
  if (Platform.OS === 'web') {
    // The web adapter aliases replace to navigate. Reset prevents the removed
    // access/room screen from reopening and redirecting on the next back press.
    // Replacing an access/room screen must carry its original caller forward,
    // including that caller's own back route (e.g. MyCompanions -> MyPage).
    let backRoute = navigation.companionRoute?.params?.__webBackRoute;
    while (backRoute && (isTransient(backRoute.name) || backRoute.name === name)) {
      backRoute = backRoute.params?.__webBackRoute;
    }
    navigation.reset({
      index: 0,
      routes: [{name, params: {...params, __webBackRoute: backRoute}}],
    });
  } else {
    navigation.replace(name, params);
  }
}

export function RecoveryScreen({onBack, ...props}) {
  const back = useCompanionBack({onBack});
  return <Screen {...props} onBack={onBack || back} />;
}

export function RecoveryBody({resource, ...props}) {
  // A failed refresh must not replace data the user is already viewing.
  return (
    <ResourceBody
      {...props}
      resource={resource.data ? {...resource, error: null} : resource}
    />
  );
}

// Keep the existing group form layout while supplying a local back handler.
export function RecoveryForm({title, children, footer}) {
  const insets = useSafeAreaInsets();
  const back = useCompanionBack();
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <Header title={title} onPress={back} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={false}
        contentContainerStyle={{padding: 20, gap: 16, flexGrow: 1}}>
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          }}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
