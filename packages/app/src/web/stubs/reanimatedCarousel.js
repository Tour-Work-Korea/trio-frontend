import React from 'react';
import {ScrollView, View} from 'react-native';

export default function Carousel({data = [], renderItem, width, height, style}) {
  if (!Array.isArray(data) || typeof renderItem !== 'function') {
    return React.createElement(View, {style});
  }

  return React.createElement(
    ScrollView,
    {
      horizontal: true,
      pagingEnabled: true,
      showsHorizontalScrollIndicator: false,
      style: [style, width ? {width} : null, height ? {height} : null],
    },
    data.map((item, index) =>
      React.createElement(
        View,
        {key: item?.id ?? item?.imageUrl ?? index, style: width ? {width} : null},
        renderItem({item, index}),
      ),
    ),
  );
}
