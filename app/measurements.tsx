import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import { CartesianChart, Line, Scatter } from 'victory-native';
import { matchFont } from "@shopify/react-native-skia";
import { useUserStore } from '../src/store/userStore';
import { useMeasurementStore } from '../src/store/measurementStore';
import { useTheme } from '../src/hooks/useTheme';

export default function MeasurementsScreen() {
  const colorScheme = useTheme();
  const isDark = colorScheme === 'dark';
  const user = useUserStore((state) => state.user);
  const { history, isLoading, loadHistory, addMeasurement } = useMeasurementStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({
    weight: '',
    bodyFat: '',
    waist: '',
    chest: '',
    arms: '',
    legs: '',
  });

  const font = matchFont({
    fontFamily: "System",
    fontSize: 10,
    fontStyle: "normal",
    fontWeight: "normal",
  });

  useEffect(() => {
    if (user) {
      loadHistory(user.id);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    await addMeasurement({
      userId: user.id,
      date: today,
      weight: newData.weight ? parseFloat(newData.weight) : undefined,
      bodyFat: newData.bodyFat ? parseFloat(newData.bodyFat) : undefined,
      waist: newData.waist ? parseFloat(newData.waist) : undefined,
      chest: newData.chest ? parseFloat(newData.chest) : undefined,
      arms: newData.arms ? parseFloat(newData.arms) : undefined,
      legs: newData.legs ? parseFloat(newData.legs) : undefined,
    });
    setShowAddModal(false);
    setNewData({ weight: '', bodyFat: '', waist: '', chest: '', arms: '', legs: '' });
  };

  const bgColor = isDark ? '#000000' : '#f8f9fa';
  const surfaceColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const chartColor = '#6366f1';

  // Prepare chart data (reverse to show oldest to newest)
  // Convert date to timestamp for the x-axis numerical scale
  const weightData = [...history].reverse()
    .filter(m => m.weight)
    .map(m => ({ x: new Date(m.date).getTime(), y: m.weight }));

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen 
        options={{
          headerTitle: 'Body Measurements',
          headerStyle: { backgroundColor: surfaceColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header Actions */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              backgroundColor: chartColor,
              padding: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              gap: 8,
            }}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
              Log New Measurement
            </Text>
          </TouchableOpacity>

          {/* Weight Chart */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
              Weight Progress
            </Text>
            <View style={{ backgroundColor: surfaceColor, borderRadius: 16, padding: 16, height: 280 }}>
              {weightData.length > 1 ? (
                <CartesianChart
                  data={weightData}
                  xKey="x"
                  yKeys={["y"]}
                  axisOptions={{
                    font,
                    tickCount: 5,
                    lineColor: mutedColor,
                    labelColor: mutedColor,
                    formatXLabel: (value) => {
                       const d = new Date(value);
                       return `${d.getMonth() + 1}/${d.getDate()}`;
                    },
                  }}
                >
                  {({ points }) => (
                    <>
                      <Line
                        points={points.y}
                        color={chartColor}
                        strokeWidth={3}
                        animate={{ type: "timing", duration: 1000 }}
                      />
                      <Scatter
                        points={points.y}
                        shape="circle"
                        radius={6}
                        color={chartColor}
                        style="fill"
                      />
                    </>
                  )}
                </CartesianChart>
              ) : (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: mutedColor }}>Not enough data for chart</Text>
                </View>
              )}
            </View>
          </View>


          {/* History List */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 12 }}>
            History
          </Text>
          
          {isLoading ? (
            <ActivityIndicator color={chartColor} size="large" />
          ) : (
            <View style={{ gap: 12 }}>
              {history.map((item) => (
                <View 
                  key={item.id}
                  style={{
                    backgroundColor: surfaceColor,
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: mutedColor }}>
                      {new Date(item.date).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {item.weight && (
                      <View>
                        <Text style={{ fontSize: 10, color: mutedColor }}>Weight</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: textColor }}>
                          {item.weight} kg
                        </Text>
                      </View>
                    )}
                    {item.bodyFat && (
                      <View>
                        <Text style={{ fontSize: 10, color: mutedColor }}>Body Fat</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: textColor }}>
                          {item.bodyFat}%
                        </Text>
                      </View>
                    )}
                    {item.waist && (
                      <View>
                        <Text style={{ fontSize: 10, color: mutedColor }}>Waist</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: textColor }}>
                          {item.waist} cm
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: surfaceColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>Log Measurement</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={32} color={mutedColor} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ color: mutedColor, marginBottom: 8 }}>Weight (kg)</Text>
                  <TextInput
                    value={newData.weight}
                    onChangeText={t => setNewData({...newData, weight: t})}
                    keyboardType="numeric"
                    placeholder="0.0"
                    placeholderTextColor={mutedColor}
                    style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 14 }}
                  />
                </View>

                <View>
                  <Text style={{ color: mutedColor, marginBottom: 8 }}>Body Fat (%)</Text>
                  <TextInput
                    value={newData.bodyFat}
                    onChangeText={t => setNewData({...newData, bodyFat: t})}
                    keyboardType="numeric"
                    placeholder="0.0%"
                    placeholderTextColor={mutedColor}
                    style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 14 }}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: mutedColor, marginBottom: 8 }}>Waist (cm)</Text>
                    <TextInput
                      value={newData.waist}
                      onChangeText={t => setNewData({...newData, waist: t})}
                      keyboardType="numeric"
                      style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 12 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: mutedColor, marginBottom: 8 }}>Chest (cm)</Text>
                    <TextInput
                      value={newData.chest}
                      onChangeText={t => setNewData({...newData, chest: t})}
                      keyboardType="numeric"
                      style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 12 }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: mutedColor, marginBottom: 8 }}>Arms (cm)</Text>
                    <TextInput
                      value={newData.arms}
                      onChangeText={t => setNewData({...newData, arms: t})}
                      keyboardType="numeric"
                      style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 12 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: mutedColor, marginBottom: 8 }}>Legs (cm)</Text>
                    <TextInput
                      value={newData.legs}
                      onChangeText={t => setNewData({...newData, legs: t})}
                      keyboardType="numeric"
                      style={{ backgroundColor: bgColor, padding: 16, borderRadius: 12, color: textColor, fontSize: 12 }}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    backgroundColor: chartColor,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    marginTop: 24,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>Save Entry</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
