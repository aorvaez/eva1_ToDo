import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from "react";

import { loadTasks, saveTasks } from "@/storage/tasksStorage";
import type { Task } from "@/types/task";
import { tasksReducer, type TasksAction } from "./tasksReducer";

type TasksContextValue = { tasks: Task[]; dispatch: Dispatch<TasksAction>; loaded: boolean };

const TasksContext = createContext<TasksContextValue | null>(null);

// userId is the owner of the list: a Firebase uid, or GUEST_ID when nobody is signed in.
export function TasksProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  // Nothing is saved until the stored list is loaded, so an empty start never overwrites it.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTasks(userId).then((saved) => {
      if (saved) dispatch({ type: "load", tasks: saved });
      setLoaded(saved !== null);
    });
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    // shortcut: save failures are silent, show a message when sync arrives (Paso 6).
    saveTasks(userId, tasks).catch(() => {});
  }, [tasks, loaded, userId]);

  return <TasksContext.Provider value={{ tasks, dispatch, loaded }}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
