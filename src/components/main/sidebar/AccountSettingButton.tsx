import { useI18n } from "@solid-primitives/i18n"
import { ThemeSwitchButton } from "../../common/buttons.jsx"
import { useUIState } from "../../../store"

export default function AccountSettingButton() {
  let navRef: HTMLElement

  const [t] = useI18n()
  const ui = useUIState()

  return (
    <div class="group cursor-pointer select-none">
      <div
        onpointerenter={() => {
          !navRef.classList.contains("group-hover:flex") &&
            navRef.classList.add("group-hover:flex")
        }}
        class="flex items-center py-2 px-3 gap-3 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        <img
          alt="User"
          // src={user().picture}
          class="object-cover w-8 h-8 rounded-md flex-none"
        />
        <strong class="font-bold text-xs">
          {" "}
          {
            // user().nickname
          }{" "}
        </strong>
        <div class="grow" />
        <button
          onclick={() => {
            navRef.classList.remove("group-hover:flex")
          }}
          class="p-1 rounded duration-300 shirink-0 flex items-center justify-center hover:bg-gray-300"
        >
          <span class="transition duration-300 group-hover:-rotate-180 i-carbon-chevron-down" />
        </button>
      </div>
      <nav
        ref={navRef!}
        aria-label="Account Nav"
        class="ml-4 flex-col hidden group-hover:flex"
      >
        <ThemeSwitchButton />
        <button
          onclick={() => ui.setTab("settings")}
          class={
            ui.tab === "settings"
              ? "flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              : "flex items-center px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          }
        >
          <span class="i-carbon-settings" />
          <span class="ml-3 text-sm font-medium"> {t("project.settings")}</span>
        </button>
        <button
          onclick={() => {
            // logout();
          }}
          class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <span class="i-carbon-logout" />
          <span class="ml-3 text-sm font-medium"> {t("project.logout")} </span>
        </button>
      </nav>
    </div>
  )
}
