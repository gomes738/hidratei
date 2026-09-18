import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { REMINDER_INTERVALS, WaterSettings } from "@/model/waterSettings";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

export default function Settings() {
  const [state, actions] = useSettingsViewModel();
  const [goal, setGoal] = useState("2000");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [interval, setIntervalValue] = useState(60);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGoal(String(state.settings.dailyGoal));
      setStartTime(state.settings.reminderStartTime);
      setEndTime(state.settings.reminderEndTime);
      setIntervalValue(state.settings.reminderIntervalMinutes);
      setEnabled(state.settings.remindersEnabled);
    }, 0);
    return () => clearTimeout(timer);
  }, [
    state.settings.dailyGoal,
    state.settings.reminderEndTime,
    state.settings.reminderIntervalMinutes,
    state.settings.remindersEnabled,
    state.settings.reminderStartTime,
  ]);

  function currentSettings(): WaterSettings {
    return {
      dailyGoal: Number(goal.replace(",", ".")),
      reminderStartTime: startTime.trim(),
      reminderEndTime: endTime.trim(),
      reminderIntervalMinutes: interval,
      remindersEnabled: enabled,
    };
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={actions.goBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.placeholder} />
        </View>
        {state.initialLoading ? (
          <ActivityIndicator color="#2196F3" size="large" style={styles.loader} />
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Meta diária</Text>
              <Text style={styles.help}>Escolha a quantidade que deseja beber por dia.</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  accessibilityLabel="Meta diária em mililitros"
                  keyboardType="numeric"
                  onChangeText={setGoal}
                  style={styles.suffixInput}
                  value={goal}
                />
                <Text style={styles.suffix}>ml</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.sectionTitle}>Lembretes</Text>
                  <Text style={styles.help}>Receba avisos locais durante o dia.</Text>
                </View>
                <Switch
                  accessibilityLabel="Ativar lembretes"
                  onValueChange={setEnabled}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: "#A9B8C5", true: "#64B5F6" }}
                  value={enabled}
                />
              </View>

              <Text style={styles.fieldLabel}>Período dos lembretes</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.smallLabel}>Início</Text>
                  <TextInput
                    accessibilityLabel="Horário inicial"
                    editable={enabled}
                    maxLength={5}
                    onChangeText={setStartTime}
                    placeholder="08:00"
                    style={[styles.input, !enabled && styles.disabled]}
                    value={startTime}
                  />
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.smallLabel}>Fim</Text>
                  <TextInput
                    accessibilityLabel="Horário final"
                    editable={enabled}
                    maxLength={5}
                    onChangeText={setEndTime}
                    placeholder="20:00"
                    style={[styles.input, !enabled && styles.disabled]}
                    value={endTime}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Intervalo</Text>
              <View style={styles.intervalRow}>
                {REMINDER_INTERVALS.map((minutes) => {
                  const selected = interval === minutes;
                  const label = minutes === 30 ? "30 min" : `${minutes / 60} h`;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={!enabled}
                      key={minutes}
                      onPress={() => setIntervalValue(minutes)}
                      style={[styles.intervalButton, selected && styles.intervalSelected, !enabled && styles.disabled]}
                    >
                      <Text style={[styles.intervalText, selected && styles.intervalSelectedText]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {state.error && <Text style={styles.error}>{state.error}</Text>}
            {state.success && <Text style={styles.success}>{state.success}</Text>}
            <Pressable
              accessibilityRole="button"
              disabled={state.saving}
              onPress={() => void actions.save(currentSettings())}
              style={[styles.saveButton, state.saving && styles.disabled]}
            >
              {state.saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Salvar configurações</Text>}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={state.saving}
              onPress={() => void actions.redoOnboarding()}
              style={styles.redoButton}
            >
              <Text style={styles.redoText}>Refazer configuração inicial</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: "#F5F9FC", flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 20 },
  backButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, height: 46, justifyContent: "center", width: 46 },
  backText: { color: "#16324F", fontSize: 36, lineHeight: 38 },
  title: { color: "#16324F", fontSize: 22, fontWeight: "900" },
  placeholder: { width: 46 },
  loader: { marginTop: 80 },
  content: { gap: 16, padding: 20, paddingTop: 4, paddingBottom: 40 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, gap: 12, padding: 18 },
  sectionTitle: { color: "#16324F", fontSize: 18, fontWeight: "800" },
  help: { color: "#718497", fontSize: 13, lineHeight: 19, marginTop: -5 },
  inputWithSuffix: { alignItems: "center", borderColor: "#D7E3ED", borderRadius: 12, borderWidth: 1, flexDirection: "row" },
  suffixInput: { color: "#16324F", flex: 1, fontSize: 18, minHeight: 52, paddingHorizontal: 14 },
  suffix: { color: "#718497", fontWeight: "700", paddingRight: 14 },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  switchText: { flex: 1, gap: 7, paddingRight: 16 },
  fieldLabel: { color: "#16324F", fontSize: 14, fontWeight: "700", marginTop: 8 },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1, gap: 6 },
  smallLabel: { color: "#718497", fontSize: 12 },
  input: { borderColor: "#D7E3ED", borderRadius: 12, borderWidth: 1, color: "#16324F", minHeight: 50, paddingHorizontal: 14 },
  intervalRow: { flexDirection: "row", gap: 8 },
  intervalButton: { alignItems: "center", borderColor: "#D7E3ED", borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 46, justifyContent: "center" },
  intervalSelected: { backgroundColor: "#E3F2FD", borderColor: "#2196F3" },
  intervalText: { color: "#60778C", fontSize: 14, fontWeight: "700" },
  intervalSelectedText: { color: "#1976D2" },
  disabled: { opacity: 0.5 },
  error: { color: "#D32F2F", fontSize: 14, lineHeight: 20, textAlign: "center" },
  success: { color: "#2E7D32", fontSize: 14, fontWeight: "700", textAlign: "center" },
  saveButton: { alignItems: "center", backgroundColor: "#2196F3", borderRadius: 14, justifyContent: "center", minHeight: 54 },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  redoButton: { alignItems: "center", borderColor: "#2196F3", borderRadius: 14, borderWidth: 1, justifyContent: "center", minHeight: 50 },
  redoText: { color: "#1976D2", fontSize: 15, fontWeight: "800" },
});
