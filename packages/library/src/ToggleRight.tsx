import type { ReactNode } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type SwipeBarProps, toggleWrapperStyle } from "./swipePaneShared";
import { useSwipePaneContext } from "./useSwipePaneContext";

type ToggleProps = {
  showToggle?: boolean;
  ToggleComponent?: ReactNode;
  options: Required<SwipeBarProps>;
};

export function ToggleRight({
  options,
  showToggle = true,
  ToggleComponent,
}: ToggleProps) {
  const { openPane } = useSwipePaneContext();

  if (!showToggle) return null;

  if (ToggleComponent) {
    return (
      <div style={{ zIndex: toggleWrapperStyle.zIndex }}>{ToggleComponent}</div>
    );
  }

  return (
    // 1px wide container
    <div
      style={{
        ...toggleWrapperStyle,
        right: 0,
      }}
    >
      <button
        type="button"
        onClick={() => openPane("right")}
        style={{
          marginRight: `${options.toggleIconEdgeDistancePx}px`,
          transform: "rotate(180deg)",
        }}
      >
        <ToggleIcon
          size={options.toggleIconSizePx}
          color={options.toggleIconColor}
        />
      </button>
    </div>
  );
}
