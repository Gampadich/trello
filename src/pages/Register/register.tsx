import './register.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import instance from '../../api/request';
import { AxiosError } from 'axios';

// --- ТИПИ (згідно з твоєю таблицею) ---

// Відповідь на POST /user (Реєстрація)
interface IRegisterResponse {
  result: string;
  id: number; // <--- Сервер повертає ID тут!
}

// Відповідь на POST /login (Логін)
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

  const strengthClass = getStrengthClass();

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
      // --- КРОК 1: Реєстрація (отримуємо ID відразу) ---
      // TS знає, що registerResponse має поле id завдяки <IRegisterResponse>
      const registerResponse = await instance.post<IRegisterResponse>('/user', { email, password });
      
      // Оскільки у тебе interceptor, він повертає дані напряму. 
      // Приводимо тип через 'unknown', щоб TS не сварився, якщо interceptor складний
      const regData = registerResponse as unknown as IRegisterResponse;

      if (regData.id) {
         localStorage.setItem('userId', String(regData.id));
         console.log('User ID saved:', regData.id);
      }

      // --- КРОК 2: Логін (отримуємо Токен) ---
      const loginResponse = await instance.post<ILoginResponse>('/login', { email, password });
      const loginData = loginResponse as unknown as ILoginResponse;

      // Тепер беремо токен прямо з об'єкта (як на скріншоті консолі)
      const token = loginData.token;

      if (!token) {
        console.error('Login Data:', loginData);
        throw new Error('Token not found in response');
      }

      localStorage.setItem('token', token);

      
      
      alert('Registration successful!');
      navigate('/trello');

    } catch (error) {
      console.error('Registration flow failed:', error);
      
      const err = error as AxiosError<{ error: string }>;
      
      if (err.response?.status === 400) {
        alert('Registration failed: User with this email probably exists.');
      } else {
        alert(err.message || 'Something went wrong');
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
            type="text" 
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
          <div className={`password-strength ${strengthClass}`}>
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

        <button type="submit" onClick={handleSendRegister}>Register</button>
        
        <p className="register-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};