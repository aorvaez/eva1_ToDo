import { fireEvent, render, screen } from "@testing-library/react-native";

import { EmptyState } from "@/components/EmptyState";
import { TaskItem } from "@/components/TaskItem";

// The real icons load their font asynchronously and trigger act() warnings; the tests don't need them.
jest.mock("@expo/vector-icons", () => ({ MaterialIcons: () => null }));

const task = { id: "1", title: "Comprar pan", description: "En la panadería" };

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
