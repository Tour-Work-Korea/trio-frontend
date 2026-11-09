import {englishAdmissionPrices} from '../data/englishAdmissionPrices.js';
import {englishEventCopy} from '../data/englishEventCopy.js';

// The API contract is provisional. Keep server DTO adaptation here, outside UI.
const languages = ['ko', 'en'];
const timeZone = 'Asia/Seoul';

export function localized(value, fallback = '') {
  const ko = typeof value === 'string' ? value : value?.ko;
  const en = typeof value === 'string' ? value : value?.en;
  const clean = text => (typeof text === 'string' ? text.trim() : '');
  return {
    ko: clean(ko) || clean(en) || fallback,
    en: clean(en) || clean(ko) || fallback,
  };
}

export function eventHref(id, language) {
  const query = new URLSearchParams({id: String(id)});
  if (language === 'ko' || language === 'en') query.set('lang', language);
  return `/koda/event/?${query}`;
}

const optionalUrl = value => {
  if (!value) return '';
  if (
    typeof value !== 'string' ||
    !/^(\/(?![\/\\])|https:\/\/)/.test(value) ||
    /[\s\\]/.test(value)
  ) {
    throw new Error(
      'Event media and map URLs must be local paths or HTTPS URLs.',
    );
  }
  return value;
};

const media = value => {
  if (!value?.url) return null;
  return {
    url: optionalUrl(value.url),
    alt: localized(value.alt),
    width:
      Number.isFinite(value.width) && value.width > 0 ? value.width : undefined,
    height:
      Number.isFinite(value.height) && value.height > 0
        ? value.height
        : undefined,
  };
};

const textList = values =>
  (Array.isArray(values) ? values : [])
    .map(value => localized(value))
    .filter(value => value.ko || value.en);

export function normalizeGallery(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter(item => item?.src)
    .map(item => ({
      src: optionalUrl(item.src),
      type: item.type === 'video' ? 'video' : 'image',
      poster: optionalUrl(item.poster),
      caption: localized(item.caption),
    }));
}

