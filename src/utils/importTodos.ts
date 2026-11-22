import type { ImportedTodo } from "@/services/api";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

// The id is derived from the source, so importing the same todos again adds nothing.
export function todosToTasks(todos: ImportedTodo[], now: number): Task[] {
  return todos
    .filter((todo) => todo.title.trim().length > 0)
    .map((todo) => ({
      id: `jp-${todo.id}`,
      title: todo.title.trim(),
      description: textDoc(
        todo.completed
          ? "Importada desde JSONPlaceholder. Estaba completada en la fuente."
          : "Importada desde JSONPlaceholder.",
      ),
      updatedAt: now,
    }));
}
