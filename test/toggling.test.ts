/**
 * Tests for BhAttrManager - Toggling Logic
 */
import { describe, expect, it, vi } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/attr-manager";
import { buildTestDom, createManager, setup } from "./fixtures";

setup();

describe("BhAttrManager - Toggling Logic", () => {
  it("sets `whenTrue` on `toggle(true)` and `whenFalse` on `toggle(false)`", () => {
    const [el] = buildTestDom();
    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenFalse",
      },
    });

    manager.toggle(true);
    expect(el.getAttribute("aria-hidden")).toBe("false");

    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("flips `currentState` automatically across consecutive `toggle()` calls", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    expect(el.getAttribute("aria-hidden")).toBe("false");

    // First toggle - flip to false
    manager.toggle();
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Second toggle - flip back to true
    manager.toggle();
    expect(el.getAttribute("aria-hidden")).toBe("false");

    // Third toggle - flip to false again
    manager.toggle();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("handles interleaved explicit and zero-argument toggles", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenFalse",
      },
    });

    // Start at false (aria-hidden="true")
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Explicit true
    manager.toggle(true);
    expect(el.getAttribute("aria-hidden")).toBe("false");

    // Zero-argument toggle flips to false
    manager.toggle();
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Explicit false
    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Zero-argument toggle flips to true
    manager.toggle();
    expect(el.getAttribute("aria-hidden")).toBe("false");
  });

  it("removes attribute when target value is `null`", () => {
    const [el] = buildTestDom();
    el.setAttribute("hidden", "custom");

    const manager = createManager(el, {
      hidden: {
        whenTrue: "custom",
        whenFalse: null,
        initial: "whenTrue",
      },
    });

    expect(el.getAttribute("hidden")).toBe("custom");

    manager.toggle(false);
    expect(el.getAttribute("hidden")).toBe(null);
  });

  it("skips DOM mutations if element already has target value", () => {
    const [el] = buildTestDom();

    const setAttributeSpy = vi.spyOn(el, "setAttribute");

    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
      },
    );

    // Initial setup set the attribute
    expect(setAttributeSpy).toHaveBeenCalledTimes(1);
    expect(el.getAttribute("aria-hidden")).toBe("false");

    // Clear the spy
    setAttributeSpy.mockClear();

    // Toggle to the same state should NOT re-set
    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });
    manager.toggle(true);

    expect(setAttributeSpy).not.toHaveBeenCalled();
  });

  it("ignores `fixed: true` attributes during toggle but applies initial and restore", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "original");
    el.setAttribute("tabindex", "5");

    const restorers: BhAttrRestorerEntry[] = [];
    const manager = new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
          fixed: true,
        },
        tabindex: {
          whenTrue: "0",
          whenFalse: "-1",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    // Initial state: aria-hidden should be false, tabindex should be 0
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");

    // Toggle - aria-hidden should NOT change (fixed), tabindex should change
    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("false"); // unchanged
    expect(el.getAttribute("tabindex")).toBe("-1"); // changed

    // Restore - both should revert to original captured values
    const restorer = restorers[0];
    restorer?.restore();

    // aria-hidden was originally "original", tabindex was originally "5"
    expect(el.getAttribute("aria-hidden")).toBe("original");
    expect(el.getAttribute("tabindex")).toBe("5");
  });
});
