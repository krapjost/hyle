import { useI18n } from "@solid-primitives/i18n";
import { createEffect, createSignal } from "solid-js";

// TODO Darkmode I18N
function ThemeSwitchButton() {
  const [t, { locale }] = useI18n();
  const [darkMode, setDarkMode] = createSignal(localStorage.theme);

  function applyDarkMode() {
    const htmlClassList = document.documentElement.classList;
    darkMode()
      ? htmlClassList.add("dark")
      : htmlClassList.remove("dark");
  }

  createEffect(() => applyDarkMode());

  const toggleDarkMode = () => {
    localStorage.theme = darkMode() ? '' : 'dark';
    setDarkMode(localStorage.theme);
  }

  return (
    <button
      onClick={toggleDarkMode}
      class="flex items-center justify-start px-4 py-2 w-full text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
      <label
        for="DarkModeToggle"
        class="flex-none relative cursor-pointer">
        <input
          type="checkbox"
          id="DarkModeToggle"
          checked={darkMode()}
          disabled
          class="peer sr-only"
        />
        <div h-4 w-4 class={darkMode() ? "i-carbon-moon" : "i-carbon-sun"} />
        {/* <span class="icon_color absolute inset-0 z-2 inline-flex items-center justify-center h-6 w-6 rounded-full transition peer-checked:translate-x-4" > */}
        {/* </span> */}
        {/* <span class="prime_color absolute inset-0 rounded-full" /> */}
      </label>
      <span ml-3 > {darkMode() ? "Light Mode" : "Dark Mode"} </span>
    </button>

  );
}

export { ThemeSwitchButton };
