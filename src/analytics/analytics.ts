import Analytics from "analytics";
import amplitudePlugin from "@analytics/amplitude";
import googleAnalytics from "@analytics/google-analytics";
import mixpanelPlugin from "@analytics/mixpanel";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    amplitudePlugin({
      apiKey: AMPLITUDE_API_KEY,
      options: {
        includeUtm: true,
        includeReferrer: true,
        trackingOptions: { ip_address: false },
      },
    }),
    googleAnalytics({ measurementIds: [GOOGLE_ANALYTICS_ID] }),
    mixpanelPlugin({ token: MIXPANEL_TOKEN }),
  ],
});

export function analyticsTrack(eventName: string, eventProperties: object) {
  if (
    import.meta.env.VITE_ENV == "staging" ||
    import.meta.env.VITE_ENV == "prod"
  ) {
    analytics.track(eventName, {
      ...eventProperties,
      WEB_VERSION: WEB_VERSION,
    });
  }
}
