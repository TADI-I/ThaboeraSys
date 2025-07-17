import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const styles = {
  body: {
    margin: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(to right, #b71c1c, #e53935)",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    background: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  heading: {
    marginBottom: "25px",
    fontSize: "28px",
    color: "#b71c1c",
  },
  formGroup: {
    marginBottom: "20px",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    boxSizing: "border-box",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  inputFocus: {
    borderColor: "#d32f2f",
    boxShadow: "0 0 0 2px rgba(211, 47, 47, 0.2)",
    outline: "none",
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: "#d32f2f",
    color: "#fff",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  btnPrimaryHover: {
    backgroundColor: "#b71c1c",
  },
  paragraph: {
    marginTop: "15px",
  },
  link: {
    color: "#d32f2f",
    textDecoration: "none",
  },
  linkHover: {
    textDecoration: "underline",
  },
  alert: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "14px",
  },
  alertSuccess: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  alertError: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocus, setInputFocus] = useState({ email: false, password: false });
  const [btnHover, setBtnHover] = useState(false);
  const [linkHover, setLinkHover] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/dashboard');
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during login' });
      console.error('Login error:', error);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.authContainer}>
        <h1 style={styles.heading}>Login</h1>

        {message && (
          <div
            style={{
              ...styles.alert,
              ...(message.type === 'error' ? styles.alertError : styles.alertSuccess),
            }}
          >
            {message.text}
          </div>
        )}

        <form id="loginForm" onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setInputFocus({ ...inputFocus, email: true })}
              onBlur={() => setInputFocus({ ...inputFocus, email: false })}
              style={{
                ...styles.input,
                ...(inputFocus.email ? styles.inputFocus : {}),
              }}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setInputFocus({ ...inputFocus, password: true })}
              onBlur={() => setInputFocus({ ...inputFocus, password: false })}
              style={{
                ...styles.input,
                ...(inputFocus.password ? styles.inputFocus : {}),
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.btnPrimary,
              ...(btnHover ? styles.btnPrimaryHover : {}),
            }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            Login
          </button>
        </form>

        <p style={styles.paragraph}>
          <Link
            to="/forgot-password"
            style={{
              ...styles.link,
              ...(linkHover ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setLinkHover(true)}
            onMouseLeave={() => setLinkHover(false)}
          >
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
