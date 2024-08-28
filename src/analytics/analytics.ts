import Analytics from "analytics";
import amplitudePlugin from "@analytics/amplitude";
import googleAnalytics from "@analytics/google-analytics";

const apiKeyAmplitude = import.meta.env.VITE_AMPLITUDE_API_KEY;
const IdGA = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

export const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    amplitudePlugin({
      apiKey: apiKeyAmplitude,
      options: {
        trackingOptions: {
          ip_address: false,
        },
      },
    }),
    googleAnalytics({
      measurementIds: [IdGA],
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
