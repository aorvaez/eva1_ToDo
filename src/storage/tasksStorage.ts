import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RichDoc, Task } from "@/types/task";

// shortcut: one key for everyone on the device, user-scoped when auth arrives (Paso 5).
const KEY = "tasks.v1";

// Trust boundary: what comes back from disk is not trusted to have the Task shape.
function isTask(item: unknown): item is Task {
  if (typeof item !== "object" || item === null) return false;
  const t = item as Partial<Record<keyof Task, unknown>>;
  const doc = t.description as Partial<RichDoc> | undefined;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof doc === "object" &&
    doc !== null &&
    doc.type === "doc"
  );
}

// Returns null only when the storage itself cannot be read, so the caller
// does not overwrite data it failed to load. Corrupt JSON is treated as empty.
export async function loadTasks(): Promise<Task[] | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return AsyncStorage.setItem(KEY, JSON.stringify(tasks));
}
