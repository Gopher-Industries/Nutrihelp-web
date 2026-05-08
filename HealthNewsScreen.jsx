import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getHealthArticles } from '../../api/healthNewsApi';
import { colors, screenPadding, shadow, spacing } from '../../theme/nutriTheme';

export default function HealthNewsScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadArticles = useCallback(async () => {
    const nextArticles = await getHealthArticles();
    setArticles(nextArticles);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const refresh = async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Page Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/nutrihelp-logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.screenTitle}>Health News</Text>
        </View>
        <Text style={styles.subtitle}>Stay updated with wellness insights</Text>
      </View>

      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation?.navigate?.('HealthNewsDetail', { article: item, id: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
            <View style={styles.articleBody}>
              <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.summary} numberOfLines={2}>
                {item.summary}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },

  // Header
  header: {
    paddingHorizontal: screenPadding.paddingHorizontal,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 4,
  },

  loading: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: colors.background 
  },

  list: { 
    paddingHorizontal: screenPadding.paddingHorizontal,
    paddingBottom: spacing.xl 
  },

  card: {
    ...shadow,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },

  thumbnail: { 
    width: 120, 
    height: 120, 
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },

  articleBody: { 
    flex: 1, 
    paddingHorizontal: spacing.md, 
    justifyContent: 'center' 
  },

  date: { 
    color: colors.primary, 
    fontSize: 13, 
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  articleTitle: { 
    color: colors.ink, 
    fontSize: 18, 
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 8,
  },

  summary: { 
    color: colors.muted, 
    fontSize: 15,
    lineHeight: 20,
  },
});