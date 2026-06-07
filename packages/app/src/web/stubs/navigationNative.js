import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

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

function encodeRouteForUrl(route) {
  if (!canUseBrowserHistory || !route?.name) {
    return '';
  }

  const encodedName = encodeURIComponent(route.name);
  const encodedParams =
    route.params == null
      ? ''
      : `?params=${encodeURIComponent(JSON.stringify(route.params))}`;

  return `${window.location.pathname}${window.location.search}#/${encodedName}${encodedParams}`;
}

function parseRouteFromUrl() {
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

function getInitialRoute(childScreens, firstScreen) {
  const urlRoute = parseRouteFromUrl();
  const ownsUrlRoute =
    urlRoute && childScreens.some(child => child.props.name === urlRoute.name);

  if (ownsUrlRoute) {
    return urlRoute;
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
    encodeRouteForUrl(route) || window.location.href,
  );
}

export function createNavigatorFactory(defaultKind = 'stack') {
  const Screen = () => null;

  function Navigator({children, initialRouteName, screenOptions}) {
    const parentNavigation = useNavigation();
    const childScreens = React.Children.toArray(children).filter(
      child => React.isValidElement(child) && child.props?.name && child.props?.component,
    );
    const firstScreen = childScreens.find(child => child.props.name === initialRouteName) || childScreens[0];
    const [route, setRoute] = React.useState(() =>
      getInitialRoute(childScreens, firstScreen),
    );
    const historyRef = useRef([]);
    const routeRef = useRef(route);

    routeRef.current = route;

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

      const handlePopState = () => {
        const previous = historyRef.current.pop();

        if (previous) {
          setRoute(previous);
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, []);

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
      }),
      [firstScreen, goBack, navigate],
    );

    const activeScreen =
      childScreens.find(child => child.props.name === route.name) || firstScreen;
    const Component = activeScreen?.props.component;

    if (!Component) {
      return null;
    }

    const routeValue = {name: activeScreen.props.name, params: route.params};
    const content = (
      <View style={styles.navigator}>
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
