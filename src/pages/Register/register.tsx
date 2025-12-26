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
      console.log('--- 1. Починаємо реєстрацію ---');
      const response = await instance.post<IRegisterResponse>('/user', { email, password });
      
      // Логуємо "сиру" відповідь, щоб побачити, що там
      console.log('--- 2. Сира відповідь від сервера:', response);

      // Безпечна спроба дістати дані
      // @ts-ignore
      const regData = response.data || response;
      console.log('--- 3. Дані, які ми витягли:', regData);

      // Безпечна перевірка ID (використовуємо знак питання, щоб не падало)
      if (!regData?.id) {
         console.error('!!! УВАГА: Сервер не повернув ID. Структура відповіді:', regData);
         alert('Помилка: сервер не повернув ID. Зроби скріншот консолі (F12).');
         return;
      }

      console.log('--- 4. ID знайдено:', regData.id);
      localStorage.setItem('userId', String(regData.id));

      // --- Логін ---
      console.log('--- 5. Пробуємо залогінитись ---');
      const loginResponse = await instance.post<ILoginResponse>('/login', { email, password });
      
      // @ts-ignore
      const loginData = loginResponse.data || loginResponse;
      
      if (!loginData?.token) {
        throw new Error('Token not found in login response');
      }

      localStorage.setItem('token', loginData.token);
      console.log('--- 6. Успіх! Переходимо на дошку ---');
      navigate('/trello');

    } catch (error) {
      console.error('Помилка в процесі:', error);
      const err = error as AxiosError<{ error: string }>;

      if (err.response?.status === 400) {
        alert('Registration failed: User with this email probably exists.');
      } else {
        alert((error as Error).message || 'Something went wrong');
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