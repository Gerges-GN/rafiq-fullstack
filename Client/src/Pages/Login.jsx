import { AuthPage } from './Register';

// Keep the existing /login URL, but render the shared Login/Join experience.
export default function Login() {
  return <AuthPage initialMode="login" />;
}
