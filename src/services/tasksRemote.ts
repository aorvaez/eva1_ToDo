import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";

import { db } from "@/services/firebase";
import type { Task } from "@/types/task";
import { fromRemote, toRemote } from "@/utils/taskSync";

// Each person's tasks live under users/{uid}/tasks, the path the security rules protect.
function tasksPath(uid: string) {
  if (!db) throw new Error("Firestore no está configurado.");
  return collection(db, "users", uid, "tasks");
}

// fromCache is true while the answer comes from memory, before the server has replied.
export function listenTasks(
  uid: string,
  onTasks: (tasks: Task[], fromCache: boolean) => void,
): Unsubscribe {
  return onSnapshot(tasksPath(uid), (snapshot) => {
    const tasks = snapshot.docs.flatMap((d) => {
      const task = fromRemote(d.id, d.data());
      return task ? [task] : [];
    });
    onTasks(tasks, snapshot.metadata.fromCache);
  });
}

export function pushTask(uid: string, task: Task) {
  if (!db) throw new Error("Firestore no está configurado.");
  return setDoc(doc(db, "users", uid, "tasks", task.id), toRemote(task));
}
