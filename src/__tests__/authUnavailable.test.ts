import { authErrorMessage, signIn } from "@/services/auth";

// Without a .env the app runs local-only: the auth client does not exist.
jest.mock("@/services/firebase", () => ({ auth: null }));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

describe("accounts unavailable", () => {
  it("rejects sign-in with a dedicated code", async () => {
    await expect(signIn("a@b.cl", "secreto1")).rejects.toMatchObject({ code: "auth/unavailable" });
  });

  it("explains it in Spanish", () => {
    expect(authErrorMessage({ code: "auth/unavailable" })).toBe(
      "La cuenta no está disponible en esta instalación.",
    );
  });
});
