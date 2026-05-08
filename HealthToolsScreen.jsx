import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { calculateBmi, calculateCalories } from '../../utils/wellnessCalculators';
import { colors, screenPadding, shadow, spacing } from '../../theme/nutriTheme';

const activities = [
  { label: 'Light', value: '1.375' },
  { label: 'Moderate', value: '1.55' },
  { label: 'Active', value: '1.725' },
];

function Field({ label, value, onChangeText }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder="Enter value"
      />
    </View>
  );
}

export default function HealthToolsScreen() {
  const [weightKg, setWeightKg] = useState('68');
  const [heightCm, setHeightCm] = useState('165');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('female');
  const [activity, setActivity] = useState('1.55');

  const bmi = useMemo(() => calculateBmi(weightKg, heightCm), [weightKg, heightCm]);

  const calories = useMemo(
    () => calculateCalories({ age, gender, weightKg, heightCm, activity }),
    [age, gender, weightKg, heightCm, activity]
  );

  const calorieChart = calories
    ? [
        { label: 'Loss', value: calories.mildLoss || 0 },
        { label: 'Keep', value: calories.maintenance || 0 },
        { label: 'Gain', value: calories.mildGain || 0 },
      ]
    : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Wellness</Text>
        <Text style={styles.title}>Health tools</Text>

        {/* BMI Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body metrics</Text>
          <View style={styles.inputRow}>
            <Field label="Weight kg" value={weightKg} onChangeText={setWeightKg} />
            <Field label="Height cm" value={heightCm} onChangeText={setHeightCm} />
          </View>
          <View style={styles.resultBand}>
            <Text style={styles.resultValue}>{bmi?.value || '--'}</Text>
            <Text style={styles.resultLabel}>BMI - {bmi?.category || 'Enter values'}</Text>
          </View>
        </View>

        {/* Calorie Calculator */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calorie calculator</Text>

          <View style={styles.inputRow}>
            <Field label="Age" value={age} onChangeText={setAge} />

            <View style={styles.field}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.segment}>
                {['female', 'male'].map((item) => (
                  <Text
                    key={item}
                    onPress={() => setGender(item)}
                    style={[styles.segmentItem, gender === item && styles.segmentActive]}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.segment}>
            {activities.map((item) => (
              <Text
                key={item.value}
                onPress={() => setActivity(item.value)}
                style={[styles.segmentItem, activity === item.value && styles.segmentActive]}
              >
                {item.label}
              </Text>
            ))}
          </View>

          {calories && (
            <>
              <Text style={styles.calorieText}>
                Maintenance estimate: {calories.maintenance} kcal/day
              </Text>
              <CalorieBars data={calorieChart} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CalorieBars({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.chartCard}>
      {data.map((item) => {
        const height = Math.max(24, (item.value / maxValue) * 150);

        return (
          <View key={item.label} style={styles.chartColumn}>
            <Text style={styles.chartValue}>{item.value}</Text>
            <View style={styles.chartTrack}>
              <View style={[styles.chartBar, { height }]} />
            </View>
            <Text style={styles.chartLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { ...screenPadding, paddingBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginBottom: spacing.md },

  card: {
    ...shadow,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: spacing.md },

  inputRow: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1, marginBottom: spacing.md },
  label: { color: colors.muted, fontWeight: '700', marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },

  resultBand: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultValue: { color: colors.primary, fontSize: 42, fontWeight: '900' },
  resultLabel: { color: colors.muted, fontWeight: '700' },

  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentItem: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 6,
    color: colors.muted,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  segmentActive: { backgroundColor: colors.surface, color: colors.primary },
  calorieText: { color: colors.ink, fontWeight: '800', marginBottom: spacing.md, fontSize: 16 },
  chartCard: {
    height: 220,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartTrack: {
    height: 150,
    width: 42,
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  chartBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  chartValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  chartLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
});