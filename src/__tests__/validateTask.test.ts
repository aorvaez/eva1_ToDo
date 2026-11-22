import { emptyDoc, textDoc } from "@/utils/richDoc";
import { validateTask } from "@/utils/validateTask";

describe("validateTask", () => {
  it("returns no errors for a valid task", () => {
    expect(validateTask({ title: "Comprar pan", description: textDoc("En la panadería") })).toEqual({});
  });

  it("requires a title", () => {
    expect(validateTask({ title: "", description: textDoc("ok") })).toEqual({
      title: "El título es obligatorio",
    });
  });

  it("requires a description", () => {
    expect(validateTask({ title: "ok", description: emptyDoc })).toEqual({
      description: "La descripción es obligatoria",
    });
  });

  it("treats whitespace-only values as empty", () => {
    expect(validateTask({ title: "   ", description: textDoc("\n\t ") })).toEqual({
      title: "El título es obligatorio",
      description: "La descripción es obligatoria",
    });
  });

  it("treats a list with no text as an empty description", () => {
    const listOnly = { type: "doc" as const, content: [{ type: "bulletList", content: [] }] };
    expect(validateTask({ title: "ok", description: listOnly })).toEqual({
      description: "La descripción es obligatoria",
    });
  });

  it("reports both errors at once", () => {
    expect(Object.keys(validateTask({ title: "", description: emptyDoc }))).toHaveLength(2);
  });
});
