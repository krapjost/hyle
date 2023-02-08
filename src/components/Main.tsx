import type { Component } from "solid-js";
import { onMount, Switch, Match } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";
import { createShortcut } from "@solid-primitives/keyboard";

import { SearchModal } from "./common/modals.jsx";
// FIX need more clear file structure
import Sidebar from "./main/Sidebar";
import TrashTab from "./main/TrashTab";
import SettingTab from "./main/SettingTab";
import Editor from "./Editor";
import { useUIState } from "../store";

/* TODO:
 * cases;
 * if user is offline; -> when deployed by apps.
 *  alarm user to check online status;
 * if user first time use it;
 *  create user metadata on local userDB? no, have to save it on auth0;
 *  create default 'untitled document' to dexie and pass it to editor;
 * if user has document before exited;
 *  fetch 'last edited document id' and 'whole document list' from dexie;
 *
 * editor only needs to know 'docId' user wants to edit;
 */

function setGlobalShortCuts() {
  const ui = useUIState();
  createShortcut(["Escape"], () => ui.hideSearchModal());
  createShortcut(["Control", "K"], () => ui.toggleSearchModal());
  createShortcut(["Control", "\\"], () => ui.toggleSidebar());
}

const Main: Component = () => {
  const [t] = useI18n();
  const ui = useUIState();

  onMount(() => {
    setGlobalShortCuts();
  });

  return (
    <>
      <div class="bg-gray-200 dark:bg-gray-900 text-black dark:text-white min-h-screen flex justify-center items-stretch overflow-hidden">
        {ui.searchModal && <SearchModal />}
        <Sidebar />
        <Switch fallback={<div>No such tab</div>}>
          <Match when={ui.tab.startsWith("books")}>
            <Editor />
          </Match>
          <Match when={ui.tab === "trash"}>
            <TrashTab />
          </Match>
          <Match when={ui.tab === "settings"}>
            <SettingTab />
          </Match>
        </Switch>
      </div>
    </>
  );
}
export default Main;
