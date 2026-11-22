import type { Task } from "@/types/task";

export type TasksAction =
  | { type: "add"; task: Task }
  | { type: "update"; task: Task }
  | { type: "delete"; id: string }
  | { type: "load"; tasks: Task[] }
  | { type: "import"; tasks: Task[] };

// Pure on purpose: the id arrives inside the action, so tests need no mocks.
export function tasksReducer(state: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case "add":
      return [action.task, ...state];
    case "update":
      return state.map((task) => (task.id === action.task.id ? action.task : task));
    case "delete":
      return state.filter((task) => task.id !== action.id);
    case "load":
      return action.tasks;
    case "import": {
      // Copies never overwrite a task that already has the same id.
      const known = new Set(state.map((task) => task.id));
      return [...action.tasks.filter((task) => !known.has(task.id)), ...state];
    }
  }
}
