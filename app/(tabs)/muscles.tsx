import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MUSCLE_GROUPS } from '../../src/utils/constants';
import { ExerciseService } from '../../src/services/exerciseService';
import { useTheme } from '../../src/hooks/useTheme';
import { Exercise } from '../../src/types';

export default function MusclesScreen() {
  const router = useRouter();
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgColor = isDark ? '#0a0e27' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1f3a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const handleMuscleSelect = async (muscleName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedMuscle(muscleName);
    setIsLoading(true);
    setError(null);

    try {
      const fetchedExercises = await ExerciseService.getExercisesByBodyPart(muscleName.toLowerCase());
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExercises(fetchedExercises);
    } catch (err) {
      setError('Failed to load exercises. Check your internet connection.');
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
          Muscle Groups
        </Text> */}
        <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 24 }}>
          Select a muscle group to find exercises
        </Text>

        {/* Muscle Group Grid */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: 12,
          marginBottom: 32,
        }}>
          {MUSCLE_GROUPS.map((muscle) => (
            <TouchableOpacity
              key={muscle.name}
              onPress={() => handleMuscleSelect(muscle.name)}
              style={{
                width: '47%',
                backgroundColor: selectedMuscle === muscle.name ? muscle.color : surfaceColor,
                padding: 20,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons
                name={muscle.icon as any}
                size={32}
                color={selectedMuscle === muscle.name ? '#ffffff' : muscle.color}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: selectedMuscle === muscle.name ? '#ffffff' : textColor,
                marginTop: 8,
                textAlign: 'center',
              }}>
                {muscle.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercises Section */}
        {selectedMuscle && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
              {MUSCLE_GROUPS.find(m => m.name === selectedMuscle)?.label} Exercises
            </Text>

            {/* Loading State */}
            {isLoading && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ fontSize: 14, color: mutedColor, marginTop: 12 }}>
                  Loading exercises...
                </Text>
              </View>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <View style={{
                backgroundColor: '#ef4444' + '20',
                padding: 20,
                borderRadius: 12,
                marginBottom: 20,
              }}>
                <Text style={{ fontSize: 14, color: '#ef4444' }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Exercise List */}
            {!isLoading && !error && exercises.length > 0 && (
              <View style={{ gap: 12 }}>
                {exercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => router.push(`/exercise/${exercise.id}` as any)}
                    style={{
                      backgroundColor: surfaceColor,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    {/* Exercise Image */}
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
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
                          <Ionicons name="barbell" size={32} color="#6366f1" />
                        </View>
                      )}
                    </View>

                    {/* Exercise Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: textColor,
                        marginBottom: 4,
                      }}>
                        {exercise.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: mutedColor, marginBottom: 4 }}>
                        {exercise.target}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: '#10b981' + '20',
                        }}>
                          <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600' }}>
                            {exercise.equipment}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color={mutedColor} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Empty State */}
            {!isLoading && !error && exercises.length === 0 && selectedMuscle && (
              <View style={{
                backgroundColor: surfaceColor,
                padding: 40,
                borderRadius: 16,
                alignItems: 'center',
              }}>
                <Ionicons name="search" size={48} color={mutedColor} />
                <Text style={{ fontSize: 16, color: textColor, marginTop: 12, fontWeight: '600' }}>
                  No exercises found
                </Text>
                <Text style={{ fontSize: 14, color: mutedColor, marginTop: 4, textAlign: 'center' }}>
                  Try selecting a different muscle group
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
