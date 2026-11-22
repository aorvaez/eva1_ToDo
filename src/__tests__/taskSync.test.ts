import { applyRemote, fromRemote, planPushes, toRemote } from "@/utils/taskSync";
import type { Task } from "@/types/task";
import { textDoc } from "@/utils/richDoc";

const base: Task = { id: "a", title: "A", description: textDoc("desc a"), updatedAt: 10 };
const other: Task = { id: "b", title: "B", description: textDoc("desc b"), updatedAt: 20 };

describe("applyRemote (last write wins)", () => {
  it("adds tasks that only exist in the cloud", () => {
    const fromOtherDevice: Task = { id: "z", title: "Z", description: textDoc("z"), updatedAt: 5 };
    expect(applyRemote([base], [fromOtherDevice])).toEqual([fromOtherDevice, base]);
  });

  it("replaces a local task with a newer remote copy", () => {
    const newer = { ...base, title: "A nuevo", updatedAt: 30 };
    expect(applyRemote([base, other], [newer])).toEqual([newer, other]);
  });

  it("keeps the local copy when the remote one is older or equal", () => {
    const older = { ...base, title: "viejo", updatedAt: 5 };
    expect(applyRemote([base], [older])).toEqual([base]);
    expect(applyRemote([base], [{ ...base, title: "igual" }])).toEqual([base]);
  });

  it("keeps the photo that only exists on this phone", () => {
    const local = { ...base, imageUri: "file:///docs/foto.jpg" };
    const newer = { ...base, title: "editada desde otro teléfono", updatedAt: 30 };
    expect(applyRemote([local], [newer])[0]).toMatchObject({ title: newer.title, imageUri: local.imageUri });
  });

  it("returns the same list when nothing changes", () => {
    const local = [base, other];
    expect(applyRemote(local, [])).toBe(local);
    expect(applyRemote(local, [base])).toBe(local);
  });

  it("brings in deletions made on another device", () => {
    const deleted = { ...base, deleted: true, updatedAt: 40 };
    expect(applyRemote([base], [deleted])).toEqual([deleted]);
  });
});

describe("planPushes", () => {
  it("sends tasks the server does not have", () => {
    expect(planPushes([base, other], new Map([["a", 10]]))).toEqual([other]);
  });

  it("sends tasks whose local copy is newer than the server's", () => {
    const edited = { ...base, updatedAt: 99 };
    expect(planPushes([edited], new Map([["a", 10]]))).toEqual([edited]);
  });

  it("sends nothing when the server already has the same version", () => {
    expect(planPushes([base], new Map([["a", 10]]))).toEqual([]);
  });
});

describe("toRemote", () => {
  it("drops the id and the local-only photo, and never sends undefined", () => {
    const remote = toRemote({ ...base, imageUri: "file:///x.jpg", location: { lat: 1, lon: 2, name: undefined } });
    expect(remote).not.toHaveProperty("id");
    expect(remote).not.toHaveProperty("imageUri");
    expect(remote.location).toEqual({ lat: 1, lon: 2 });
    expect(remote.title).toBe("A");
  });
});

describe("fromRemote", () => {
  it("accepts a well-formed document", () => {
    expect(fromRemote("a", toRemote(base))).toEqual({ ...base, id: "a" });
  });

  it("rejects documents that are not tasks", () => {
    expect(fromRemote("a", null)).toBeNull();
    expect(fromRemote("a", { title: 1, description: textDoc("x") })).toBeNull();
    expect(fromRemote("a", { title: "x", description: "texto" })).toBeNull();
    expect(fromRemote("a", { title: "x", description: textDoc("x"), updatedAt: "ayer" })).toBeNull();
  });

  it("keeps only the known fields of a remote document", () => {
    const parsed = fromRemote("a", { ...toRemote(base), campoExtra: "no" });
    expect(parsed).not.toHaveProperty("campoExtra");
  });
});
