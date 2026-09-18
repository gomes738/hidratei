import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ProfileType } from "@/model/userProfile";
import { useOnboardingViewModel } from "@/viewmodel/useOnboardingViewModel";

const mascot = require("@/assets/images/gota-comemorando.png");
const profiles = require("@/assets/images/gotas-perfil.png");
const weightMascot = require("@/assets/images/gota-balanca-v2.png");
const wakeMascot = require("@/assets/images/gota-acordando.png");
const sleepMascot = require("@/assets/images/gota-dormindo.png");

type ProfileOptionProps = {
  label: string;
  value: ProfileType;
  selected: boolean;
  onPress: () => void;
};

function ProfileOption({ label, value, selected, onPress }: ProfileOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.profileOption, selected && styles.profileOptionSelected]}
    >
      <View style={styles.profileArtworkViewport}>
        <Image
          source={profiles}
          resizeMode="contain"
          style={[styles.profileArtwork, value === "female" && styles.profileArtworkFemale]}
        />
      </View>
      <View style={[styles.check, selected && styles.checkSelected]}>
        <Text style={styles.checkText}>{selected ? "✓" : ""}</Text>
      </View>
      <Text style={[styles.profileLabel, selected && styles.profileLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function MascotScene({ source = mascot, compact = false }: { source?: number; compact?: boolean }) {
  return (
    <View style={[styles.mascotScene, compact && styles.mascotSceneCompact]}>
      <View style={styles.sceneGlow} />
      <Image source={source} resizeMode="contain" style={[styles.mascot, compact && styles.mascotCompact]} />
    </View>
  );
}

export default function Onboarding() {
  const [state, actions] = useOnboardingViewModel();
  const [opacity] = useState(() => new Animated.Value(1));
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    opacity.setValue(0.35);
    Animated.timing(opacity, { duration: 220, toValue: 1, useNativeDriver: true }).start();
  }, [opacity, state.step]);

  function dismissKeyboardAndContinue() {
    Keyboard.dismiss();
    actions.next();
  }

  function keepWeightVisible() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180);
  }

  if (state.initialLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color="#2196F3" size="large" />
      </SafeAreaView>
    );
  }

  function renderStep() {
    if (state.step === 1) {
      return (
        <View style={styles.stepContent}>
          <MascotScene />
          <Text style={styles.title}>Olá! Eu sou seu companheiro de hidratação.</Text>
          <Text style={styles.subtitle}>Para preparar seu plano diário, preciso conhecer um pouco da sua rotina.{"\n"}Suas informações ficarão salvas somente neste aparelho.</Text>
          <Pressable accessibilityRole="button" onPress={actions.next} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>VAMOS COMEÇAR</Text>
          </Pressable>
        </View>
      );
    }

    if (state.step === 2) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.eyebrow}>SOBRE VOCÊ</Text>
          <Text style={styles.title}>Qual é o seu sexo?</Text>
          <View style={styles.profileRow}>
            <ProfileOption label="Masculino" value="male" selected={state.profileType === "male"} onPress={() => actions.selectProfile("male")} />
            <ProfileOption label="Feminino" value="female" selected={state.profileType === "female"} onPress={() => actions.selectProfile("female")} />
          </View>
        </View>
      );
    }

    if (state.step === 3) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.eyebrow}>SEU PLANO</Text>
          <Text style={styles.title}>Qual é o seu peso?</Text>
          <MascotScene source={weightMascot} compact />
          <View style={styles.valueCard}>
            <TextInput
              accessibilityLabel="Peso em quilogramas"
              keyboardType="decimal-pad"
              maxLength={5}
              onChangeText={actions.setWeight}
              onFocus={keepWeightVisible}
              onSubmitEditing={Keyboard.dismiss}
              returnKeyType="done"
              selectTextOnFocus
              style={styles.valueInput}
              value={state.weight}
            />
            <Text style={styles.valueUnit}>kg</Text>
          </View>
          <Text style={styles.hint}>Aceitamos valores entre 20 e 300 kg.</Text>
        </View>
      );
    }

    if (state.step === 4 || state.step === 5) {
      const wakingUp = state.step === 4;
      return (
        <View style={styles.stepContent}>
          <Text style={styles.eyebrow}>SUA ROTINA</Text>
          <Text style={styles.title}>{wakingUp ? "Que horas você costuma acordar?" : "Que horas você costuma dormir?"}</Text>
          <MascotScene source={wakingUp ? wakeMascot : sleepMascot} compact />
          <View style={styles.timeCard}>
            <TextInput
              accessibilityLabel={wakingUp ? "Horário de acordar" : "Horário de dormir"}
              keyboardType="number-pad"
              maxLength={5}
              onChangeText={wakingUp ? actions.setWakeUpTime : actions.setSleepTime}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="00:00"
              selectTextOnFocus
              style={styles.timeInput}
              value={wakingUp ? state.wakeUpTime : state.sleepTime}
            />
          </View>
          <Text style={styles.hint}>{wakingUp ? "Este será o início dos seus lembretes." : "Depois desse horário, não enviaremos lembretes."}</Text>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <Text style={styles.eyebrow}>TUDO CERTO</Text>
        <Text style={styles.title}>Seu plano está pronto!</Text>
        <MascotScene compact />
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Meta diária</Text><Text style={styles.summaryValue}>{state.dailyGoal.toLocaleString("pt-BR")} ml</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Lembretes</Text><Text style={styles.summaryValue}>{state.wakeUpTime} às {state.sleepTime}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Intervalo inicial</Text><Text style={styles.summaryValue}>1 hora</Text></View>
        </View>
        <Text style={styles.disclaimer}>Meta estimada para bem-estar com base no peso informado. Não substitui orientação médica e pode ser alterada nas configurações.</Text>
        {state.permissionNotice ? (
          <>
            <Text style={styles.notice}>{state.permissionNotice}</Text>
            <Pressable accessibilityRole="button" onPress={actions.finish} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>IR PARA O INÍCIO</Text>
            </Pressable>
          </>
        ) : (
          <Pressable accessibilityRole="button" disabled={state.saving} onPress={actions.openPermissionDialog} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>ATIVAR LEMBRETES</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={styles.progressHeader}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(state.step / state.totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{state.step} de {state.totalSteps}</Text>
        </View>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.animatedContent, { opacity }]}>{renderStep()}</Animated.View>
          {state.error && <Text style={styles.error}>{state.error}</Text>}
          {state.step > 1 && state.step < 6 && (
            <View style={styles.navigation}>
              <Pressable accessibilityRole="button" onPress={actions.back} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>VOLTAR</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={state.step === 2 && !state.profileType}
                onPress={dismissKeyboardAndContinue}
                style={[styles.nextButton, state.step === 2 && !state.profileType && styles.buttonDisabled]}
              >
                <Text style={styles.primaryButtonText}>PRÓXIMO</Text>
              </Pressable>
            </View>
          )}
          {state.step === 6 && !state.permissionNotice && (
            <Pressable accessibilityRole="button" onPress={actions.back} style={styles.finalBackButton}>
              <Text style={styles.secondaryButtonText}>VOLTAR</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal animationType="fade" transparent visible={state.permissionDialogVisible} onRequestClose={actions.closePermissionDialog}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Lembretes do Hidratei</Text>
            <Text style={styles.modalText}>Permita as notificações para que o Hidratei possa lembrar você de beber água durante o dia.</Text>
            <Pressable accessibilityRole="button" disabled={state.saving} onPress={() => void actions.activateReminders()} style={styles.primaryButton}>
              {state.saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>CONTINUAR</Text>}
            </Pressable>
            {!state.saving && (
              <Pressable accessibilityRole="button" onPress={actions.closePermissionDialog} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Agora não</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: "#F7FBFF", flex: 1 },
  loadingScreen: { alignItems: "center", backgroundColor: "#F7FBFF", flex: 1, justifyContent: "center" },
  progressHeader: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 22, paddingTop: 10 },
  progressTrack: { backgroundColor: "#DCECF8", borderRadius: 8, flex: 1, height: 9, overflow: "hidden" },
  progressFill: { backgroundColor: "#2196F3", borderRadius: 8, height: "100%" },
  progressText: { color: "#60778C", fontSize: 12, fontWeight: "700" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  animatedContent: { flex: 1 },
  stepContent: { alignItems: "center", flex: 1, justifyContent: "center", width: "100%" },
  eyebrow: { color: "#2196F3", fontSize: 13, fontWeight: "900", letterSpacing: 1.8, marginBottom: 10 },
  title: { color: "#16324F", fontSize: 28, fontWeight: "900", lineHeight: 35, maxWidth: 500, textAlign: "center" },
  subtitle: { color: "#60778C", fontSize: 15, lineHeight: 23, marginBottom: 26, marginTop: 14, maxWidth: 480, textAlign: "center" },
  mascotScene: { alignItems: "center", height: 300, justifyContent: "center", marginBottom: 12, position: "relative", width: "100%" },
  mascotSceneCompact: { height: 215, marginVertical: 10 },
  sceneGlow: { backgroundColor: "#E3F2FD", borderRadius: 140, height: 250, position: "absolute", width: 250 },
  mascot: { height: 285, width: 285 },
  mascotCompact: { height: 205, width: 205 },
  profileRow: { flexDirection: "row", gap: 12, marginTop: 24, width: "100%" },
  profileOption: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D8E7F2", borderRadius: 18, borderWidth: 2, flex: 1, minHeight: 270, justifyContent: "flex-end", padding: 12, position: "relative" },
  profileOptionSelected: { backgroundColor: "#E3F2FD", borderColor: "#2196F3" },
  profileArtworkViewport: { height: 220, overflow: "hidden", width: 115 },
  profileArtwork: { height: 230, left: 0, position: "absolute", top: -5, width: 230 },
  profileArtworkFemale: { left: -115 },
  profileLabel: { color: "#60778C", fontSize: 16, fontWeight: "800" },
  profileLabelSelected: { color: "#1976D2" },
  check: { alignItems: "center", borderRadius: 12, height: 24, justifyContent: "center", position: "absolute", right: 8, top: 8, width: 24 },
  checkSelected: { backgroundColor: "#2196F3" },
  checkText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  valueCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#BBDEFB", borderRadius: 20, borderWidth: 2, flexDirection: "row", justifyContent: "center", paddingHorizontal: 20, width: "72%" },
  valueInput: { color: "#1976D2", fontSize: 42, fontWeight: "900", minHeight: 78, minWidth: 100, textAlign: "center" },
  valueUnit: { color: "#60778C", fontSize: 20, fontWeight: "800" },
  hint: { color: "#718497", fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: "center" },
  timeCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#BBDEFB", borderRadius: 20, borderWidth: 2, flexDirection: "row", gap: 10, justifyContent: "center", paddingHorizontal: 22, width: "78%" },
  timeInput: { color: "#1976D2", fontSize: 38, fontWeight: "900", minHeight: 78, minWidth: 145, textAlign: "center" },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 18, width: "100%" },
  summaryRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 15 },
  summaryLabel: { color: "#60778C", fontSize: 14, fontWeight: "600" },
  summaryValue: { color: "#16324F", fontSize: 15, fontWeight: "900" },
  divider: { backgroundColor: "#E7EFF5", height: 1 },
  disclaimer: { color: "#718497", fontSize: 12, lineHeight: 17, marginVertical: 14, textAlign: "center" },
  notice: { backgroundColor: "#FFF8E1", borderRadius: 12, color: "#8A5A00", fontSize: 13, lineHeight: 19, marginBottom: 12, padding: 12, textAlign: "center", width: "100%" },
  primaryButton: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#2196F3", borderRadius: 17, justifyContent: "center", minHeight: 56, paddingHorizontal: 20 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },
  navigation: { flexDirection: "row", gap: 12, marginTop: 20 },
  secondaryButton: { alignItems: "center", borderColor: "#B9D7EC", borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 54 },
  secondaryButtonText: { color: "#1976D2", fontSize: 15, fontWeight: "900" },
  nextButton: { alignItems: "center", backgroundColor: "#2196F3", borderRadius: 16, flex: 1.5, justifyContent: "center", minHeight: 54 },
  buttonDisabled: { opacity: 0.45 },
  finalBackButton: { alignItems: "center", alignSelf: "center", justifyContent: "center", minHeight: 42, paddingHorizontal: 24 },
  error: { color: "#D32F2F", fontSize: 14, marginTop: 10, textAlign: "center" },
  modalBackdrop: { alignItems: "center", backgroundColor: "rgba(15, 42, 64, 0.55)", flex: 1, justifyContent: "center", padding: 24 },
  modalCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 24, maxWidth: 440, padding: 24, width: "100%" },
  modalTitle: { color: "#16324F", fontSize: 22, fontWeight: "900", textAlign: "center" },
  modalText: { color: "#60778C", fontSize: 15, lineHeight: 22, marginBottom: 22, marginTop: 10, textAlign: "center" },
  modalCancel: { minHeight: 44, justifyContent: "center", marginTop: 7 },
  modalCancelText: { color: "#60778C", fontSize: 14, fontWeight: "700" },
});
