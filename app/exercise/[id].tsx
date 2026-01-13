import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseService } from '../../src/services/exerciseService';
import { Exercise } from '../../src/types';
import { useUserStore } from '../../src/store/userStore';
import { useHabitStore } from '../../src/store/habitStore';
import YoutubePlayer from "react-native-youtube-iframe";
import { YouTubeService } from '../../src/services/youtubeService';
import { useTheme } from '../../src/hooks/useTheme';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const createHabit = useHabitStore((state) => state.createHabit);
  const loadHabits = useHabitStore((state) => state.loadHabits);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  useEffect(() => {
    loadExercise();
  }, [id]);

  useEffect(() => {
    if (exercise) {
      loadRelatedVideo();
    }
  }, [exercise]);

  const loadRelatedVideo = async () => {
    if (!exercise) return;
    const id = await YouTubeService.searchRelatedVideo(exercise.name);
    setVideoId(id);
  };

  const loadExercise = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const exerciseData = await ExerciseService.getExerciseById(id);
      if (exerciseData) {
        setExercise(exerciseData);
      } else {
        setError('Exercise not found');
      }
    } catch (err) {
      setError('Failed to load exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!exercise || !user) return;

    await createHabit({
      userId: user.id,
      exerciseId: exercise.id,
      name: exercise.name,
      type: 'reps',
      targetSets: 3,
      targetReps: 10,
      frequency: 'daily',
      active: true,
    });

    await loadHabits(user.id);
    
    router.back();
    // Navigate to habits tab after a short delay
    setTimeout(() => {
      router.push('/(tabs)/habits');
    }, 100);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ fontSize: 10, color: mutedColor, marginTop: 12 }}>
          Loading exercise...
        </Text>
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={64} color={mutedColor} />
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginTop: 16 }}>
          {error || 'Exercise not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: '#6366f1',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 12 }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Exercise GIF */}
        <View style={{
          backgroundColor: surfaceColor,
          alignItems: 'center',
        }}>
          <View style={{
            width: '100%',
            aspectRatio: 1,
            maxWidth: 400,
            backgroundColor: '#6366f1' + '20',
            overflow: 'hidden',
          }}>
            {exercise.gifUrl ? (
              <Image
                source={{ uri: exercise.gifUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="barbell" size={80} color="#6366f1" />
              </View>
            )}
          </View>
        </View>

        <View style={{ padding: 20, paddingTop: 24 }}>
          {/* Exercise Name */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
            {exercise.name}
          </Text>

          {/* Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#6366f1' + '20',
            }}>
              <Text style={{ fontSize: 10, color: '#6366f1', fontWeight: '600' }}>
                {exercise.bodyPart}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#f97316' + '20',
            }}>
              <Text style={{ fontSize: 10, color: '#f97316', fontWeight: '600' }}>
                {exercise.target}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#10b981' + '20',
            }}>
              <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '600' }}>
                {exercise.equipment}
              </Text>
            </View>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#8b5cf6' + '20',
            }}>
              <Text style={{ fontSize: 10, color: '#8b5cf6', fontWeight: '600' }}>
                {exercise.difficulty}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                Instructions
              </Text>
              <View style={{
                backgroundColor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
                padding: 16,
                borderRadius: 16,
                gap: 12,
              }}>
                {exercise.instructions.map((instruction, index) => (
                  <View key={index} style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#6366f1',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 10, color: textColor, lineHeight: 20 }}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                Secondary Muscles
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <View
                    key={index}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <Text style={{ fontSize: 10, color: textColor }}>
                      {muscle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Exercise Info */}
          <View style={{
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
            padding: 16,
            borderRadius: 16,
            marginBottom: 24,
          }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Category</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: textColor, textTransform: 'capitalize' }}>
                  {exercise.category}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Difficulty</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: textColor, textTransform: 'capitalize' }}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>
          </View>

          {/* Related Video */}
          {videoId && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
                Related Video
              </Text>
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: surfaceColor, opacity: 0.99 }}>
                <YoutubePlayer
                  height={220}
                  play={false}
                  videoId={videoId}
                  webViewProps={{
                    androidLayerType: 'hardware',
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Habit Button */}
      <View style={{
        padding: 20,
        paddingBottom: 30,
        backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
      }}>
        <TouchableOpacity
          onPress={handleCreateHabit}
          style={{
            backgroundColor: '#6366f1',
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
            Create Habit from This Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
