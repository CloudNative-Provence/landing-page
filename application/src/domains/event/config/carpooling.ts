import { EVENT } from 'astrowind:config';

export type CarpoolingInfo = {
  provider?: string;
  url?: string;
  embedUrl?: string;
};

type ExtendedEventConfig = typeof EVENT & {
  carpooling?: CarpoolingInfo;
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : undefined;
};

export const getCarpoolingInfo = (): CarpoolingInfo => {
  const carpoolingConfig = (EVENT as ExtendedEventConfig).carpooling;

  const url = normalizeOptionalString(carpoolingConfig?.url);
  const embedUrl = normalizeOptionalString(carpoolingConfig?.embedUrl) ?? url;

  return {
    provider: normalizeOptionalString(carpoolingConfig?.provider),
    url,
    embedUrl,
  };
};

export const hasCarpooling = (info: CarpoolingInfo = getCarpoolingInfo()): boolean =>
  Boolean(info.embedUrl ?? info.url);
