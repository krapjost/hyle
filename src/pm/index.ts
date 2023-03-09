import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { Plugin } from "prosemirror-state"

export default function setupPlugins(): Plugin[] {
  const plugins = [keymap(baseKeymap)]
  return plugins
}
