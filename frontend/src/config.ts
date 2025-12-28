// config.ts - Fixed Configuration

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5002',
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    VIDEOS: '/videos',
    AUTH: '/auth', 
    COURSES: '/courses',
    SUBJECTS: '/subjects',
    USERS: '/users',
    BLOG: '/blog',
    HEALTH: '/health'
  }
};

// Authentication configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  SESSION_TIMEOUT: 86400000, // 24 hours in milliseconds
};

// Use local placeholder images instead of via.placeholder.com
export const PLACEHOLDERS = {
  AVATAR: '/assets/placeholder-avatar.png',
  COURSE: '/assets/placeholder-course.png', 
  BLOG: '/assets/placeholder-blog.png',
  LOGO: '/assets/logo.png',
  ICON: '/assets/icon.png',
};

// Feature flags
export const FEATURES = {
  COURSE_ENROLLMENT: true,
  VIDEO_PROGRESS_TRACKING: true,
  BLOG_COMMENTS: false,
  USER_REGISTRATION: false,
};

// App metadata
export const APP_INFO = {
  NAME: 'Legal Education Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Platform for legal education and resources',
  CONTACT_EMAIL: 'info@legaleducation.com',
};

// Environment-specific configurations
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_DEBUG: process.env.REACT_APP_DEBUG_API === 'true',
  AUTH_DEBUG: process.env.REACT_APP_DEBUG_AUTH === 'true',
};