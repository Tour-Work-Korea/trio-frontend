import axios from 'axios';
import {Platform} from 'react-native';
import {
  NAVER_SEARCH_CLIENT_ID,
  NAVER_SEARCH_CLIENT_SECRET,
} from '@env';

const isWeb = Platform.OS === 'web';

const naverPlaceClient = axios.create({
  baseURL: isWeb
    ? '/naver-search'
    : 'https://openapi.naver.com/v1/search',
  timeout: 12000,
});

const naverPlaceApi = {
  searchLocal: ({query, display = 5, start = 1, sort = 'random'}) => {
    if (!isWeb && (!NAVER_SEARCH_CLIENT_ID || !NAVER_SEARCH_CLIENT_SECRET)) {
      throw new Error('NAVER_SEARCH_CREDENTIALS_MISSING');
    }

    return naverPlaceClient.get('/local.json', {
      params: {
        query,
        display,
        start,
        sort,
      },
      headers: isWeb
        ? undefined
        : {
            'X-Naver-Client-Id': NAVER_SEARCH_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_SEARCH_CLIENT_SECRET,
          },
    });
  },
};

export default naverPlaceApi;
