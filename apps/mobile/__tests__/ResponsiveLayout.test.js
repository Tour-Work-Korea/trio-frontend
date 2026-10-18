import {getAdaptiveTextProps} from '@trio/app/src/components/AdaptiveText';

describe('AdaptiveText', () => {
  it('preserves the existing Korean text layout', () => {
    expect(getAdaptiveTextProps('ko', 'button')).toEqual({});
  });

  it('allows English button labels to wrap or shrink within their control', () => {
    expect(getAdaptiveTextProps('en', 'button')).toMatchObject({
      numberOfLines: 2,
      adjustsFontSizeToFit: true,
      minimumFontScale: 0.82,
    });
  });

  it('keeps English tab labels on one adaptive line', () => {
    expect(getAdaptiveTextProps('en', 'tab')).toMatchObject({
      numberOfLines: 1,
      minimumFontScale: 0.72,
    });
  });
});
