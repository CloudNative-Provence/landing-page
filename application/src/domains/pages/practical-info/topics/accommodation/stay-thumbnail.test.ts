import { describe, expect, it } from 'vitest';

import { defaultStayThumbnailSrc, getStayThumbnailSrc } from './stay-thumbnail';

describe('accommodation stay thumbnails', () => {
  it('maps each supported stay type to an illustration asset', () => {
    expect(getStayThumbnailSrc('hotel')).toBe('~/assets/images/pages/practical-info/accommodation/hotel.svg');
    expect(getStayThumbnailSrc('aparthotel')).toBe('~/assets/images/pages/practical-info/accommodation/aparthotel.svg');
    expect(getStayThumbnailSrc('guesthouse')).toBe('~/assets/images/pages/practical-info/accommodation/guesthouse.svg');
    expect(defaultStayThumbnailSrc).toBe('~/assets/images/pages/practical-info/accommodation/hotel.svg');
  });

  it('returns undefined for unsupported stay types', () => {
    expect(getStayThumbnailSrc('hostel')).toBeUndefined();
  });
});
