import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QuickSettings = () => {
  const toggleComponentCode = `import { CustomToggle } from "./CustomToggle";

// ToggleComponent is only available on SwipeBarLeft and SwipeBarRight
<SwipeBarLeft ToggleComponent={<CustomToggle />}>
  {/* sidebar content */}
</SwipeBarLeft>

// Or pass undefined to use the default toggle
<SwipeBarRight ToggleComponent={undefined}>
  {/* sidebar content */}
</SwipeBarRight>`;

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl text-white md:col-span-2">
      <h2 className="text-xl font-semibold mb-4">Custom Toggle Component</h2>
      <p className="text-white/70 text-sm mb-4">
        The ToggleComponent prop is only available on SwipeBarLeft and
        SwipeBarRight components. Use it to replace the default toggle button
        with your own custom component.
      </p>

      <div className="rounded-lg border border-white/10 bg-black/20 overflow-hidden">
        <div className="px-3 py-2 text-xs text-emerald-300/90 font-medium border-b border-white/10">
          Custom Toggle Example
        </div>
        <SyntaxHighlighter
          language="typescript"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "0.75rem",
            background: "transparent",
            fontSize: "0.75rem",
            lineHeight: "1.5",
          }}
          codeTagProps={{
            style: {
              fontFamily: "ui-monospace, monospace",
            },
          }}
        >
          {toggleComponentCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

