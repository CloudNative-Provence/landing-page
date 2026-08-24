import type { ImageMetadata } from 'astro';
import type { MetaDataOpenGraph } from '~/types';
import { astroAssetsOptimizer, isUnpicCompatible, unpicOptimizer } from './image-optimizer';

type LocalImageModule = {
  default: ImageMetadata;
};

const LOCAL_ASSET_MODULE_PREFIX = '../../assets/images';

const load = async function () {
  let images: Record<string, LocalImageModule> | undefined = undefined;
  try {
    images = import.meta.glob(
      ['../../assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}'],
      { eager: true }
    ) as Record<string, LocalImageModule>;
  } catch {
    // continue regardless of error
  }
  return images;
};

let _images: Record<string, LocalImageModule> | undefined = undefined;

/** */
export const fetchLocalImages = async () => {
  _images = _images || (await load());
  return _images;
};

/** */
export const findImage = async (
  imagePath?: string | ImageMetadata | null
): Promise<string | ImageMetadata | undefined | null> => {
  // Not string
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Absolute paths
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Relative paths or not "~/assets/"
  if (!imagePath.startsWith('~/assets/images')) {
    return imagePath;
  }

  const images = await fetchLocalImages();
  const key = imagePath.replace('~/assets/images', LOCAL_ASSET_MODULE_PREFIX);

  return images?.[key]?.default ?? null;
};

/** */
export const adaptOpenGraphImages = async (
  openGraph: MetaDataOpenGraph = {},
  astroSite: URL | undefined = new URL('')
): Promise<MetaDataOpenGraph> => {
  if (!openGraph?.images?.length) {
    return openGraph;
  }

  const images = openGraph.images;
  const defaultWidth = 1200;
  const defaultHeight = 626;

  const adaptedImages = await Promise.all(
    images.map(async (image) => {
      if (image?.url) {
        const resolvedImage = (await findImage(image.url)) as ImageMetadata | string | undefined;
        if (!resolvedImage) {
          return {
            url: '',
          };
        }

        const isSvgImage =
          (typeof resolvedImage === 'string' && resolvedImage.toLowerCase().endsWith('.svg')) ||
          (typeof resolvedImage !== 'string' && resolvedImage.format === 'svg');

        if (isSvgImage) {
          const svgUrl = typeof resolvedImage === 'string' ? resolvedImage : resolvedImage.src;

          return {
            url: String(new URL(svgUrl, astroSite)),
            width: typeof resolvedImage === 'string' ? image.width : resolvedImage.width,
            height: typeof resolvedImage === 'string' ? image.height : resolvedImage.height,
          };
        }

        let _image: object | string | undefined = undefined;

        if (
          typeof resolvedImage === 'string' &&
          (resolvedImage.startsWith('http://') || resolvedImage.startsWith('https://')) &&
          isUnpicCompatible(resolvedImage)
        ) {
          _image = (await unpicOptimizer(resolvedImage, [defaultWidth], defaultWidth, defaultHeight, 'jpg'))[0];
        } else if (resolvedImage) {
          const dimensions =
            typeof resolvedImage !== 'string' && resolvedImage?.width <= defaultWidth
              ? [resolvedImage?.width, resolvedImage?.height]
              : [defaultWidth, defaultHeight];
          _image = (await astroAssetsOptimizer(resolvedImage, [dimensions[0]], dimensions[0], dimensions[1], 'jpg'))[0];
        }

        if (typeof _image === 'object') {
          return {
            url: 'src' in _image && typeof _image.src === 'string' ? String(new URL(_image.src, astroSite)) : '',
            width: 'width' in _image && typeof _image.width === 'number' ? _image.width : undefined,
            height: 'height' in _image && typeof _image.height === 'number' ? _image.height : undefined,
          };
        }
        return {
          url: '',
        };
      }

      return {
        url: '',
      };
    })
  );

  return { ...openGraph, ...(adaptedImages ? { images: adaptedImages } : {}) };
};
