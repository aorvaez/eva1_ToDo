// Tiptap JSON document, as produced/consumed by @10play/tentap-editor's getJSON/initialContent.
export type RichDoc = {
  type: "doc";
  content?: RichNode[];
};

export type RichNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  text?: string;
  marks?: { type: string }[];
};

export type Task = {
  id: string;
  title: string;
  description: RichDoc;
};
