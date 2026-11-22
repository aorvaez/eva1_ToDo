import { signInWithEmailAndPassword } from "firebase/auth";

import { authErrorMessage, signIn } from "@/services/auth";

// Firebase needs a real project; the tests replace both the client and the SDK calls.
jest.mock("@/services/firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

describe("authErrorMessage", () => {
  it("explains a wrong email or password in Spanish", () => {
    expect(authErrorMessage({ code: "auth/invalid-credential" })).toBe("Correo o contraseña incorrectos.");
  });

  it("explains a missing connection", () => {
    expect(authErrorMessage({ code: "auth/network-request-failed" })).toBe("Sin conexión. Revisa tu internet.");
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(authErrorMessage(new Error("algo raro"))).toBe("No se pudo completar la acción. Inténtalo de nuevo.");
    expect(authErrorMessage(undefined)).toBe("No se pudo completar la acción. Inténtalo de nuevo.");
  });
});

describe("signIn", () => {
  it("passes the email and password to Firebase", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: { uid: "u1" } });

    await signIn("ana@correo.cl", "secreto1");

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, "ana@correo.cl", "secreto1");
  });
});
