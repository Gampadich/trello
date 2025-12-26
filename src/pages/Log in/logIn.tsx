import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './logIn.css';
import instance from '../../api/request';
import { AxiosError } from 'axios';

interface ILoginResponse {
  result: string;
  token: string;
  refreshToken: string;
}

const isLoginResponse = (data: unknown): data is ILoginResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof (data as Record<string, unknown>).token === 'string'
  );
};

export const LogIn = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const nav = useNavigate();

  const SendLoginRequest = async () => {
    setError(false);

    if (!email || !password) {
      setError(true);
      return;
    }

    try {
      const response = await instance.post('/login', { email, password });

      if (isLoginResponse(response)) {
        localStorage.setItem('token', response.token);
        nav('/trello');
      } else {
        throw new Error('Invalid server response');
      }

    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError && e.response?.status === 400) {
        alert('Login failed: Incorrect email or password.');
      } else {
        const message = e instanceof Error ? e.message : 'Something went wrong';
        alert(message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h3>Log In</h3>

        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error-message">Check your email or password</p>}

        <button type="submit" onClick={SendLoginRequest}>
          Log in
        </button>

        <p className="register-link">
          First time here? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};