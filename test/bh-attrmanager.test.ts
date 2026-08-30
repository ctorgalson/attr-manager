import { describe, expect, it, vi } from "vitest";
import BhAttrManager, { BhAttrRestorerEntry } from "../src/bh-attrmanager";
import { buildTestDom, setup } from "./fixtures";

setup();

describe("manages create, set, toggle, restore attribute lifecycle", () => {
  it("can set initial 'active' attribute values on element", () => {
    const [el] = buildTestDom();
    const restorers: BhAttrRestorerEntry[] = [];
    const setAttributeSpy = vi.spyOn(el, "setAttribute");
    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
        tabindex: { whenTrue: "0", whenFalse: "-1", initial: "whenTrue" },
      },
      restorers,
    );
    expect(setAttributeSpy).toHaveBeenCalledTimes(2);
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("can set initial 'inactive' attribute values on element", () => {
    const [el] = buildTestDom();
    const restorers: BhAttrRestorerEntry[] = [];
    const setAttributeSpy = vi.spyOn(el, "setAttribute");
    new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenFalse",
        },
        tabindex: { whenTrue: "0", whenFalse: "-1", initial: "whenFalse" },
      },
      restorers,
    );
    expect(setAttributeSpy).toHaveBeenCalledTimes(2);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("can toggle 'active' and 'inactive' attribute values", () => {
    const [el] = buildTestDom();
    const restorers: BhAttrRestorerEntry[] = [];
    const a = new BhAttrManager(
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
    const b = new BhAttrManager(
      el,
      {
        tabindex: { whenTrue: "0", whenFalse: "-1", initial: "whenFalse" },
      },
      restorers,
    );
    a.toggle(true);
    b.toggle(true);
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");
    a.toggle(false);
    b.toggle(false);
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("can restore its own original attribute states via direct call to restore()", () => {
    const [el] = buildTestDom();
    const restorers: BhAttrRestorerEntry[] = [];
    const a = new BhAttrManager(
      el,
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
        tabindex: { whenTrue: "0", whenFalse: "-1", initial: "whenTrue" },
      },
      restorers,
    );
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("tabindex")).toBe("0");
    a.restore();
    expect(el.getAttribute("aria-hidden")).toBe(null);
    expect(el.getAttribute("tabindex")).toBe(null);
  });

  it("can restore original attribute states across multiple elements", () => {
    const els = buildTestDom(3);
    els[1].setAttribute("aria-busy", "true");
    const restorers: BhAttrRestorerEntry[] = [];
    new BhAttrManager(
      els[0],
      {
        "aria-hidden": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenFalse",
        },
        tabindex: { whenTrue: "0", whenFalse: "-1", initial: "whenFalse" },
      },
      restorers,
    );
    new BhAttrManager(
      els[1],
      {
        "aria-busy": {
          whenTrue: "false",
          whenFalse: "true",
          initial: "whenTrue",
        },
      },
      restorers,
    );

    // Test that the initial states were correctly altered.
    expect(els[0].getAttribute("aria-hidden")).toBe("true");
    expect(els[0].getAttribute("tabindex")).toBe("-1");
    expect(els[1].getAttribute("aria-busy")).toBe("false");

    // Run restorers.
    restorers.forEach(({ restore }) => restore());

    // Test that resulting states match the originals.
    expect(els[0].getAttribute("aria-hidden")).toBe(null);
    expect(els[0].getAttribute("tabindex")).toBe(null);
    expect(els[1].getAttribute("aria-busy")).toBe("true");
  });
});
