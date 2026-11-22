import { fireEvent, render, screen } from "@testing-library/react-native";

import { EmptyState } from "@/components/EmptyState";
import { RichTextPreview } from "@/components/RichTextPreview";
import { TaskItem } from "@/components/TaskItem";
import type { RichDoc } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

// The real icons load their font asynchronously and trigger act() warnings; the tests don't need them.
jest.mock("@expo/vector-icons", () => ({ MaterialIcons: () => null }));

const task = { id: "1", title: "Comprar pan", description: textDoc("En la panadería") };

describe("TaskItem", () => {
  it("shows the title and the description", () => {
    render(<TaskItem task={task} onPress={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Comprar pan")).toBeTruthy();
    expect(screen.getByText("En la panadería")).toBeTruthy();
  });

  it("tapping the trash only asks to delete, it does not open the editor", () => {
    const onPress = jest.fn();
    const onDelete = jest.fn();
    render(<TaskItem task={task} onPress={onPress} onDelete={onDelete} />);
    fireEvent.press(screen.getByLabelText("Eliminar tarea: Comprar pan"));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows the attached photo when the task has one", () => {
    render(<TaskItem task={{ ...task, imageUri: "file:///docs/1.jpg" }} onPress={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByLabelText("Foto de Comprar pan")).toBeTruthy();
  });

  it("tapping the card opens the editor", () => {
    const onPress = jest.fn();
    render(<TaskItem task={task} onPress={onPress} onDelete={jest.fn()} />);
    fireEvent.press(screen.getByLabelText("Editar tarea: Comprar pan"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyState", () => {
  it("tells the person how to start", () => {
    render(<EmptyState />);
    expect(screen.getByText("Aún no tienes tareas")).toBeTruthy();
    expect(screen.getByText("Toca + para agregar una")).toBeTruthy();
  });
});

describe("RichTextPreview", () => {
  it("renders an ordered list with numbers", () => {
    const doc: RichDoc = {
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Pan" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Leche" }] }] },
          ],
        },
      ],
    };
    render(<RichTextPreview doc={doc} />);
    expect(screen.getByText("1.")).toBeTruthy();
    expect(screen.getByText("Pan")).toBeTruthy();
    expect(screen.getByText("2.")).toBeTruthy();
    expect(screen.getByText("Leche")).toBeTruthy();
  });

  it("renders a bullet list with bullets", () => {
    const doc: RichDoc = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Pan" }] }] }],
        },
      ],
    };
    render(<RichTextPreview doc={doc} />);
    expect(screen.getByText("•")).toBeTruthy();
  });

  it("renders a checked task item", () => {
    const doc: RichDoc = {
      type: "doc",
      content: [
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: true },
              content: [{ type: "paragraph", content: [{ type: "text", text: "Pagar" }] }],
            },
          ],
        },
      ],
    };
    render(<RichTextPreview doc={doc} />);
    expect(screen.getByText("Pagar")).toBeTruthy();
  });

  it("shows bold and italic runs", () => {
    const doc: RichDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "urgente", marks: [{ type: "bold" }] },
            { type: "text", text: " y suave", marks: [{ type: "italic" }] },
          ],
        },
      ],
    };
    render(<RichTextPreview doc={doc} />);
    expect(screen.getByText("urgente")).toBeTruthy();
    expect(screen.getByText("y suave")).toBeTruthy();
  });

  it("cuts off after 3 blocks", () => {
    const doc: RichDoc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Uno" }] },
        { type: "paragraph", content: [{ type: "text", text: "Dos" }] },
        { type: "paragraph", content: [{ type: "text", text: "Tres" }] },
        { type: "paragraph", content: [{ type: "text", text: "Cuatro" }] },
      ],
    };
    render(<RichTextPreview doc={doc} />);
    expect(screen.queryByText("Cuatro")).toBeNull();
    expect(screen.getByText("…")).toBeTruthy();
  });
});
