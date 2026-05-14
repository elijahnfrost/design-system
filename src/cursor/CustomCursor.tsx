"use client";

import { useEffect, useRef, useState } from "react";
import {
  CURSOR_ARROW_CX,
  CURSOR_ARROW_CY,
  CURSOR_ARROW_VIEWBOX,
  CursorArrowIcon,
} from "./cursor-icon.js";

function hasTextSelection(): boolean {
  if (typeof document === "undefined") return false;
  const s = document.getSelection();
  if (!s || s.rangeCount === 0) return false;
  return !s.isCollapsed;
}

function cursorKeywords(cursor: string): string[] {
  return cursor.split(",").map((s) => {
    const t = s.trim();
    const withoutUrl = t.replace(/url\([^)]+\)\s*(\d+\s*(,\s*\d+)?\s*)?/gi, "").trim();
    return withoutUrl.split(/\s+/)[0] ?? "";
  });
}

function keywordIsInteractivePointer(key: string): boolean {
  return (
    key === "pointer" ||
    key === "grab" ||
    key === "grabbing" ||
    key === "zoom-in" ||
    key === "zoom-out" ||
    key === "alias" ||
    key === "copy" ||
    key === "cell" ||
    key === "context-menu" ||
    key === "help" ||
    key === "move" ||
    key === "col-resize" ||
    key === "row-resize" ||
    key === "ew-resize" ||
    key === "ns-resize" ||
    key === "nesw-resize" ||
    key === "nwse-resize" ||
    key === "n-resize" ||
    key === "e-resize" ||
    key === "s-resize" ||
    key === "w-resize" ||
    key === "ne-resize" ||
    key === "nw-resize" ||
    key === "se-resize" ||
    key === "sw-resize"
  );
}

function isInteractiveTarget(from: Element | null): boolean {
  let el: Element | null = from;
  while (el && el !== document.documentElement) {
    const c = getComputedStyle(el).cursor;
    const keys = cursorKeywords(c);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      if (!key || key === "auto") continue;
      if (keywordIsInteractivePointer(key)) return true;
    }

    const tag = el.tagName;
    if (tag === "A" && (el as HTMLAnchorElement).href) return true;
    if (tag === "BUTTON" || tag === "SUMMARY") return true;
    if (tag === "SELECT") return true;
    if (tag === "INPUT") {
      const type = (el as HTMLInputElement).type?.toLowerCase() ?? "text";
      if (
        type === "submit" ||
        type === "button" ||
        type === "reset" ||
        type === "checkbox" ||
        type === "radio" ||
        type === "file" ||
        type === "color" ||
        type === "range" ||
        type === "date"
      ) {
        return true;
      }
    }
    const role = el.getAttribute("role");
    if (role === "button" || role === "link" || role === "tab") return true;
    if (el.getAttribute("tabindex") === "0" && role !== "presentation") return true;

    el = el.parentElement;
  }
  return false;
}

function useCustomCursorEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const update = () => {
      setEnabled(!mqReduce.matches && !mqCoarse.matches);
    };
    update();
    mqReduce.addEventListener("change", update);
    mqCoarse.addEventListener("change", update);
    return () => {
      mqReduce.removeEventListener("change", update);
      mqCoarse.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

/** Resting scale — slightly larger than 1 so the arrow has presence on screen. */
const SCALE_BASE = 1.12;
/** Multiplied on top of base when hovering an interactive target. */
const SCALE_HOVER_MULT = 1.14;
/** Multiplied on top when the user is pressing or selecting text. */
const SCALE_ENGAGED_MULT = 1.08;

function combinedScale(hover: boolean, engaged: boolean): number {
  return SCALE_BASE * (hover ? SCALE_HOVER_MULT : 1) * (engaged ? SCALE_ENGAGED_MULT : 1);
}

/**
 * Custom cursor — replaces the system pointer with a themed arrow.
 *
 * Activates only when (pointer: coarse) is false AND
 * (prefers-reduced-motion: reduce) is false. On touch devices and reduced
 * motion the OS cursor is left untouched and this component renders nothing.
 *
 * Pair with `cursor.css` so the system pointer is hidden while this is mounted.
 */
export function CustomCursor() {
  const enabled = useCustomCursorEnabled();
  const shellRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const buttonsRef = useRef(0);
  const engagedRef = useRef(false);
  const hoverRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.dataset.cursorCustom = "";

    const applyPosition = (x: number, y: number) => {
      const shell = shellRef.current;
      if (!shell) return;
      shell.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const applyScale = () => {
      const scaleEl = scaleRef.current;
      if (!scaleEl) return;
      const s = combinedScale(hoverRef.current, engagedRef.current);
      scaleEl.style.transform = `scale(${s})`;
      scaleEl.style.transformOrigin = `${CURSOR_ARROW_CX}px ${CURSOR_ARROW_CY}px`;
    };

    const syncEngaged = () => {
      engagedRef.current = buttonsRef.current !== 0 || hasTextSelection();
      applyScale();
    };

    const syncHover = (clientX: number, clientY: number) => {
      const hit = document.elementFromPoint(clientX, clientY);
      hoverRef.current = isInteractiveTarget(hit);
      applyScale();
    };

    let rafId = 0;
    /** Higher = less smoothing / tighter follow (0–1 per frame). */
    const lerp = 0.45;
    let snapped = false;

    const tick = () => {
      const t = targetRef.current;
      const p = posRef.current;
      p.x += (t.x - p.x) * lerp;
      p.y += (t.y - p.y) * lerp;
      applyPosition(p.x, p.y);
      rafId = requestAnimationFrame(tick);
    };

    const hide = () => setVisible(false);

    const isInsideViewport = (clientX: number, clientY: number) =>
      clientX >= 0 &&
      clientY >= 0 &&
      clientX < window.innerWidth &&
      clientY < window.innerHeight;

    const onMove = (e: MouseEvent) => {
      if (!isInsideViewport(e.clientX, e.clientY)) {
        hide();
        return;
      }
      if (!snapped) {
        snapped = true;
        posRef.current.x = e.clientX;
        posRef.current.y = e.clientY;
        applyPosition(e.clientX, e.clientY);
      }
      buttonsRef.current = e.buttons;
      syncEngaged();
      syncHover(e.clientX, e.clientY);
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      setVisible(true);
    };

    const onButtons = (e: MouseEvent) => {
      buttonsRef.current = e.buttons;
      syncEngaged();
    };

    const onSelectionChange = () => {
      syncEngaged();
    };

    const onLeaveDocument = () => hide();
    const onBlur = () => hide();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hide();
    };

    rafId = requestAnimationFrame(tick);

    const htmlEl = document.documentElement;
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onButtons, { passive: true });
    window.addEventListener("mouseup", onButtons, { passive: true });
    window.addEventListener("blur", onBlur);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("visibilitychange", onVisibility);
    htmlEl.addEventListener("mouseleave", onLeaveDocument);
    return () => {
      cancelAnimationFrame(rafId);
      delete root.dataset.cursorCustom;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onButtons);
      window.removeEventListener("mouseup", onButtons);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      htmlEl.removeEventListener("mouseleave", onLeaveDocument);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !shellRef.current || !scaleRef.current) return;
    shellRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    const s = combinedScale(hoverRef.current, engagedRef.current);
    scaleRef.current.style.transform = `scale(${s})`;
    scaleRef.current.style.transformOrigin = `${CURSOR_ARROW_CX}px ${CURSOR_ARROW_CY}px`;
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={shellRef}
      data-cursor-root
      aria-hidden
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        cursor: "none",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        transition: "opacity 0.06s ease-out",
      }}
    >
      <div
        ref={scaleRef}
        style={{
          transformOrigin: `${CURSOR_ARROW_CX}px ${CURSOR_ARROW_CY}px`,
          transition: "transform 0.1s var(--ease-out-quart, cubic-bezier(0.22, 1, 0.36, 1))",
        }}
      >
        <CursorArrowIcon
          size={CURSOR_ARROW_VIEWBOX}
          aria-hidden
          style={{ overflow: "visible" }}
        />
      </div>
    </div>
  );
}
