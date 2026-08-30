[**@bedlamhotel/attrmanager**](../README.md)

---

[@bedlamhotel/attrmanager](../README.md) / NormalizedAttr

# Interface: NormalizedAttr

Defined in: attr-manager.ts:26

An internal type: guarantees `falseValue` is never undefined.

## Properties

### falseValue

> **falseValue**: `string` \| `null`

Defined in: attr-manager.ts:30

The value set for an attribute when currentState is `false`.

---

### fixed

> **fixed**: `boolean`

Defined in: attr-manager.ts:34

Whether this attribute will be ignored by `.toggle()`.

---

### name

> **name**: `string`

Defined in: attr-manager.ts:32

The name of the attribute under management.

---

### trueValue

> **trueValue**: `string` \| `null`

Defined in: attr-manager.ts:28

The value set for an attribute when currentState is `true`.
