# BhAttrManager

![Documentation coverage](docs/coverage.svg)
![Test coverage: branches](coverage/branches.svg) 
![Test coverage: functions](coverage/functions.svg) 
![Test coverage: lines](coverage/lines.svg) 
![Test coverage: statements](coverage/statements.svg) 

A TypeScript class for managing HTMLElement attribute values based on a boolean
`currentState`. Automatically handles attribute toggling, restoration to original
DOM state, and lifecycle cleanup.

## Documentation

For detailed API documentation and reference, see:

- [Full API Reference](./docs/README.md)
- [Constructor Options](./docs/BhAttrManager.constructor.html)
- [Methods](./docs/BhAttrManager.html#methods)

## Installation

```bash
npm install bh-attrmanager  # or link local
```

## Basic Usage

```typescript
import BhAttrManager from 'bh-attrmanager';

const manager = new BhAttrManager(element, {
  'data-active': {
    whenTrue: 'true',
    whenFalse: null,
    initial: 'whenTrue'
  }
});

// Toggle the attributes
manager.toggle();
manager.toggle(false);
manager.toggle(true);

// Restore to original DOM state
manager.restore();
```

## Examples

### Multiple Attributes Per Instance

Manage multiple related attributes together - useful for components like
carousel slides:

```typescript
const slideElement = document.querySelector('[data-slide]') as HTMLElement;

const slideAttrs = new BhAttrManager(slideElement, {
  'tabindex': {
    whenTrue: '0',      // Focusable when active
    whenFalse: '-1',    // Not focusable when inactive
    initial: 'whenTrue' // Start focused
  },
  'aria-current': {
    whenTrue: 'page',   // Mark current slide
    whenFalse: null,    // Remove attribute when not current
    initial: 'whenTrue' // Start as current slide
  },
  'data-hidden': {
    whenTrue: 'false',
    whenFalse: 'true',
    initial: 'whenFalse' // Hide by default
  }
});

// When switching to next slide:
activeSlide.destroy();        // Clean up previous slide
slideAttrs.toggle(false);     // Deactivate old slide
newSlideAttrs.toggle(true);   // Activate new slide
```

### Boolean-Style Attributes

Handle attributes that are present/absent rather than value-based:

```typescript
const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;

const checkedState = new BhAttrManager(checkbox, {
  'checked': {
    whenTrue: '',       // Empty string means attribute is present (boolean)
    whenFalse: null,    // null removes the attribute
    initial: null       // No "initial" key - don't set at construction
  }
});

// Manually check/uncheck the box
checkedState.toggle();           // Check
checkedState.toggle(false);      // Uncheck

// Or use explicit booleans
checkedState.toggle(true);       // Check
checkedState.toggle(false);      // Uncheck
```

Another example with `hidden`:

```typescript
const dialog = document.querySelector('.modal-dialog') as HTMLElement;

const hiddenState = new BhAttrManager(dialog, {
  'hidden': {
    whenTrue: '',    // Attribute present = visible state
    whenFalse: null, // Attribute removed = hidden state
    initial: null    // Start based on existing DOM state
  }
});
```

### Global DOM Restoration via Restorers Array

Track multiple managers and restore all at once (e.g., responsive mode change):

```typescript
// Create a shared restorer array
const globalRestorers: BhAttrRestorerEntry[] = [];

// Register managers with the same restorer array
const slide1Attrs = new BhAttrManager(
  slide1Element,
  {
    tabindex: { whenTrue: '0', whenFalse: '-1', initial: 'whenTrue' },
    'aria-selected': { whenTrue: 'true', whenFalse: 'false', initial: 'whenTrue' }
  },
  globalRestorers
);

const slide2Attrs = new BhAttrManager(
  slide2Element,
  {
    tabindex: { whenTrue: '0', whenFalse: '-1', initial: 'whenFalse' }
  },
  globalRestorers
);

// Later - restore entire carousel to original state
globalRestorers.forEach(({ restore }) => restore());

// Or selectively destroy specific managers while keeping others
slide1Attrs.destroy();  // Removes from restorers, clears internal state
globalRestorers.forEach(({ restore }) => restore());  // Remaining restored
```

**Note:** By default, `restore()` on a restorer entry does NOT call `destroy()` -
it only reverts DOM changes, keeping the manager usable. To also destroy:

```typescript
// Restore and destroy this specific manager
slide1Attrs.restore(true);  // Teardown = true

// Or call destroy explicitly
slide1Attrs.destroy();
```

### Single Instance DOM Restoration

#### With Automatic Cleanup (Default)

```typescript
const slider = new BhAttrManager(element, {
  'aria-hidden': {
    whenTrue: 'false',
    whenFalse: 'true',
    initial: 'whenTrue'
  }
});

// Do some work...

// Default behavior: restore DOM without clearing internal state
slider.restore();  // Same as slider.restore(false)
// Can still toggle after restore:
slider.toggle(true);
slider.toggle(false);
```

#### With Cleanup (Teardown)

```typescript
const slider = new BhAttrManager(element, {
  'aria-hidden': {
    whenTrue: 'false',
    whenFalse: 'true',
    initial: 'whenTrue'
  }
});

// Do some work...

// Restore DOM AND clear internal state
slider.restore(true);
// Manager is now unusable (internal state cleared)
```

#### Explicit Destroy Without Restore

```typescript
const slider = new BhAttrManager(element, {
  'aria-hidden': {
    whenTrue: 'false',
    whenFalse: 'true',
    initial: 'whenTrue'
  }
});

// Current state: aria-hidden="false"

// Just clear internal state - DOM stays as-is
slider.destroy();
// aria-hidden is still "false", but manager internals are gone
// This is rare - typically you'd restore first, then destroy
```

### Independent `destroy()` Usage

When you have a reference but no restorer array:

```typescript
// No restorers provided
const standalone = new BhAttrManager(element, {
  'data-state': {
    whenTrue: 'active',
    whenFalse: 'inactive',
    initial: 'active'
  }
});

standalone.toggle(false);  // data-state="inactive"

// When done, just destroy - no global cleanup needed
standalone.destroy();
// Internal state cleared, but no automatic restorer removal (none registered)
```

## API Reference

### Types

```typescript
type BhAttrInitialValue = "whenTrue" | "whenFalse" | null;  // See: [BhAttrInitialValue](./docs/BhAttrInitialValue.html)

interface BhAttrConfig {  // See: [BhAttrConfig](./docs/BhAttrConfig.html)
  [key: string]: {
    whenTrue: string | null;
    whenFalse?: string | null;
    initial?: BhAttrInitialValue;
    fixed?: boolean;  // Skip this attribute during toggle()
  };
}
```

### Constructor Options

```typescript
constructor(
  el: HTMLElement,
  config: BhAttrConfig,
  restorers?: BhAttrRestorerEntry[],
)
```

| Parameter   | Description                                              |
| ----------- | -------------------------------------------------------- |
| [`el`](./docs/BhAttrManager.constructor.html#el)        | The element to manage attributes on                      |
| [`config`](./docs/BhAttrManager.constructor.html#config)    | Configuration object mapping attribute names ([BhAttrConfig](./docs/BhAttrConfig.html)) |
| [`restorers`](./docs/BhAttrManager.constructor.html#restorers) | Optional array for tracking managers ([BhAttrRestorerEntry](./docs/BhAttrRestorerEntry.html)) |

### Methods

| Method          | Signature                | Description                              |
| --------------- | ------------------------ | ---------------------------------------- |
| [`toggle()`](./docs/BhAttrManager.html#toggle)  | `(condition?: boolean)`  | Toggle all managed attributes            |
| [`restore()`](./docs/BhAttrManager.html#restore)| `(teardown?: boolean)`   | Revert to original DOM state             |
| [`destroy()`](./docs/BhAttrManager.html#destroy)| `()`                     | Clear internal state and remove if regen |

### Lifecycle Flow

```
┌─────────────────┐
│  constructor()  │ → Captures original DOM state
│                 │ → Applies initial values
│                 │ → Optionally registers in restorers
└────────┬────────┘
         │
         ├─────────────→ toggle() → Change all managed attributes
         │
         ├─────────────→ restore([teardown]) → Revert to originals
         │                         └── teardown=true: also destroy
         │
         └─────────────→ destroy() → Clear state + self-remove
```

## Error Handling

Invalid configurations throw descriptive errors:

```typescript
// Missing required whenTrue field
new BhAttrManager(el, {
  myAttr: {
    whenFalse: 'x',  // ❌ Error: must supply a `whenTrue` value
    initial: 'whenTrue'
  }
});

// Invalid initial value
new BhAttrManager(el, {
  myAttr: {
    whenTrue: 'a',
    whenFalse: 'b',
    initial: 'invalid'  // ❌ Error: must be one of whenTrue, whenFalse, or null
  }
});
```

## Best Practices

1. **Group related attributes** - Use one manager per logical unit (e.g., a
   carousel slide)
2. **Use `fixed: true` sparingly** - Only when certain attributes should never
   toggle
3. **Clean up properly** - Call `destroy()` when removing from DOM, or let
   global restorers handle it
4. **Consider boolean semantics** - `null` removes the attribute, empty string
   `''` adds it (for boolean attrs)
