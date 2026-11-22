import type { RichDoc, Task } from "@/types/task";

// Last write wins: the copy with the newer updatedAt is kept; a tie keeps the local copy.
export function applyRemote(local: Task[], remote: Task[]): Task[] {
  const remoteById = new Map(remote.map((task) => [task.id, task]));
  const localIds = new Set(local.map((task) => task.id));
  let changed = false;

  const updated = local.map((task) => {
    const incoming = remoteById.get(task.id);
    if (!incoming || (incoming.updatedAt ?? 0) <= (task.updatedAt ?? 0)) return task;
    changed = true;
    // The photo only exists on the phone that took it, so a newer remote copy keeps it.
    return { ...incoming, imageUri: task.imageUri };
  });

  const added = remote.filter((task) => !localIds.has(task.id));
  if (added.length > 0) changed = true;
  return changed ? [...added, ...updated] : local;
}

// Tasks whose local version the server does not have yet, or has an older one.
export function planPushes(local: Task[], server: ReadonlyMap<string, number>): Task[] {
  return local.filter((task) => server.get(task.id) !== (task.updatedAt ?? 0));
}

// Only synced fields go up: the id is the document name and the photo stays on this phone.
// The JSON round trip also drops undefined values, which Firestore does not accept.
export function toRemote(task: Task): Record<string, unknown> {
  const fields: Partial<Task> = { ...task };
  delete fields.id;
  delete fields.imageUri;
  return JSON.parse(JSON.stringify(fields));
}

// Trust boundary: data from the network is checked before it becomes a task.
export function fromRemote(id: string, data: unknown): Task | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Partial<Record<keyof Task, unknown>>;
  const doc = d.description as Partial<RichDoc> | undefined;
  if (typeof d.title !== "string" || typeof doc !== "object" || doc === null || doc.type !== "doc") return null;
  if (d.updatedAt !== undefined && typeof d.updatedAt !== "number") return null;
  if (d.deleted !== undefined && typeof d.deleted !== "boolean") return null;

  const location = d.location as Task["location"] | undefined;
  const weather = d.weather as Task["weather"] | undefined;
  return {
    id,
    title: d.title,
    description: doc as RichDoc,
    updatedAt: d.updatedAt as number | undefined,
    deleted: d.deleted as boolean | undefined,
    location:
      location && typeof location.lat === "number" && typeof location.lon === "number" ? location : undefined,
    weather: weather && typeof weather.tempC === "number" && typeof weather.code === "number" ? weather : undefined,
  };
}
