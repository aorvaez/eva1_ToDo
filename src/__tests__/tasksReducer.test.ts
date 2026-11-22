import { tasksReducer } from "@/context/tasksReducer";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

const a: Task = { id: "a", title: "A", description: textDoc("desc a") };
const b: Task = { id: "b", title: "B", description: textDoc("desc b") };
const c: Task = { id: "c", title: "C", description: textDoc("desc c") };

describe("tasksReducer", () => {
  describe("add", () => {
    it("puts the new task first", () => {
      expect(tasksReducer([a, b], { type: "add", task: c })).toEqual([c, a, b]);
    });

    it("does not mutate the previous state", () => {
      const state = [a];
      tasksReducer(state, { type: "add", task: b });
      expect(state).toEqual([a]);
    });
  });

  describe("update", () => {
    it("replaces the task in the same position and keeps the id", () => {
      const edited: Task = { ...b, title: "B2", description: textDoc("nuevo") };
      expect(tasksReducer([a, b, c], { type: "update", task: edited })).toEqual([a, edited, c]);
    });

    it("leaves the list unchanged when the id does not exist", () => {
      expect(tasksReducer([a, b], { type: "update", task: { ...c, title: "X" } })).toEqual([a, b]);
    });
  });

  describe("load", () => {
    it("replaces the list with the saved tasks", () => {
      expect(tasksReducer([a], { type: "load", tasks: [b, c] })).toEqual([b, c]);
    });
  });

  describe("delete", () => {
    it("removes only the task with that id", () => {
      expect(tasksReducer([a, b, c], { type: "delete", id: "b" })).toEqual([a, c]);
    });

    it("leaves the list unchanged when the id does not exist", () => {
      expect(tasksReducer([a, b], { type: "delete", id: "zzz" })).toEqual([a, b]);
    });

    it("returns an empty list after deleting the last task", () => {
      expect(tasksReducer([a], { type: "delete", id: "a" })).toEqual([]);
    });
  });
});
