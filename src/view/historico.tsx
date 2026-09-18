import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HistoryDay, useHistoryViewModel } from "@/viewmodel/useHistoryViewModel";

function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function HistoryItem({ item }: { item: HistoryDay }) {
  const visualPercentage = Math.min(item.percentage, 100);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          <Text style={styles.amount}>{item.consumed} ml de {item.goal} ml</Text>
        </View>
        <View style={[styles.badge, item.completed ? styles.doneBadge : styles.pendingBadge]}>
          <Text style={[styles.badgeText, item.completed ? styles.doneText : styles.pendingText]}>
            {item.completed ? "Concluída" : "Pendente"}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, item.completed && styles.doneFill, { width: `${visualPercentage}%` }]} />
      </View>
      <Text style={styles.percentage}>{Math.round(item.percentage)}% da meta</Text>
    </View>
  );
}

export default function History() {
  const [state, actions] = useHistoryViewModel();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={actions.goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Histórico</Text>
        <View style={styles.placeholder} />
      </View>
      {state.initialLoading ? (
        <ActivityIndicator color="#2196F3" size="large" style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={state.days}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => <HistoryItem item={item} />}
          ListEmptyComponent={<Text style={styles.empty}>Seu histórico aparecerá aqui após o primeiro registro.</Text>}
          ListHeaderComponent={state.error ? <Text style={styles.error}>{state.error}</Text> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F5F9FC", flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 20 },
  backButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, height: 46, justifyContent: "center", width: 46 },
  backText: { color: "#16324F", fontSize: 36, lineHeight: 38 },
  title: { color: "#16324F", fontSize: 24, fontWeight: "900" },
  placeholder: { width: 46 },
  loader: { marginTop: 80 },
  list: { gap: 12, padding: 20, paddingTop: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, gap: 13, padding: 18 },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardDate: { color: "#16324F", fontSize: 16, fontWeight: "800", textTransform: "capitalize" },
  amount: { color: "#718497", fontSize: 14, marginTop: 5 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  doneBadge: { backgroundColor: "#E8F5E9" },
  pendingBadge: { backgroundColor: "#FFF3E0" },
  badgeText: { fontSize: 12, fontWeight: "800" },
  doneText: { color: "#2E7D32" },
  pendingText: { color: "#C56A00" },
  track: { backgroundColor: "#DCEAF5", borderRadius: 6, height: 10, overflow: "hidden" },
  fill: { backgroundColor: "#2196F3", borderRadius: 6, height: "100%" },
  doneFill: { backgroundColor: "#2E7D32" },
  percentage: { color: "#60778C", fontSize: 13, textAlign: "right" },
  empty: { color: "#718497", lineHeight: 22, marginTop: 80, paddingHorizontal: 30, textAlign: "center" },
  error: { color: "#D32F2F", marginBottom: 8, textAlign: "center" },
});
