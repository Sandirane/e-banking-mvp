import { environment } from '@config/environment';
import { provideKeycloak, withAutoRefreshToken } from 'keycloak-angular';

export const provideKeycloakConfig = () =>
  provideKeycloak({
    config: environment.keycloak,
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
    },
    features: [withAutoRefreshToken()],
  });
