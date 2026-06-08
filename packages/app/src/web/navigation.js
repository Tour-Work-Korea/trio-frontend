import {Platform} from 'react-native';
import {WEB_ROUTES} from './routes';

export const isWeb = Platform.OS === 'web';

const canUseWindowHistory = () =>
  isWeb
  && typeof window !== 'undefined'
  && typeof window.history !== 'undefined';

export const getGuesthouseMapParams = (params = {}) => ({
  screen: '지도',
  params: {
    screen: 'GuesthouseList',
    params: {
      initialMapView: true,
      ...params,
    },
  },
});

export const getGuesthouseMapRoute = params => ({
  name: 'MainTabs',
  params: getGuesthouseMapParams(params),
});

export const pushWebPath = (path, state = {}) => {
  if (!canUseWindowHistory()) {
    return;
  }

  window.history.pushState(state, '', path);
};

export const replaceWebPath = (path, state = {}) => {
  if (!canUseWindowHistory()) {
    return;
  }

  window.history.replaceState(state, '', path);
};

export const replaceWebMapPath = mapParams => {
  if (!canUseWindowHistory()) {
    return;
  }

  const route = getGuesthouseMapRoute(mapParams);

  replaceWebPath(WEB_ROUTES.MAP, {
    __trioNavigation: true,
    route,
  });
};

export const navigateWebGuesthouseDetailFromMap = ({
  navigation,
  guesthouseId,
  detailParams = {},
  mapParams = {},
}) => {
  const webBackTo = isWeb ? WEB_ROUTES.MAP : undefined;
  const webBackParams = isWeb ? mapParams : undefined;

  if (isWeb) {
    replaceWebMapPath(mapParams);
  }

  navigation.navigate('GuesthouseDetail', {
    ...detailParams,
    id: guesthouseId,
    webBackTo,
    webBackParams,
  });
};

export const navigateWebBackToMap = (navigation, mapParams = {}) => {
  if (isWeb) {
    replaceWebMapPath(mapParams);
  }

  navigation.navigate('MainTabs', getGuesthouseMapParams(mapParams));
};
