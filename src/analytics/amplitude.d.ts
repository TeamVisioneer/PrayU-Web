declare module "@analytics/amplitude" {
  import { AnalyticsPlugin } from "analytics";

  function amplitudePlugin(options: {
    apiKey: string;
    options?: object;
  }): AnalyticsPlugin;

  export default amplitudePlugin;
}
