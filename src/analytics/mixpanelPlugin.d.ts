declare module "@analytics/mixpanel" {
  import { mixpanelPlugin } from "analytics";

  function mixpanelPlugin(options: { token: string }): mixpanelPlugin;

  export default mixpanelPlugin;
}
