declare module "@analytics/google-analytics" {
  import { googleAnalytics } from "analytics";

  function googleAnalytics(options: {
    measurementIds: string[];
  }): googleAnalytics;

  export default googleAnalytics;
}
