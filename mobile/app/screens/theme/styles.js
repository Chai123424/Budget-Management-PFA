// theme/styles.js

import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.backgroundLight,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
  },
  titleDark: {
    color: COLORS.textLight,
  },

  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  tipBox: {
    backgroundColor: COLORS.cardBgLighter,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  tipBoxDark: {
    backgroundColor: COLORS.cardBgDark,
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tabButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: COLORS.cardBgLighter,
  },
  tabButtonDark: {
    backgroundColor: COLORS.cardBgDark,
  },
  tabText: {
    color: COLORS.textDark,
  },
  tabTextDark: {
    color: COLORS.textLight,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  activeTabText: {
    color: "white",
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  secondaryButton: {
    backgroundColor: COLORS.cardBgLighter,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  secondaryButtonDark: {
    backgroundColor: COLORS.cardBgDark,
  },
  secondaryText: {
    color: COLORS.primaryDark,
    fontWeight: "bold",
    textAlign: "center",
  },

  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#aaa",
  },
  activeDot: {
    backgroundColor: COLORS.warning,
    width: 12,
    height: 12,
  },
});
