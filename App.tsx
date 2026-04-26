import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Platform, SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIT_DATE_KEY = 'dayzero_quit_date';

export default function App() {
  const [quitDate, setQuitDate] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Tick every minute to keep counter live
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load saved date on app start
  useEffect(() => {
    AsyncStorage.getItem(QUIT_DATE_KEY).then(val => {
      if (val) setQuitDate(new Date(val));
    });
  }, []);

  const saveDate = async (date: Date) => {
    setQuitDate(date);
    await AsyncStorage.setItem(QUIT_DATE_KEY, date.toISOString());
  };

  const handleReset = () => {
    Alert.alert(
      'Reset counter?',
      'This will clear your quit date. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            setQuitDate(null);
            await AsyncStorage.removeItem(QUIT_DATE_KEY);
          }
        }
      ]
    );
  };

  const getStats = () => {
    if (!quitDate) return null;
    const diffMs = now.getTime() - quitDate.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours   = Math.floor(diffMs / 3600000);
    const days    = Math.floor(diffMs / 86400000);
    const weeks   = Math.floor(days / 7);
    return { days, weeks, hours, minutes };
  };

  const stats = getStats();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.appTitle}>DAYZERO</Text>
        <Text style={styles.habitName}>Quit Smoking</Text>

        {/* Counter ring */}
        <View style={styles.ring}>
          <Text style={styles.dayNumber}>{stats ? stats.days : '–'}</Text>
          <Text style={styles.dayLabel}>days free</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { val: stats?.weeks, label: 'weeks' },
            { val: stats?.hours, label: 'hours' },
            { val: stats?.minutes, label: 'minutes' },
          ].map(({ val, label }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statVal}>{val ?? '–'}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Quit date row */}
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.dateCaption}>Quit date</Text>
            <Text style={styles.dateValue}>
              {quitDate ? formatDate(quitDate) : 'Not set'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowPicker(true)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Date picker */}
        {showPicker && (
          <DateTimePicker
            value={quitDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) saveDate(selected);
            }}
          />
        )}

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Reset counter</Text>
        </TouchableOpacity>

        <Text style={styles.motivation}>"Every day is a victory."</Text>
      </View>
    </SafeAreaView>
  );
}

const GREEN = '#1D9E75';
const DARK_GREEN = '#0F6E56';

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#fff' },
  container:   { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 32 },
  appTitle:    { fontSize: 13, color: '#888', letterSpacing: 2, marginBottom: 6 },
  habitName:   { fontSize: 22, fontWeight: '500', color: '#1a1a1a', marginBottom: 28 },
  ring: {
    width: 170, height: 170, borderRadius: 85,
    borderWidth: 3, borderColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  dayNumber:   { fontSize: 52, fontWeight: '500', color: DARK_GREEN },
  dayLabel:    { fontSize: 14, color: '#888', marginTop: 2 },
  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
  statCard: {
    flex: 1, backgroundColor: '#f8f8f6',
    borderRadius: 12, paddingVertical: 12,
    alignItems: 'center',
  },
  statVal:     { fontSize: 18, fontWeight: '500', color: '#1a1a1a' },
  statLabel:   { fontSize: 11, color: '#888', marginTop: 2 },
  dateRow: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8f8f6', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24,
  },
  dateCaption: { fontSize: 12, color: '#888' },
  dateValue:   { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginTop: 2 },
  editBtn: {
    borderWidth: 1, borderColor: GREEN,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  editBtnText: { fontSize: 12, color: GREEN },
  resetBtn: {
    width: '100%', paddingVertical: 14,
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 12, alignItems: 'center', marginBottom: 20,
  },
  resetText:   { fontSize: 14, color: '#E24B4A', fontWeight: '500' },
  motivation:  { fontSize: 12, color: '#aaa', fontStyle: 'italic' },
});