import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../src/store/userStore';
import { SeedService } from '../src/services/seedService';
import { useTheme } from '../src/hooks/useTheme';
import { Goal, MuscleGroup, SkillLevel } from '../src/types';
import { GOALS, MUSCLE_GROUPS, SKILL_LEVELS, TRAINING_FREQUENCIES } from '../src/utils/constants';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const createUser = useUserStore((state) => state.createUser);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [frequency, setFrequency] = useState(3);

  const bgColor = isDark ? '#0a0e27' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1f3a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const handleComplete = async () => {
    await createUser({
      name: name || 'Athlete',
      skillLevel,
      goals: selectedGoals,
      targetMuscles: selectedMuscles,
      weeklyFrequency: frequency,
    });
    
    // Get the created user from store and seed sample habits
    const currentUser = useUserStore.getState().user;
    if (currentUser) {
      await SeedService.seedSampleHabits(currentUser.id);
    }
    
    router.replace('/(tabs)');
  };

  const steps = [
    {
      title: '👋 Welcome to BodyFlow',
      description: 'Your personal gymnastics and calisthenics training companion',
    },
    {
      title: '🎯 Set Your Goals',
      description: 'What do you want to achieve?',
    },
    {
      title: '💪 Target Muscles',
      description: 'Which muscle groups do you want to focus on?',
    },
    {
      title: '📊 Skill Level',
      description: 'Where are you starting from?',
    },
    {
      title: '📅 Training Frequency',
      description: 'How many days per week will you train?',
    },
  ];

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 || 
    (step === 1 && selectedGoals.length > 0) ||
    (step === 2 && selectedMuscles.length > 0) ||
    step >= 3;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20, paddingTop: 60 }}>
          {/* Progress Indicator */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 40 }}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: index <= step ? '#6366f1' : mutedColor + '40',
                }}
              />
            ))}
          </View>

          {/* Step Content */}
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
            {currentStep.title}
          </Text>
          <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 32 }}>
            {currentStep.description}
          </Text>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#6366f1',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <Ionicons name="fitness" size={60} color="#ffffff" />
              </View>
              <Text style={{ fontSize: 18, color: textColor, textAlign: 'center', lineHeight: 28 }}>
                BodyFlow helps you master gymnastics skills, build strength, and track your progress—all offline.
              </Text>
            </View>
          )}

          {/* Step 1: Goals */}
          {step === 1 && (
            <View style={{ gap: 12 }}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  onPress={() => toggleGoal(goal.value)}
                  style={{
                    backgroundColor: selectedGoals.includes(goal.value) ? '#6366f1' : surfaceColor,
                    padding: 20,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={28}
                    color={selectedGoals.includes(goal.value) ? '#ffffff' : '#6366f1'}
                  />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: selectedGoals.includes(goal.value) ? '#ffffff' : textColor,
                  }}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Muscles */}
          {step === 2 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle.name}
                  onPress={() => toggleMuscle(muscle.name)}
                  style={{
                    width: '47%',
                    backgroundColor: selectedMuscles.includes(muscle.name) ? muscle.color : surfaceColor,
                    padding: 20,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={muscle.icon as any}
                    size={32}
                    color={selectedMuscles.includes(muscle.name) ? '#ffffff' : muscle.color}
                  />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: selectedMuscles.includes(muscle.name) ? '#ffffff' : textColor,
                    marginTop: 8,
                  }}>
                    {muscle.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 3: Skill Level */}
          {step === 3 && (
            <View style={{ gap: 12 }}>
              {SKILL_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => setSkillLevel(level.value)}
                  style={{
                    backgroundColor: skillLevel === level.value ? '#6366f1' : surfaceColor,
                    padding: 20,
                    borderRadius: 16,
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: skillLevel === level.value ? '#ffffff' : textColor,
                    marginBottom: 4,
                  }}>
                    {level.label}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: skillLevel === level.value ? '#ffffff' + 'CC' : mutedColor,
                  }}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 4: Frequency */}
          {step === 4 && (
            <View style={{ gap: 12 }}>
              {TRAINING_FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  onPress={() => setFrequency(freq.value)}
                  style={{
                    backgroundColor: frequency === freq.value ? '#6366f1' : surfaceColor,
                    padding: 20,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: frequency === freq.value ? '#ffffff' : textColor,
                  }}>
                    {freq.label}
                  </Text>
                  {frequency === freq.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={{
        padding: 20,
        paddingBottom: 40,
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#2d3250' : '#e5e7eb',
      }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: surfaceColor,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => isLastStep ? handleComplete() : setStep(step + 1)}
            disabled={!canProceed}
            style={{
              flex: step === 0 ? 1 : 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: canProceed ? '#6366f1' : mutedColor + '40',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
              {isLastStep ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
