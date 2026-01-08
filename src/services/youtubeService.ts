import { youtubeClient } from '../api/config';
import { YouTubeSearchResponse } from '../types';

export class YouTubeService {
  /**
   * Search for the best related video for an exercise
   * Criteria: Shortest duration (< 4 mins), most watched
   */
  static async searchRelatedVideo(exerciseName: string): Promise<string | null> {
    try {
      const response = await youtubeClient.get<YouTubeSearchResponse>('/search', {
        params: {
          q: `${exerciseName} exercise`, // Append "exercise" for better context
          part: 'snippet,id',
          maxResults: 1,
          type: 'video',
          videoDuration: 'short', // Filter for videos < 4 minutes
          order: 'viewCount', // Sort by view count to get the most popular/reliable
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id.videoId;
      }

      return null;
      return null;
    } catch (error) {
      console.error('Error fetching related YouTube video:', error);
      return null;
    }
  }
}
