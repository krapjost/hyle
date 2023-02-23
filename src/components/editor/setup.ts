import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";
import * as Y from "yjs";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";

import placeholder from "./placeholder";
import { buildKeymap } from "./keymap";
import { buildInputRules } from "./input-rules";
import { Schema } from "prosemirror-model";

export default function setupPlugins(options: {
  xml: Y.XmlFragment;
  schema: Schema;
  placeholder?: string | undefined;
}): Plugin[] {
  const plugins = [
    ySyncPlugin(options.xml),
    yUndoPlugin(),
    buildInputRules(options.schema.nodes),
    keymap(buildKeymap(options.schema)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
  ];

  if (options.placeholder) {
    plugins.push(placeholder(options.placeholder));
  }

  return plugins.concat(
    new Plugin({
      props: {
        attributes: { class: "Hyle" },
      },
    })
  );
}
