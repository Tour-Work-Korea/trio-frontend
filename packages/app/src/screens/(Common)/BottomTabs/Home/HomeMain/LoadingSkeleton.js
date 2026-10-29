import React from 'react';
import {View, Platform, Dimensions} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';
const frameWidth = Math.min(Dimensions.get('window').width, 430);
const meetWidth =
  Platform.OS === 'web'
    ? Math.max(136, Math.floor((frameWidth - 32 - 12) / 2))
    : 160;

export default function ScreenSkeleton({title, layout, section}) {
  return (
    <SkeletonLayout
      title={title}
      style={
        section === 'banner'
          ? [layout.bannerContainer, {paddingHorizontal: 18}]
          : section === 'guesthouses'
          ? layout.guesthouseContainer
          : layout.jobContainer
      }>
      {section === 'banner' ? (
        <Line width="100%" height={120} style={{borderRadius: 10}} />
      ) : (
        <>
          <View style={[layout.titleSection, {marginBottom: 10}]}>
            <Line width="65%" height={22} />
            <Line width="20%" height={14} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: section === 'guesthouses' ? 20 : 12,
            }}>
            <Repeat>
              {() => (
                <View
                  style={
                    section === 'guesthouses'
                      ? layout.guesthouseCard
                      : {width: meetWidth}
                  }>
                  <Line
                    style={
                      section === 'guesthouses'
                        ? layout.guesthouseImage
                        : {
                            width: meetWidth,
                            height: Math.round(meetWidth * 1.5),
                            borderRadius: 12,
                          }
                    }
                  />
                  {section === 'guesthouses' ? (
                    <>
                      <View style={[layout.titleSection, {marginBottom: 10}]}>
                        <Line width="40%" height={20} />
                        <Line width="48%" height={20} />
                      </View>
                      <Chips />
                    </>
                  ) : (
                    <View style={{marginTop: 8, gap: 4}}>
                      <Line width="65%" height={12} />
                      <Line width="90%" height={18} />
                      <Line width="75%" height={16} />
                    </View>
                  )}
                </View>
              )}
            </Repeat>
          </View>
        </>
      )}
    </SkeletonLayout>
  );
}
