import UnoCSS from "unocss/vite";

import {
  presetUno,
  presetWebFonts,
  presetIcons,
  presetAttributify,
  presetTypography,
  presetTagify,
} from "unocss";

import { presetForms } from "@julr/unocss-preset-forms";
import { presetHeroPatterns } from "@julr/unocss-preset-heropatterns";

export default () =>
  UnoCSS({
    theme: {
      extend: {
        transitionProperty: {
          'width': 'width',
          'spacing': 'margin, padding',
        }
      },
      colors: {
        gray: {
          50: "#EEEEEE",
          100: "#DDDDDD",
          200: "#CCCCCC",
          300: "#BBBBBB",
          400: "#AAAAAA",
          500: "#999999",
          600: "#777777",
          700: "#555555",
          800: "#333333",
          900: "#111111",
        },
      },
    },
    shortcuts: [
      {
        dots: "i-carbon-overflow-menu-vertical p-8 text-2xl",
        full: "w-full h-full",
        prime_color:
          "bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-white",
        second_color:
          "bg-gray-200 text-gray-900 dark:bg-gray-900 dark:text-gray-100",
        modal_color:
          "bg-gray-100 text-black dark:bg-black dark:text-gray-100 shadow-lg shadow-black/20 dark:shadow-black/20 border border-gray-100 dark:border-black",
        modal_item_color: "hover:bg-gray-200 dark:hover:bg-gray-900",
        icon_color:
          "bg-transparent text-gray-900 hover:text-gray-700 transition hover:bg-white dark:text-white dark:hover:text-gray-200 dark:hover:bg-black",
        divider: "-my-2 divide-y divide-gray-200 dark:divide-gray-800",
        text_label: "block text-sm font-medium text-pen-600 dark:text-pen-200",
        text_input:
          "mt-1 w-full rounded-sm text-sm shadow-sm border-none focus:border-none focus:ring-pen-200 dark:focus:ring-pen-700 dark:bg-pen-900",
        hl_color:
          "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-white",
      },
      [
        /^btn-(.*)$/,
        ([, c]) =>
          `bg-${c}-600 border-${c}-600 hover:text-${c}-600 active:text-${c}-500 dark:hover:bg-${c}-700 dark:hover:text-white inline-block shrink-0 rounded-sm border px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent focus:outline-none focus:ring`,
      ],
    ],
    presets: [
      presetAttributify(),
      presetTypography(),
      presetWebFonts({
        provider: "google", // default provider
        fonts: {
          sans: "Roboto",
          mono: ["Fira Code", "Fira Mono:400,700"],
        },
      }),
      presetTagify(),
      presetIcons({
        cdn: "https://esm.sh/",
      }),
      presetUno(),
      presetForms(),
      presetHeroPatterns(),
    ],
  });
