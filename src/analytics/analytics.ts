import Analytics from "analytics";
import amplitudePlugin from "@analytics/amplitude";

const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

export const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    amplitudePlugin({
      apiKey: apiKey,
      options: {
        trackingOptions: {
          ip_address: false,
        },
      },
    }),
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
