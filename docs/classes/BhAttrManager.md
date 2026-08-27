[**bh-attrmanager**](../README.md)

---

[bh-attrmanager](../README.md) / BhAttrManager

# Class: BhAttrManager

Defined in: bh-attrmanager.ts:34

A class used to create and/or enforce HTMLElement attribute values.

## Constructors

### Constructor

> **new BhAttrManager**(`el`, `config`, `restorers?`): `BhAttrManager`

Defined in: bh-attrmanager.ts:43

Constructs a new BhAttrManager instance.

#### Parameters

##### el

[`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)

##### config

[`BhAttrConfig`](../type-aliases/BhAttrConfig.md)

##### restorers?

() => `void`[]

#### Returns

`BhAttrManager`

## Methods

### restore()

> **restore**(): `void`

Defined in: bh-attrmanager.ts:84

Restores original state of attributes managed by this instance.

#### Returns

`void`

---

### toggle()

> **toggle**(`condition?`): `void`

Defined in: bh-attrmanager.ts:73

Toggles state of attributes managed by this instance.

#### Parameters

##### condition?

`boolean`

#### Returns

`void`
