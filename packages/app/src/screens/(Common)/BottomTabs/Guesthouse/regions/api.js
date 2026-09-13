import api from '@utils/api/axiosInstance';
import qs from 'qs';

// 새 지역 계약은 기존 구버전 API 래퍼와 분리해서 사용한다.
const get = (path, {regionIds, ...params}, options = {}) =>
  api.get(path, {
    params,
    paramsSerializer: values => qs.stringify(values, {arrayFormat: 'repeat'}),
    ...options,
  });

export const regionGuesthouseApi = {
  getGuesthouseList: params => get('/user/guesthouses', params),
  getGuesthouseMap: params => get('/user/guesthouses/map', params),
  getGuesthouseFilterCount: params =>
    get('/user/guesthouses/filter-count', params, {withAuth: false}),
  getServiceRegions: () =>
    api.get('/common/service-regions', {withAuth: false}),
};
