interface Window {
  flutter_inappwebview?: {
    callHandler: (
      handlerName: string,
      ...args: Array<string | number | boolean | object | null>
    ) => Promise<unknown>;
  };
}
