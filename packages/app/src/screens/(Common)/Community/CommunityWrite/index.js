import {useTranslation} from 'react-i18next';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NaverMapMarkerOverlay} from '@mj-studio/react-native-naver-map';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import Header from '@components/Header';
import NaverMapView from '@components/LocalizedNaverMapView';
import AppImage from '@components/AppImage';
import Modal from '@components/modals/AdaptiveModal';
import {FONTS} from '@constants/fonts';
import communityApi from '@utils/api/communityApi';
import {normalizeCommunityLocation} from '@utils/communityLocation';
import styles from './CommunityWrite.styles';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import PhotoIcon from '@assets/images/add_image_gray.svg';
import LocationIcon from '@assets/images/map_pin_gray.svg';
import LocationPinIcon from '@assets/images/map_pin_fill_orange.svg';
import KeyboardHideIcon from '@assets/images/keyboard_hide_gray.svg';
import EditIcon from '@assets/images/edit_white.svg';
import XIcon from '@assets/images/x_white.svg';

const TITLE_MAX_LENGTH = 40;
const BODY_MAX_LENGTH = 2000;
const MB = 1024 * 1024;
const JPEG_CONTENT_TYPE = 'image/jpeg';
export const COMMENT_MAX_LENGTH = 300;
export const COMMUNITY_IMAGE_LIMITS = {
  maxCount: 10,
  maxSingleFileSizeMb: 20,
  maxTotalFileSizeMb: 100,
};

const defaultCategories = [
  {
    id: 'GUESTHOUSE_RECOMMEND',
    code: 'GUESTHOUSE_RECOMMEND',
    displayName: '게하 추천',
    contentType: 'COMMUNITY',
  },
  {
    id: 'FOOD',
    code: 'FOOD',
    displayName: '맛집',
    contentType: 'COMMUNITY',
  },
  {
    id: 'CAFE',
    code: 'CAFE',
    displayName: '카페',
    contentType: 'COMMUNITY',
  },
  {
    id: 'COMPANION',
    code: 'COMPANION',
    displayName: '동행',
    contentType: 'COMMUNITY',
  },
];

const getObjectKeyFromImageUrl = imageUrl => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  try {
    const {pathname} = new URL(imageUrl);
    return decodeURIComponent(pathname).replace(/^\/+/, '') || null;
  } catch {
    return imageUrl.replace(/^\/+/, '') || null;
  }
};

const normalizeExistingImages = post =>
  [...(post?.images ?? [])]
    .sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
    .map((image, index) => ({
      id: `existing-${image.imageId ?? image.objectKey ?? index}`,
      uri: image.imageUrl,
      imageUrl: image.imageUrl,
      objectKey: image.objectKey ?? getObjectKeyFromImageUrl(image.imageUrl),
      fileSize: image.fileSizeBytes ?? image.fileSize ?? 1,
      fileSizeBytes: image.fileSizeBytes ?? image.fileSize ?? 1,
      isExisting: true,
    }))
    .filter(image => image.uri);

