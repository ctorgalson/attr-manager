[**@bedlamhotel/attrmanager**](../README.md)

---

[@bedlamhotel/attrmanager](../README.md) / NormalizedAttr

# Interface: NormalizedAttr

Defined in: [attr-manager.ts:26](https://github.com/ctorgalson/attr-manager/blob/df85440b4e3c6eb06f917a773fb1c70228c95edb/src/attr-manager.ts#L26)

An internal type: guarantees `falseValue` is never undefined.

## Properties

### falseValue

> **falseValue**: `string` \| `null`

Defined in: [attr-manager.ts:30](https://github.com/ctorgalson/attr-manager/blob/df85440b4e3c6eb06f917a773fb1c70228c95edb/src/attr-manager.ts#L30)

The value set for an attribute when currentState is `false`.

---

### fixed

> **fixed**: `boolean`

Defined in: [attr-manager.ts:34](https://github.com/ctorgalson/attr-manager/blob/df85440b4e3c6eb06f917a773fb1c70228c95edb/src/attr-manager.ts#L34)

Whether this attribute will be ignored by `.toggle()`.

---

### name

> **name**: `string`

Defined in: [attr-manager.ts:32](https://github.com/ctorgalson/attr-manager/blob/df85440b4e3c6eb06f917a773fb1c70228c95edb/src/attr-manager.ts#L32)

The name of the attribute under management.

---

### trueValue

> **trueValue**: `string` \| `null`

Defined in: [attr-manager.ts:28](https://github.com/ctorgalson/attr-manager/blob/df85440b4e3c6eb06f917a773fb1c70228c95edb/src/attr-manager.ts#L28)

The value set for an attribute when currentState is `true`.
