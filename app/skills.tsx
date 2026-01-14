import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/hooks/useTheme';
import { GYMNASTICS_SKILLS } from '../src/utils/constants';

export default function SkillsScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return '#10b981';
    if (difficulty <= 5) return '#f59e0b';
    if (difficulty <= 7) return '#f97316';
    return '#ef4444';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Beginner';
    if (difficulty <= 5) return 'Intermediate';
    if (difficulty <= 7) return 'Advanced';
    return 'Expert';
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        
        <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 24 }}>
          Master advanced gymnastics movements step by step
        </Text>

        {/* Skill Category Cards */}
        {Object.entries(GYMNASTICS_SKILLS).map(([key, skillCategory]) => (
          <View
            key={key}
            style={{
              backgroundColor: surfaceColor,
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Category Header */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                  {skillCategory.name}
                </Text>
                <View style={{
                  backgroundColor: '#6366f1' + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '600' }}>
                    {skillCategory.progressions.length} levels
                  </Text>
                </View>
              </View>
            </View>

            {/* Progression Tree */}
            <View style={{ gap: 12 }}>
              {skillCategory.progressions.map((progression, index) => {
                const isLocked = index > 0; // In MVP, only first is unlocked
                const difficultyColor = getDifficultyColor(progression.difficulty);

                return (
                  <View key={progression.id}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        backgroundColor: isDark ? '#000000' : '#f8f9fa',
                        borderRadius: 12,
                        opacity: isLocked ? 0.6 : 1,
                      }}
                    >
                      {/* Level Indicator */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: isLocked ? mutedColor + '40' : difficultyColor + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        {isLocked ? (
                          <Ionicons name="lock-closed" size={20} color={mutedColor} />
                        ) : (
                          <Text style={{ 
                            fontSize: 12, 
                            fontWeight: 'bold', 
                            color: difficultyColor 
                          }}>
                            {index + 1}
                          </Text>
                        )}
                      </View>

                      {/* Skill Info */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '600', 
                          color: textColor 
                        }}>
                          {progression.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: mutedColor, marginTop: 2 }}>
                          {getDifficultyLabel(progression.difficulty)}
                        </Text>
                      </View>

                      {/* Difficulty Badge */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {[...Array(Math.min(progression.difficulty, 5))].map((_, i) => (
                          <View
                            key={i}
                            style={{
                              width: 4,
                              height: 16,
                              borderRadius: 2,
                              backgroundColor: difficultyColor,
                            }}
                          />
                        ))}
                      </View>
                    </TouchableOpacity>

                    {/* Connection Line */}
                    {index < skillCategory.progressions.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          height: 12,
                          backgroundColor: mutedColor + '40',
                          marginLeft: 19,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Progress Bar */}
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: mutedColor + '20' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 10, color: mutedColor }}>Your Progress</Text>
                <Text style={{ fontSize: 10, fontWeight: '600', color: textColor }}>
                  1/{skillCategory.progressions.length}
                </Text>
              </View>
              <View style={{
                height: 8,
                backgroundColor: isDark ? '#000000' : '#e5e7eb',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <View
                  style={{
                    width: `${(1 / skillCategory.progressions.length) * 100}%`,
                    height: '100%',
                    backgroundColor: '#6366f1',
                  }}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Tips Section */}
        <View style={{
          backgroundColor: '#6366f1' + '20',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="bulb" size={24} color="#6366f1" />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor, marginLeft: 8 }}>
              Training Tips
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: textColor, lineHeight: 20 }}>
            • Master each level before progressing{'\n'}
            • Practice consistently 3-4 times per week{'\n'}
            • Focus on form over repetitions{'\n'}
            • Record your attempts to track progress{'\n'}
            • Rest adequately between sessions
          </Text>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
