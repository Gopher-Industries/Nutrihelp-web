import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, screenPadding, shadow, spacing } from '../../theme/nutriTheme';

const faqItems = [
  {
    question: 'How does NutriHelp calculate calorie goals?',
    answer:
      'NutriHelp estimates goals from your profile, activity level, and nutrition target. Your dietitian can adjust these goals when needed.',
  },
  {
    question: 'Can I scan packaged food?',
    answer:
      'Yes. Use the scan screen to read a barcode and pull nutrition information from the connected barcode API.',
  },
  {
    question: 'Where do recipes come from?',
    answer:
      'Recipes are shown from the NutriHelp recipe source and can be filtered by goals, dietary preference, and saved items.',
  },
  {
    question: 'Can I change my avatar and profile details?',
    answer:
      'Yes. The profile screen supports inline edits and avatar uploads through the profile API.',
  },
];

export default function FAQScreen() {
  const [query, setQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(search) ||
        item.answer.toLowerCase().includes(search)
    );
  }, [query]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Help</Text>
      <Text style={styles.title}>FAQ</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search questions"
        placeholderTextColor={colors.muted}
        style={styles.search}
      />
      {filteredFaqs.map((item) => (
        <FAQItem key={item.question} item={item} />
      ))}
    </ScrollView>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    rotation.value = withTiming(open ? 0 : 45, { duration: 180 });
    setOpen((current) => !current);
  };

  return (
    <Animated.View layout={Layout.springify()} style={styles.card}>
      <Pressable onPress={toggle} style={styles.questionRow}>
        <Text style={styles.question}>{item.question}</Text>
        <Animated.Text style={[styles.plus, iconStyle]}>+</Animated.Text>
      </Pressable>
      {open && (
        <Animated.Text entering={FadeIn.duration(160)} style={styles.answer}>
          {item.answer}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { ...screenPadding, paddingBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginBottom: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.ink,
  },
  card: {
    ...shadow,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  question: { flex: 1, color: colors.ink, fontSize: 16, fontWeight: '800' },
  plus: { color: colors.primary, fontSize: 26, fontWeight: '700', width: 28, textAlign: 'center' },
  answer: { color: colors.muted, lineHeight: 22, marginTop: spacing.sm },
});
