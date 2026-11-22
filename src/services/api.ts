// Data from JSONPlaceholder: a public practice API, no key needed.
export type ImportedTodo = { userId?: number; id: number; title: string; completed: boolean };

const TODOS_URL = "https://jsonplaceholder.typicode.com/todos?_limit=10";
const TIMEOUT_MS = 8000;

// Trust boundary: each item from the network is checked before it is used.
function isTodo(value: unknown): value is ImportedTodo {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return typeof t.id === "number" && typeof t.title === "string" && typeof t.completed === "boolean";
}

// Throws on network errors, timeouts and HTTP errors; the caller shows one message for all of them.
export async function fetchTodos(): Promise<ImportedTodo[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(TODOS_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("Respuesta inesperada");
    return data.filter(isTodo);
  } finally {
    clearTimeout(timer);
  }
}
