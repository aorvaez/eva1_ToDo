import type { Task } from "@/types/task";
import { applyRemote } from "@/utils/taskSync";

export type TasksAction =
  | { type: "add"; task: Task }
  | { type: "update"; task: Task }
  | { type: "delete"; id: string; at: number }
  | { type: "load"; tasks: Task[] }
  | { type: "import"; tasks: Task[] }
  | { type: "remote"; tasks: Task[] };

// Pure on purpose: the id and the time arrive inside the action, so tests need no mocks.
export function tasksReducer(state: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case "add":
      return [action.task, ...state];
    case "update":
      return state.map((task) => (task.id === action.task.id ? action.task : task));
    case "delete":
      // A tombstone, not a removal: the deletion has to reach the cloud and other phones.
      return state.map((task) =>
        task.id === action.id ? { ...task, deleted: true, updatedAt: action.at } : task,
      );
    case "load":
      return action.tasks;
    case "import": {
      // Copies never overwrite a task that already has the same id.
      const known = new Set(state.map((task) => task.id));
      return [...action.tasks.filter((task) => !known.has(task.id)), ...state];
    }
    case "remote":
      return applyRemote(state, action.tasks);
  }
}