const CommunityWrite = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {
    mode,
    post: editingPost,
    selectedLocation: selectedLocationParam,
  } = route?.params ?? {};
  const isEditMode = mode === 'edit' && Boolean(editingPost?.postId);
  const titleInputRef = useRef(null);
  const bodyInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const scrollFocusTimerRef = useRef(null);
  const locationMapRef = useRef(null);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bodyInputHeight, setBodyInputHeight] = useState(160);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(() =>
    normalizeCommunityLocation(editingPost?.location),
  );
  const [images, setImages] = useState(() =>
    isEditMode ? normalizeExistingImages(editingPost) : [],
  );
  const [previewImageUri, setPreviewImageUri] = useState(null);
  const [inputsEditable, setInputsEditable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesChanged, setImagesChanged] = useState(false);
  const canSubmit =
    selectedCategory?.code &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    !isSubmitting;

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (scrollFocusTimerRef.current) {
        clearTimeout(scrollFocusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await communityApi.getCategories();
        const communityCategories = Array.isArray(response.data)
          ? response.data.filter(
              category =>
                category.contentType === 'COMMUNITY' &&
                category.code !== 'STAFF',
            )
          : defaultCategories;

        setCategories(
          communityCategories.length > 0
            ? communityCategories
            : defaultCategories,
        );
        if (isEditMode) {
          const matchedCategory = communityCategories.find(
            category => category.code === editingPost.categoryCode,
          );
          setSelectedCategory(matchedCategory ?? null);
        }
      } catch (error) {
        console.warn('fetchCommunityWriteCategories 실패:', error);
      }
    };

    fetchCategories();
  }, [editingPost?.categoryCode, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    setTitle(editingPost.title ?? '');
    setBody(editingPost.content ?? '');
    setSelectedLocation(normalizeCommunityLocation(editingPost.location));
    setImages(normalizeExistingImages(editingPost));
    setImagesChanged(false);
  }, [editingPost, isEditMode]);

  useEffect(() => {
    const nextLocation = normalizeCommunityLocation(selectedLocationParam);

    if (nextLocation) {
      setSelectedLocation(nextLocation);
    }
  }, [selectedLocationParam]);

  useEffect(() => {
    if (
      !Number.isFinite(selectedLocation?.latitude) ||
      !Number.isFinite(selectedLocation?.longitude)
    ) {
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      locationMapRef.current?.animateCameraTo?.({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        zoom: 16,
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [selectedLocation?.latitude, selectedLocation?.longitude]);

  const unlockInputsAfterScroll = () => {
    if (scrollFocusTimerRef.current) {
      clearTimeout(scrollFocusTimerRef.current);
    }

    scrollFocusTimerRef.current = setTimeout(() => {
      setInputsEditable(true);
    }, 180);
  };

  const handleScrollStart = () => {
    if (scrollFocusTimerRef.current) {
      clearTimeout(scrollFocusTimerRef.current);
    }

    setInputsEditable(false);
    titleInputRef.current?.blur();
    bodyInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleToggleCategory = () => {
    Keyboard.dismiss();
    setCategoryVisible(prev => !prev);
  };

  const handleSelectCategory = category => {
    Keyboard.dismiss();
    setSelectedCategory(category);
    setCategoryVisible(false);
  };

  const handleOpenPlaceSearch = () => {
    Keyboard.dismiss();
    navigation.navigate('CommunityPlaceSearch', {
      initialQuery: selectedLocation?.placeName ?? '',
    });
  };

  const handleRemoveLocation = () => {
    setSelectedLocation(null);
  };

  const buildLocationPayload = () => {
    if (!selectedLocation) {
      return {};
    }

    const payload = {
      placeName: selectedLocation.placeName,
      address: selectedLocation.address,
      roadAddress: selectedLocation.roadAddress,
      provider: selectedLocation.provider ?? 'NAVER',
    };

    if (
      Number.isFinite(selectedLocation.latitude) &&
      Number.isFinite(selectedLocation.longitude)
    ) {
      payload.lat = selectedLocation.latitude;
      payload.lng = selectedLocation.longitude;
    }

    if (selectedLocation.providerPlaceId) {
      payload.providerPlaceId = selectedLocation.providerPlaceId;
    }

    return payload;
  };

  const normalizeImageToJpeg = async (asset, index) => {
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        asset.uri,
        1600,
        1600,
        'JPEG',
        90,
      );

      return {
        id: `${Date.now()}-${index}`,
        uri: resizedImage.uri,
        fileName: `community-${Date.now()}-${index}.jpg`,
        fileSize: resizedImage.size || asset.fileSize || 1,
        type: JPEG_CONTENT_TYPE,
      };
    } catch (error) {
      console.warn('community image convert 실패:', error);

      return {
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        fileName: `community-${Date.now()}-${index}.jpg`,
        fileSize: asset.fileSize || 1,
        type: JPEG_CONTENT_TYPE,
      };
    }
  };

  const handleAddImages = async () => {
    const remainingCount = COMMUNITY_IMAGE_LIMITS.maxCount - images.length;

    if (remainingCount <= 0) {
      Alert.alert(
        t('community.upToValueImagesCanBeAdded_5e7cc2', {
          COMMUNITY_IMAGE_LIMITS_maxCount: COMMUNITY_IMAGE_LIMITS.maxCount,
        }),
      );
      return;
    }

    const result = await new Promise(resolve =>
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: remainingCount,
        },
        response => resolve(response),
      ),
    );

    if (result.didCancel || result.errorCode || !result.assets?.length) {
      return;
    }

    const selectedAssets = result.assets.filter(asset => asset.uri);
    const oversizedAsset = selectedAssets.find(
      asset =>
        Number(asset.fileSize || 0) >
        COMMUNITY_IMAGE_LIMITS.maxSingleFileSizeMb * MB,
    );

    if (oversizedAsset) {
      Alert.alert(
        t('community.imagesCanBeUploadedUpToValueMbPerPage_b41951', {
          COMMUNITY_IMAGE_LIMITS_maxSingleFileSizeMb:
            COMMUNITY_IMAGE_LIMITS.maxSingleFileSizeMb,
        }),
      );
      return;
    }

    const currentTotalSize = images.reduce(
      (total, image) => total + Number(image.fileSize || 0),
      0,
    );
    const selectedTotalSize = selectedAssets.reduce(
      (total, asset) => total + Number(asset.fileSize || 0),
      0,
    );

    if (
      currentTotalSize + selectedTotalSize >
      COMMUNITY_IMAGE_LIMITS.maxTotalFileSizeMb * MB
    ) {
      Alert.alert(
        t('community.theTotalImageSizeCanBeUploadedUpToValue_c70f62', {
          COMMUNITY_IMAGE_LIMITS_maxTotalFileSizeMb:
            COMMUNITY_IMAGE_LIMITS.maxTotalFileSizeMb,
        }),
      );
      return;
    }

    const nextImages = await Promise.all(
      selectedAssets.map((asset, index) => normalizeImageToJpeg(asset, index)),
    );
    const convertedOversizedImage = nextImages.find(
      image =>
        Number(image.fileSize || 0) >
        COMMUNITY_IMAGE_LIMITS.maxSingleFileSizeMb * MB,
    );

    if (convertedOversizedImage) {
      Alert.alert(
        t('community.imagesCanBeUploadedUpToValueMbPerPage_b41951', {
          COMMUNITY_IMAGE_LIMITS_maxSingleFileSizeMb:
            COMMUNITY_IMAGE_LIMITS.maxSingleFileSizeMb,
        }),
      );
      return;
    }

    const nextTotalSize = nextImages.reduce(
      (total, image) => total + Number(image.fileSize || 0),
      0,
    );

    if (
      currentTotalSize + nextTotalSize >
      COMMUNITY_IMAGE_LIMITS.maxTotalFileSizeMb * MB
    ) {
      Alert.alert(
        t('community.theTotalImageSizeCanBeUploadedUpToValue_c70f62', {
          COMMUNITY_IMAGE_LIMITS_maxTotalFileSizeMb:
            COMMUNITY_IMAGE_LIMITS.maxTotalFileSizeMb,
        }),
      );
      return;
    }

    setImages(prev => [...prev, ...nextImages]);
    setImagesChanged(true);
  };

  const handleRemoveImage = imageId => {
    setImages(prev => prev.filter(image => image.id !== imageId));
    setImagesChanged(true);
  };

  const uploadImageToS3 = async ({presignedUrl, uri, contentType}) => {
    const fileResponse = await fetch(uri);
    const blob = await fileResponse.blob();

    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {'Content-Type': contentType},
      body: blob,
    });
  };

  const getImageFilename = (image, index) => {
    if (image.fileName?.toLowerCase().endsWith('.jpg')) {
      return image.fileName;
    }

    return `community-${Date.now()}-${index}.jpg`;
  };

  const buildUploadedImages = async postId => {
    if (images.length === 0) {
      return [];
    }

    const newImages = images
      .map((image, finalIndex) => ({...image, finalIndex}))
      .filter(image => !image.isExisting);

    const uploadedImageMap = new Map();

    if (newImages.length > 0) {
      const presignTargets = newImages.map(image => ({
        filename: getImageFilename(image, image.finalIndex),
        contentType: JPEG_CONTENT_TYPE,
        imageOrder: image.finalIndex,
        fileSizeBytes: Number(image.fileSize || 1),
      }));
      const presignedResponse = await communityApi.getImagePresignedUrls(
        postId,
        presignTargets,
      );
      const presignedImages = presignedResponse.data ?? [];

      await Promise.all(
        presignedImages.map(presignedImage => {
          const sourceImage = newImages.find(
            image => image.finalIndex === presignedImage.imageOrder,
          );

          if (!sourceImage) {
            throw new Error('PRESIGNED_IMAGE_SOURCE_MISSING');
          }

          return uploadImageToS3({
            presignedUrl: presignedImage.presignedUrl,
            uri: sourceImage.uri,
            contentType: JPEG_CONTENT_TYPE,
          });
        }),
      );

      presignedImages.forEach(image => {
        uploadedImageMap.set(image.imageOrder, image);
      });
    }

    return images.map((image, index) => {
      if (image.isExisting) {
        if (!image.objectKey) {
          throw new Error('EXISTING_IMAGE_OBJECT_KEY_MISSING');
        }

        return {
          objectKey: image.objectKey,
          imageOrder: index,
          fileSizeBytes: Number(image.fileSizeBytes || image.fileSize || 1),
        };
      }

      const uploadedImage = uploadedImageMap.get(index);

      if (!uploadedImage) {
        throw new Error('PRESIGNED_IMAGE_RESULT_MISSING');
      }

      return {
        objectKey: uploadedImage.objectKey,
        imageOrder: index,
        fileSizeBytes: uploadedImage.fileSizeBytes,
      };
    });
  };

  const handleGoBack = () => {
    if (Platform.OS !== 'web') {
      navigation.goBack();
      return;
    }

    if (isEditMode && editingPost?.postId) {
      navigation.navigate('CommunityDetail', {postId: editingPost.postId});
      return;
    }

    navigation.navigate('MainTabs', {screen: '커뮤니티'});
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    Keyboard.dismiss();

    try {
      setIsSubmitting(true);
      const locationPayload = buildLocationPayload();

      if (isEditMode) {
        const uploadedImages = imagesChanged
          ? await buildUploadedImages(editingPost.postId)
          : null;

        await communityApi.updatePost(editingPost.postId, {
          categoryCode: selectedCategory.code,
          title: title.trim(),
          content: body.trim(),
          location: locationPayload,
          tags: (editingPost.tags ?? [])
            .map(tag =>
              typeof tag === 'string'
                ? tag
                : tag.name ?? tag.tagName ?? tag.content,
            )
            .filter(Boolean),
          images: uploadedImages,
        });

        handleGoBack();
        return;
      }

      const draftResponse = await communityApi.createDraft({
        categoryCode: selectedCategory.code,
        title: title.trim(),
        content: body.trim(),
        location: locationPayload,
        tags: [],
      });
      const postId = draftResponse.data?.postId;

      if (!postId) {
        throw new Error(t('community.thereIsNoPostid'));
      }

      let uploadedImages = [];

      if (images.length > 0) {
        uploadedImages = await buildUploadedImages(postId);
      }

      await communityApi.publishPost(postId, {
        location: locationPayload,
        images: uploadedImages,
      });

      handleGoBack();
    } catch (error) {
      console.warn(
        isEditMode ? 'updateCommunityPost 실패:' : 'createCommunityPost 실패:',
        error,
      );
      if (error?.message === 'EXISTING_IMAGE_OBJECT_KEY_MISSING') {
        Alert.alert(
          t('community.theImageListCannotBeChangedBecauseTheExistingImage'),
        );
      } else {
        Alert.alert(
          isEditMode
            ? t('community.failedToEditThePostPleaseTryAgainLater')
            : t('community.postRegistrationFailedPleaseTryAgainLater'),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditMode ? t('community.editPost') : t('common.writing')}
        onPress={handleGoBack}
        rightComponent={
          <TouchableOpacity
            activeOpacity={canSubmit ? 0.8 : 1}
            style={[
              styles.submitButton,
              canSubmit && styles.submitButtonActive,
            ]}
            onPress={handleSubmit}>
            <Text
              style={[
                FONTS.fs_14_semibold,
                styles.submitButtonText,
                canSubmit && styles.submitButtonTextActive,
              ]}>
              {isSubmitting
                ? isEditMode
                  ? t('community.editing')
                  : t('community.registering')
                : isEditMode
                ? t('common.edit')
                : t('common.register')}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={unlockInputsAfterScroll}
        onMomentumScrollEnd={unlockInputsAfterScroll}
        onStartShouldSetResponderCapture={() => {
          Keyboard.dismiss();
          return false;
        }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.categoryWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.categoryButton}
            onPress={handleToggleCategory}>
            <Text
              style={[
                FONTS.fs_14_regular,
                styles.categoryButtonText,
                selectedCategory && styles.selectedCategoryButtonText,
              ]}>
              {selectedCategory?.displayName ||
                t('community.pleaseSelectACategory')}
            </Text>
            {categoryVisible ? (
              <ChevronUp width={16} height={16} />
            ) : (
              <ChevronDown width={16} height={16} />
            )}
          </TouchableOpacity>

          {categoryVisible ? (
            <View style={styles.categoryMenu}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id ?? category.code}
                  activeOpacity={0.8}
                  style={styles.categoryMenuItem}
                  onPress={() => handleSelectCategory(category)}>
                  <Text
                    style={[
                      FONTS.fs_14_regular,
                      styles.categoryMenuText,
                      selectedCategory?.code === category.code &&
                        styles.selectedCategoryMenuText,
                    ]}>
                    {category.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <TextInput
          ref={titleInputRef}
          value={title}
          editable={inputsEditable}
          onChangeText={setTitle}
          maxLength={TITLE_MAX_LENGTH}
          style={[FONTS.fs_16_regular, styles.titleInput]}
          placeholder={t('community.pleaseEnterATitle')}
          placeholderTextColor="#CDD2D8"
        />

        {images.length > 0 ? (
          <View style={styles.imagePreviewSection}>
            <View style={styles.imagePreviewHeader}>
              <Text style={[FONTS.fs_14_medium, styles.imagePreviewTitle]}>
                {t('community.picture')}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.imagePreviewCount]}>
                {images.length}/{COMMUNITY_IMAGE_LIMITS.maxCount}
              </Text>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewList}>
              {images.map(image => (
                <TouchableOpacity
                  key={image.id}
                  activeOpacity={0.9}
                  style={styles.imagePreviewItem}
                  onPress={() => setPreviewImageUri(image.uri)}>
                  <AppImage
                    uri={image.uri}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.imageRemoveButton}
                    onPress={() => handleRemoveImage(image.id)}>
                    <XIcon width={16} height={16} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {selectedLocation ? (
          <View style={styles.locationPreviewCard}>
            {Number.isFinite(selectedLocation.latitude) &&
            Number.isFinite(selectedLocation.longitude) ? (
              <View style={styles.locationMapPreview}>
                <NaverMapView
                  key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
                  ref={locationMapRef}
                  style={styles.locationMap}
                  initialCamera={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    zoom: 16,
                  }}>
                  <NaverMapMarkerOverlay
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    width={32}
                    height={40}
                    anchor={{x: 0.5, y: 1}}>
                    <LocationPinIcon width={32} height={40} />
                  </NaverMapMarkerOverlay>
                </NaverMapView>
                <View style={styles.locationMapActions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.locationMapActionButton}
                    onPress={handleOpenPlaceSearch}>
                    <EditIcon width={12} height={12} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.locationMapActionButton}
                    onPress={handleRemoveLocation}>
                    <XIcon width={12} height={12} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            <View style={styles.locationPreviewBody}>
              <View style={styles.locationPreviewTextWrap}>
                <Text
                  style={[FONTS.fs_14_medium, styles.locationPreviewTitle]}
                  numberOfLines={1}>
                  {selectedLocation.placeName || t('common.selectedLocation')}
                </Text>
                <Text
                  style={[FONTS.fs_12_medium, styles.locationPreviewAddress]}
                  numberOfLines={1}>
                  {selectedLocation.roadAddress ||
                    selectedLocation.address ||
                    t('common.thereIsNoAddressInformation')}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <TextInput
          ref={bodyInputRef}
          value={body}
          editable={inputsEditable}
          onChangeText={setBody}
          maxLength={BODY_MAX_LENGTH}
          onContentSizeChange={event => {
            if (Platform.OS === 'web') {
              return;
            }

            setBodyInputHeight(
              Math.max(160, event.nativeEvent.contentSize.height + 24),
            );
          }}
          style={[
            FONTS.fs_14_regular,
            styles.bodyInput,
            {height: bodyInputHeight},
          ]}
          placeholder={t('community.pleaseEnterTheDetails')}
          placeholderTextColor="#CDD2D8"
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
        />
      </ScrollView>

      <View
        style={[
          styles.bottomToolbar,
          keyboardHeight > 0
            ? {bottom: keyboardHeight}
            : styles.bottomToolbarDetached,
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.toolbarButton}
          onPress={handleAddImages}>
          <PhotoIcon width={18} height={18} />
          <Text style={[FONTS.fs_14_regular, styles.toolbarButtonText]}>
            {t('community.picture')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.toolbarButton}
          onPress={handleOpenPlaceSearch}>
          <LocationIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.toolbarButtonText]}>
            {t('common.location_962eeb')}
          </Text>
        </TouchableOpacity>
        {keyboardHeight > 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.keyboardHideButton}
            onPress={Keyboard.dismiss}>
            <KeyboardHideIcon width={22} height={22} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal
        visible={Boolean(previewImageUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}>
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.imageModalCloseArea}
            onPress={() => setPreviewImageUri(null)}>
            {previewImageUri ? (
              <AppImage
                uri={previewImageUri}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CommunityWrite;
