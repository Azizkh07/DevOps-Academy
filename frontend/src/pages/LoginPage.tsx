import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import '../styles/LoginPage.css';

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading: authLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null); // ✅ NEW
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parse redirect URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // ✅ NEW: Check for session message
    const message = sessionStorage.getItem('loginMessage');
    if (message) {
      setSessionMessage(message);
      sessionStorage.removeItem('loginMessage');
    }
    
    // Trigger animations
    setTimeout(() => setIsVisible(true), 300);

    // Mouse tracking for parallax effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Login attempt with:', { email: credentials.email, passwordLength: credentials.password.length });
      const user = await login(credentials.email, credentials.password); // will throw if failed

      console.log('✅ Login successful, user:', user);

      // Navigate based on role
      if (user?.is_admin) {
        navigate('/admin');
        return;
      }

      // Regular user -> redirect path
      navigate(redirectPath);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : t('auth.login.error_default', 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || authError;
  const displayMessage = sessionMessage; // ✅ NEW

  return (
    <div className="login-page-container">
      <Header />

      {/* Login Section */}
      <section className="login-section" aria-labelledby="login-title">
        <div className="login-grid" />

        <div className="particles-container" aria-hidden>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`particle particle-${i % 4}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="login-bg-shapes" aria-hidden>
          <div
            className="bg-shape shape-1"
            style={{
              transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px) rotate(${mousePosition.x * 3}deg)`
            }}
          />
          <div
            className="bg-shape shape-2"
            style={{
              transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px) rotate(${mousePosition.y * -2}deg)`
            }}
          />
          <div
            className="bg-shape shape-3"
            style={{
              transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 18}px)`
            }}
          />
        </div>

        <div className="login-content">
          <div className="container">
            {/* ✅ NEW: Session message */}
            {displayMessage && (
              <div className="alert alert-warning mb-4" style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '12px 20px',
                marginBottom: '20px',
                textAlign: 'center',
                color: '#856404'
              }}>
                <strong>⚠️ {displayMessage}</strong>
              </div>
            )}
            
            {/* Centered Form Layout */}
            <div className="login-centered-layout">
              <div className={`login-form-container ${isVisible ? 'animate-in' : ''}`}>
                <div className="login-form-wrapper">
                  <div className="login-header">
                    <h1 id="login-title" className="login-title">
                      <span className="title-line">{t('auth.login.welcome_line1', 'Welcome')}</span>
                      <span className="title-highlight">{t('auth.login.welcome_line2', 'back')}</span>
                    </h1>

                    <p className="login-description">
                      {t('auth.login.subtitle', 'Sign in to access your courses and legal resources')}
                    </p>
                  </div>

                  <div className="login-form-card">
                    {displayError && (
                      <div className="error-alert" role="alert" aria-live="assertive">
                        <p>{displayError}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="login-form">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          {t('auth.login.email_label', 'Email address')}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={credentials.email}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder={t('auth.login.email_placeholder', 'your.email@example.com')}
                          disabled={loading || authLoading}
                          aria-required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="password" className="form-label">
                          {t('auth.login.password_label', 'Password')}
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={credentials.password}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder={t('auth.login.password_placeholder', '••••••••')}
                          disabled={loading || authLoading}
                          aria-required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || authLoading}
                        className={`login-btn ${loading || authLoading ? 'loading' : ''}`}
                        aria-busy={loading || authLoading}
                      >
                        <span className="btn-bg" />
                        <span className="btn-text">
                          {loading || authLoading ? (
                            <>
                              <div className="loading-spinner" aria-hidden />
                              {t('auth.login.connecting', 'Signing in...')}
                            </>
                          ) : (
                            t('auth.login.submit', 'Sign in')
                          )}
                        </span>
                        <div className="btn-shine" />
                      </button>
                    </form>

                    <div className="login-footer">
                      <div className="divider">
                        <span className="divider-text">{t('auth.login.new_here', 'New here?')}</span>
                      </div>

                      <div className="signup-text">
                        {t('auth.login.no_account', "Don't have an account?")}{' '}
                        <Link to="/contact" className="signup-link">
                          <span>{t('auth.login.contact_us', 'Contact us')}</span>
                          <span className="link-underline" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};

export default LoginPage;