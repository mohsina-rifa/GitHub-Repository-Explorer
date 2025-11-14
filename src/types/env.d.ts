/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string;
  readonly VITE_GITHUB_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_CONTENT_SECURITY_POLICY: string;
  readonly VITE_X_FRAME_OPTIONS: string;
  readonly VITE_X_CONTENT_TYPE_OPTIONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}