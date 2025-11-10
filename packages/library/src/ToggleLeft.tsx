import type { ReactNode } from "react";
import { ToggleIcon } from "./components/ToggleIcon";
import { type SwipeBarProps, toggleWrapperStyle } from "./swipePaneShared";
import { useSwipePaneContext } from "./useSwipePaneContext";

type ToggleProps = {
  showToggle?: boolean;
  ToggleComponent?: ReactNode;
  options: Required<SwipeBarProps>;
};

export function ToggleLeft({
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
    <div
      style={{
        ...toggleWrapperStyle,
        left: 0,
      }}
    >
      <button
        type="button"
        onClick={() => openPane("left")}
        style={{
          marginLeft: `${options.toggleIconEdgeDistancePx}px`,
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
