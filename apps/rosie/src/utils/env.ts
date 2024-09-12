import dotenv from 'dotenv';

let isLoaded = false;

export const isDev = () => {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
};

export const loadEnv = () => {
  if (isDev() && !isLoaded) {
    console.log('Loading environment variables from .env file');
    dotenv.config();
    isLoaded = true;
  }
};
