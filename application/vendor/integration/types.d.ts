declare module 'astrowind:config' {
  import type {
    SiteConfig,
    I18NConfig,
    EventConfig,
    MetaDataConfig,
    AppBlogConfig,
    AppProgramConfig,
    UIConfig,
    AnalyticsConfig,
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
