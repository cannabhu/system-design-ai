import { cn } from "@/lib/utils";
import type { CanvasNodeShape } from "@/types/canvas";

interface NodeShapeProps {
  shape: CanvasNodeShape;
  fill: string;
  textColor: string;
  selected?: boolean;
  children?: React.ReactNode;
}

const CSS_SHAPE_CLASSES: Partial<Record<CanvasNodeShape, string>> = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};

// Drawn in a 100x100 viewBox and stretched to the node size.
const SVG_SHAPE_PATHS: Partial<Record<CanvasNodeShape, string[]>> = {
  diamond: ["M50 1 L99 50 L50 99 L1 50 Z"],
  hexagon: ["M25 1 L75 1 L99 50 L75 99 L25 99 L1 50 Z"],
  cylinder: [
    "M1 12 A49 11 0 0 1 99 12 V88 A49 11 0 0 1 1 88 Z",
    "M1 12 A49 11 0 0 0 99 12",
  ],
};

export function NodeShape({
  shape,
  fill,
  textColor,
  selected = false,
  children,
}: NodeShapeProps) {
  const paths = SVG_SHAPE_PATHS[shape];
  const label = (
    <span className="relative px-3 text-center text-sm">{children}</span>
  );

  if (paths) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ color: textColor }}
      >
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {paths.map((d, index) => (
            <path
              key={d}
              d={d}
              fill={index === 0 ? fill : "none"}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className={cn(
                "transition-colors",
                selected ? "stroke-brand" : "stroke-surface-border",
              )}
            />
          ))}
        </svg>
        {label}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center border transition-colors",
        CSS_SHAPE_CLASSES[shape],
        selected ? "border-brand" : "border-surface-border",
      )}
      style={{ backgroundColor: fill, color: textColor }}
    >
      {label}
    </div>
  );
}
