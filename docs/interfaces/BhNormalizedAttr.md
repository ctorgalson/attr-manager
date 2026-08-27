[**bh-attrmanager**](../README.md)

---

[bh-attrmanager](../README.md) / BhNormalizedAttr

# Interface: BhNormalizedAttr

Defined in: bh-attrmanager.ts:20

An internal type: guarantees `falseValue` is never undefined.

## Properties

### falseValue

> **falseValue**: `string` \| `null`

Defined in: bh-attrmanager.ts:24

The value set for an attribute when currentState is `false`.

---

### fixed

> **fixed**: `boolean`

Defined in: bh-attrmanager.ts:28

Whether this attribute will be affected by .toggle() (no if `true`).

---

### name

> **name**: `string`

Defined in: bh-attrmanager.ts:26

The name of the attribute under management.

---

### trueValue

> **trueValue**: `string` \| `null`

Defined in: bh-attrmanager.ts:22

The value set for an attribute when currentState is `true`.
