import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // 명시적으로 환경 변수 로드
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      sentryVitePlugin({
        org: "visioneer",
        project: "prayu-web",
        authToken: env.VITE_SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
    },
    define: {
      "import.meta.env": env,
    },
  };
});
