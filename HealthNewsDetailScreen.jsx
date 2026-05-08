import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Pressable,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { getHealthArticleById } from '../../api/healthNewsApi';
import { colors, spacing } from '../../theme/nutriTheme';

export default function HealthNewsDetailScreen({ route, navigation }) {   // ← navigation prop
  const { width } = useWindowDimensions();
  const [article, setArticle] = useState(route?.params?.article || null);
  const id = route?.params?.id || route?.params?.article?.id;

  useEffect(() => {
    if (!article && id) {
      getHealthArticleById(id).then(setArticle);
    }
  }, [article, id]);

  const shareArticle = () => {
    Share.share({
      title: article?.title,
      message: `${article?.title}\n\n${article?.summary || ''}`,
    });
  };

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation?.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={colors.ink} />
        </Pressable>

        <Text style={styles.headerTitle}>Health News</Text>

        <Pressable onPress={shareArticle} style={styles.shareButton}>
          <Ionicons name="share-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {article.image && (
          <Image source={{ uri: article.image }} style={styles.heroImage} />
        )}

        <View style={styles.body}>
          <Text style={styles.date}>
            {new Date(article.date).toDateString()}
          </Text>
          <Text style={styles.title}>{article.title}</Text>

          {article.content?.includes('<') ? (
            <RenderHTML
              contentWidth={width - 40}
              source={{ html: article.content }}
              baseStyle={styles.htmlText}
            />
          ) : (
            <Text style={styles.summary}>{article.content || article.summary}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  shareButton: { padding: 8 },

  scrollView: { flex: 1 },
  content: { paddingBottom: spacing.xl },

  heroImage: { width: '100%', height: 260, resizeMode: 'cover' },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  date: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 32,
    marginBottom: spacing.xl,
  },
  summary: {
    fontSize: 16.5,
    lineHeight: 26,
    color: colors.ink,
  },
  htmlText: {
    fontSize: 16.5,
    lineHeight: 26,
    color: colors.ink,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: colors.muted },
});