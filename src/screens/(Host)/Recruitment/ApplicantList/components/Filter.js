import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../ApplicantList.styles';

export default function Filter({selectedFilter, setSelectedFilter}) {
  return (
    <View style={styles.filterButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('all')}>
        <Text style={styles.filterButtonText}>전체</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'career1' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('career1')}>
        <Text style={styles.filterButtonText}>1년 이상</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'age20' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age20')}>
        <Text style={styles.filterButtonText}>20대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'age30' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age30')}>
        <Text style={styles.filterButtonText}>30대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'genderF' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderF')}>
        <Text style={styles.filterButtonText}>여자</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'genderM' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderM')}>
        <Text style={styles.filterButtonText}>남자</Text>
      </TouchableOpacity>
    </View>
  );
}