function schedule(startsAt, endsAt) {
  const hasZone = value =>
    typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (
    !hasZone(startsAt) ||
    !hasZone(endsAt) ||
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    end <= start
  ) {
    throw new Error(
      'An event needs valid start/end timestamps with a timezone.',
    );
  }
  const date = {};
  const time = {};
  for (const language of languages) {
    const dateFormat = new Intl.DateTimeFormat(language, {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    const timeFormat = new Intl.DateTimeFormat(language, {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
    });
    date[language] = dateFormat.format(start);
    const endDate = dateFormat.format(end);
    time[language] = `${timeFormat.format(start)} – ${
      date[language] === endDate ? '' : `${endDate} `
    }${timeFormat.format(end)} · KST`;
  }
  return {date, time};
}

function priceLabel(pricing, eventId) {
  if (!pricing) return localized({ko: '추후 안내', en: 'To be announced'});
  if (
    !Number.isFinite(pricing.amount) ||
    pricing.amount < 0 ||
    !/^[A-Z]{3}$/.test(pricing.currency || '')
  ) {
    throw new Error(
      'Event pricing needs a non-negative amount and ISO currency.',
    );
  }
  // Optional display-only legacy copy. Never use it to construct a payment.
  const labels = pricing.displayLabel
    ? localized(pricing.displayLabel)
    : Object.fromEntries(
        languages.map(language => [
          language,
          language === 'ko' && pricing.currency === 'KRW'
            ? `${new Intl.NumberFormat('ko').format(pricing.amount)}원`
            : new Intl.NumberFormat(language, {
                style: 'currency',
                currency: pricing.currency,
              }).format(pricing.amount),
        ]),
      );
  const englishPrice = englishAdmissionPrices[eventId];
  if (englishPrice && pricing.currency === 'KRW') {
    const matchingRate = [englishPrice.earlyBird, englishPrice].find(
      rate => rate && rate.krwAmount === pricing.amount,
    );
    labels.en =
      matchingRate
        ? `$${matchingRate.usdAmount} USD`
        : 'USD price to be confirmed';
  }
  return labels;
}

function paypalDiscounts(record) {
  const rates = englishAdmissionPrices[record.id];
  if (
    record.pricing?.currency !== 'KRW' ||
    record.pricing.amount !== rates?.krwAmount
  )
    return [];
  return (rates.discounts || []).filter(rate =>
    record.pricing.options?.some(
      option => option.id === rate.optionId && option.amount === rate.krwAmount,
    ),
  );
}

export function toEventViewModel(record) {
  const rates = englishAdmissionPrices[record?.id];
  const earlyBird = record?.pricing?.currency === 'KRW' &&
    rates?.earlyBird && record.pricing.amount === rates.earlyBird.krwAmount
    ? {startsAt: rates.earlyBird.startsAt, endsAt: rates.earlyBird.endsAt, regularPrice: {ko: `${new Intl.NumberFormat('ko').format(rates.krwAmount)}원`, en: `$${rates.usdAmount} USD`}}
    : null;
  const translations = englishEventCopy[record?.id];
  const localize = value => {
    const result = localized(value);
    const translation = translations?.[result.ko] ||
      (earlyBird && translations?.[result.ko.replace('- 참가비: 15,000원', '- 참가비: 20,000원')]);
    if (translation && (typeof value === 'string' || !value?.en)) {
      result.en = translation.replace(
        '{admissionPrice}',
        priceLabel(record.pricing, record.id).en,
      ).replace('Standard admission:', 'Admission:');
      if (earlyBird) result.ko = result.ko.replace('- 참가비: 20,000원', '- 참가비: 15,000원');
    }
    return result;
  };
  const title = localize(record?.title);
  if (
    !record ||
    typeof record.id !== 'string' ||
    !record.id.trim() ||
    !title.ko
  ) {
    throw new Error('An event needs an ID and at least one translated title.');
  }
  const cover = media(record.cover);
  const programImage = media(record.program?.image);
  return {
    id: record.id,
    reviewSeriesId: record.reviewSeriesId || record.id,
    bookingPartyId:
      Number.isSafeInteger(record.bookingPartyId) && record.bookingPartyId > 0
        ? record.bookingPartyId
        : null,
    booking: record.booking || null,
    bookingEnabled: record.bookingEnabled === true,
    path: eventHref(record.id),
    title,
    intro: localized(record.intro),
    organizer: localize(record.organizer),
    edition: typeof record.edition === 'string' ? record.edition : '',
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    ...schedule(record.startsAt, record.endsAt),
    cover: cover ? {...cover, alt: localize(record.cover.alt)} : null,
    poster: cover?.url || '',
    posterAlt: cover?.alt.ko || title.ko,
    venue: record.location?.name
      ? localize(record.location.name)
      : localized('—'),
    address: localized(record.location?.address),
    mapUrl: optionalUrl(record.location?.mapUrl),
    price: priceLabel(record.pricing, record.id),
    earlyBird,
    paypalDiscounts: paypalDiscounts(record),
    priceNote: localized(record.pricing?.note),
    about: (Array.isArray(record.about) ? record.about : [])
      .map(localize)
      .filter(value => value.ko || value.en),
    introduction: (Array.isArray(record.introduction)
      ? record.introduction
      : []
    )
      .map(item => ({
        title: localize(item.title),
        description: localize(item.description),
        images: normalizeGallery(item.images),
      }))
      .filter(
        item => item.title.ko || item.description.ko || item.images.length,
      ),
    program: textList(record.program?.steps),
    programDescription: localize(record.program?.description),
    programImage,
    faqs: (Array.isArray(record.faqs) ? record.faqs : [])
      .map(faq => ({
        question: localized(faq?.question),
        answer: localized(faq?.answer),
      }))
      .filter(faq => faq.question.ko && faq.answer.ko),
    gallery: normalizeGallery(record.gallery),
    detailImages: normalizeGallery(record.detailImages),
    relatedIds: Array.isArray(record.relatedIds)
      ? [
          ...new Set(
            record.relatedIds.filter(
              id => typeof id === 'string' && id !== record.id,
            ),
          ),
        ]
      : [],
  };
}

export function resolveEventRequest(pageId, search) {
  if (pageId === 'home') return {type: 'home'};
  if (pageId === 'gatherings') return {type: 'gatherings'};
  if (pageId === 'about') return {type: 'about'};
  if (pageId === 'my') return {type: 'my'};
  if (pageId === 'join') return {type: 'join'};
  // Existing editorial URLs are aliases; new events use the single event entry.
  return {
    type: 'detail',
    id: pageId === 'event' ? new URLSearchParams(search).get('id') : pageId,
  };
}
