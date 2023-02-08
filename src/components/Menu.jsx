import { Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { Motion, Presence } from "@motionone/solid";
import { ThemeSwitchButton } from "./common/buttons";

const Setting = () => {
  const auth = { user: () => false };
  const [modalOpened, setModalOpened] = createSignal(false);

  const toggleModalOpened = () => setModalOpened(!modalOpened());

  return (
    <div class="icon_color rounded-md">
      <button
        type="button"
        onClick={toggleModalOpened}
        class="flex items-center shrink-0 rounded-lg p-2.5 shadow-sm"
      >
        <sr-only>Menu</sr-only>
        {auth.user() ? (
          <img
            src={auth.user().picture}
            class="h-4 w-4 rounded-full object-cover"
          />
        ) : (
          <div class="h-4 w-4 rounded-full">
            <div class="i-carbon-user" />
          </div>
        )}
        <div
          class={
            modalOpened() ? "i-carbon-chevron-up" : "i-carbon-chevron-down"
          }
          text-xl
        />
      </button>
      {modalOpened() && (
        <div class="relative">
          <div
            role="menu"
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-sm modal_color"
          >
            <div class="flow-root py-2">
              <div class="divider">
                {auth.user() && (
                  <div class="modal_item_color">
                    <A
                      href={`/user/${auth.user().nickname}`}
                      class="flex items-center justify-between px-4 py-2 w-full text-sm"
                    >
                      <p class="">
                        <strong class="block font-medium">
                          {auth.user().name}
                        </strong>
                        <span class="text-gray-500"> {auth.user().email}</span>
                      </p>
                    </A>
                  </div>
                )}
                <div class="modal_item_color">
                  <ThemeSwitchButton />
                </div>
                <div class="modal_item_color">
                  {auth.user() ? (
                    <button
                      onclick={auth.logout}
                      class="flex items-center justify-between w-ful px-4 py-2 text-sm"
                    >
                      <span class="icon_color inline-flex items-center justify-center h-6 w-6 rounded-full">
                        <div h-4 w-4 class="i-carbon-logout" />
                      </span>
                      Log Out
                    </button>
                  ) : (
                    <A
                      href="/auth"
                      class="flex items-center justify-between w-ful px-4 py-2 text-sm"
                    >
                      <span class="icon_color inline-flex items-center justify-center h-6 w-6 rounded-full">
                        <div h-4 w-4 class="i-carbon-login" />
                      </span>
                      Log In
                    </A>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Menu() {
  const location = useLocation();
  const [showHeader, setShowHeader] = createSignal(true);

  let lastScrollTop = scrollY;
  let frame;

  const toggleHeader = () => {
    console.log("location ,", location.pathname);
    if (location.pathname === "/writes") return;

    const currentScrollTop = scrollY;
    if (currentScrollTop > lastScrollTop) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  };

  function scrollListener() {
    frame = requestAnimationFrame(toggleHeader);
  }

  createEffect(() => {
    setShowHeader(location.pathname !== "/writes");
  });

  onMount(() => {
    addEventListener("scroll", scrollListener);
  });

  onCleanup(() => {
    removeEventListener("scroll", scrollListener);
    cancelAnimationFrame(frame);
  });

  return (
    <Presence exitBeforeEnter>
      <Show when={showHeader()}>
        <Motion.header
          initial={{ y: -69 }}
          animate={{ y: 0 }}
          exit={{ y: -69 }}
          transition={{ duration: 0.3 }}
          class="w-full shadow-sm bg-gray-100/80 dark:bg-gray-900/80 top-0"
        >
          <div class="mx-auto max-w-screen-2xl py-1 sm:px-6 lg:px-8">
            <div class="flex items-center gap-2 justify-end">
              <A
                href="/editor"
                class="icon_color block shrink-0 rounded-full p-2 shadow-sm"
              >
                <div class="i-carbon-pen-fountain text-xl" />
              </A>
              <Setting />
            </div>
          </div>
        </Motion.header>
      </Show>
    </Presence>
  );
}
