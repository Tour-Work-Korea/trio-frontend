import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {
  WEB_ROUTES,
  WEB_SCREEN_BY_STATIC_PATH,
  WEB_STATIC_ROUTE_BY_SCREEN,
} from '../routes';

const NavigationContext = createContext(null);
const RouteContext = createContext({name: undefined, params: undefined});
const canUseBrowserHistory =
  typeof window !== 'undefined' &&
  typeof window.history !== 'undefined' &&
  typeof window.addEventListener === 'function';
let webHistoryIndex = 0;

export const CommonActions = {
  navigate: (name, params) => ({type: 'NAVIGATE', payload: {name, params}}),
  reset: payload => ({type: 'RESET', payload}),
  setParams: params => ({type: 'SET_PARAMS', payload: {params}}),
};

export const StackActions = {
  push: (name, params) => ({type: 'PUSH', payload: {name, params}}),
  replace: (name, params) => ({type: 'REPLACE', payload: {name, params}}),
  pop: count => ({type: 'POP', payload: {count}}),
  popTo: (name, params) => ({type: 'POP_TO', payload: {name, params}}),
  popToTop: () => ({type: 'POP_TO_TOP'}),
};

export function createNavigationContainerRef() {
  const ref = {
    current: null,
    isReady: () => Boolean(ref.current),
    navigate: (...args) => ref.current?.navigate?.(...args),
    goBack: () => ref.current?.goBack?.(),
    dispatch: action => ref.current?.dispatch?.(action),
  };

  return ref;
}

export function NavigationContainer({children, ref: navigationRef}) {
  const fallbackNavigation = useMemo(
    () => ({
      navigate: () => {},
      goBack: () => {},
      dispatch: () => {},
      setOptions: () => {},
      getParent: () => null,
      __isRootFallback: true,
    }),
    [],
  );

  useEffect(() => {
    if (navigationRef && typeof navigationRef === 'object') {
      navigationRef.current = fallbackNavigation;
    }
  }, [fallbackNavigation, navigationRef]);

  return (
    <NavigationContext.Provider value={fallbackNavigation}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext) || {
    navigate: () => {},
    goBack: () => {},
    dispatch: () => {},
    setOptions: () => {},
    getParent: () => null,
  };
}

export function useRoute() {
  return useContext(RouteContext);
}

export function useFocusEffect(effect) {
  useEffect(() => {
    const cleanup = effect?.();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [effect]);
}

export function useIsFocused() {
  return true;
}

export function useNavigationState(selector) {
  const state = {index: 0, routes: []};
  return typeof selector === 'function' ? selector(state) : state;
}

function normalizeNavigateArgs(nameOrOptions, params) {
  if (typeof nameOrOptions === 'string') {
    return {name: nameOrOptions, params};
  }

  return {
    name: nameOrOptions?.name || nameOrOptions?.screen,
    params: nameOrOptions?.params,
  };
}

function getMapParams(params = {}) {
  const nestedParams = params?.params?.params ?? params?.params ?? params;

  return {
    screen: '지도',
    params: {
      screen: 'GuesthouseList',
      params: {
        initialMapView: true,
        ...nestedParams,
      },
    },
  };
}

function getNestedMainTabsParams(screen, params = {}) {
  return {
    screen,
    params,
  };
}

function getNestedStackParams(screen, nestedScreen, params = {}) {
  return {
    screen,
    params: {
      screen: nestedScreen,
      params,
    },
  };
}

function getFirstParam(params, keys) {
  for (const key of keys) {
    if (params?.[key] != null) {
      return params[key];
    }
  }

  return undefined;
}

function encodeExtraParams(params) {
  if (params == null || Object.keys(params).length === 0) {
    return '';
  }

  return `?params=${encodeURIComponent(JSON.stringify(params))}`;
}

function decodeExtraParams(search = '') {
  try {
    const searchParams = new URLSearchParams(search);
    const encodedParams = searchParams.get('params');
    return encodedParams ? JSON.parse(encodedParams) : undefined;
  } catch {
    return undefined;
  }
}

function withParams(path, params) {
  return `${path}${encodeExtraParams(params)}`;
}

function getDefaultGuesthouseDetailParams() {
  const checkIn = new Date();
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 1);

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return {
    checkIn: formatDate(checkIn),
    checkOut: formatDate(checkOut),
    guestCount: 1,
  };
}

