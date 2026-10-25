import {
  dateKey,
  kstDate,
  mergeMessages,
  parsePayload,
  roomForAccess,
  validateDraft,
} from '../../../packages/app/src/features/companion/model';

const valid = {
  title: '함께 제주 산책',
  description: '제주 바닷길을 함께 걸어요.',
  activityType: 'WALK',
  regionCode: 'JEJU_NORTH',
  meetingPlace: '',
  capacity: 2,
  startDate: '2026-11-20',
  endDate: '2026-11-20',
};
const now = new Date('2026-11-01T00:00:00Z');
describe('companion lifecycle and validation', () => {
  test('same-day plans are valid and capacity excludes the organizer', () => {
    expect(validateDraft(valid, now)).toBeNull();
    expect(validateDraft({...valid, capacity: 0}, now)).toBe(
      'companion.validation',
    );
    expect(validateDraft({...valid, capacity: 101}, now)).toBe(
      'companion.validation',
    );
  });
  test.each([
    ['title', '가'.repeat(120), null],
    ['title', '가'.repeat(121), 'companion.validation'],
    ['description', '가'.repeat(1000), null],
    ['description', '가'.repeat(1001), 'companion.validation'],
    ['description', ' '.repeat(1000), 'companion.validation'],
  ])('content boundary %s', (field, value, expected) => {
    expect(validateDraft({...valid, [field]: value}, now)).toBe(expected);
  });
  test('30 inclusive days are permitted, 31 days and reversed ranges are rejected', () => {
    expect(
      validateDraft(
        {...valid, startDate: '2026-11-01', endDate: '2026-11-30'},
        new Date('2026-10-01'),
      ),
    ).toBeNull();
    expect(
      validateDraft(
        {...valid, startDate: '2026-11-01', endDate: '2026-12-01'},
        now,
      ),
    ).toBe('companion.dateValidation');
    expect(validateDraft({...valid, endDate: '2026-11-19'}, now)).toBe(
      'companion.dateValidation',
    );
    expect(validateDraft({...valid, startDate: '2026-02-30'}, now)).toBe(
      'companion.dateValidation',
    );
  });
  test('today and same-day plans are allowed; dates before today in Korea are rejected', () => {
    const plan = {...valid, startDate: '2026-11-20', endDate: '2026-11-20'};
    expect(validateDraft(plan, new Date('2026-11-20T14:59:59Z'))).toBeNull();
    expect(validateDraft(plan, new Date('2026-11-20T15:00:00Z'))).toBe(
      'companion.dateValidation',
    );
  });
  test('server failure cannot open a room even when stale room ids remain in the response', () => {
    expect(
      roomForAccess({status: 'FAILED', directRoomId: 4}, {status: 'OPEN'}),
    ).toBeNull();
    expect(
      roomForAccess({status: 'NONE', directRoomId: 4}, {status: 'OPEN'}),
    ).toBeNull();
  });
  test('editing keeps content checks without requiring new dates', () => {
    expect(validateDraft(valid, new Date('2027-01-01'), false)).toBeNull();
    expect(validateDraft({...valid, description: 'short'}, now, false)).toBe(
      'companion.validation',
    );
  });
  test('READY needs a room matching the recruitment stage', () => {
    expect(
      roomForAccess(
        {status: 'READY', directRoomId: 4, groupRoomId: 8},
        {status: 'OPEN'},
      ),
    ).toBe(4);
    expect(
      roomForAccess(
        {status: 'READY', directRoomId: 4, groupRoomId: 8},
        {status: 'CLOSED'},
      ),
    ).toBe(8);
    expect(
      roomForAccess({status: 'READY'}, {status: 'CLOSED'}),
    ).toBeUndefined();
    expect(
      roomForAccess({status: 'PENDING', groupRoomId: 8}, {status: 'CLOSED'}),
    ).toBeNull();
    expect(
      roomForAccess({status: 'READY', groupRoomId: 8}, {status: 'CANCELLED'}),
    ).toBeNull();
  });
  test('offset-free core times are interpreted as Korea time, UTC chat times retain their instant', () => {
    expect(kstDate('2026-11-19T18:00:00').toISOString()).toBe(
      '2026-11-19T09:00:00.000Z',
    );
    expect(kstDate('2026-11-19T09:00:00Z').toISOString()).toBe(
      '2026-11-19T09:00:00.000Z',
    );
    expect(dateKey(new Date('2026-11-19T16:00:00Z'))).toBe('2026-11-20');
  });
});
describe('chat ordering and payloads', () => {
  const optimistic = {
    clientMessageId: 'intent-1',
    content: 'hello',
    senderUserId: '20',
    pending: true,
    sentAt: '2026-11-18T03:30:00Z',
  };
  const ack = {
    messageId: 80,
    clientMessageId: 'intent-1',
    acceptedAt: '2026-11-18T03:30:00Z',
  };
  const event = {
    messageId: 80,
    clientMessageId: 'intent-1',
    senderId: '20',
    roomId: '7',
    content: 'hello',
    sentAt: '2026-11-18T03:30:00Z',
  };
  test.each([
    [ack, event],
    [event, ack],
  ])('ACK and MESSAGE can arrive in either order', (first, second) => {
    const messages = mergeMessages(mergeMessages([optimistic], [first]), [
      second,
    ]);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      messageId: 80,
      content: 'hello',
      senderUserId: '20',
      pending: false,
    });
  });
  test('overlapping REST pages normalize IDs and deduplicate without losing message content', () => {
    const messages = mergeMessages(
      [event],
      [
        {
          messageId: 79,
          senderUserId: 10,
          content: 'older',
          sentAt: '2026-11-18T03:29:00Z',
        },
        {...event, senderUserId: 20, unreadMemberCount: 1},
      ],
    );
    expect(messages.map(message => message.messageId)).toEqual([79, 80]);
    expect(messages[1].senderUserId).toBe('20');
  });
  test('client message IDs are scoped to their sender', () => {
    const messages = mergeMessages(
      [optimistic],
      [{...event, messageId: 81, senderId: '30'}],
    );
    expect(messages).toHaveLength(2);
    expect(
      messages.find(message => message.messageId === 81).senderUserId,
    ).toBe('30');
  });
  test('invalid structured payloads do not crash a conversation', () => {
    expect(parsePayload({payloadJson: '{invalid'})).toEqual({});
    expect(parsePayload({payloadJson: '{"latitude":33.5}'})).toEqual({
      latitude: 33.5,
    });
  });
});
