import { Pressable, StyleSheet, Text, View } from "react-native";

import { WaterEntry } from "@/model/waterEntry";

type WaterEntryItemProps = {
  entry: WaterEntry;
  disabled?: boolean;
  onRemove: () => void;
};

export function WaterEntryItem({ entry, disabled = false, onRemove }: WaterEntryItemProps) {
  const time = new Date(entry.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <View style={styles.drop} accessibilityElementsHidden>
        <View style={styles.dropIcon} />
      </View>
      <View style={styles.info}>
        <Text style={styles.amount}>{entry.amount} ml</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <Pressable accessibilityRole="button" disabled={disabled} onPress={onRemove} hitSlop={10} style={[styles.remove, disabled && styles.disabled]}>
        <Text style={styles.removeText}>Excluir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", borderBottomColor: "#E7EEF4", borderBottomWidth: 1, flexDirection: "row", paddingVertical: 14 },
  drop: { alignItems: "center", backgroundColor: "#E3F2FD", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  dropIcon: {
    backgroundColor: "#208AEF",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    height: 19,
    transform: [{ rotate: "45deg" }],
    width: 19,
  },
  info: { flex: 1, marginLeft: 12 },
  amount: { color: "#16324F", fontSize: 16, fontWeight: "700" },
  time: { color: "#718497", fontSize: 13, marginTop: 2 },
  remove: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  removeText: { color: "#D32F2F", fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.5 },
});
