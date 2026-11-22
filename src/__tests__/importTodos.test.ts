import { fetchTodos } from "@/services/api";
import { tasksReducer } from "@/context/tasksReducer";
import { todosToTasks } from "@/utils/importTodos";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

const fetchMock = jest.spyOn(globalThis, "fetch");

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) } as Response);
}

beforeEach(() => fetchMock.mockReset());

describe("fetchTodos", () => {
  it("asks for ten todos over HTTPS with a timeout signal", async () => {
    fetchMock.mockReturnValue(jsonResponse([]));
    await fetchTodos();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://jsonplaceholder.typicode.com/todos?_limit=10");
    expect(init.signal).toBeDefined();
  });

  it("keeps only the items that have the expected shape", async () => {
    fetchMock.mockReturnValue(
      jsonResponse([
        { userId: 1, id: 1, title: "Pan", completed: false },
        { id: "malo", title: 5 },
        null,
      ]),
    );
    expect(await fetchTodos()).toEqual([{ userId: 1, id: 1, title: "Pan", completed: false }]);
  });

  it("throws on an HTTP error", async () => {
    fetchMock.mockReturnValue(jsonResponse({}, false));
    await expect(fetchTodos()).rejects.toThrow("HTTP 500");
  });

  it("throws when the answer is not a list", async () => {
    fetchMock.mockReturnValue(jsonResponse({ error: "algo" }));
    await expect(fetchTodos()).rejects.toThrow("Respuesta inesperada");
  });
});

describe("todosToTasks", () => {
  const now = 1000;

  it("turns each todo into a task with a stable id and the current time", () => {
    const [task] = todosToTasks([{ id: 7, title: "Comprar pan", completed: false }], now);
    expect(task).toEqual({
      id: "jp-7",
      title: "Comprar pan",
      description: textDoc("Importada desde JSONPlaceholder."),
      updatedAt: now,
    });
  });

  it("notes when the original todo was already completed", () => {
    const [task] = todosToTasks([{ id: 8, title: "Lavar", completed: true }], now);
    expect(task.description).toEqual(textDoc("Importada desde JSONPlaceholder. Estaba completada en la fuente."));
  });

  it("skips todos with an empty title", () => {
    expect(todosToTasks([{ id: 9, title: "   ", completed: false }], now)).toEqual([]);
  });

  it("importing the same todos twice does not duplicate them", () => {
    const first = tasksReducer([] as Task[], { type: "import", tasks: todosToTasks([{ id: 1, title: "A", completed: false }], now) });
    const second = tasksReducer(first, { type: "import", tasks: todosToTasks([{ id: 1, title: "A", completed: false }], now + 5) });
    expect(second).toHaveLength(1);
  });
});
