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
  const { openPane, rightToggleRef, isRightOpen, closePane } =
    useSwipePaneContext();

  if (!showToggle) return null;

  return (
    // 1px wide container
    <div
      ref={rightToggleRef}
      style={{
        ...toggleWrapperStyle,
        transition: `transform ${options.transitionMs}ms ease, opacity ${options.transitionMs}ms ease`,
        right: 0,
      }}
    >
      {(!isRightOpen || (isRightOpen && !options.showOverlay)) && (
        <button
          type="button"
          onClick={() => (isRightOpen ? closePane("right") : openPane("right"))}
          style={{
            marginRight: `${options.toggleIconEdgeDistancePx}px`,
            // reverse because we are using the same icon for both left and right
            ...(!isRightOpen ? { transform: "rotate(180deg)" } : {}),
          }}
        >
          {ToggleComponent ?? (
            <ToggleIcon
              size={options.toggleIconSizePx}
              color={options.toggleIconColor}
            />
          )}
        </button>
      )}
    </div>
  );
}
