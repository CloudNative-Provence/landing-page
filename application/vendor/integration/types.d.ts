declare module 'astrowind:config' {
  import type {
    AnalyticsConfig,
    AppBlogConfig,
    AppProgramConfig,
    EventConfig,
    I18NConfig,
    MetaDataConfig,
    SiteConfig,
    UIConfig,
  } from './utils/configBuilder';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const EVENT: EventConfig;
  export const METADATA: MetaDataConfig;
  export const APP_BLOG: AppBlogConfig;
  export const APP_PROGRAM: AppProgramConfig;
  export const UI: UIConfig;
  export const ANALYTICS: AnalyticsConfig;
}
