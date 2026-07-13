import { createContext, useEffect, useReducer, useCallback } from 'react';
// utils
import axios from '../utils/axios';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

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

  const buildDemoUser = (args?: { role?: 'ADMIN' | 'MANAGER'; agencyCode?: string; email?: string; name?: string }) => {
    const role = args?.role ?? 'ADMIN';
    const email = args?.email ?? (role === 'ADMIN' ? 'admin@local' : 'manager@local');
    const name = args?.name ?? (role === 'ADMIN' ? 'System Admin' : 'Project Manager');
    const agencyCode = args?.agencyCode ?? (role === 'MANAGER' ? 'SO_NOI_VU' : undefined);

    const adminPermissions = [
      'USER_MANAGE',
      'UNIT_MANAGE',
      'ROLE_MANAGE',
      'CATEGORY_MANAGE',
      'DOC_CREATE',
      'DOC_REGISTER',
      'DOC_PUBLISH',
      'DOC_RELEASE',
      'WF_APPROVE',
      'WF_REJECT',
      'WF_ASSIGN',
      'SIGN_PERSONAL',
      'SIGN_ORG',
      'EXCHANGE_SUBMIT',
      'EXCHANGE_RECEIVE',
      'REPORT_VIEW',
      'AUDIT_VIEW',
    ];

    const managerPermissions = [
      'DOC_CREATE',
      'DOC_REGISTER',
      'DOC_PUBLISH',
      'DOC_RELEASE',
      'WF_APPROVE',
      'WF_REJECT',
      'WF_ASSIGN',
      'SIGN_PERSONAL',
      'SIGN_ORG',
      'EXCHANGE_SUBMIT',
      'EXCHANGE_RECEIVE',
      'REPORT_VIEW',
    ];

    const permissions = role === 'ADMIN' ? adminPermissions : managerPermissions;

    return {
      id: role === 'ADMIN' ? 'demo-admin' : 'demo-manager',
      role,
      agencyCode,
      // keep both shapes to satisfy existing UI components
      avatar: '/assets/images/avatars/avatar_default.jpg',
      photoURL: '/assets/images/avatars/avatar_default.jpg',
      email,
      name,
      displayName: name,
      permissions,
    };
  };

  const initialize = useCallback(async () => {
    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // const response = await axios.get('/api/account/my-account');

        // const { user } = response.data;
        // Until BE is ready: treat existing token as admin demo
        const user = buildDemoUser({ role: 'ADMIN' });

        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
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
  const login = async (email: string, password: string) => {
    // const response = await axios.post('/api/account/login', {
    // //   email,
    // //   password,
    // });
    // const { accessToken, user } = response.data;
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Fake accounts for UI + permissions testing (until BE is ready)
    // - admin@local / admin123  -> full permissions
    // - manager@local / manager123 -> no system admin perms
    if (normalizedEmail === 'admin@local' && password === 'admin123') {
      // ok
    } else if (normalizedEmail === 'manager@local' && password === 'manager123') {
      // ok
    } else {
      throw new Error('Sai tài khoản/mật khẩu demo. Dùng admin@local/admin123 hoặc manager@local/manager123');
    }

    const user =
      normalizedEmail === 'manager@local'
        ? buildDemoUser({ role: 'MANAGER', email: 'manager@local', name: 'Project Manager', agencyCode: 'SO_NOI_VU' })
        : buildDemoUser({ role: 'ADMIN', email: 'admin@local', name: 'System Admin' });

    const accessToken = 'demoAccessToken1234567890';

    setSession(accessToken);
    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user,
      },
    });
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
    setSession(null);
    localStorage.removeItem('accessToken');
    dispatch({
      type: Types.LOGOUT,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
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
