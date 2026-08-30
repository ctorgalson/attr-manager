/**
 * Tests for BhAttrManager - Initialization & State Capture
 */
import { describe, expect, it } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/bh-attrmanager";
import { buildTestDom, createManager, setup } from "./fixtures";

setup();

describe("BhAttrManager - Initialization & State Capture", () => {
  it("captures original DOM attribute values before applying updates", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "0");

    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
        tabindex: {
          whenTrue: "0",
          whenFalse: "-1",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    // DOM was updated to initial state
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");

    // Restore should revert to original captured values
    const restorer = restorers[0];
    restorer?.restore();

    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("captures absent (null) attributes and preserves them on restore", () => {
    const [el] = buildTestDom();
    // Attribute never set — el.getAttribute returns null

    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    expect(el.getAttribute("aria-hidden")).toBe("false");

    restorers[0]?.restore();

    // Original was null — restore leaves it absent
    expect(el.getAttribute("aria-hidden")).toBe(null);
  });

  it("applies `initial: 'whenTrue'` immediately on instantiation", () => {
    const [el] = buildTestDom();
    createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    expect(el.getAttribute("aria-hidden")).toBe("false");
  });

  it("applies `initial: 'whenFalse'` immediately on instantiation", () => {
    const [el] = buildTestDom();
    createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenFalse",
      },
    });

    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies `whenFalse` at construction when `initial: null` is specified", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "original");

    createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: null,
      },
    });

    // initial: null applies whenFalse ("true"), not the DOM original
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("defaults `whenFalse` to original DOM value when omitted", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "custom");

    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          // whenFalse omitted
          initial: "whenFalse",
        },
      },
      restorers,
    );

    expect(el.getAttribute("aria-hidden")).toBe("custom");

    // Toggle to true
    const restorer = restorers[0];
    restorer?.restore();

    expect(el.getAttribute("aria-hidden")).toBe("custom");
  });

  it("preserves `whenFalse: null` to remove attribute on false", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: null,
        initial: "whenTrue",
      },
    });

    expect(el.getAttribute("aria-hidden")).toBe("false");

    // Toggle to false - should remove attribute
    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe(null);
  });

  it("registers restorer callback when `restorers` array is provided", () => {
    const [el] = buildTestDom();
    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(el, {}, restorers);

    expect(restorers.length).toBe(1);
    expect(restorers[0]?.restore).toBeDefined();
  });

  it("instantiates gracefully without errors when `restorers` is omitted", () => {
    const [el] = buildTestDom();

    expect(() => {
      createManager(el, {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenFalse",
        },
      });
    }).not.toThrow();
  });

  it("throws error if `whenTrue` is missing from config", () => {
    const [el] = buildTestDom();

    expect(() => {
      createManager(el, {
        // whenTrue omitted
        "aria-hidden": {
          whenFalse: "true",
          initial: "whenFalse",
        },
      });
    }).toThrow("must supply a `whenTrue` value");
  });

  it("throws error if `initial` is invalid", () => {
    const [el] = buildTestDom();

    expect(() => {
      createManager(el, {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          // invalid initial
          initial: "invalid" as any,
        },
      });
    }).toThrow("must be one of `whenTrue`, `whenFalse`, or `null`");
  });
});
