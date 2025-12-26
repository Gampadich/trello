import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './logIn.css';
import instance from '../../api/request';
import { AxiosError, AxiosResponse } from 'axios';

interface ILoginResponse {
  result: string;
  token: string;
  refreshToken: string;
}

export const LogIn = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const nav = useNavigate();

  // --- МАГІЯ ТУТ: Чиста функція для вилучення даних ---
  // Вона приймає "що завгодно" (unknown) і безпечно шукає токен
  const extractToken = (response: unknown): string => {
    // 1. Якщо це стандартна відповідь Axios (об'єкт має поле data)
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as AxiosResponse).data;
      if (data && typeof data === 'object' && 'token' in data) {
        return (data as ILoginResponse).token;
      }
    }

    // 2. Якщо інтерцептор вже розпакував дані (об'єкт сам є даними)
    if (response && typeof response === 'object' && 'token' in response) {
      return (response as ILoginResponse).token;
    }

    throw new Error('Invalid server response structure');
  };
  // ----------------------------------------------------

  const SendLoginRequest = async () => {
    setError(false);

    if (!email || !password) {
      setError(true);
      return;
    }

    try {
      // Тут ми кажемо unknown, бо ми не довіряємо типам інстансу на 100% поки що
      const rawResponse = await instance.post<unknown>('/login', { email, password });

      // Наша функція чисто дістає токен без жодного "any" в основному коді
      const token = extractToken(rawResponse);

      localStorage.setItem('token', token);
      nav('/trello');
    } catch (e) {
      console.error(e);
      const err = e as AxiosError<{ error: string }>;

      if (err.response?.status === 400) {
        alert('Login failed: Incorrect email or password.');
      } else {
        alert(err.message || 'Something went wrong');
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
