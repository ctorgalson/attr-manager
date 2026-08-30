# AttrManager

## Test coverage

- documentation: <img src="https://raw.githubusercontent.com/ctorgalson/attr-manager/main/docs/coverage.svg" alt="Documentation coverage">
- branches: <img src="https://raw.githubusercontent.com/ctorgalson/attr-manager/main/coverage/branches.svg" alt="Test coverage: branches">
- functions: <img src="https://raw.githubusercontent.com/ctorgalson/attr-manager/main/coverage/functions.svg" alt="Test coverage: functions">
- lines: <img src="https://raw.githubusercontent.com/ctorgalson/attr-manager/main/coverage/lines.svg" alt="Test coverage: lines">
- statements: <img src="https://raw.githubusercontent.com/ctorgalson/bh-attrmanager/main/coverage/statements.svg" alt="Test coverage: statements">

A TypeScript class for managing HTMLElement attribute values based on a boolean
`currentState`. Automatically handles attribute toggling, restoration to original
DOM state, and lifecycle cleanup.

## Documentation

For detailed API documentation and reference, see:

- [Full API Reference](./docs/README.md)
- [Constructor Options](./docs/AttrManager.constructor.html)
- [Methods](./docs/AttrManager.html#methods)

## Installation

```bash
npm install @bedlamhotel/attr-manager
```

## Basic Usage

```typescript
import AttrManager from '@bedlamhotel/attr-manager';

const manager = new AttrManager(element, {
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

const slideAttrs = new AttrManager(slideElement, {
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

const checkedState = new AttrManager(checkbox, {
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

const hiddenState = new AttrManager(dialog, {
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
const globalRestorers: RestorerEntry[] = [];

// Register managers with the same restorer array
const slide1Attrs = new AttrManager(
  slide1Element,
  {
    tabindex: { whenTrue: '0', whenFalse: '-1', initial: 'whenTrue' },
    'aria-selected': { whenTrue: 'true', whenFalse: 'false', initial: 'whenTrue' }
  },
  globalRestorers
);

const slide2Attrs = new AttrManager(
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
const slider = new AttrManager(element, {
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
const slider = new AttrManager(element, {
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
const slider = new AttrManager(element, {
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
const standalone = new AttrManager(element, {
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
type AttrInitialValue = "whenTrue" | "whenFalse" | null;  // See: [AttrInitialValue](./docs/AttrInitialValue.html)

interface AttrConfig {  // See: [AttrConfig](./docs/AttrConfig.html)
  [key: string]: {
    whenTrue: string | null;
    whenFalse?: string | null;
    initial?: AttrInitialValue;
    fixed?: boolean;  // Skip this attribute during toggle()
  };
}
```

### Constructor Options

```typescript
constructor(
  el: HTMLElement,
  config: AttrConfig,
  restorers?: RestorerEntry[],
)
```

| Parameter   | Description                                              |
| ----------- | -------------------------------------------------------- |
| [`el`](./docs/AttrManager.constructor.html#el)        | The element to manage attributes on                      |
| [`config`](./docs/AttrManager.constructor.html#config)    | Configuration object mapping attribute names ([AttrConfig](./docs/AttrConfig.html)) |
| [`restorers`](./docs/AttrManager.constructor.html#restorers) | Optional array for tracking managers ([RestorerEntry](./docs/RestorerEntry.html)) |

### Methods

| Method          | Signature                | Description                              |
| --------------- | ------------------------ | ---------------------------------------- |
| [`toggle()`](./docs/AttrManager.html#toggle)  | `(condition?: boolean)`  | Toggle all managed attributes            |
| [`restore()`](./docs/AttrManager.html#restore)| `(teardown?: boolean)`   | Revert to original DOM state             |
| [`destroy()`](./docs/AttrManager.html#destroy)| `()`                     | Clear internal state and remove if regen |

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
new AttrManager(el, {
  myAttr: {
    whenFalse: 'x',  // ❌ Error: must supply a `whenTrue` value
    initial: 'whenTrue'
  }
});

// Invalid initial value
new AttrManager(el, {
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
