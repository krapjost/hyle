import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";
import { Plugin } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";

import placeholder from "./placeholder";
import { buildKeymap } from "./keymap";
import { buildInputRules } from "./input-rules";

export default function editorSetup(options: {
  schema: any;
  placeholder: any;
  mapKeys?: any;
}) {
  let plugins = [
    buildInputRules(options.schema),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    history(),
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
