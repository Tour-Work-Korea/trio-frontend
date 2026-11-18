import React, {useMemo, useRef, useState} from 'react';
import {
  Keyboard,
  NativeModules,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import ImageModal from '@components/modals/ImageModal';
import DownloadIcon from '@assets/images/download_black.svg';
import {COLORS as C} from '@constants/colors';
import {Txt} from './ui';

async function savePhoto(uri) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) throw new Error('DOWNLOAD_FAILED');
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('INVALID_IMAGE');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ddakji-chat-${Date.now()}.${
      blob.type.split('/')[1] || 'jpg'
    }`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  if (Platform.OS === 'android' && Number(Platform.Version) < 29) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED)
      throw new Error('PHOTO_PERMISSION');
  }
  await NativeModules.ChatPhotoSaver.save(uri);
}

export default function ChatPhoto({uri, resolveUri, children}) {
  const {t} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState(uri);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const savingRef = useRef(false);
  const thumbnailRef = useRef(null);
  const [sourceRect, setSourceRect] = useState(null);
  const images = useMemo(() => [photoUri], [photoUri]);
  const open = () => {
    Keyboard.dismiss();
    setPhotoUri(uri);
    setStatus('');
    setSourceRect(null);
    const thumbnail = thumbnailRef.current;
    if (thumbnail?.measureInWindow) {
      thumbnail.measureInWindow((x, y, width, height) => {
        setSourceRect({x, y, width, height, imageIndex: 0});
        setVisible(true);
      });
    } else {
      setVisible(true);
    }
  };
  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setStatus('');
    try {
      const next = resolveUri ? await resolveUri() : uri;
      await savePhoto(next);
      setStatus(
        t(
          Platform.OS === 'web'
            ? 'companion.photoDownloadStarted'
            : 'companion.photoSaved',
        ),
      );
    } catch (error) {
      setStatus(
        t(
          error.code === 'PHOTO_PERMISSION' ||
            error.message === 'PHOTO_PERMISSION'
            ? 'companion.photoPermissionRequired'
            : 'companion.photoSaveFailed',
        ),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <TouchableOpacity
        ref={thumbnailRef}
        accessibilityRole="button"
        accessibilityLabel={t('companion.viewPhoto')}
        onPress={open}>
        {children}
      </TouchableOpacity>
      <ImageModal
        visible={visible}
        images={images}
        selectedImageIndex={0}
        sourceRect={sourceRect}
        sourceBorderRadius={8}
        onClose={() => setVisible(false)}
        headerAction={
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{disabled: saving, busy: saving}}
              disabled={saving}
              onPress={save}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                minHeight: 44,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: C.grayscale_0,
                opacity: saving ? 0.6 : 1,
              }}>
              <DownloadIcon width={20} height={20} />
              <Txt>
                {t(saving ? 'companion.photoSaving' : 'companion.savePhoto')}
              </Txt>
            </TouchableOpacity>
            {!!status && (
              <Txt
                accessibilityLiveRegion="polite"
                style={{
                  position: 'absolute',
                  top: 52,
                  width: 240,
                  alignSelf: 'center',
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: C.grayscale_900,
                  color: C.grayscale_0,
                }}>
                {status}
              </Txt>
            )}
          </View>
        }
      />
    </>
  );
}
