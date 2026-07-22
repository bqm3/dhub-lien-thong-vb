import { createContext, useEffect, useReducer, useCallback } from 'react';
// utils
import axios from '../utils/axios';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';
import { ROLE_PERMISSIONS } from './permissions';

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

  const buildDemoUser = (args?: { role?: 'ADMIN' | 'MANAGER' | 'CLERK' | 'LEADER'; agencyCode?: string; email?: string; name?: string }) => {
    const role = args?.role ?? 'ADMIN';
    const email = args?.email ?? 'admin@local';
    const name = args?.name ?? 'System Admin';
    const agencyCode = args?.agencyCode ?? (role === 'CLERK' ? 'SO_THONG_TIN' : 'SO_NOI_VU');

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
    if (normalizedEmail === 'admin@local' && password === 'admin123') {
      // ok
    } else if (normalizedEmail === 'manager@local' && password === 'manager123') {
      // ok
    } else if (normalizedEmail === 'vanthu@local' && password === 'vanthu123') {
      // ok
    } else if (normalizedEmail === 'lanhdao@local' && password === 'lanhdao123') {
      // ok
    } else {
      throw new Error('Sai tài khoản/mật khẩu demo. Dùng admin@local/admin123, vanthu@local/vanthu123 hoặc lanhdao@local/lanhdao123');
    }

    let user;
    if (normalizedEmail === 'admin@local') {
      user = buildDemoUser({ role: 'ADMIN', email: 'admin@local', name: 'Quản trị hệ thống' });
    } else if (normalizedEmail === 'vanthu@local') {
      user = buildDemoUser({ role: 'CLERK', email: 'vanthu@local', name: 'Văn thư cơ quan', agencyCode: 'SO_THONG_TIN' });
    } else if (normalizedEmail === 'lanhdao@local') {
      user = buildDemoUser({ role: 'LEADER', email: 'lanhdao@local', name: 'Lãnh đạo đơn vị' });
    } else {
      user = buildDemoUser({ role: 'LEADER', email: 'manager@local', name: 'Lãnh đạo đơn vị' });
    }

    // JWT demo: header.payload.signature — exp = year 2099 (4070908800)
    // payload: { "sub": "demo", "exp": 4070908800 }
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjo0MDcwOTA4ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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
