/** A type used to define possible values for BhAttrConfig's `inital` prop. */
export type BhAttrInitialValue = "whenTrue" | "whenFalse";

/** A type used to define the config option used by the constructor. */
export type BhAttrConfig = Record<
  string,
  {
    /** The value set for an attribute when currentState is `true`. */
    whenTrue: string | null;
    /** The value set for an attribute when currentState is `false`. */
    whenFalse?: string | null;
    /** The value set for an attribute in the constructor. */
    initial?: BhAttrInitialValue;
    /** Whether this attribute will be affected by .toggle() (no if `true`). */
    fixed?: boolean;
  }
>;

/** An internal type: guarantees `falseValue` is never undefined. */
export interface BhNormalizedAttr {
  /** The value set for an attribute when currentState is `true`. */
  trueValue: string | null;
  /** The value set for an attribute when currentState is `false`. */
  falseValue: string | null;
  /** The name of the attribute under management. */
  name: string;
  /** Whether this attribute will be affected by .toggle() (no if `true`). */
  fixed: boolean;
}

/**
 * A class used to create and/or enforce HTMLElement attribute values.
 */
export default class BhAttrManager {
  /** An array of the attributes under management in BhNormalizedAttr form. */
  private readonly items: BhNormalizedAttr[] = [];
  /** An array of the incoming values of the attributes under management. */
  private readonly original: [string, string | null][] = [];
  /** A var used to track the state of the attributes under management. */
  private currentState: boolean = false;

  /** Constructs a new BhAttrManager instance. */
  constructor(
    private readonly el: HTMLElement,
    config: BhAttrConfig,
    restorers?: (() => void)[],
  ) {
    let hasExplicitInitial = false;

    for (const [
      name,
      { whenTrue: trueValue, whenFalse, initial, fixed },
    ] of Object.entries(config)) {
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

    restorers?.push(() => this.restore());
  }

  /** Toggles state of attributes managed by this instance. */
  public toggle(condition?: boolean): void {
    this.currentState = condition ?? !this.currentState;
    for (const { name, trueValue, falseValue, fixed } of this.items) {
      if (fixed) {
        continue;
      }
      this.applyValue(name, this.currentState ? trueValue : falseValue);
    }
  }

  /** Restores original state of attributes managed by this instance. */
  public restore(): void {
    for (const [name, value] of this.original) {
      this.applyValue(name, value);
    }
  }

  /** Handles actual DOM attribute manipulation for toggle(), restore(). */
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
