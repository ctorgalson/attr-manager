/**
 * Tests for BhAttrManager - Edge Cases
 */
import { describe, expect, it } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/attr-manager";
import { buildTestDom, createManager, setup } from "./fixtures";

setup();

describe("BhAttrManager - Edge Cases", () => {
  it("handles boolean attributes that toggle presence/absence", () => {
    const [el] = buildTestDom();
    el.setAttribute("hidden", "custom");

    const manager = new BhAttrManager(el, {
      hidden: {
        whenTrue: "custom",
        whenFalse: null,
        initial: "whenTrue",
      },
    });

    // Present with value
    expect(el.getAttribute("hidden")).toBe("custom");

    // Toggle to false - should remove
    manager.toggle(false);
    expect(el.getAttribute("hidden")).toBe(null);

    // Toggle back to true - should add with value
    manager.toggle(true);
    expect(el.getAttribute("hidden")).toBe("custom");
  });

  it("multiple managers per element operate independently", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "0");

    const restorers: BhAttrRestorerEntry[] = [];

    const manager1 = new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenFalse",
        },
      },
      restorers,
    );

    const manager2 = new BhAttrManager(
      el,
      {
        tabindex: {
          whenTrue: "0",
          whenFalse: "-1",
          initial: "whenFalse",
        },
      },
      restorers,
    );

    // Both managers should work independently
    manager1.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");

    manager2.toggle(false);
    expect(el.getAttribute("tabindex")).toBe("-1");

    // Toggle manager1 back
    manager1.toggle(true);
    expect(el.getAttribute("aria-hidden")).toBe("false");
    // manager2 should be unchanged
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("restorer entries have correct `{ id: string, restore: () => void }` shape", () => {
    const [el] = buildTestDom();

    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(el, {}, restorers);

    const entry = restorers[0];
    expect(entry).toHaveProperty("id");
    expect(typeof entry.id).toBe("string");
    expect(entry).toHaveProperty("restore");
    expect(typeof entry.restore).toBe("function");
  });
});
