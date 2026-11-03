import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Action, Title, Txt, styles as s} from './ui';

export function ChatReentryPrompt({busy, onRejoin, onMyCompanions}) {
  const {t} = useTranslation();
  return (
    <View style={[s.empty, {padding: 24, gap: 16}]}>
      <Title>{t('companion.reentry.title')}</Title>
      <Txt style={[s.small, {textAlign: 'center'}]}>
        {t('companion.reentry.body')}
      </Txt>
      <Action
        label={t('companion.rejoin')}
        disabled={busy}
        onPress={onRejoin}
      />
      <Action secondary label={t('companion.my')} onPress={onMyCompanions} />
    </View>
  );
}