function routeToWebPath(route) {
  if (!route?.name) {
    return null;
  }

  if (route.name === 'MainTabs') {
    const screen = route.params?.screen;

    if (screen === '지도') {
      const initialMapView =
        route.params?.params?.params?.initialMapView
        ?? route.params?.params?.initialMapView;

      return initialMapView ? WEB_ROUTES.MAP : WEB_ROUTES.GUESTHOUSES;
    }

    if (screen === '커뮤니티') {
      return WEB_ROUTES.COMMUNITY;
    }

    if (screen === '콘텐츠') {
      return WEB_ROUTES.CONTENTS;
    }

    if (screen === '마이') {
      return WEB_ROUTES.MY;
    }

    if (screen === '채용') {
      return WEB_ROUTES.EMPLOY;
    }

    if (screen === '게하') {
      return WEB_ROUTES.GUESTHOUSES;
    }

    if (!screen || screen === '홈') {
      return WEB_ROUTES.HOME;
    }
  }

  if (route.name === '홈' || route.name === 'HomeMain') {
    return WEB_ROUTES.HOME;
  }

  if (route.name === '커뮤니티') {
    return WEB_ROUTES.COMMUNITY;
  }

  if (route.name === '콘텐츠' || route.name === 'MeetMain') {
    return WEB_ROUTES.CONTENTS;
  }

  if (route.name === '마이' || route.name === 'MyGate' || route.name === 'UserMyPage') {
    return WEB_ROUTES.MY;
  }

  if (route.name === '채용' || route.name === 'EmployIntro') {
    return WEB_ROUTES.EMPLOY;
  }

  if (route.name === '지도') {
    const initialMapView =
      route.params?.params?.initialMapView ?? route.params?.initialMapView;

    return initialMapView ? WEB_ROUTES.MAP : WEB_ROUTES.GUESTHOUSES;
  }

  if (route.name === 'GuesthouseList') {
    return route.params?.initialMapView
      ? WEB_ROUTES.MAP
      : WEB_ROUTES.GUESTHOUSES;
  }

  if (route.name === 'GuesthouseSearch') {
    return withParams(WEB_ROUTES.GUESTHOUSE_SEARCH, route.params);
  }

  if (route.name === 'GuesthouseReview') {
    return withParams(WEB_ROUTES.GUESTHOUSE_REVIEW, route.params);
  }

  if (route.name === 'GuesthouseDetail' && route.params?.id != null) {
    return withParams(WEB_ROUTES.GUESTHOUSE_DETAIL(route.params.id), route.params);
  }

  if (route.name === 'GuesthouseLocationMap') {
    const id = getFirstParam(route.params, ['guesthouseId', 'id']);
    return id == null
      ? withParams('/guesthouses/location', route.params)
      : withParams(WEB_ROUTES.GUESTHOUSE_LOCATION(id), route.params);
  }

  if (route.name === 'GuesthousePost') {
    const id = getFirstParam(route.params, ['guesthouseId', 'id']);
    return id == null
      ? withParams('/guesthouses/posts', route.params)
      : withParams(WEB_ROUTES.GUESTHOUSE_POST(id), route.params);
  }

  if (route.name === 'RoomDetail') {
    const roomId = getFirstParam(route.params, ['roomId', 'id']);
    return roomId == null
      ? withParams('/rooms/detail', route.params)
      : withParams(WEB_ROUTES.ROOM_DETAIL(roomId), route.params);
  }

  if (route.name === 'MeetDetail') {
    const partyId = getFirstParam(route.params, ['partyId', 'id']);
    return partyId == null
      ? withParams('/contents/detail', route.params)
      : withParams(WEB_ROUTES.MEET_DETAIL(partyId), route.params);
  }

  if (route.name === 'EmployDetail') {
    const id = getFirstParam(route.params, ['id', 'recruitId']);
    return id == null
      ? withParams('/employ/detail', route.params)
      : withParams(WEB_ROUTES.EMPLOY_DETAIL(id), route.params);
  }

  if (route.name === 'EmploySearchList') {
    return withParams(WEB_ROUTES.EMPLOY_SEARCH, route.params);
  }

  if (route.name === 'EmploySearchResult') {
    return withParams(WEB_ROUTES.EMPLOY_SEARCH_RESULT, route.params);
  }

  if (route.name === 'EmployMap') {
    return withParams(WEB_ROUTES.EMPLOY_MAP, route.params);
  }

  if (route.name === 'CommunityDetail') {
    const postId = getFirstParam(route.params, ['postId', 'id']);
    return postId == null
      ? withParams('/community/posts/detail', route.params)
      : withParams(WEB_ROUTES.COMMUNITY_DETAIL(postId), route.params);
  }

  if (route.name === 'CommunityStaffDetail') {
    const id = getFirstParam(route.params, ['id', 'recruitId']);
    return id == null
      ? withParams('/community/staff/detail', route.params)
      : withParams(WEB_ROUTES.COMMUNITY_STAFF_DETAIL(id), route.params);
  }

  if (route.name === 'CommunityWrite') {
    return withParams(WEB_ROUTES.COMMUNITY_WRITE, route.params);
  }

  const staticPath = WEB_STATIC_ROUTE_BY_SCREEN[route.name];

  if (staticPath) {
    return withParams(staticPath, route.params);
  }

  return null;
}

