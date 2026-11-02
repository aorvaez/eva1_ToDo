import { validateTask } from "@/utils/validateTask";

describe("validateTask", () => {
  it("returns no errors for a valid task", () => {
    expect(validateTask({ title: "Comprar pan", description: "En la panadería" })).toEqual({});
  });

  it("requires a title", () => {
    expect(validateTask({ title: "", description: "ok" })).toEqual({
      title: "El título es obligatorio",
    });
  });

  it("requires a description", () => {
    expect(validateTask({ title: "ok", description: "" })).toEqual({
      description: "La descripción es obligatoria",
    });
  });

  it("treats whitespace-only values as empty", () => {
    expect(validateTask({ title: "   ", description: "\n\t " })).toEqual({
      title: "El título es obligatorio",
      description: "La descripción es obligatoria",
    });
  });

  it("reports both errors at once", () => {
    expect(Object.keys(validateTask({ title: "", description: "" }))).toHaveLength(2);
  });
});
