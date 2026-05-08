import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/home/HomeScreen";
import HealthNewsScreen from "./src/screens/wellness/HealthNewsScreen";
import HealthNewsDetailScreen from "./src/screens/wellness/HealthNewsDetailScreen";
import HealthToolsScreen from "./src/screens/wellness/HealthToolsScreen";
import FAQScreen from "./src/screens/wellness/FAQScreen";
import { colors, screenPadding, spacing } from "./src/theme/nutriTheme";

const launcherItems = [
  ["Home", "Home"],
  ["Health News", "HealthNews"],
  ["Health Tools", "HealthTools"],
  ["FAQ", "FAQ"]
];

export default function App() {
  const [routeName, setRouteName] = useState("Launcher");
  const [routeParams, setRouteParams] = useState({});

  const navigation = useMemo(
    () => ({
      navigate: (nextRoute, params = {}) => {
        setRouteName(nextRoute);
        setRouteParams(params);
      },
      goBack: () => {
        setRouteName("Launcher");
        setRouteParams({});
      }
    }),
    []
  );

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {routeName !== "Launcher" && (
        <View style={styles.topBar}>
          <Pressable onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.routeTitle}>{getTitle(routeName)}</Text>
          <View style={styles.backButton} />
        </View>
      )}
      {renderScreen(routeName, navigation, routeParams)}
    </View>
  );
}

function renderScreen(routeName, navigation, routeParams) {
  if (routeName === "Launcher") {
    return <Launcher navigation={navigation} />;
  }

  if (routeName === "Home") {
    return <HomeScreen navigation={navigation} />;
  }

  if (routeName === "HealthNews") {
    return <HealthNewsScreen navigation={navigation} />;
  }

  if (routeName === "HealthNewsDetail") {
    return <HealthNewsDetailScreen route={{ params: routeParams }} navigation={navigation} />;
  }

  if (routeName === "HealthTools") {
    return <HealthToolsScreen />;
  }

  if (routeName === "FAQ") {
    return <FAQScreen />;
  }

  return <Placeholder routeName={routeName} />;
}

function getTitle(routeName) {
  const titles = {
    Home: "Home",
    HealthNews: "Health News",
    HealthNewsDetail: "Article",
    HealthTools: "Health Tools",
    FAQ: "FAQ",
    MealPlan: "Meal Plan",
    Recipes: "Recipes",
    Scan: "Scan"
  };
  return titles[routeName] || routeName;
}

function Launcher({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Section 6</Text>
      <Text style={styles.title}>Home & Wellness Screens</Text>
      <Text style={styles.subtitle}>Open each assignment screen from this menu.</Text>
      {launcherItems.map(([label, route]) => (
        <Pressable key={route} style={styles.card} onPress={() => navigation.navigate(route)}>
          <Text style={styles.cardTitle}>{label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Placeholder({ routeName }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>{getTitle(routeName)}</Text>
      <Text style={styles.subtitle}>Placeholder route for testing Home screen buttons.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    paddingTop: 44,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backButton: {
    width: 74
  },
  backText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 16
  },
  routeTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    ...screenPadding,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: 72
  },
  kicker: {
    color: colors.primary,
    fontWeight: "800"
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.md
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background
  }
});
