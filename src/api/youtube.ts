import { youtubeClient, handleAPIError } from './config';
import { YouTubeSearchResponse } from '../types';

/**
 * Search for YouTube videos
 */
export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 5
): Promise<YouTubeSearchResponse> => {
  try {
    const response = await youtubeClient.get('/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        order: 'relevance',
        videoDuration: 'medium', // 4-20 minutes
        videoEmbeddable: 'true',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching YouTube:', handleAPIError(error));
    throw error;
  }
};

/**
 * Search for exercise tutorial videos
 */
export const searchExerciseTutorial = async (
  exerciseName: string
): Promise<YouTubeSearchResponse> => {
  const query = `${exerciseName} gymnastics tutorial`;
  return await searchYouTubeVideos(query, 3);
};

/**
 * Search for skill progression videos
 */
export const searchSkillProgression = async (
  skillName: string
): Promise<YouTubeSearchResponse> => {
  const query = `${skillName} progression tutorial calisthenics`;
  return await searchYouTubeVideos(query, 3);
};

/**
 * Get video details by ID
 */
export const getVideoDetails = async (videoId: string) => {
  try {
    const response = await youtubeClient.get('/videos', {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
      },
    });
    
    return response.data.items?.[0];
  } catch (error) {
    console.error('Error fetching video details:', handleAPIError(error));
    throw error;
  }
};
