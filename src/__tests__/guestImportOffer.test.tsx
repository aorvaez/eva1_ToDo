import { Alert } from "react-native";
import { render, waitFor } from "@testing-library/react-native";

import { GuestImportOffer } from "@/components/GuestImportOffer";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { GUEST_ID, loadTasks, markOffered, wasOffered } from "@/storage/tasksStorage";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/context/TasksContext", () => ({ useTasks: jest.fn() }));
jest.mock("@/storage/tasksStorage", () => ({
  GUEST_ID: "guest",
  loadTasks: jest.fn(),
  wasOffered: jest.fn(),
  markOffered: jest.fn(),
}));

const guestTask: Task = { id: "g1", title: "Sin cuenta", description: textDoc("hola") };
const dispatch = jest.fn();
const alert = jest.spyOn(Alert, "alert");

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({ user: { uid: "u1" }, loading: false });
  (useTasks as jest.Mock).mockReturnValue({ tasks: [], dispatch, loaded: true });
  (wasOffered as jest.Mock).mockResolvedValue(false);
  (markOffered as jest.Mock).mockResolvedValue(undefined);
  (loadTasks as jest.Mock).mockResolvedValue([guestTask]);
});

describe("GuestImportOffer", () => {
  it("offers to import the guest tasks into the account", async () => {
    render(<GuestImportOffer />);
    await waitFor(() => expect(alert).toHaveBeenCalledTimes(1));
    expect(alert.mock.calls[0][0]).toBe("¿Importar tus tareas?");
    expect(alert.mock.calls[0][1]).toContain("1 tarea");
    expect(loadTasks).toHaveBeenCalledWith(GUEST_ID);
  });

  it("imports the guest tasks when the person accepts", async () => {
    render(<GuestImportOffer />);
    await waitFor(() => expect(alert).toHaveBeenCalledTimes(1));
    const buttons = alert.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    buttons.find((b) => b.text === "Importar")?.onPress?.();
    expect(dispatch).toHaveBeenCalledWith({ type: "import", tasks: [guestTask] });
  });

  it("remembers the answer so it is asked only once per account", async () => {
    render(<GuestImportOffer />);
    await waitFor(() => expect(markOffered).toHaveBeenCalledWith("u1"));
  });

  it("does not offer when there are no guest tasks", async () => {
    (loadTasks as jest.Mock).mockResolvedValue([]);
    render(<GuestImportOffer />);
    await waitFor(() => expect(loadTasks).toHaveBeenCalled());
    expect(alert).not.toHaveBeenCalled();
  });

  it("does not offer again after it was already asked", async () => {
    (wasOffered as jest.Mock).mockResolvedValue(true);
    render(<GuestImportOffer />);
    await waitFor(() => expect(wasOffered).toHaveBeenCalledWith("u1"));
    expect(alert).not.toHaveBeenCalled();
  });

  it("waits until the account list has loaded", () => {
    (useTasks as jest.Mock).mockReturnValue({ tasks: [], dispatch, loaded: false });
    render(<GuestImportOffer />);
    expect(loadTasks).not.toHaveBeenCalled();
  });

  it("does nothing while nobody is signed in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    render(<GuestImportOffer />);
    expect(loadTasks).not.toHaveBeenCalled();
  });
});
