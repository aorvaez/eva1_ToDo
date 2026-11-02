import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

import type { Task } from "@/types/task";
import { tasksReducer, type TasksAction } from "./tasksReducer";

type TasksContextValue = { tasks: Task[]; dispatch: Dispatch<TasksAction> };

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  return <TasksContext.Provider value={{ tasks, dispatch }}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
