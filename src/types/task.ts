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
  // Local file in the app's documents folder; optional so tasks saved before Eva 2 still load.
  imageUri?: string;
  // Where the task was created; set once, never updated by the edit flow.
  location?: { lat: number; lon: number; name?: string };
  // Weather at that place when the task was created (tempC in °C, code as WMO).
  weather?: { tempC: number; code: number };
  // Last change time in ms; the newer copy wins when the cloud and the phone disagree.
  updatedAt?: number;
  // Deleted tasks stay as tombstones so a deletion can reach the cloud and other phones.
  deleted?: boolean;
};
