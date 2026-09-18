import { Pressable, StyleSheet, Text } from "react-native";

type QuickAddButtonProps = {
  amount: number;
  disabled?: boolean;
  onPress: () => void;
};

export function QuickAddButton({ amount, disabled = false, onPress }: QuickAddButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.plus}>+</Text>
      <Text style={styles.text}>{amount} ml</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    justifyContent: "center",
    padding: 10,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  plus: { color: "#2196F3", fontSize: 20, fontWeight: "800" },
  text: { color: "#16324F", fontSize: 15, fontWeight: "700" },
});