function parseLegacyHashRoute() {
  if (!canUseBrowserHistory) {
    return null;
  }

  const hash = window.location.hash || '';

  if (!hash.startsWith('#/')) {
    return null;
  }

  const hashContent = hash.slice(2);
  const [encodedName, query = ''] = hashContent.split('?');

  if (!encodedName) {
    return null;
  }

  let params;

  try {
    const searchParams = new URLSearchParams(query);
    const encodedParams = searchParams.get('params');
    params = encodedParams ? JSON.parse(encodedParams) : undefined;
  } catch {
    params = undefined;
  }

  return {
    name: decodeURIComponent(encodedName),
    params,
  };
}

function parseRouteFromUrl() {
  if (!canUseBrowserHistory) {
    return null;
  }

  const pathname = window.location.pathname || WEB_ROUTES.HOME;
  const extraParams = decodeExtraParams(window.location.search);
  const staticScreen = WEB_SCREEN_BY_STATIC_PATH[pathname];

  if (pathname === WEB_ROUTES.MAP) {
    return {
      name: 'MainTabs',
      params: getMapParams(extraParams),
    };
  }

  if (pathname === WEB_ROUTES.GUESTHOUSES) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('지도', 'GuesthouseList', {
        ...extraParams,
        initialMapView: false,
      }),
    };
  }

  if (pathname === WEB_ROUTES.HOME) {
    return {
      name: 'MainTabs',
      params: {
        screen: '홈',
      },
    };
  }

  if (pathname === WEB_ROUTES.COMMUNITY) {
    return {
      name: 'MainTabs',
      params: getNestedMainTabsParams('커뮤니티', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.CONTENTS) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('콘텐츠', 'MeetMain', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.MY) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('마이', 'MyGate', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.EMPLOY) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('채용', 'EmployIntro', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.GUESTHOUSE_SEARCH) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('지도', 'GuesthouseSearch', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.GUESTHOUSE_REVIEW) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('지도', 'GuesthouseReview', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.EMPLOY_SEARCH) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('채용', 'EmploySearchList', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.EMPLOY_SEARCH_RESULT) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('채용', 'EmploySearchResult', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.EMPLOY_MAP) {
    return {
      name: 'MainTabs',
      params: getNestedStackParams('채용', 'EmployMap', extraParams),
    };
  }

  if (pathname === WEB_ROUTES.COMMUNITY_WRITE) {
    return {
      name: 'CommunityWrite',
      params: extraParams,
    };
  }

  if (staticScreen) {
    return {
      name: staticScreen,
      params: extraParams,
    };
  }

  const guesthouseLocationMatch = pathname.match(/^\/guesthouses\/([^/]+)\/location\/?$/);
  const guesthousePostMatch = pathname.match(/^\/guesthouses\/([^/]+)\/posts\/?$/);
  const guesthouseDetailMatch = pathname.match(/^\/guesthouses\/([^/]+)\/?$/);
  const roomDetailMatch = pathname.match(/^\/rooms\/([^/]+)\/?$/);
  const meetDetailMatch = pathname.match(/^\/contents\/([^/]+)\/?$/);
  const employDetailMatch = pathname.match(/^\/employ\/([^/]+)\/?$/);
  const communityDetailMatch = pathname.match(/^\/community\/posts\/([^/]+)\/?$/);
  const communityStaffDetailMatch = pathname.match(/^\/community\/staff\/([^/]+)\/?$/);

  const parseId = value => {
    const decoded = decodeURIComponent(value);
    const numberValue = Number(decoded);
    return Number.isNaN(numberValue) ? decoded : numberValue;
  };

  if (guesthouseDetailMatch) {
    const id = parseId(guesthouseDetailMatch[1]);

    return {
      name: 'GuesthouseDetail',
      params: {
        ...getDefaultGuesthouseDetailParams(),
        ...extraParams,
        id,
        webBackToHome: true,
      },
    };
  }

  if (guesthouseLocationMatch) {
    const guesthouseId = parseId(guesthouseLocationMatch[1]);

    return {
      name: 'GuesthouseLocationMap',
      params: {
        ...extraParams,
        guesthouseId,
      },
    };
  }

  if (guesthousePostMatch) {
    const guesthouseId = parseId(guesthousePostMatch[1]);

    return {
      name: 'GuesthousePost',
      params: {
        ...extraParams,
        guesthouseId,
      },
    };
  }

  if (roomDetailMatch) {
    const roomId = parseId(roomDetailMatch[1]);

    return {
      name: 'RoomDetail',
      params: {
        ...extraParams,
        roomId,
      },
    };
  }

  if (meetDetailMatch) {
    const partyId = parseId(meetDetailMatch[1]);

    return {
      name: 'MeetDetail',
      params: {
        ...extraParams,
        partyId,
        webBackToHome: true,
      },
    };
  }

  if (employDetailMatch) {
    const id = parseId(employDetailMatch[1]);

    return {
      name: 'EmployDetail',
      params: {
        ...extraParams,
        id,
      },
    };
  }

  if (communityDetailMatch) {
    const postId = parseId(communityDetailMatch[1]);

    return {
      name: 'CommunityDetail',
      params: {
        ...extraParams,
        postId,
      },
    };
  }

  if (communityStaffDetailMatch) {
    const id = parseId(communityStaffDetailMatch[1]);

    return {
      name: 'CommunityStaffDetail',
      params: {
        ...extraParams,
        id,
      },
    };
  }

  return parseLegacyHashRoute();
}

function getNestedRoute(childScreens, parentParams) {
  const nestedScreen = parentParams?.screen;
  const ownsNestedScreen =
    nestedScreen
    && childScreens.some(child => child.props.name === nestedScreen);

  if (ownsNestedScreen) {
    return {
      name: nestedScreen,
      params: parentParams?.params,
    };
  }

  return null;
}

function getInitialRoute(childScreens, firstScreen, parentParams) {
  const urlRoute = parseRouteFromUrl();
  const ownsUrlRoute =
    urlRoute && childScreens.some(child => child.props.name === urlRoute.name);

  if (ownsUrlRoute) {
    return urlRoute;
  }

  const nestedRoute = getNestedRoute(childScreens, parentParams);

  if (nestedRoute) {
    return nestedRoute;
  }

  return {
    name: firstScreen?.props.name,
    params: firstScreen?.props.initialParams,
  };
}

function pushBrowserHistory(route) {
  if (!canUseBrowserHistory) {
    return;
  }

  webHistoryIndex += 1;
  window.history.pushState(
    {
      __trioNavigation: true,
      index: webHistoryIndex,
      route: {
        name: route.name,
        params: route.params,
      },
    },
    '',
    routeToWebPath(route) || window.location.href,
  );
}

export function createNavigatorFactory(defaultKind = 'stack') {
  const Screen = () => null;

  function Navigator({children, initialRouteName, screenOptions}) {
    const parentNavigation = useNavigation();
    const parentRoute = useRoute();
    const childScreens = useMemo(
      () =>
        React.Children.toArray(children).filter(
          child =>
            React.isValidElement(child)
            && child.props?.name
            && child.props?.component,
        ),
      [children],
    );
    const firstScreen = childScreens.find(child => child.props.name === initialRouteName) || childScreens[0];
    const [route, setRoute] = React.useState(() =>
      getInitialRoute(childScreens, firstScreen, parentRoute?.params),
    );
    const historyRef = useRef([]);
    const routeRef = useRef(route);

    routeRef.current = route;

    useEffect(() => {
      const nestedRoute = getNestedRoute(childScreens, parentRoute?.params);

      if (!nestedRoute) {
        return;
      }

      setRoute(nestedRoute);
    }, [childScreens, parentRoute?.params]);

    const navigate = useCallback(
      (nameOrOptions, params) => {
        const next = normalizeNavigateArgs(nameOrOptions, params);
        if (!next.name) {
          return;
        }

        const ownsRoute = childScreens.some(child => child.props.name === next.name);
        if (!ownsRoute) {
          parentNavigation?.navigate?.(nameOrOptions, params);
          return;
        }

        historyRef.current.push(routeRef.current);
        const nextRoute = {name: next.name, params: next.params};

        setRoute(nextRoute);
        pushBrowserHistory(nextRoute);
      },
      [childScreens, parentNavigation],
    );

    const goBack = useCallback(() => {
      if (canUseBrowserHistory && historyRef.current.length > 0) {
        window.history.back();
        return;
      }

      const previous = historyRef.current.pop();
      if (previous) {
        setRoute(previous);
        return;
      }

      parentNavigation?.goBack?.();
    }, [parentNavigation]);

    useEffect(() => {
      if (!canUseBrowserHistory) {
        return undefined;
      }

      const handlePopState = event => {
        const stateRoute = event?.state?.route;
        const ownsStateRoute =
          stateRoute?.name
          && childScreens.some(child => child.props.name === stateRoute.name);

        if (ownsStateRoute) {
          setRoute({name: stateRoute.name, params: stateRoute.params});
          return;
        }

        if (stateRoute?.name && !parentNavigation?.__isRootFallback) {
          const previous = historyRef.current.pop();

          if (previous) {
            setRoute(previous);
          }

          return;
        }

        const previous = historyRef.current.pop();

        if (previous) {
          setRoute(previous);
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, [childScreens, parentNavigation?.__isRootFallback]);

    const navigation = useMemo(
      () => ({
        navigate,
        push: navigate,
        replace: navigate,
        goBack,
        pop: goBack,
        popToTop: () => {
          historyRef.current = [];
          if (firstScreen) {
            setRoute({name: firstScreen.props.name, params: firstScreen.props.initialParams});
          }
        },
        dispatch: action => {
          const payload = action?.payload;
          if (payload?.name) {
            navigate(payload.name, payload.params);
          } else if (payload?.routes?.length) {
            const nextRoute = payload.routes[payload.index ?? payload.routes.length - 1];
            navigate(nextRoute.name, nextRoute.params);
          }
        },
        setOptions: () => {},
        getParent: () => parentNavigation ?? null,
      }),
      [firstScreen, goBack, navigate, parentNavigation],
    );

    const activeScreen =
      childScreens.find(child => child.props.name === route.name) || firstScreen;
    const Component = activeScreen?.props.component;

    if (!Component) {
      return null;
    }

    const routeValue = {name: activeScreen.props.name, params: route.params};
    const routeKey =
      defaultKind === 'bottom-tabs'
        ? routeValue.name
        : `${routeValue.name}:${JSON.stringify(routeValue.params ?? {})}`;
    const content = (
      <View key={routeKey} style={styles.navigator}>
        <Component navigation={navigation} route={routeValue} />
      </View>
    );

    return (
      <NavigationContext.Provider value={navigation}>
        <RouteContext.Provider value={routeValue}>
          {defaultKind === 'bottom-tabs' ? (
            <View style={styles.tabRoot}>
              {content}
              <View style={getTabBarStyle(screenOptions, routeValue, navigation)}>
                {childScreens.map(child => {
                  const childRoute = {
                    name: child.props.name,
                    params: child.props.initialParams,
                  };
                  const focused = child.props.name === activeScreen.props.name;
                  const options = getOptions(screenOptions, childRoute, navigation);

                  return (
                    <TouchableOpacity
                      key={child.props.name}
                      activeOpacity={0.85}
                      style={[styles.tabItem, options.tabBarItemStyle]}
                      onPress={() => {
                        const event = createNavigationEvent();
                        const listeners =
                          typeof child.props.listeners === 'function'
                            ? child.props.listeners({navigation, route: childRoute})
                            : child.props.listeners;

                        listeners?.tabPress?.(event);

                        if (!event.defaultPrevented) {
                          navigate(child.props.name, child.props.initialParams);
                        }
                      }}>
                      {typeof options.tabBarIcon === 'function'
                        ? options.tabBarIcon({focused, color: undefined, size: 24})
                        : null}
                      {renderTabLabel(options, childRoute, focused)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            content
          )}
        </RouteContext.Provider>
      </NavigationContext.Provider>
    );
  }

  return {
    Navigator,
    Screen,
    Group: ({children}) => children,
    kind: defaultKind,
  };
}

function getOptions(screenOptions, route, navigation) {
  if (typeof screenOptions === 'function') {
    return screenOptions({route, navigation}) || {};
  }

  return screenOptions || {};
}

function getTabBarStyle(screenOptions, route, navigation) {
  const options = getOptions(screenOptions, route, navigation);
  return [styles.tabBar, options.tabBarStyle];
}

function renderTabLabel(options, route, focused) {
  if (options.tabBarShowLabel === false) {
    return null;
  }

  if (typeof options.tabBarLabel === 'function') {
    return options.tabBarLabel({focused, color: undefined, position: 'below-icon'});
  }

  return (
    <Text numberOfLines={1} style={styles.defaultTabLabel}>
      {options.tabBarLabel || route.name}
    </Text>
  );
}

function createNavigationEvent() {
  return {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

const styles = {
  tabRoot: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  navigator: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
};

export default {
  CommonActions,
  StackActions,
  NavigationContainer,
  createNavigationContainerRef,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useNavigationState,
  useRoute,
};
