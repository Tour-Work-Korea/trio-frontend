import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import naverPlaceApi from '@utils/api/naverPlaceApi';
import {normalizePlaceSearchResult} from '@utils/communityLocation';
import styles from './CommunityPlaceSearch.styles';
import LocationPinIcon from '@assets/images/map_pin_fill_orange.svg';

const PLACE_SEARCH_MIN_LENGTH = 2;
const PLACE_SEARCH_DEBOUNCE_MS = 350;

const CommunityPlaceSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {initialQuery = '', onSelectLocation} = route.params ?? {};
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < PLACE_SEARCH_MIN_LENGTH) {
      setResults([]);
      setErrorMessage('');
      setIsSearching(false);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setErrorMessage('');

        const response = await naverPlaceApi.searchLocal({
          query: trimmedQuery,
        });
        const rawResults = response.data?.items ?? [];
        const nextResults = rawResults
          .map(normalizePlaceSearchResult)
          .filter(Boolean);

        setResults(nextResults);
      } catch (error) {
        console.warn('searchCommunityPlaces 실패:', error);
        setResults([]);
        setErrorMessage(
          error?.message === 'NAVER_SEARCH_CREDENTIALS_MISSING'
            ? '네이버 검색 키가 설정되지 않았어요.'
            : '장소 검색에 실패했어요.',
        );
      } finally {
        setIsSearching(false);
      }
    }, PLACE_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelectLocation = location => {
    onSelectLocation?.(location);
    Keyboard.dismiss();
    navigation.goBack();
  };

  const renderBody = () => {
    if (query.trim().length < PLACE_SEARCH_MIN_LENGTH) {
      return (
        <Text style={[FONTS.fs_14_regular, styles.guideText]}>
          두 글자 이상 입력해주세요.
        </Text>
      );
    }

    if (isSearching) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#FF6B00" />
        </View>
      );
    }

    if (errorMessage) {
      return (
        <Text style={[FONTS.fs_14_regular, styles.errorText]}>
          {errorMessage}
        </Text>
      );
    }

    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultList}>
        {results.length > 0 ? (
          results.map((item, index) => (
            <TouchableOpacity
              key={`${item.placeName}-${item.roadAddress}-${index}`}
              activeOpacity={0.8}
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}>
              <LocationPinIcon width={22} height={22} />
              <View style={styles.resultTextWrap}>
                <Text
                  style={[FONTS.fs_14_medium, styles.resultTitle]}
                  numberOfLines={1}>
                  {item.placeName || '장소명 없음'}
                </Text>
                <Text
                  style={[FONTS.fs_12_medium, styles.resultMeta]}
                  numberOfLines={1}>
                  {[item.category, item.roadAddress || item.address]
                    .filter(Boolean)
                    .join(' · ') || '주소 정보가 없어요'}
                </Text>
              </View>
              <Text style={[FONTS.fs_14_semibold, styles.selectText]}>
                선택
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
            검색 결과가 없어요.
          </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="장소 찾기" onPress={() => navigation.goBack()} />
      <View style={styles.inputWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          style={[FONTS.fs_14_regular, styles.input]}
          placeholder="주소나 장소명으로 검색"
          placeholderTextColor="#9AA1AA"
        />
      </View>
      {renderBody()}
    </View>
  );
};

export default CommunityPlaceSearch;
