/**
 * A type used to define possible values for AttrConfig's `initial` prop.
 */
export type AttrInitialValue = "whenTrue" | "whenFalse" | null;

/**
 * A type used to define the config option used by the constructor.
 */
export type AttrConfig = Record<
  string,
  {
    /** The value set for an attribute when currentState is `true`. */
    whenTrue: string | null;
    /** The value set for an attribute when currentState is `false`. */
    whenFalse?: string | null;
    /** The value set for an attribute in the constructor. */
    initial?: AttrInitialValue;
    /** Whether this attribute will be ignored by `.toggle()`. */
    fixed?: boolean;
  }
>;

/**
 * An internal type: guarantees `falseValue` is never undefined.
 */
export interface NormalizedAttr {
  /** The value set for an attribute when currentState is `true`. */
  trueValue: string | null;
  /** The value set for an attribute when currentState is `false`. */
  falseValue: string | null;
  /** The name of the attribute under management. */
  name: string;
  /** Whether this attribute will be ignored by `.toggle()`. */
  fixed: boolean;
}

/**
 * An entry in the `restorers` array.
 */
export interface RestorerEntry {
  /** Unique ID for self-removal. */
  id: string;
  /** Restore method. */
  restore: () => void;
}

/**
 * A class used to create and/or enforce HTMLElement attribute values.
 */
export default class AttrManager {
  /** Unique ID for self-removal from `restorers` array. */
  private readonly id: string;
  /** An array of the attributes under management in NormalizedAttr form. */
  private items: NormalizedAttr[] = [];
  /** An array of the attribute values (used to restore initial DOM state). */
  private original: [string, string | null][] = [];
  /** A var used to track the state of the attributes under management. */
  private currentState: boolean = false;
  /** Optional reference to the restorer array for self-removal. */
  private readonly restorers?: RestorerEntry[];

  /**
   * Generates a unique ID for this instance.
   */
  private static createId(): string {
    return Math.random().toString(36).slice(2, 7);
  }

  /**
   * Constructs a new AttrManager instance.
   *
   * @param el
   *   The HTMLElement to manage.
   * @param config
   *   The attribute configuration.
   * @param restorers
   *   Optional restorer array for lifecycle management.
   */
  constructor(
    private readonly el: HTMLElement,
    config: AttrConfig,
    restorers?: RestorerEntry[],
  ) {
    let hasExplicitInitial = false;

    // Generate unique ID for self-removal from restorers
    this.id = AttrManager.createId();

    for (const [
      name,
      { whenTrue: trueValue, whenFalse, initial, fixed },
    ] of Object.entries(config)) {
      if (trueValue === undefined) {
        throw new Error(
          "AttrManager: each attribute must supply a `whenTrue` value.",
        );
      }

      if (
        initial !== undefined &&
        !["whenTrue", "whenFalse", null].includes(initial)
      ) {
        throw new Error(
          "AttrManager: if attributes supply an `initial` value, it must be one of `whenTrue`, `whenFalse`, or `null`.",
        );
      }

      const originalVal = el.getAttribute(name);
      this.original.push([name, originalVal]);

      const falseValue = whenFalse !== undefined ? whenFalse : originalVal;
      this.items.push({ name, trueValue, falseValue, fixed: !!fixed });

      if (initial !== undefined) {
        this.applyValue(name, initial === "whenTrue" ? trueValue : falseValue);
        if (!hasExplicitInitial) {
          this.currentState = initial === "whenTrue";
          hasExplicitInitial = true;
        }
      }
    }

    // Register restorer with ID for self-removal
    if (restorers) {
      this.restorers = restorers;
      restorers.push({
        id: this.id,
        restore: () => this.restore(),
      });
    }
  }

  /**
   * Toggles state of attributes managed by this instance.
   *
   * @param condition
   *   The condition to set. If omitted, toggles the current state.
   */
  public toggle(condition?: boolean): void {
    this.currentState = condition ?? !this.currentState;
    for (const { name, trueValue, falseValue, fixed } of this.items) {
      if (fixed) {
        continue;
      }
      this.applyValue(name, this.currentState ? trueValue : falseValue);
    }
  }

  /**
   * Restores original state of attributes.
   *
   * @param teardown
   *   If `true` (default), also clears internal state and self-removes from
   *   `restorers`.
   */
  public restore(teardown: boolean = false): void {
    for (const [name, value] of this.original) {
      this.applyValue(name, value);
    }

    if (teardown) {
      this.destroy();
    }
  }

  /**
   * Clears internal state and self-removes from `restorers`.
   *
   * Use this to clean up state without affecting the DOM.
   */
  public destroy(): void {
    // Remove self from restorers if registered
    if (this.restorers) {
      const index = this.restorers.findIndex((r) => r.id === this.id);
      if (index > -1) {
        this.restorers.splice(index, 1);
      }
    }

    // Clear all state
    this.items = [];
    this.original = [];
    this.currentState = false;
  }

  /**
   * Handles actual DOM attribute manipulation for toggle(), restore().
   *
   * @param name
   *   The attribute name.
   * @param value
   *   The value to set. Pass `null` to remove the attribute.
   */
  private applyValue(name: string, value: string | null): void {
    if (this.el.getAttribute(name) === value) {
      return;
    }
    if (value === null) {
      this.el.removeAttribute(name);
    } else {
      this.el.setAttribute(name, value);
    }
  }
}
