import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50' 
        : 'bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section - FIXED */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-3">
                {/* DevOps Academy Logo */}
                <img 
  src="/assets/devposlogo.png" 
  alt="DevOps Academy"
  className="w-full h-full object-contain"
/>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>
            
            {/* Brand Text */}
            <div className="hidden md:block">
              <div className={`text-2xl font-bold transition-all duration-500 ${
                scrolled 
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent' 
                  : 'text-white group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-green-300 group-hover:bg-clip-text group-hover:text-transparent'
              }`}>
                DevOps Academy
              </div>
              <div className={`text-sm font-medium italic transition-colors ${
                scrolled ? 'text-gray-500' : 'text-cyan-200'
              }`}>
                Master Modern DevOps Practices
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { path: '/', label: 'Accueil', icon: '🏠' },
              { path: '/courses', label: 'Cours', icon: '📚' },
              { path: '/blog', label: 'Blog', icon: '📰' },
              { path: '/contact', label: 'Contact', icon: '📞' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : scrolled
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-white hover:text-yellow-300 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 ${
                      scrolled
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-white hover:text-yellow-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="hidden sm:inline arabic-text">{user.name}</span>
                    <span className="text-sm">▼</span>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-lg z-50 animate-slideInRight">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 arabic-text">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {[
                          { path: '/dashboard', label: 'Tableau de Bord', icon: '📊' },
                          { path: '/profile', label: 'Mon Profil', icon: '👤' },
                          { path: '/settings', label: 'Paramètres', icon: '⚙️' }
                        ].map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        
                        <hr className="my-2 border-gray-200" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <span className="text-lg">🚪</span>
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    scrolled
                      ? 'text-gray-700 hover:text-blue-600 border border-gray-300 hover:border-blue-400'
                      : 'text-white border border-white/30 hover:bg-white/10'
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="w-6 h-6 flex flex-col justify-around">
                <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
            <div className="px-4 py-6 space-y-4">
              {[
                { path: '/', label: 'Accueil', icon: '🏠' },
                { path: '/courses', label: 'Cours', icon: '📚' },
                { path: '/blog', label: 'Blog', icon: '📰' },
                { path: '/contact', label: 'Contact', icon: '📞' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;