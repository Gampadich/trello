import { Link } from 'react-router-dom';
import { useState } from 'react';
import './logIn.css';

export const LogIn = () => {
  const [error, setError] = useState(false);

  return (
    <div className="login-container">
      <div className="login-form">
        <h3>Log In</h3>

        <label>
          Email
          <input type="text" placeholder="Enter your email..." />
        </label>

        <label>
          Password
          <input type="password" placeholder="Enter password..." />
        </label>

        {error && <p className="error-message">User with this nickname or password not found</p>}

        <button type="submit">Log in</button>

        <p className="register-link">
          First time here? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};
