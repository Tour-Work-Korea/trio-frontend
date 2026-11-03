import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import SkeletonLayout, {
  Line,
  Repeat,
} from '../../screens/_components/SkeletonLayout';

export default function ChatSkeleton({inbox = false}) {
  const {t} = useTranslation();
  return (
    <SkeletonLayout
      title={t('companion.loading')}
      style={{paddingHorizontal: 20, paddingTop: 8, gap: inbox ? 0 : 22}}>
      {inbox ? (
        <Repeat count={5}>
          {() => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 20,
              }}>
              <Line width={48} height={48} style={{borderRadius: 24}} />
              <View style={{flex: 1, gap: 8}}>
                <Line width="70%" height={17} />
                <Line width="90%" height={13} />
              </View>
              <View style={{width: 38, alignItems: 'flex-end', gap: 14}}>
                <Line width={34} height={11} />
                <Line width={24} height={24} style={{borderRadius: 12}} />
              </View>
            </View>
          )}
        </Repeat>
      ) : (
        <Repeat count={6}>
          {index => (
            <View
              style={{
                alignSelf: index % 3 === 1 ? 'flex-end' : 'flex-start',
                width: index % 2 ? '55%' : '72%',
                gap: 8,
              }}>
              {index % 3 !== 1 && <Line width={65} height={12} />}
              <Line
                width="100%"
                height={index % 2 ? 44 : 66}
                style={{borderRadius: 12}}
              />
              <Line
                width={38}
                height={10}
                style={{alignSelf: index % 3 === 1 ? 'flex-end' : 'flex-start'}}
              />
            </View>
          )}
        </Repeat>
      )}
    </SkeletonLayout>
  );
}
