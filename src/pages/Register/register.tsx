import './register.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Register = () => {
  const [isPasswordsSameRender, setIsPasswordsSameRender] = useState(false);

  let password = '';
  const renderHardPassword = (password: string) => {
    return <div>...</div>;
  };
  const isPasswordsSame = (secondPassword: string) => {
    if (password !== secondPassword) {
      setIsPasswordsSameRender(true);
    }
  };
  return (
    <div className="login-container">
      {' '}
      <div className="login-form">
        {' '}
        <h3>Register</h3>
        <label>
          Email
          <input type="text" placeholder="Enter your email..." />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Create a password..."
            onChange={(e) => {
              renderHardPassword(e.target.value);
            }}
          />
          
          <div className="password-strength">
            <div className="strength-bar"></div>
            <div className="strength-bar"></div>
            <div className="strength-bar"></div>
            <div className="strength-bar"></div>
          </div>
        </label>
        <label>
          Repeat password
          <input type="password" placeholder="Repeat password..." onChange={(e) => isPasswordsSame(e.target.value)} />
          
          {isPasswordsSameRender && <p className="error-message">Passwords aren't same</p>}
        </label>
        <button type="submit">Register</button>
        <p className="register-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};
