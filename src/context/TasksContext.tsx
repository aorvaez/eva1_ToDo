import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";

import { loadTasks, saveTasks } from "@/storage/tasksStorage";
import type { Task } from "@/types/task";
import { tasksReducer, type TasksAction } from "./tasksReducer";

type TasksContextValue = {
  // What the screens show: deleted tasks are hidden.
  tasks: Task[];
  // Everything, including deletion marks; this is what gets synchronized.
  allTasks: Task[];
  dispatch: Dispatch<TasksAction>;
  loaded: boolean;
};

const TasksContext = createContext<TasksContextValue | null>(null);

// userId is the owner of the list: a Firebase uid, or GUEST_ID when nobody is signed in.
export function TasksProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [allTasks, dispatch] = useReducer(tasksReducer, []);
  // Nothing is saved until the stored list is loaded, so an empty start never overwrites it.
  const [loaded, setLoaded] = useState(false);
  const tasks = useMemo(() => allTasks.filter((task) => !task.deleted), [allTasks]);

  useEffect(() => {
    loadTasks(userId).then((saved) => {
      if (saved) dispatch({ type: "load", tasks: saved });
      setLoaded(saved !== null);
    });
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    // shortcut: save failures are silent; the cloud copy is the backup once sync is on.
    saveTasks(userId, allTasks).catch(() => {});
  }, [allTasks, loaded, userId]);

  return (
    <TasksContext.Provider value={{ tasks, allTasks, dispatch, loaded }}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const value = useContext(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
