import axios from 'axios';
import { API_TIMEOUT } from '../utils/constants';

// API Keys from environment variables
export const EXERCISEDB_API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || '';
export const EXERCISEDB_API_HOST = process.env.EXPO_PUBLIC_EXERCISEDB_API_HOST || 'exercisedb.p.rapidapi.com';
export const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';

// ExerciseDB API configuration
export const exerciseDbClient = axios.create({
  baseURL: `https://${EXERCISEDB_API_HOST}`,
  timeout: API_TIMEOUT,
  headers: {
    'X-RapidAPI-Key': EXERCISEDB_API_KEY,
    'X-RapidAPI-Host': EXERCISEDB_API_HOST,
  },
});

// YouTube API configuration
export const youtubeClient = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  timeout: API_TIMEOUT,
  params: {
    key: YOUTUBE_API_KEY,
  },
});

// Generic error handler
export const handleAPIError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      return `API Error: ${error.response.status} - ${error.response.data?.message || error.message}`;
    } else if (error.request) {
      // Request made but no response
      return 'Network Error: No response from server. Check your internet connection.';
    }
  }
  return error.message || 'An unknown error occurred';
};

// Check if API keys are configured
export const areAPIKeysConfigured = (): { exerciseDB: boolean; youtube: boolean } => {
  return {
    exerciseDB: EXERCISEDB_API_KEY.length > 0 && EXERCISEDB_API_KEY !== 'your_rapidapi_key_here',
    youtube: YOUTUBE_API_KEY.length > 0 && YOUTUBE_API_KEY !== 'your_youtube_api_key_here',
  };
};
