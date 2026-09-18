export const REMINDER_INTERVALS = [30, 60, 120] as const;

export type ReminderInterval = (typeof REMINDER_INTERVALS)[number];

export type WaterSettings = {
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderIntervalMinutes: number;
  reminderStartTime: string;
  reminderEndTime: string;
};

export const DEFAULT_WATER_SETTINGS: WaterSettings = {
  dailyGoal: 2000,
  remindersEnabled: false,
  reminderIntervalMinutes: 60,
  reminderStartTime: "08:00",
  reminderEndTime: "20:00",
};

export function timeToMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return null;
  }
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateSettings(settings: WaterSettings): string | null {
  if (!Number.isFinite(settings.dailyGoal) || settings.dailyGoal <= 0) {
    return "A meta diária deve ser maior que zero.";
  }

  const start = timeToMinutes(settings.reminderStartTime);
  const end = timeToMinutes(settings.reminderEndTime);
  if (start === null || end === null) {
    return "Use horários válidos no formato HH:MM.";
  }
  if (end <= start) {
    return "O horário final deve ser posterior ao horário inicial.";
  }
  if (!REMINDER_INTERVALS.includes(settings.reminderIntervalMinutes as ReminderInterval)) {
    return "Escolha um intervalo de 30 minutos, 1 hora ou 2 horas.";
  }
  return null;
}
