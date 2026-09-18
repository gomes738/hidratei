import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressCard } from "@/view/components/ProgressCard";
import { QuickAddButton } from "@/view/components/QuickAddButton";
import { WaterEntryItem } from "@/view/components/WaterEntryItem";
import { useWaterViewModel } from "@/viewmodel/useWaterViewModel";

export default function Home() {
  const [customAmount, setCustomAmount] = useState("");
  const [state, actions] = useWaterViewModel();
  const date = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const message = state.consumed >= state.goal
    ? "Meta diária concluída!"
    : state.percentage >= 75
      ? "Você está quase lá!"
      : state.consumed === 0
        ? "Vamos beber água!"
        : `Faltam ${state.remaining} ml para sua meta.`;

  async function addCustomAmount() {
    const amount = Number(customAmount.replace(",", "."));
    await actions.addWater(amount);
    if (Number.isFinite(amount) && amount > 0) setCustomAmount("");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Hidratei</Text>
              <Text style={styles.date}>{date}</Text>
            </View>
            <Pressable accessibilityLabel="Abrir configurações" accessibilityRole="button" onPress={actions.openSettings} style={styles.headerButton}>
              <View style={styles.settingsIcon}>
                <View style={styles.settingsLine} />
                <View style={[styles.settingsLine, styles.settingsLineShort]} />
                <View style={styles.settingsLine} />
              </View>
            </Pressable>
          </View>

          {state.initialLoading ? (
            <ActivityIndicator color="#2196F3" size="large" style={styles.loader} />
          ) : (
            <>
              <ProgressCard {...state} />
              <View style={[styles.message, state.consumed >= state.goal && styles.successMessage]}>
                <Text style={[styles.messageText, state.consumed >= state.goal && styles.successText]}>{message}</Text>
              </View>
              {state.error && <Text style={styles.error}>{state.error}</Text>}

              <Text style={styles.sectionTitle}>Adicionar água</Text>
              <View style={styles.quickRow}>
                {[200, 300, 500].map((amount) => (
                  <QuickAddButton
                    key={amount}
                    amount={amount}
                    disabled={state.saving}
                    onPress={() => void actions.addWater(amount)}
                  />
                ))}
              </View>
              <View style={styles.customRow}>
                <TextInput
                  accessibilityLabel="Outra quantidade em mililitros"
                  keyboardType="numeric"
                  editable={!state.saving}
                  onChangeText={setCustomAmount}
                  placeholder="Outra quantidade (ml)"
                  placeholderTextColor="#8293A3"
                  style={styles.input}
                  value={customAmount}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={state.saving}
                  onPress={() => void addCustomAmount()}
                  style={[styles.addButton, state.saving && styles.disabled]}
                >
                  <Text style={styles.addButtonText}>Adicionar</Text>
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Registros de hoje</Text>
                <Pressable accessibilityRole="button" onPress={actions.openHistory} hitSlop={8}>
                  <Text style={styles.link}>Ver histórico</Text>
                </Pressable>
              </View>
              <View style={styles.listCard}>
                {state.entries.length === 0 ? (
                  <Text style={styles.empty}>Nenhum registro hoje. Que tal começar com um copo?</Text>
                ) : (
                  state.entries.map((entry) => (
                    <WaterEntryItem
                      key={entry.id}
                      entry={entry}
                      disabled={state.saving}
                      onRemove={() => void actions.removeEntry(entry.id)}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: "#F5F9FC", flex: 1 },
  content: { gap: 16, padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: "#16324F", fontSize: 32, fontWeight: "900" },
  date: { color: "#657A8E", fontSize: 14, marginTop: 3, textTransform: "capitalize" },
  headerButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, height: 48, justifyContent: "center", width: 48 },
  settingsIcon: { gap: 4, width: 22 },
  settingsLine: { alignSelf: "center", backgroundColor: "#1976D2", borderRadius: 2, height: 3, width: 22 },
  settingsLineShort: { width: 14 },
  loader: { marginVertical: 80 },
  message: { backgroundColor: "#E3F2FD", borderRadius: 12, padding: 14 },
  successMessage: { backgroundColor: "#E8F5E9" },
  messageText: { color: "#1976D2", fontSize: 15, fontWeight: "700", textAlign: "center" },
  successText: { color: "#2E7D32" },
  error: { color: "#D32F2F", fontSize: 14, textAlign: "center" },
  sectionTitle: { color: "#16324F", fontSize: 19, fontWeight: "800" },
  quickRow: { flexDirection: "row", gap: 10 },
  customRow: { flexDirection: "row", gap: 10 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#D7E3ED", borderRadius: 12, borderWidth: 1, color: "#16324F", flex: 1, minHeight: 50, paddingHorizontal: 14 },
  addButton: { alignItems: "center", backgroundColor: "#2196F3", borderRadius: 12, justifyContent: "center", minHeight: 50, paddingHorizontal: 18 },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  link: { color: "#1976D2", fontSize: 14, fontWeight: "700" },
  listCard: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 16 },
  empty: { color: "#718497", lineHeight: 21, paddingVertical: 24, textAlign: "center" },
});
