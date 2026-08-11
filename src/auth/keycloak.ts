import axios from 'axios';
import { ROLE_PERMISSIONS, DemoRole } from './permissions';

export const KEYCLOAK_CONFIG = {
  url: (import.meta.env.VITE_KEYCLOAK_URL || 'https://dev-id.cdsdservice.com/').replace(/\/$/, ''),
  realmInternal: import.meta.env.VITE_KEYCLOAK_REALM_INTERNAL || 'INTERNAL',
  realmExternal: import.meta.env.VITE_KEYCLOAK_REALM_EXTERNAL || 'EXTERNAL',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'doc-exchange-web',
};

export type KeycloakRealm = 'INTERNAL' | 'EXTERNAL';

export async function loginKeycloakDirect({
  realm = 'INTERNAL',
  username,
  password,
}: {
  realm?: KeycloakRealm | string;
  username: string;
  password: string;
}) {
  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append('client_id', KEYCLOAK_CONFIG.clientId);
  params.append('grant_type', 'password');
  params.append('username', username.trim());
  params.append('password', password);

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data; // { access_token, refresh_token, id_token, expires_in, ... }
}

export function getKeycloakSSOUrl(realm: KeycloakRealm | string = 'INTERNAL') {
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/keycloak/callback?realm=${realm}`);
  return `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CONFIG.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=login`;
}

export async function exchangeKeycloakCode(code: string, realm: KeycloakRealm | string = 'INTERNAL') {
  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/token`;
  const redirectUri = `${window.location.origin}/auth/keycloak/callback?realm=${realm}`;

  const params = new URLSearchParams();
  params.append('client_id', KEYCLOAK_CONFIG.clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

export async function refreshKeycloakToken(refreshToken: string, realm: KeycloakRealm | string = 'INTERNAL') {
  const tokenUrl = `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append('client_id', KEYCLOAK_CONFIG.clientId);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

export async function logoutKeycloakSilent(realm: KeycloakRealm | string = 'EXTERNAL', refreshToken?: string, idToken?: string) {
  try {
    const logoutUrl = `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/logout`;
    const params = new URLSearchParams();
    params.append('client_id', KEYCLOAK_CONFIG.clientId);
    if (refreshToken) {
      params.append('refresh_token', refreshToken);
    }
    if (idToken) {
      params.append('id_token_hint', idToken);
    }
    await axios.post(logoutUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (err) {
    console.warn('Silent Keycloak logout warning:', err);
  }
}

export function getKeycloakLogoutUrl(realm: KeycloakRealm | string = 'EXTERNAL', idToken?: string) {
  const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
  let logoutUrl = `${KEYCLOAK_CONFIG.url}/realms/${realm}/protocol/openid-connect/logout?client_id=${KEYCLOAK_CONFIG.clientId}&post_logout_redirect_uri=${redirectUri}`;
  if (idToken) {
    logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
  }
  return logoutUrl;
}

export function parseKeycloakUser(accessToken: string, realmName?: string) {
  try {
    const base64Url = accessToken.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    const roles: string[] = decoded?.realm_access?.roles || [];
    const isAdmin =
      roles.some((r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'SUPERADMIN') ||
      decoded.preferred_username === 'admin';
    const isSystemAdmin = roles.some((r) => r == "systemAdmin")
    const role: DemoRole = isAdmin ? 'ADMIN' : 'AGENCY';
    const email = decoded.email || `${decoded.preferred_username || 'user'}@cdsdservice.com`;
    const name = decoded.name || decoded.preferred_username || 'Keycloak User';
    const agencyCode = decoded.agencyCode || decoded.agency_code || '';

    return {
      id: decoded.sub || `kc-${Date.now()}`,
      role,
      agencyCode,
      avatar: '/assets/images/avatars/avatar_default.jpg',
      photoURL: '/assets/images/avatars/avatar_default.jpg',
      email,
      name,
      displayName: name,
      username: decoded.preferred_username || email,
      realm: realmName || (decoded.iss?.includes('EXTERNAL') ? 'EXTERNAL' : 'INTERNAL'),
      permissions: ROLE_PERMISSIONS[role] || [],
      isSystemAdmin
    };
  } catch (error) {
    console.error('Error parsing Keycloak token:', error);
    return null;
  }
}
