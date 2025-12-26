# Component Structure & Naming Guide

This directory contains the application's UI components. We are in the process of refactoring naming conventions to be more standard and concise.

## Naming Standards

1.  **Directories**: Use singular or plural nouns describing the domain, without the `Comps` suffix.
    *   Old: `FormComps`, `UniversalComps`
    *   New: `Forms`, `Shared` (or `UI`)

2.  **Files**: Use PascalCase for component filenames, without the `Comp` or `Component` suffix.
    *   Old: `UniversalHeaderComp.tsx`
    *   New: `Header.tsx`

3.  **Exports**: Prefer default exports for main components, named exports for utilities/types.

## Refactoring Status

*   **Header**: Refactored to `Header.tsx`. The old `_HeaderContentComp.tsx` is now a compatibility wrapper.
*   **Forms**: (Pending)
*   **Universal/Shared**: (Pending)

## How to use the new Header

```typescript
import Header from "src/_components/Header";
// or
import Header from "src/_components/_HeaderContentComp"; // (Legacy)
```
