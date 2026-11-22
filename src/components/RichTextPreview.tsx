import { MaterialIcons } from "@expo/vector-icons";
import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";
import type { RichDoc, RichNode } from "@/types/task";

const MAX_BLOCKS = 3;

type Props = { doc: RichDoc };

// Renders a Tiptap JSON document as native Text/View, so the list never needs a WebView per row.
export function RichTextPreview({ doc }: Props) {
  const blocks = doc.content ?? [];
  const shown = blocks.slice(0, MAX_BLOCKS);
  return (
    <View style={styles.container}>
      {shown.map((block, index) => (
        <Fragment key={index}>{renderBlock(block)}</Fragment>
      ))}
      {blocks.length > MAX_BLOCKS ? <Text style={styles.text}>…</Text> : null}
    </View>
  );
}

function renderBlock(node: RichNode) {
  switch (node.type) {
    case "paragraph":
      return <Text style={styles.text}>{renderInline(node.content)}</Text>;
    case "orderedList":
      return (node.content ?? []).map((item, index) => (
        <View key={index} style={styles.listRow}>
          <Text style={styles.text}>{index + 1}. </Text>
          <Text style={[styles.text, styles.flex]}>{renderInline(flattenListItem(item))}</Text>
        </View>
      ));
    case "bulletList":
      return (node.content ?? []).map((item, index) => (
        <View key={index} style={styles.listRow}>
          <Text style={styles.text}>• </Text>
          <Text style={[styles.text, styles.flex]}>{renderInline(flattenListItem(item))}</Text>
        </View>
      ));
    case "taskList":
      return (node.content ?? []).map((item, index) => {
        const checked = Boolean(item.attrs?.checked);
        return (
          <View key={index} style={styles.listRow}>
            <MaterialIcons
              name={checked ? "check-box" : "check-box-outline-blank"}
              size={16}
              color={colors.textSecondary}
              style={styles.checkIcon}
            />
            <Text style={[styles.text, styles.flex]}>{renderInline(flattenListItem(item))}</Text>
          </View>
        );
      });
    default:
      return null;
  }
}

// A list item wraps its text in a paragraph; unwrap it to get straight to the inline content.
function flattenListItem(item: RichNode): RichNode[] | undefined {
  return item.content?.[0]?.content;
}

function renderInline(nodes: RichNode[] | undefined) {
  return (nodes ?? []).map((node, index) => {
    const bold = node.marks?.some((mark) => mark.type === "bold");
    const italic = node.marks?.some((mark) => mark.type === "italic");
    // Plain runs stay as bare strings so a test's getByText("word") matches one element, not two.
    if (!bold && !italic) return node.text ?? "";
    return (
      <Text key={index} style={[bold && styles.bold, italic && styles.italic]}>
        {node.text ?? ""}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm / 2 },
  text: { ...typography.body, color: colors.textSecondary },
  bold: { fontWeight: "700" },
  italic: { fontStyle: "italic" },
  listRow: { flexDirection: "row" },
  flex: { flex: 1 },
  checkIcon: { marginRight: spacing.sm / 2, marginTop: 2 },
});
