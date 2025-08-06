import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import styles from './ApplicantList.styles';

export default function Filter({selectedFilter, setSelectedFilter}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 16}}
      style={{maxHeight: 50, paddingBottom: 12}}>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'all' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('all')}>
        <Text style={styles.tagText}>전체</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'career1' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('career1')}>
        <Text style={styles.tagText}>1년 이상</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'age20' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age20')}>
        <Text style={styles.tagText}>20대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'age30' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age30')}>
        <Text style={styles.tagText}>30대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'genderF' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderF')}>
        <Text style={styles.tagText}>여자</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tagButton,
          selectedFilter === 'genderM' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderM')}>
        <Text style={styles.tagText}>남자</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
