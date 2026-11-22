import type { RichDoc, RichNode } from "@/types/task";

export const emptyDoc: RichDoc = { type: "doc", content: [{ type: "paragraph" }] };

// A single paragraph with one text run; the shape most tests and callers need.
export function textDoc(text: string): RichDoc {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

// Flattens the Tiptap tree to plain text, for validation and accessibility labels.
export function docToText(doc: RichDoc): string {
  const walk = (nodes: RichNode[] | undefined): string =>
    (nodes ?? [])
      .map((node) => (node.type === "text" ? (node.text ?? "") : walk(node.content)))
      .join(" ");
  return walk(doc.content).replace(/\s+/g, " ").trim();
}
