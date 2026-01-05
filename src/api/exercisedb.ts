import { exerciseDbClient, handleAPIError } from './config';
import { ExerciseDBResponse } from '../types';

/**
 * Fetch all exercises from ExerciseDB
 */
export const getAllExercises = async (): Promise<ExerciseDBResponse[]> => {
  try {
    const response = await exerciseDbClient.get('/exercises');
    return response.data;
  } catch (error) {
    console.error('Error fetching all exercises:', handleAPIError(error));
    throw error;
  }
};

/**
 * Fetch exercises by body part
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<ExerciseDBResponse[]> => {
  try {
    const response = await exerciseDbClient.get(`/exercises/bodyPart/${bodyPart}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for ${bodyPart}:`, handleAPIError(error));
    throw error;
  }
};

/**
 * Fetch exercises by target muscle
 */
export const getExercisesByTarget = async (target: string): Promise<ExerciseDBResponse[]> => {
  try {
    const response = await exerciseDbClient.get(`/exercises/target/${target}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for target ${target}:`, handleAPIError(error));
    throw error;
  }
};

/**
 * Fetch exercises by equipment
 */
export const getExercisesByEquipment = async (equipment: string): Promise<ExerciseDBResponse[]> => {
  try {
    const response = await exerciseDbClient.get(`/exercises/equipment/${equipment}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercises for equipment ${equipment}:`, handleAPIError(error));
    throw error;
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (id: string): Promise<ExerciseDBResponse> => {
  try {
    const response = await exerciseDbClient.get(`/exercises/exercise/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exercise ${id}:`, handleAPIError(error));
    throw error;
  }
};

/**
 * Get list of all body parts
 */
export const getBodyPartList = async (): Promise<string[]> => {
  try {
    const response = await exerciseDbClient.get('/exercises/bodyPartList');
    return response.data;
  } catch (error) {
    console.error('Error fetching body part list:', handleAPIError(error));
    throw error;
  }
};

/**
 * Get list of all target muscles
 */
export const getTargetList = async (): Promise<string[]> => {
  try {
    const response = await exerciseDbClient.get('/exercises/targetList');
    return response.data;
  } catch (error) {
    console.error('Error fetching target list:', handleAPIError(error));
    throw error;
  }
};

/**
 * Get list of all equipment types
 */
export const getEquipmentList = async (): Promise<string[]> => {
  try {
    const response = await exerciseDbClient.get('/exercises/equipmentList');
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment list:', handleAPIError(error));
    throw error;
  }
};

/**
 * Filter exercises for bodyweight/gymnastics focus
 */
export const getBodyweightExercises = async (): Promise<ExerciseDBResponse[]> => {
  try {
    const bodyweight = await getExercisesByEquipment('body weight');
    return bodyweight;
  } catch (error) {
    console.error('Error fetching bodyweight exercises:', handleAPIError(error));
    return [];
  }
};

/**
 * Search exercises (client-side filter for now)
 */
export const searchExercises = async (query: string): Promise<ExerciseDBResponse[]> => {
  try {
    const allExercises = await getAllExercises();
    const lowercaseQuery = query.toLowerCase();
    
    return allExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(lowercaseQuery) ||
      exercise.target.toLowerCase().includes(lowercaseQuery) ||
      exercise.bodyPart.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching exercises:', handleAPIError(error));
    return [];
  }
};
