[**@bedlamhotel/attrmanager**](../README.md)

---

[@bedlamhotel/attrmanager](../README.md) / AttrManager

# Class: AttrManager

Defined in: [attr-manager.ts:50](https://github.com/ctorgalson/attr-manager/blob/8bbb69282ea2012ea062c2fc2b6fd7b20aaf61cc/src/attr-manager.ts#L50)

A class used to create and/or enforce HTMLElement attribute values.

## Constructors

### Constructor

> **new AttrManager**(`el`, `config`, `restorers?`): `AttrManager`

Defined in: [attr-manager.ts:79](https://github.com/ctorgalson/attr-manager/blob/8bbb69282ea2012ea062c2fc2b6fd7b20aaf61cc/src/attr-manager.ts#L79)

Constructs a new AttrManager instance.

#### Parameters

##### el

[`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)

The HTMLElement to manage.

##### config

[`AttrConfig`](../type-aliases/AttrConfig.md)

The attribute configuration.

##### restorers?

[`RestorerEntry`](../interfaces/RestorerEntry.md)[]

Optional restorer array for lifecycle management.

#### Returns

`AttrManager`

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [attr-manager.ts:171](https://github.com/ctorgalson/attr-manager/blob/8bbb69282ea2012ea062c2fc2b6fd7b20aaf61cc/src/attr-manager.ts#L171)

Clears internal state and self-removes from `restorers`.

Use this to clean up state without affecting the DOM.

#### Returns

`void`

---

### restore()

> **restore**(`teardown?`): `void`

Defined in: [attr-manager.ts:156](https://github.com/ctorgalson/attr-manager/blob/8bbb69282ea2012ea062c2fc2b6fd7b20aaf61cc/src/attr-manager.ts#L156)

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

Defined in: [attr-manager.ts:139](https://github.com/ctorgalson/attr-manager/blob/8bbb69282ea2012ea062c2fc2b6fd7b20aaf61cc/src/attr-manager.ts#L139)

Toggles state of attributes managed by this instance.

#### Parameters

##### condition?

`boolean`

The condition to set. If omitted, toggles the current state.

#### Returns

`void`
