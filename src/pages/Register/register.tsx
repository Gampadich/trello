import './register.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import instance from '../../api/request';
import { AxiosError } from 'axios';

interface IRegisterResponse {
  result: string;
  id: number;
}

interface ILoginResponse {
  result: string;
  token: string;
  refreshToken: string;
}

const isRegisterResponse = (data: unknown): data is IRegisterResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as Record<string, unknown>).id === 'number'
  );
};

const isLoginResponse = (data: unknown): data is ILoginResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof (data as Record<string, unknown>).token === 'string'
  );
};

export const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordScore, setPasswordScore] = useState(0);
  const [isMatchError, setIsMatchError] = useState(false);

  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);

    if (val.length === 0) {
      setPasswordScore(0);
    } else {
      const result = zxcvbn(val);
      setPasswordScore(result.score);
    }

    if (confirmPassword && val !== confirmPassword) {
      setIsMatchError(true);
    } else {
      setIsMatchError(false);
    }
  };

  const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);

    if (password !== val) {
      setIsMatchError(true);
    } else {
      setIsMatchError(false);
    }
  };

  const getStrengthClass = () => {
    if (password.length === 0) return '';
    if (passwordScore < 2) return 'weak';
    if (passwordScore < 3) return 'medium';
    return 'strong';
  };

  const handleSendRegister = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (isMatchError || password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const registerResponse = await instance.post('/user', { email, password });

      if (!isRegisterResponse(registerResponse)) {
        throw new Error('Registration failed: No ID received');
      }

      localStorage.setItem('userId', String(registerResponse.id));

      const loginResponse = await instance.post('/login', { email, password });

      if (!isLoginResponse(loginResponse)) {
        throw new Error('Login failed after registration');
      }

      localStorage.setItem('token', loginResponse.token);
      navigate('/trello');

    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError && e.response?.status === 400) {
        alert('Registration failed: User with this email probably exists.');
      } else {
        const message = e instanceof Error ? e.message : 'Something went wrong';
        alert(message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h3>Register</h3>

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
            placeholder="Create a password..."
            value={password}
            onChange={handlePasswordChange}
          />
          <div className={`password-strength ${getStrengthClass()}`}>
            <div className={`strength-bar ${passwordScore >= 1 ? 'filled' : ''}`}></div>
            <div className={`strength-bar ${passwordScore >= 2 ? 'filled' : ''}`}></div>
            <div className={`strength-bar ${passwordScore >= 3 ? 'filled' : ''}`}></div>
            <div className={`strength-bar ${passwordScore >= 4 ? 'filled' : ''}`}></div>
          </div>
        </label>

        <label>
          Repeat password
          <input
            type="password"
            placeholder="Repeat password..."
            value={confirmPassword}
            onChange={handleRepeatPasswordChange}
          />
          {isMatchError && <p className="error-message">Passwords don't match</p>}
        </label>

        <button type="submit" onClick={handleSendRegister}>
          Register
        </button>

        <p className="register-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};