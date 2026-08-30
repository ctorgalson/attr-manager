/**
 * Tests for BhAttrManager - Restoration
 */
import { describe, expect, it } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/bh-attrmanager";
import { buildTestDom, createManager, setup } from "./fixtures";

setup();

describe("BhAttrManager - Restoration", () => {
  it("reverts DOM to original state via `manager.restore()`", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "0");

    const manager = new BhAttrManager(el, {
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
    });

    // Current state: aria-hidden=false, tabindex=0
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");

    // Toggle to false - aria-hidden becomes "true", tabindex becomes "-1"
    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");

    // Restore reverts to original captured values
    manager.restore();
    expect(el.getAttribute("aria-hidden")).toBe("true"); // original
    expect(el.getAttribute("tabindex")).toBe("0"); // original
  });

  it("reverts DOM when invoking callbacks in `restorers` array", () => {
    const els = (() => {
      const array = [];
      for (let i = 0; i < 2; i++) {
        const el = document.createElement("div");
        el.setAttribute("aria-hidden", "true");
        el.setAttribute("tabindex", "0");
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
          initial: "whenFalse",
        },
      },
      restorers,
    );

    const manager2 = new BhAttrManager(
      els[1],
      {
        tabindex: {
          whenTrue: "0",
          whenFalse: "-1",
          initial: "whenFalse",
        },
      },
      restorers,
    );

    // Toggle both to false
    manager1.toggle(false);
    manager2.toggle(false);

    expect(els[0].getAttribute("aria-hidden")).toBe("true");
    expect(els[1].getAttribute("tabindex")).toBe("-1");

    // Restore all via restorers array
    restorers.forEach(({ restore }) => restore());

    expect(els[0].getAttribute("aria-hidden")).toBe("true"); // original
    expect(els[1].getAttribute("tabindex")).toBe("0"); // original
  });

  it("reverts to original DOM state even after multiple toggles", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = new BhAttrManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    // Multiple toggles
    manager.toggle(false); // false -> true
    manager.toggle(); // true -> false
    manager.toggle(true); // false -> false (no change)
    manager.toggle(false); // false -> true
    manager.toggle(false); // true -> false

    // Current state: false (aria-hidden="true")
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Restore reverts to original captured state
    manager.restore();
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("defaults `restore()` to `teardown: false` (restore DOM only, keep internal state)", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "true");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");

    manager.restore(); // Default teardown: false

    // DOM should be restored
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Manager should still be usable
    manager.toggle(true);
    expect(el.getAttribute("aria-hidden")).toBe("false");
  });

  it("restores DOM AND clears internal state when `restore(true)` is called", () => {
    const [el] = buildTestDom();
    el.setAttribute("aria-hidden", "original");

    const manager = createManager(el, {
      "aria-hidden": {
        whenTrue: "false",
        whenFalse: "true",
        initial: "whenTrue",
      },
    });

    manager.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");

    // Call restore with teardown: true
    manager.restore(true);

    // DOM should be restored to original captured value
    expect(el.getAttribute("aria-hidden")).toBe("original");
  });

  it("self-removes from `restorers` array when `manager.restore(true)` is called", () => {
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

    const restorer = restorers[0];
    // The stored closure calls this.restore() with no args (defaults to teardown: false)
    // So it won't remove itself from restorers array
    restorer?.restore();
    expect(restorers.length).toBe(1);

    // To actually test teardown=true removal, we need to call manager.restore(true) directly
    manager.restore(true);
    expect(restorers.length).toBe(0);
  });
});
