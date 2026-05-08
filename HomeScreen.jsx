import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getDashboard } from '../../api/dashboardApi';
import { colors, screenPadding, shadow, spacing } from '../../theme/nutriTheme';

export default function HomeScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !dashboard) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header - Matching Screenshot */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Good morning, {dashboard.name || 'Jeram'}</Text>
          <Text style={styles.date}>Monday, April 21, 2026</Text>
        </View>

        {/* App Logo - Top Right like in screenshot */}
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../../assets/nutrihelp-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          {/* <Text style={styles.appName}>NutriHelp</Text> */}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{dashboard.calories?.current || 1320}</Text>
          <Text style={styles.statGoal}>/{dashboard.calories?.goal || 2000} kcal</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={styles.statValue}>{dashboard.water?.current || 4}</Text>
          <Text style={styles.statGoal}>/{dashboard.water?.goal || 8} cups</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🍽️</Text>
          <Text style={styles.statValue}>{dashboard.meals?.current || 3}</Text>
          <Text style={styles.statGoal}>/{dashboard.meals?.goal || 3}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('LogMeal')}>
          <Text style={styles.actionIcon}>🍴</Text>
          <Text style={styles.actionText}>Log Meal</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('AddWater')}>
          <Text style={styles.actionIcon}>🥤</Text>
          <Text style={styles.actionText}>Add Water</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('AIChat')}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Ask AI</Text>
        </Pressable>
      </View>

      {/* Today's Meals */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>

        {dashboard.meals?.items?.length > 0 ? (
          dashboard.meals.items.map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <View style={[styles.mealDot, { backgroundColor: meal.color || '#10B981' }]} />
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealType}>{meal.type}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals planned yet</Text>
            <Text style={styles.emptySubtitle}>Get started by setting up your meals for today.</Text>
            <Pressable style={styles.setupButton}>
              <Text style={styles.setupButtonText}>Set Up Today's Meals</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { ...screenPadding, paddingBottom: 100 },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  date: { 
    fontSize: 15, 
    color: '#6B7280', 
    marginTop: 4 
  },

  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 42,
    height: 42,
  },
  appName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },

  // Stats, Buttons, Meals styles (same as before)
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    ...shadow,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '31.5%',
    alignItems: 'center',
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  statGoal: { fontSize: 13, color: '#6B7280' },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    width: '100%',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    width: '31.5%',
    alignItems: 'center',
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionText: { color: 'white', fontWeight: '600', fontSize: 13 },

  mealsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1F2937' },

  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadow,
  },
  mealDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  mealInfo: { flex: 1 },
  mealName: { fontWeight: '600', fontSize: 16 },
  mealType: { color: '#6B7280', fontSize: 13 },
  mealCalories: { fontWeight: '600', color: '#1F2937' },

  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    ...shadow,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySubtitle: { textAlign: 'center', color: '#6B7280', lineHeight: 20 },
  setupButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
  },
  setupButtonText: { color: 'white', fontWeight: '600' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});