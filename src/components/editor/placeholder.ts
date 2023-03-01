import { Plugin } from "prosemirror-state"

export default function placeholder(text) {
  const update = (view) => {
    if (view.state.doc.textContent) {
      view.dom.removeAttribute("data-placeholder")
    } else {
      view.dom.setAttribute("data-placeholder", text)
    }
  }

  return new Plugin({
    view(view) {
      update(view)
      return { update }
    },
  })
}
