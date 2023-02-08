import { onMount, Component } from "solid-js";

const SearchModal: Component = () => {
  let searchInput: HTMLInputElement;

  onMount(() => searchInput.focus());

  return (
    <>
      <div class="fixed z-40 w-full h-screen bg-black/10 backdrop-blur-sm" />
      <div class="fixed z-50 rounded flex flex-col items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-4 p-8 bg-gray-50 shadow-md">
        <div class="flex items-center gap-4">
          <span class="i-carbon-search" />
          <input ref={searchInput!} class="rounded-full h-11 px-4" />
        </div>
      </div>
    </>
  );
}

export { SearchModal };
