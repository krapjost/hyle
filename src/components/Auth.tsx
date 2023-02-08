import { onMount } from "solid-js";

export default function Auth() {

  onMount(async () => {
    if (
      location.search.includes("state=") &&
      (location.search.includes("code=") || location.search.includes("error="))
    ) {
      window.history.replaceState({}, document.title, "/");
    }
  });

  return (
    <div class="h-screen flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-black">
      Logging in ...
    </div>
  );
}
