const stayThumbnailSrcByType = {
  hotel: '~/assets/images/pages/practical-info/accommodation/hotel.svg',
  aparthotel: '~/assets/images/pages/practical-info/accommodation/aparthotel.svg',
  guesthouse: '~/assets/images/pages/practical-info/accommodation/guesthouse.svg',
} as const;

export const defaultStayThumbnailSrc = stayThumbnailSrcByType.hotel;

export const getStayThumbnailSrc = (typeId: string): string | undefined =>
  stayThumbnailSrcByType[typeId as keyof typeof stayThumbnailSrcByType];
