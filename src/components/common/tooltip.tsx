import { mergeProps } from "solid-js"
import { useI18n } from "@solid-primitives/i18n"

export default function Tooltip(props: { direction?: string; for: string }) {
  const merged = mergeProps({ direction: "top" }, props)
  const [t] = useI18n()
  return (
    <div
      class={`z-36 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity ease-in bg-black px-2 py-1 text-xs text-gray-100 rounded-md absolute -right-2 ${
        merged.direction
      }-0 flex flex-col items-start translate-x-full ${
        merged.direction === "bottom" ? "" : "-"
      }translate-y-full`}
    >
      <span class="whitespace-nowrap font-bold">
        {t(`tooltip.${props.for}.main`)}
      </span>
      <p class="whitespace-nowrap text-gray-300">
        {t(`tooltip.${props.for}.sub`)}
      </p>
    </div>
  )
}
