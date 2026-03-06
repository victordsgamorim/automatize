# @automatize/ui

Design system and UI components for Automatize.

## What is this?

A unified design system that provides reusable UI components and design tokens for both mobile (React Native) and web platforms. It ensures visual consistency across all Automatize applications.

## How it works

The package has two main exports:

**Design tokens** — Centralized definitions for colors, spacing, and typography. These are the foundational values that all components use. When you change a token, it propagates everywhere automatically.

**UI components** — Pre-built, accessible components like buttons, inputs, cards, and text elements. Components are built on top of tokens, ensuring they always use the correct values.

## Why this way?

**Single source of truth for design**: Instead of defining colors or spacing in each app, tokens live in one place. A brand color change only happens once.

**Cross-platform consistency**: The same component abstractions work on React Native and web. We use lucide-react-native which provides icons that adapt to each platform.

**Design tokens approach**: Tokens are organized semantically (brand, background, state colors) rather than just listing hex codes. This makes it easy to swap entire themes or add dark mode later.

## Directory organization

- **components/** — Reusable UI components, each in its own file.
- **tokens/** — Design token definitions (colors, spacing, typography).

## Design decisions

**Why tokens instead of CSS variables or StyleSheet?**
Tokens provide a language-agnostic foundation. The same color token works whether rendered as CSS custom property or React Native StyleSheet object.

**Why lucide icons?**
Lucide provides consistent, clean icons that work across platforms. The library is actively maintained and has excellent accessibility.

**Component philosophy**:

- Every component uses design tokens
- Every component has size variants (sm, md, lg)
- Every interactive component is accessible
- No hardcoded colors or spacing anywhere

## Usage pattern

Apps import from this package instead of creating their own styling. This guarantees that every button, input, and card looks exactly the same across the entire application.
