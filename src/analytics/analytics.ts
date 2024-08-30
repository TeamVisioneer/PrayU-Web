import Analytics from "analytics";
import amplitudePlugin from "@analytics/amplitude";
import googleAnalytics from "@analytics/google-analytics";

const VITE_AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const VITE_GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

export const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    amplitudePlugin({
      apiKey: VITE_AMPLITUDE_API_KEY,
      options: {
        includeUtm: true,
        includeReferrer: true,
        trackingOptions: {
          ip_address: false,
        },
      },
    }),
    googleAnalytics({
      measurementIds: [VITE_GOOGLE_ANALYTICS_ID],
    }),
  ],
});

export function analyticsTrack(eventName: string, eventProperties: object) {
  if (
    import.meta.env.VITE_ENV == "staging" ||
    import.meta.env.VITE_ENV == "prod"
  ) {
    analytics.track(eventName, eventProperties);
  }
}
