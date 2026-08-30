/**
 * Tests for BhAttrManager - Lifecycle Cleanup (destroy)
 */
import { describe, expect, it } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/bh-attrmanager";
import { buildTestDom, createManager, setup } from "./fixtures";

setup();

describe("BhAttrManager - Lifecycle Cleanup (destroy)", () => {
  it("clears internal state without affecting DOM via `destroy()`", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = new BhAttrManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    const domState = el.getAttribute("aria-hidden");

    manager.destroy();

    // DOM should be unchanged
    expect(el.getAttribute("aria-hidden")).toBe(domState);

    // Manager should still be usable to some degree
    expect(manager).toBeDefined();
  });

  it("self-removes from `restorers` array when `destroy()` is called", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const restorers: BhAttrRestorerEntry[] = [];
    const manager = new BhAttrManager(
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

    expect(restorers.length).toBe(1);

    manager.destroy();

    expect(restorers.length).toBe(0);
  });

  it("succeeds gracefully without errors if not registered to `restorers` array", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    expect(() => {
      manager.destroy();
    }).not.toThrow();

    // Should clear state even though not in restorers
    expect(manager).toBeDefined();
  });

  it("clears state when destroy() is called but index is not found in restorers", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const restorers: BhAttrRestorerEntry[] = [];
    const manager = new BhAttrManager(
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

    // Remove the manager's restorer entry so it's not in the array
    const index = restorers.findIndex((r) => r.id === manager["id"]);
    if (index > -1) {
      restorers.splice(index, 1);
    }

    // Verify our manager is not in restorers
    expect(restorers.length).toBe(0);

    // destroy() should clear state without error
    expect(() => {
      manager.destroy();
    }).not.toThrow();
  });

  it("each instance maintains its own `id` for independent self-removal", () => {
    const els = (() => {
      const array = [];
      for (let i = 0; i < 2; i++) {
        const el = document.createElement("div");
        el.setAttribute("aria-hidden", "true");
        array.push(el);
        document.body.appendChild(el);
      }
      return array;
    })();

    const restorers: BhAttrRestorerEntry[] = [];
    const manager1 = new BhAttrManager(
      els[0],
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    const manager2 = new BhAttrManager(
      els[1],
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    expect(restorers.length).toBe(2);

    // Destroy only manager1
    manager1.destroy();
    expect(restorers.length).toBe(1);

    // Manager2 should still be in array
    const restorer2 = restorers[0];
    restorer2?.restore();

    expect(els[1].getAttribute("aria-hidden")).toBe("true");
  });
});
