import {buildRefundPolicyTableHtml} from '@utils/refundPolicyAgreement';
import {formatServiceRegion} from '@utils/formatServiceRegion';
import React from 'react';
import {Text} from 'react-native';
import Renderer, {act} from 'react-test-renderer';
import i18n from '@trio/app/src/i18n';
import RecruitTapSection from '@screens/(Common)/Employ/EmployDetail/RecruitTapSection';
import ServiceInfoContent from '@screens/(Common)/Guesthouse/GuesthouseDetail/ServiceInfoContent';
import ApplicantInfoDatePicker from '@screens/(User)/Employ/ApplicantInfo/ApplicantInfoDatePicker';
import DateGuestModal from '@components/modals/Guesthouse/DateGuestModal';
import GlobalAlertModal from '@components/modals/GlobalAlertModal';
import {AGREEMENT_CONTENT} from '@data/agreeContents';
import {showErrorModal} from '@utils/loginModalHub';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
}));
jest.mock('@utils/navigationService', () => ({navigate: jest.fn()}));
jest.mock('@components/AppImage', () => 'AppImage');
jest.mock('@components/LocalizedNaverMapView', () => 'Map');
jest.mock('@components/modals/ImageModal', () => 'ImageModal');
jest.mock('@components/modals/AdaptiveModal', () => 'Modal');
jest.mock('@components/modals/AlertModal', () => 'AlertModal');
jest.mock('@components/ButtonScarlet', () => 'ButtonScarlet');
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  LocaleConfig: {locales: {}},
}));
jest.mock('react-native-calendars/src/calendar/day/period', () => 'PeriodDay');
jest.mock(
  '@stores/amenityStore',
  () => selector =>
    selector({
      amenities: [
        {
          id: 1,
          name: '호스트 시설명',
          amenityType: 'CUSTOM',
          category: 'PUBLIC',
        },
      ],
    }),
);

const content = node =>
  typeof node === 'string'
    ? node
    : Array.isArray(node)
    ? node.map(content).join(' ')
    : content(node?.children ?? []);
let screen;
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  screen = undefined;
  await act(async () => i18n.changeLanguage('ko'));
});
const mount = async component =>
  act(async () => {
    screen = Renderer.create(component);
  });
const press = async label => {
  let node = screen.root
    .findAllByType(Text)
    .find(n => content(n.props.children) === label);
  expect(node).toBeDefined();
  while (node && !node.props.onPress) node = node.parent;
  await act(async () => node.props.onPress());
};

test.each(['ko', 'en'])(
  'recruitment tabs keep their content and selection after switching from %s',
  async initial => {
    await i18n.changeLanguage(initial);
    await mount(
      <RecruitTapSection
        recruit={{
          recruitStart: '2026-10-01T10:00:00',
          recruitEnd: '2026-11-30T10:00:00',
          entryStartDate: '2026-10-01T10:00:00',
          entryEndDate: '2026-12-01T10:00:00',
          workPart: '호스트 업무 원문',
          recruitImages: [],
        }}
      />,
    );
    expect(content(screen.toJSON())).toContain(
      i18n.t('employ.recruitmentPeriod'),
    );
    await press(i18n.t('employ.workingConditions'));
    for (const language of ['en', 'ko', 'en']) {
      await act(async () => i18n.changeLanguage(language));
      const text = content(screen.toJSON());
      expect(text).toContain(i18n.t('employ.workingConditions'));
      expect(text).toContain(i18n.t('employ.mainTasks'));
      expect(text).toContain('호스트 업무 원문');
      expect(text).not.toContain(
        i18n.getFixedT(language === 'ko' ? 'en' : 'ko')('employ.mainTasks'),
      );
    }
  },
);

