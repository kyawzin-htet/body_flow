import { View, Text, Modal, TouchableOpacity, TextInput, useColorScheme } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (habitData: {
    name: string;
    type: 'reps' | 'time';
    targetSets: number;
    targetReps?: number;
    targetTime?: number;
    frequency: 'daily' | 'weekly';
  }) => void;
}

export default function CreateHabitModal({ visible, onClose, onCreate }: CreateHabitModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [type, setType] = useState<'reps' | 'time'>('reps');
  const [targetSets, setTargetSets] = useState('3');
  const [targetReps, setTargetReps] = useState('10');
  const [targetTime, setTargetTime] = useState('30');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const bgInput = isDark ? '#0a0e27' : '#f8f9fa';

  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      type,
      targetSets: parseInt(targetSets) || 3,
      targetReps: type === 'reps' ? parseInt(targetReps) || 10 : undefined,
      targetTime: type === 'time' ? parseInt(targetTime) || 30 : undefined,
      frequency,
    });

    // Reset form
    setName('');
    setType('reps');
    setTargetSets('3');
    setTargetReps('10');
    setTargetTime('30');
    setFrequency('daily');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          maxHeight: '90%',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
              Create New Habit
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ gap: 20 }}>
            {/* Name */}
            <View>
              <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Habit Name *</Text>
              <TextInput
                style={{
                  backgroundColor: bgInput,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: textColor,
                  fontSize: 12,
                }}
                placeholder="e.g., Push-ups, Handstand Practice"
                placeholderTextColor={mutedColor}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Type */}
            <View>
              <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setType('reps')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: type === 'reps' ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    backgroundColor: type === 'reps' ? '#6366f1' : bgInput,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: type === 'reps' ? '#ffffff' : textColor }}>
                    Reps
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setType('time')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: type === 'time' ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    backgroundColor: type === 'time' ? '#6366f1' : bgInput,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: type === 'time' ? '#ffffff' : textColor }}>
                    Time
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sets */}
            <View>
              <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Target Sets</Text>
              <TextInput
                style={{
                  backgroundColor: bgInput,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: textColor,
                  fontSize: 12,
                }}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor={mutedColor}
                value={targetSets}
                onChangeText={setTargetSets}
              />
            </View>

            {/* Reps or Time */}
            {type === 'reps' ? (
              <View>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Reps per Set</Text>
                <TextInput
                  style={{
                    backgroundColor: bgInput,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: textColor,
                    fontSize: 12,
                  }}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={mutedColor}
                  value={targetReps}
                  onChangeText={setTargetReps}
                />
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Seconds per Set</Text>
                <TextInput
                  style={{
                    backgroundColor: bgInput,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: textColor,
                    fontSize: 12,
                  }}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={mutedColor}
                  value={targetTime}
                  onChangeText={setTargetTime}
                />
              </View>
            )}

            {/* Frequency */}
            <View>
              <Text style={{ fontSize: 10, color: mutedColor, marginBottom: 8 }}>Frequency</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setFrequency('daily')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: frequency === 'daily' ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    backgroundColor: frequency === 'daily' ? '#6366f1' : bgInput,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: frequency === 'daily' ? '#ffffff' : textColor }}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFrequency('weekly')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: frequency === 'weekly' ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    backgroundColor: frequency === 'weekly' ? '#6366f1' : bgInput,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: frequency === 'weekly' ? '#ffffff' : textColor }}>
                    Weekly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  backgroundColor: mutedColor + '20',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={!name.trim()}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: name.trim() ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                  backgroundColor: name.trim() ? '#6366f1' : mutedColor + '40',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
