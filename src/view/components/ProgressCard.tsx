import { StyleSheet, Text, View } from "react-native";

type ProgressCardProps = {
  consumed: number;
  goal: number;
  remaining: number;
  percentage: number;
};

export function ProgressCard({ consumed, goal, remaining, percentage }: ProgressCardProps) {
  const visualPercentage = Math.min(Math.max(percentage, 0), 100);
  const completed = consumed >= goal;

  return (
    <View style={styles.card}>
      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.label}>Consumido hoje</Text>
          <Text style={styles.amount}>{consumed} ml</Text>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
      <View style={styles.track} accessibilityLabel={`Progresso: ${Math.round(percentage)} por cento`}>
        <View style={[styles.fill, { width: `${visualPercentage}%` }]} />
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detail}>Meta: {goal} ml</Text>
        <Text style={styles.detail}>{completed ? "Meta concluída" : `Faltam ${remaining} ml`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, gap: 16 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: "#5D7185", fontSize: 14 },
  amount: { color: "#16324F", fontSize: 30, fontWeight: "800", marginTop: 3 },
  percentageBadge: {
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 40,
    height: 70,
    justifyContent: "center",
    width: 70,
  },
  percentage: { color: "#1976D2", fontSize: 18, fontWeight: "800" },
  track: { backgroundColor: "#DCEAF5", borderRadius: 8, height: 14, overflow: "hidden" },
  fill: { backgroundColor: "#2196F3", borderRadius: 8, height: "100%" },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  detail: { color: "#5D7185", fontSize: 14, fontWeight: "600" },
});