test('facility headings switch while host amenity names stay unchanged', async () => {
  await mount(<ServiceInfoContent selectedAmenities={['CUSTOM']} />);
  for (const language of ['en', 'ko']) {
    await act(async () => i18n.changeLanguage(language));
    const text = content(screen.toJSON());
    expect(text).toContain(i18n.t('common.accommodationCommonFacilities'));
    expect(text).toContain('호스트 시설명');
  }
});

test('the application calendar uses a month name rather than the Monday translation', async () => {
  await i18n.changeLanguage('en');
  await mount(
    <ApplicantInfoDatePicker
      value={new Date(2026, 9, 25)}
      onChange={jest.fn()}
    />,
  );
  expect(content(screen.toJSON())).toContain('October 2026');
  expect(content(screen.toJSON())).not.toContain('2026year10Mon');
  await act(async () => i18n.changeLanguage('ko'));
  expect(content(screen.toJSON())).toContain('2026년 10월');
});

test('selected date range accessibility and guest count follow app language', async () => {
  await mount(
    <DateGuestModal
      visible
      initCheckInDate="2026-10-25"
      initCheckOutDate="2026-10-26"
      initAdultGuestCount={1}
      initChildGuestCount={0}
    />,
  );
  for (const language of ['en', 'ko']) {
    await act(async () => i18n.changeLanguage(language));
    const calendar = screen.root.findByType('Calendar');
    const label = calendar.props.dayComponent({
      date: {dateString: '2026-10-25', day: 25},
      marking: calendar.props.markedDates['2026-10-25'],
      state: 'today',
    }).props.accessibilityLabel;
    expect(label).toContain(
      language === 'ko' ? '선택 구간 시작' : 'start of selected range',
    );
    expect(label).not.toContain('period start');
    expect(content(screen.toJSON())).not.toContain('{{');
  }
});

test('an open default alert does not retain its previous language button', async () => {
  await mount(<GlobalAlertModal />);
  await act(async () => showErrorModal({title: 'Server content'}));
  for (const language of ['en', 'ko']) {
    await act(async () => i18n.changeLanguage(language));
    const alert = screen.root.findByType('AlertModal');
    expect(alert.props.buttonText).toBe(i18n.t('common.confirm'));
    expect(alert.props.title).toBe('Server content');
  }
});

test('agreement documents resolve current language and preserve property interpolation', async () => {
  const doc = AGREEMENT_CONTENT.USER.GUESTHOUSE_PRIVACY_THIRD_PARTY;
  for (const language of ['en', 'ko', 'en']) {
    await i18n.changeLanguage(language);
    expect(doc.title).toBe(
      i18n.t('agreements.GUESTHOUSE_PRIVACY_THIRD_PARTY.title'),
    );
    expect(doc.detail).toContain('{{guesthouseName}}');
    if (language === 'en') {
      for (const agreement of Object.values(AGREEMENT_CONTENT.USER)) {
        expect(
          `${agreement.title} ${agreement.detailHtml || ''} ${
            agreement.detail || ''
          }`,
        ).not.toMatch(/[가-힣]/);
      }
    }
  }
});

test('refund day labels describe time before check-in and use singular correctly', async () => {
  await i18n.changeLanguage('en');
  const html = buildRefundPolicyTableHtml([
    {daysBeforeCheckin: 7, refundRate: 100},
    {daysBeforeCheckin: 1, refundRate: 0},
  ]);
  expect(html).toContain('7 days before check-in');
  expect(html).toContain('1 day before check-in');
  expect(html).not.toContain('days ago');
});

test('app-owned region labels follow language without changing unrecognized server values', async () => {
  await i18n.changeLanguage('en');
  expect(formatServiceRegion('JEJU_NORTH')).toBe('North Jeju');
  expect(formatServiceRegion('UNKNOWN')).toBe('Location not specified');
  expect(formatServiceRegion('서버 원문')).toBe('서버 원문');
  await i18n.changeLanguage('ko');
  expect(formatServiceRegion('JEJU_NORTH')).toBe('제주 북부');
});
