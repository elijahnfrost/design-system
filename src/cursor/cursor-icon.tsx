import type { SVGProps } from "react";

/** Symmetry axis: angle from +x (SVG, y down), clockwise toward +y. */
export const CURSOR_ARROW_AXIS_DEG = 65;

const RAD = (CURSOR_ARROW_AXIS_DEG * Math.PI) / 180;

/** Distance from tip to base-center along the symmetry axis. */
export const CURSOR_ARROW_DEPTH = 20.5;
/** Half-width of the back (perpendicular to axis). */
export const CURSOR_ARROW_HALF_WIDTH = 7.25;
/** How far the notch moves inward from base-center toward the tip along the axis. */
export const CURSOR_ARROW_NOTCH_IN = 2.75;
/** SVG canvas — slightly larger than the geometry so the stroke isn't clipped. */
export const CURSOR_ARROW_VIEWBOX = 30;
/** Stroke painted in --cursor-stroke (page bg by default) for a subtle rim. */
export const CURSOR_ARROW_STROKE_WIDTH = 1.35;

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function buildGeometry() {
  const ux = Math.cos(RAD);
  const uy = Math.sin(RAD);
  const px = -Math.sin(RAD);
  const py = Math.cos(RAD);

  const Cx = CURSOR_ARROW_DEPTH * ux;
  const Cy = CURSOR_ARROW_DEPTH * uy;

  const L1x = round3(Cx + CURSOR_ARROW_HALF_WIDTH * px);
  const L1y = round3(Cy + CURSOR_ARROW_HALF_WIDTH * py);
  const L2x = round3(Cx - CURSOR_ARROW_HALF_WIDTH * px);
  const L2y = round3(Cy - CURSOR_ARROW_HALF_WIDTH * py);

  const Nx = round3(Cx - CURSOR_ARROW_NOTCH_IN * ux);
  const Ny = round3(Cy - CURSOR_ARROW_NOTCH_IN * uy);

  // Single closed path with a sharp notch — straight L1 → N → L2.
  const path = `M0 0 L${L1x} ${L1y} L${Nx} ${Ny} L${L2x} ${L2y} Z`;

  const verts = [
    [0, 0],
    [L1x, L1y],
    [Nx, Ny],
    [L2x, L2y],
  ] as const;

  return { path, verts };
}

const { path: CURSOR_ARROW_PATH_BUILT, verts: CURSOR_ARROW_VERTS_TUPLE } = buildGeometry();

export const CURSOR_ARROW_PATH = CURSOR_ARROW_PATH_BUILT;

export const CURSOR_ARROW_VERTS = CURSOR_ARROW_VERTS_TUPLE as readonly [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

const cx = CURSOR_ARROW_VERTS.reduce((s, v) => s + v[0], 0) / CURSOR_ARROW_VERTS.length;
const cy = CURSOR_ARROW_VERTS.reduce((s, v) => s + v[1], 0) / CURSOR_ARROW_VERTS.length;

/** Scale origin (centroid of vertices) — used by the press/hover tween. */
export const CURSOR_ARROW_CX = cx;
export const CURSOR_ARROW_CY = cy;

type CursorArrowIconProps = {
  size?: number;
} & Omit<SVGProps<SVGSVGElement>, "viewBox" | "children">;

export function CursorArrowIcon({ size = CURSOR_ARROW_VIEWBOX, className, ...rest }: CursorArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${CURSOR_ARROW_VIEWBOX} ${CURSOR_ARROW_VIEWBOX}`}
      fill="none"
      className={className}
      shapeRendering="geometricPrecision"
      {...rest}
    >
      <path d={CURSOR_ARROW_PATH} fill="var(--cursor-arrow-fill)" stroke="none" />
      <path
        d={CURSOR_ARROW_PATH}
        fill="none"
        stroke="var(--cursor-stroke)"
        strokeWidth={CURSOR_ARROW_STROKE_WIDTH}
        strokeLinejoin="miter"
        strokeMiterlimit={2.75}
      />
    </svg>
  );
}
