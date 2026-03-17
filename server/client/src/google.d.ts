interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      shape?: string;
      text?: string;
      logo_alignment?: string;
      width?: number;
      locale?: string;
    }
  ) => void;
  cancel: () => void;
}

interface GoogleAccountsOauth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
  }) => GoogleTokenClient;
  revoke: (token: string, callback?: () => void) => void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
      oauth2: GoogleAccountsOauth2;
    };
  };
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
