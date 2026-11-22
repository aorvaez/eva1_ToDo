import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadTasks, saveTasks } from "@/storage/tasksStorage";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

// The official mock is CommonJS; require is the documented way to load it.
jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const a: Task = { id: "a", title: "A", description: textDoc("desc a") };
const b: Task = { id: "b", title: "B", description: textDoc("desc b") };

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("tasksStorage", () => {
  it("keeps each user's list apart", async () => {
    await saveTasks("u1", [a]);
    expect(await loadTasks("u2")).toEqual([]);
  });

  it("saves and loads the same tasks", async () => {
    await saveTasks("u1", [a, b]);
    expect(await loadTasks("u1")).toEqual([a, b]);
  });

  it("returns an empty list when nothing was saved", async () => {
    expect(await loadTasks("u1")).toEqual([]);
  });

  it("returns an empty list when the stored JSON is corrupt", async () => {
    await AsyncStorage.setItem("tasks.v1.u1", "{no es json");
    expect(await loadTasks("u1")).toEqual([]);
  });

  it("drops stored items that do not have the task shape", async () => {
    await AsyncStorage.setItem(
      "tasks.v1.u1",
      JSON.stringify([a, { id: 1, title: "malo" }, null, { id: "c", title: "sin doc", description: "texto" }]),
    );
    expect(await loadTasks("u1")).toEqual([a]);
  });

  it("returns null when the storage cannot be read", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("disco lleno"));
    expect(await loadTasks("u1")).toBeNull();
  });
});
