/**
 * Test fixtures for BhAttrManager.
 */

import { afterEach } from "vitest";
import BhAttrManager from "../src/attr-manager";

/**
 * Build test DOM elements.
 *
 * @param nodes
 *   Number of div elements to create. Default: 1.
 * @returns Array of created DOM elements.
 */
export const buildTestDom = (nodes = 1): HTMLElement[] => {
  const els = [];
  for (let i = 0; i < nodes; i++) {
    const el = document.createElement("div");
    els.push(el);
    document.body.appendChild(el);
  }
  return els;
};

/**
 * Set up a teardown cleanup for each test.
 */
export const setup = () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });
};

/**
 * Create a new BhAttrManager with the given configuration.
 *
 * @param el
 *   The HTMLElement to manage.
 * @param config
 *   The attribute configuration.
 * @param options
 *   Optional settings.
 * @param options.withRestorers
 *   If `true`, create and manage an internal restorer array. Default: `true`.
 * @returns The created BhAttrManager instance.
 */
export const createManager = <El extends HTMLElement = HTMLElement>(
  el: El,
  config: Record<string, any>,
  options?: { withRestorers?: boolean },
): BhAttrManager => {
  const withRestorers = options?.withRestorers ?? true;
  return new BhAttrManager(el, config, withRestorers ? [] : undefined);
};
