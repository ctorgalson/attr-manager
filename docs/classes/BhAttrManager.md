[**bh-attrmanager**](../README.md)

---

[bh-attrmanager](../README.md) / BhAttrManager

# Class: BhAttrManager

Defined in: bh-attrmanager.ts:50

A class used to create and/or enforce HTMLElement attribute values.

## Constructors

### Constructor

> **new BhAttrManager**(`el`, `config`, `restorers?`): `BhAttrManager`

Defined in: bh-attrmanager.ts:79

Constructs a new BhAttrManager instance.

#### Parameters

##### el

[`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)

The HTMLElement to manage.

##### config

[`BhAttrConfig`](../type-aliases/BhAttrConfig.md)

The attribute configuration.

##### restorers?

[`BhAttrRestorerEntry`](../interfaces/BhAttrRestorerEntry.md)[]

Optional restorer array for lifecycle management.

#### Returns

`BhAttrManager`

## Methods

### destroy()

> **destroy**(): `void`

Defined in: bh-attrmanager.ts:171

Clears internal state and self-removes from `restorers`.

Use this to clean up state without affecting the DOM.

#### Returns

`void`

---

### restore()

> **restore**(`teardown?`): `void`

Defined in: bh-attrmanager.ts:156

Restores original state of attributes.

#### Parameters

##### teardown?

`boolean` = `false`

If `true` (default), also clears internal state and self-removes from
`restorers`.

#### Returns

`void`

---

### toggle()

> **toggle**(`condition?`): `void`

Defined in: bh-attrmanager.ts:139

Toggles state of attributes managed by this instance.

#### Parameters

##### condition?

`boolean`

The condition to set. If omitted, toggles the current state.

#### Returns

`void`
