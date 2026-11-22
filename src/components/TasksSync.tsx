import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { listenTasks, pushTask } from "@/services/tasksRemote";
import type { Task } from "@/types/task";
import { applyRemote, planPushes } from "@/utils/taskSync";

// Uploads whatever the server does not have yet, and records it as known.
function upload(uid: string, tasks: Task[], server: Map<string, number>) {
  for (const task of planPushes(tasks, server)) {
    server.set(task.id, task.updatedAt ?? 0);
    // shortcut: a failed upload is not retried until the next change; the next start reconciles it.
    pushTask(uid, task).catch(() => {});
  }
}

// Renders nothing. Keeps the signed-in person's tasks in step with Firestore in real time.
export function TasksSync() {
  const { user } = useAuth();
  const { allTasks, loaded, dispatch } = useTasks();
  const uid = user?.uid;

  // Latest local list, read from the snapshot callback without restarting the listener.
  const latest = useRef(allTasks);
  useEffect(() => {
    latest.current = allTasks;
  }, [allTasks]);

  // What the server is known to have: task id -> updatedAt.
  const server = useRef(new Map<string, number>());
  // Nothing is uploaded until the first answer from the server, so older local copies never overwrite newer ones.
  const ready = useRef(false);

  useEffect(() => {
    if (!uid || !loaded) return;
    ready.current = false;
    server.current = new Map();

    const unsubscribe = listenTasks(uid, (remote, fromCache) => {
      if (fromCache && !ready.current) return;
      for (const task of remote) server.current.set(task.id, task.updatedAt ?? 0);
      const first = !ready.current;
      ready.current = true;
      dispatch({ type: "remote", tasks: remote });
      // On the first answer, local changes the server lacks (made offline or before sign-in) go up now.
      if (first) upload(uid, applyRemote(latest.current, remote), server.current);
    });

    return () => {
      unsubscribe();
      ready.current = false;
    };
  }, [uid, loaded, dispatch]);

  useEffect(() => {
    if (uid && ready.current) upload(uid, allTasks, server.current);
  }, [allTasks, uid]);

  return null;
}
