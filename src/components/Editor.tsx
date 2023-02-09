import "./editor/editor.css";
import "prosemirror-view/style/prosemirror.css";
import type { Component } from "solid-js";

import useYFS from "solid-yfs";
import * as Y from "yjs";
import { onMount, createSignal, createEffect } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";
import schema from "./editor/schema";
import editorSetup from "./editor/setup";

import { EditorView } from "prosemirror-view";
import { DOMParser, Fragment, Slice } from "prosemirror-model";
import { EditorState, Selection } from "prosemirror-state";

declare global {
  interface Window {
    view: EditorView;
  }
}

const Editor: Component = () => {
  let view: EditorView;
  let content: HTMLDivElement;
  let editor: HTMLDivElement;

  // TODO: rename useYFS to yfs
  const { setRootDirectory, unsetRootDirectory, directoryName, syncDoc } =
    useYFS;
  const [doc] = createSignal<Y.Doc>(new Y.Doc());
  const [t] = useI18n();
  const [contentSize, setContentSize] = createSignal(0);

  createEffect(() => {
    if (directoryName()) {
      console.log("directoryName is: ", directoryName());
      console.log("doc changed as :", doc());
      syncDoc("default-file.md", doc());
    } else {
      console.log("directoryName is unsetted: ", directoryName());
    }
  });

  onMount(() => {
    view = new EditorView(editor, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(content),
        plugins: editorSetup({
          schema: schema,
          placeholder: t("editor.default_title"),
        }),
      }),
      dispatchTransaction: (tr) => {
        if (!tr.docChanged) return view.updateState(view.state.apply(tr));
        setContentSize(tr.doc.content.size);

        console.log(
          "Document size went from",
          tr.before.content.size,
          "to",
          tr.doc.content.size
        );

        const titleBefore = tr.before.content.firstChild?.textContent;
        const titleCurrent = tr.doc.content.firstChild?.textContent;
        if (titleBefore === titleCurrent) {
          if (titleCurrent) {
            // trigger add doc once right after user write Docs title
            // user editing content
            console.log("child count : ", tr.doc.childCount);
            console.log(tr.doc.content.toJSON());
            console.log(tr.doc.content.toString());

            const ytext = doc().getText(titleCurrent);
            ytext.insert(0, tr.doc.textContent);
            console.log("doc.text is:", ytext);

            const countBefore = tr.before.content.childCount;
            const countCurrent = tr.doc.content.childCount;

            if (countBefore === countCurrent) {
              // editing same node
              tr.doc.content.childCount;
            } else if (countBefore > countCurrent) {
              // node deleted
            } else {
              // node added
            }
          } else {
            // user didn't write title and enter
            const titleJSON = [
              { type: "text", text: t("editor.default_title") },
            ];
            const titleNode = schema.nodes.title.create(
              null,
              Fragment.fromJSON(schema, titleJSON)
            );
            view.state.apply(tr.replaceWith(0, 1, titleNode));
          }
        } else {
          // user editing title
        }
        view.updateState(view.state.apply(tr));
      },
    });
    view.focus();
  });
  return (
    <div class="flex flex-col grow min-h-screen ">
      <button onclick={() => setRootDirectory(true)}>set root directory</button>
      <button onclick={() => unsetRootDirectory()}>unset root directory</button>
      <div class="absolute top-5 right-5 bg-black/50 text-white px-2 py-1 text-xs rounded">
        {contentSize()}
      </div>
      <div ref={content!} id="content" />
      <div
        ref={editor!}
        id="editor"
        class="bg-white text-black dark:bg-gray-900 dark:text-white"
      />
      <div
        class="grow w-full cursor-text bg-gray-50 dark:bg-gray-900"
        onclick={() => {
          const s = view.state;
          view.dispatch(s.tr.setSelection(Selection.atEnd(s.doc)));
          view.focus();
        }}
      ></div>
    </div>
  );
};

export default Editor;
