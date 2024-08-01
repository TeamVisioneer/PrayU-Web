import Analytics from "analytics";
import amplitudePlugin from "@analytics/amplitude";

export const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    amplitudePlugin({
      apiKey: "3045d3fe56e7bc3e11793d51ce1da755",
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
    analytics.track(eventName, eventProperties);
  }
}
