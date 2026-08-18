import { createContext, useEffect, useReducer, useCallback } from 'react';
// utils
import axios from '../utils/axios';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';
import { DemoRole, ROLE_PERMISSIONS } from './permissions';
import {
  loginKeycloakDirect,
  getKeycloakSSOUrl,
  exchangeKeycloakCode,
  parseKeycloakUser,
  refreshKeycloakToken,
  getKeycloakLogoutUrl,
  logoutKeycloakSilent,
  KeycloakRealm,
} from './keycloak';
import { usersApi } from '../services/usersApi';

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const buildDemoUser = (args?: {
    role?: DemoRole;
    agencyCode?: string;
    email?: string;
    name?: string;
    isSystemAdmin?: boolean;
  }): AuthUserType => {
    const role = args?.role ?? 'ADMIN';
    const email = args?.email ?? 'admin@local';
    const name = args?.name ?? 'System Admin';
    const agencyCode = args?.agencyCode ?? '';
    const isSystemAdmin = args?.isSystemAdmin ?? false;

    const permissions = ROLE_PERMISSIONS[role] || [];

    return {
      id: `demo-${role.toLowerCase()}`,
      role,
      agencyCode,
      avatar: '/assets/images/avatars/avatar_default.jpg',
      photoURL: '/assets/images/avatars/avatar_default.jpg',
      email,
      name,
      displayName: name,
      username: email,
      realm: 'INTERNAL',
      permissions,
      isSystemAdmin,
    };
  };

  const initialize = useCallback(async () => {
    try {
      let accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : '';
      const authRealm = (typeof window !== 'undefined' && localStorage.getItem('authRealm')) || 'INTERNAL';

      if (accessToken) {
        if (!isValidToken(accessToken) && refreshToken && authRealm !== 'LOCAL') {
          try {
            const res = await refreshKeycloakToken(refreshToken, authRealm);
            if (res?.access_token) {
              accessToken = res.access_token;
              setSession(accessToken as string);
              localStorage.setItem('accessToken', accessToken as string);
              if (res.refresh_token) {
                localStorage.setItem('refreshToken', res.refresh_token);
              }
              if (res.id_token) {
                localStorage.setItem('idToken', res.id_token);
              }
            }
          } catch (refreshErr) {
            console.warn('Auto refresh token on initialize failed:', refreshErr);
          }
        }

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          let user: any = parseKeycloakUser(accessToken, authRealm);
          if (!user) {
            user = buildDemoUser({ role: 'ADMIN' });
          }

          dispatch({
            type: Types.INITIAL,
            payload: {
              isAuthenticated: true,
              user,
            },
          });
          return;
        }
      }

      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, []);


  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = async (email: string, password: string, realm: string = 'INTERNAL') => {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Local demo credentials fallback
    if (normalizedEmail === 'admin@local' && password === 'admin123') {
      const user = buildDemoUser({ role: 'ADMIN', email: 'admin@local', name: 'Quản trị hệ thống' });
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjo0MDcwOTA4ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      setSession(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('authRealm', 'LOCAL');
      dispatch({ type: Types.LOGIN, payload: { user } });
      return;
    }

    if (normalizedEmail === 'donvi@local' && password === 'donvi123') {
      const user = buildDemoUser({
        role: 'AGENCY',
        email: 'donvi@local',
        name: 'Cán bộ đơn vị',
        agencyCode: '',
      });
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjo0MDcwOTA4ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      setSession(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('authRealm', 'LOCAL');
      dispatch({ type: Types.LOGIN, payload: { user } });
      return;
    }

    // 2. Keycloak Direct Grant login
    try {
      const res = await loginKeycloakDirect({ realm: realm as KeycloakRealm, username: email, password });
      const accessToken = res.access_token;

      if (accessToken) {
        setSession(accessToken);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authRealm', realm);
        if (res.refresh_token) {
          localStorage.setItem('refreshToken', res.refresh_token);
        }
        if (res.id_token) {
          localStorage.setItem('idToken', res.id_token);
        }

        const user = parseKeycloakUser(accessToken, realm) || buildDemoUser({ role: 'ADMIN', email, name: email });

        if (user) {
          syncUserToDatabase(user);
        }

        dispatch({
          type: Types.LOGIN,
          payload: {
            user,
          },
        });
        return;
      }
    } catch (err: any) {
      console.error('Keycloak login error:', err);
      const msg =
        err?.response?.data?.error_description ||
        err?.response?.data?.error ||
        err?.message ||
        'Đăng nhập Keycloak thất bại';
      throw new Error(msg);
    }
  };

  const syncUserToDatabase = async (user: any) => {
    try {
      if (!user || !user.username) return;
      await usersApi.createOrUpdate({
        username: user.username,
        fullName: user.name || user.displayName || user.username,
        email: user.email || '',
        unitCode: user.agencyCode || '',
        unitName: user.agencyCode || '',
        roleCode: user.role || 'USER',
        roleName: user.role === 'ADMIN' ? 'Quản trị hệ thống' : 'Cán bộ đơn vị',
        isActive: 1,
        status: 1,
      });
    } catch (err) {
      console.warn('JIT User sync to DB warning:', err);
    }
  };

  const loginWithKeycloakSSO = (realm: string = 'INTERNAL') => {
    localStorage.setItem('authRealm', realm);
    const ssoUrl = getKeycloakSSOUrl(realm as KeycloakRealm);
    window.location.href = ssoUrl;
  };

  const loginWithKeycloakCode = async (code: string, realm: string = 'INTERNAL') => {
    const res = await exchangeKeycloakCode(code, realm as KeycloakRealm);
    const accessToken = res.access_token;
    if (accessToken) {
      setSession(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('authRealm', realm);
      if (res.refresh_token) {
        localStorage.setItem('refreshToken', res.refresh_token);
      }
      if (res.id_token) {
        localStorage.setItem('idToken', res.id_token);
      }

      const user = parseKeycloakUser(accessToken, realm) || buildDemoUser({ role: 'ADMIN' });
      if (user) {
        syncUserToDatabase(user);
      }
      dispatch({
        type: Types.LOGIN,
        payload: {
          user,
        },
      });
    }
  };

  // REGISTER
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { accessToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: Types.REGISTER,
      payload: {
        user,
      },
    });
  };

  // LOGOUT
  const logout = async () => {
    const idToken = localStorage.getItem('idToken') || undefined;
    const refreshToken = localStorage.getItem('refreshToken') || undefined;
    const authRealm = localStorage.getItem('authRealm') || 'EXTERNAL';

    setSession(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('authRealm');

    dispatch({
      type: Types.LOGOUT,
    });

    if (authRealm !== 'LOCAL') {
      await logoutKeycloakSilent(authRealm, refreshToken, idToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'keycloak',
        login,
        loginWithKeycloakSSO,
        loginWithKeycloakCode,
        loginWithGoogle: () => {},
        loginWithGithub: () => {},
        loginWithTwitter: () => {},
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
