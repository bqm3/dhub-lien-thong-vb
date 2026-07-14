import { Helmet } from 'react-helmet-async';
// sections
import Login from '../sections/auth/Login';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Đăng nhập | Trục liên thông văn bản</title>
      </Helmet>

      <Login />
    </>
  );
}
