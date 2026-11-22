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
  it("saves and loads the same tasks", async () => {
    await saveTasks([a, b]);
    expect(await loadTasks()).toEqual([a, b]);
  });

  it("returns an empty list when nothing was saved", async () => {
    expect(await loadTasks()).toEqual([]);
  });

  it("returns an empty list when the stored JSON is corrupt", async () => {
    await AsyncStorage.setItem("tasks.v1", "{no es json");
    expect(await loadTasks()).toEqual([]);
  });

  it("drops stored items that do not have the task shape", async () => {
    await AsyncStorage.setItem(
      "tasks.v1",
      JSON.stringify([a, { id: 1, title: "malo" }, null, { id: "c", title: "sin doc", description: "texto" }]),
    );
    expect(await loadTasks()).toEqual([a]);
  });

  it("returns null when the storage cannot be read", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("disco lleno"));
    expect(await loadTasks()).toBeNull();
  });
});
