import {
  classifyLogoPixel,
  findAlphaBounds,
  removeCheckerboardBackground,
} from './logo-background-removal';

describe('classifyLogoPixel', () => {
  it('removes neutral gray checkerboard squares', () => {
    expect(classifyLogoPixel(58, 58, 58)).toEqual({
      isForeground: false,
      alpha: 0,
    });
    expect(classifyLogoPixel(117, 117, 115)).toEqual({
      isForeground: false,
      alpha: 0,
    });
  });

  it('preserves gold icon tones', () => {
    expect(classifyLogoPixel(213, 157, 44)).toEqual({
      isForeground: true,
      alpha: 255,
    });
    expect(classifyLogoPixel(109, 101, 88)).toEqual({
      isForeground: true,
      alpha: 255,
    });
  });

  it('preserves white wordmark text', () => {
    expect(classifyLogoPixel(251, 251, 251)).toEqual({
      isForeground: true,
      alpha: 255,
    });
  });

  it('removes compression chroma spikes on gray background', () => {
    expect(classifyLogoPixel(58, 255, 58)).toEqual({
      isForeground: false,
      alpha: 0,
    });
  });
});

describe('findAlphaBounds', () => {
  it('returns a tight bounding box for opaque pixels', () => {
    const rgba = Buffer.alloc(4 * 4 * 4, 0);
    // Single opaque pixel at (1,1)
    rgba[(1 * 4 + 1) * 4 + 3] = 255;

    expect(findAlphaBounds(rgba, 4, 4)).toEqual({
      left: 1,
      top: 1,
      width: 1,
      height: 1,
    });
  });
});

describe('removeCheckerboardBackground', () => {
  it('produces transparent background for gray pixels', () => {
    const input = Buffer.from([58, 58, 58, 213, 157, 44]);
    const out = removeCheckerboardBackground(input, 2, 1, 3);

    expect(out[3]).toBe(0);
    expect(out[4]).toBe(213);
    expect(out[5]).toBe(157);
    expect(out[6]).toBe(44);
    expect(out[7]).toBe(255);
  });
});
