import { useEffect, useRef } from "react";
import { Alert } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { GUEST_ID, loadTasks, markOffered, wasOffered } from "@/storage/tasksStorage";

// Renders nothing. Once per account, after signing in, offers to copy the tasks made without an account.
export function GuestImportOffer() {
  const { user } = useAuth();
  const { loaded, dispatch } = useTasks();
  const offeredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !loaded || offeredFor.current === user.uid) return;
    offeredFor.current = user.uid;
    const uid = user.uid;

    (async () => {
      if (await wasOffered(uid)) return;
      const guest = await loadTasks(GUEST_ID);
      if (!guest || guest.length === 0) return;
      // Marked before asking: the question is asked once, whatever the answer.
      await markOffered(uid);
      const count = guest.length === 1 ? "1 tarea" : `${guest.length} tareas`;
      Alert.alert(
        "¿Importar tus tareas?",
        `Tienes ${count} creadas sin cuenta. Se copiarán a esta cuenta; tu lista sin cuenta no se borra.`,
        [
          { text: "Ahora no", style: "cancel" },
          { text: "Importar", onPress: () => dispatch({ type: "import", tasks: guest }) },
        ],
      );
    })().catch(() => {});
  }, [user, loaded, dispatch]);

  return null;
}
