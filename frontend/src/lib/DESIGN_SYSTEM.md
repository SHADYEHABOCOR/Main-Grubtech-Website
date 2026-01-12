# Grubtech Design System

This document outlines the design system patterns, components, and usage guidelines for the Grubtech website.

## Table of Contents
- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [CSS Utilities](#css-utilities)
- [Migration Guide](#migration-guide)

---

## Colors

### Brand Colors
```
brand.DEFAULT: #0d47c0  → Primary blue
brand.light:   #1a5fd8  → Lighter blue for hover states
brand.dark:    #0a3a99  → Darker blue for active states
accent:        #ff6b35  → Orange accent (use sparingly)
```

### Surface Colors (Backgrounds)
```
surface.DEFAULT:      #ffffff  → White background
surface.muted:        #f8fafc  → Subtle gray background
surface.brand-light:  #f5faff  → Light blue background (sections)
```

### Text Colors
```
text.primary:   #1a1a2e  → Headings, important text
text.secondary: #64748b  → Body text, descriptions
text.tertiary:  #94a3b8  → Muted text, placeholders
text.inverse:   #ffffff  → Text on dark backgrounds
```

### Usage in Tailwind
```jsx
// Brand colors
<div className="bg-brand text-white">Primary brand</div>
<div className="bg-brand-light">Hover state</div>

// Surface colors
<section className="bg-surface-brand-light">Light blue section</section>
<div className="bg-surface-muted">Subtle gray</div>

// Text colors
<h1 className="text-text-primary">Heading</h1>
<p className="text-text-secondary">Body text</p>
```

---

## Typography

### Heading Sizes
| Class | Size | Use Case |
|-------|------|----------|
| `text-display-1` | 4.5rem | Hero headlines |
| `text-display-2` | 3.75rem | Large section titles |
| `text-heading-1` | 2.5rem | Page titles |
| `text-heading-2` | 2rem | Section headings |
| `text-heading-3` | 1.5rem | Card titles |
| `text-heading-4` | 1.25rem | Subsection titles |

### Body Sizes
| Class | Size | Use Case |
|-------|------|----------|
| `text-body-lg` | 1.125rem | Lead paragraphs |
| `text-body` | 1rem | Standard body |
| `text-body-sm` | 0.875rem | Small text, captions |

### Using the Heading Component
```jsx
import { Heading } from '@/components/ui';

// Display heading for hero
<Heading level={1} variant="display" color="white">
  Hero Title
</Heading>

// Section heading
<Heading level={2} variant="section" align="center">
  Section Title
</Heading>

// Card title
<Heading level={3} variant="card">
  Card Title
</Heading>
```

### Using the Text Component
```jsx
import { Text } from '@/components/ui';

// Standard paragraph
<Text>Body text content</Text>

// Large centered description
<Text size="lg" color="secondary" align="center" maxWidth="narrow">
  Section description text
</Text>

// Small caption
<Text size="sm" color="tertiary">
  Caption text
</Text>
```

---

## Spacing

### Section Padding
| Token | Value | CSS Class |
|-------|-------|-----------|
| default | py-12 sm:py-16 md:py-28 | `section-brand`, `section-white` |
| small | py-10 sm:py-12 md:py-24 | - |
| compact | py-8 sm:py-10 md:py-16 | - |
| hero | pt-24 pb-20 ... | Hero sections |

### Container Max Widths
| Token | Value | Class |
|-------|-------|-------|
| default | 1280px | `max-w-7xl` |
| narrow | 672px | `max-w-narrow` |
| wide | 1440px | `max-w-wide` |
| content | 65ch | `max-w-content` |

---

## Components

### Button
```jsx
import { Button } from '@/components/ui';

// Primary CTA
<Button variant="primary" size="lg">Get Started</Button>

// Secondary
<Button variant="secondary">Learn More</Button>

// Outline (on dark backgrounds)
<Button variant="outline">Contact Us</Button>

// Ghost (subtle)
<Button variant="ghost">Cancel</Button>

// Full width
<Button fullWidth>Submit</Button>

// Icon only
<Button variant="ghost" iconOnly size="sm">
  <ChevronRight />
</Button>
```

### Card
```jsx
import { Card } from '@/components/ui';

// Default card
<Card>Card content</Card>

// Elevated with shadow
<Card variant="elevated">Prominent card</Card>

// Brand shadow (blue tint)
<Card variant="brand">Featured card</Card>

// Without hover effect
<Card hoverable={false}>Static card</Card>

// With animation disabled
<Card animate={false}>No entrance animation</Card>

// Custom padding
<Card padding="lg">Large padding card</Card>
```

### Badge
```jsx
import { Badge } from '@/components/ui';

// Brand badge
<Badge variant="brand">New Feature</Badge>

// With dot indicator
<Badge variant="success" dot>Active</Badge>

// With icon
<Badge variant="primary" icon={<Check className="w-3 h-3" />}>
  Verified
</Badge>
```

### Container
```jsx
import { Container } from '@/components/ui';

// Standard container (1280px)
<Container>Content</Container>

// Narrow container (672px)
<Container size="narrow">Narrow content</Container>

// Wide container (1440px)
<Container size="wide">Wide content</Container>
```

### SectionWrapper
```jsx
import { SectionWrapper, Container } from '@/components/ui';

// Brand light background section
<SectionWrapper background="brand-light">
  <Container>Section content</Container>
</SectionWrapper>

// White section with compact padding
<SectionWrapper background="white" padding="compact">
  <Container>Compact section</Container>
</SectionWrapper>

// Hero section
<SectionWrapper background="gradient" padding="hero">
  <Container>Hero content</Container>
</SectionWrapper>
```

---

## CSS Utilities

### Component Classes (index.css)

These classes use `@apply` and should be used for consistency:

```css
/* Sections */
.section-brand     /* py-12 sm:py-16 md:py-28 bg-surface-brand-light */
.section-white     /* py-12 sm:py-16 md:py-28 bg-white */

/* Section Typography */
.section-heading       /* Responsive heading styles */
.section-heading-accent /* Blue accent color */
.section-subheading    /* Responsive subheading */

/* Cards */
.card-base       /* Base card styles */
.card-elevated   /* Card with shadow */
.card-brand      /* Card with blue shadow */
.card-hoverable  /* Hover lift effect */

/* Navigation */
.nav-dot          /* Carousel dot base */
.nav-dot-active   /* Active dot */
.nav-dot-inactive /* Inactive dot */
.nav-arrow        /* Arrow button */

/* Badges */
.badge-brand /* Brand colored badge pill */

/* Features */
.feature-item  /* Feature with check icon */
.feature-check /* Green check circle */
.feature-text  /* Feature text */

/* Links */
.link-arrow      /* Read more link with arrow */
.link-arrow-icon /* Arrow icon */

/* Containers */
.container-default /* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */
.container-narrow  /* max-w-4xl variant */
```

### Utility Classes

```css
/* Glass effects */
.glass-elegant  /* White glass with blur */
.glass-card     /* Blue-tinted glass */

/* Gradients */
.bg-hero-gradient     /* Hero section gradient */
.bg-gradient-primary  /* Primary button gradient */
.gradient-elegant     /* Subtle brand gradient */

/* Text gradients */
.text-gradient-primary /* Blue gradient text */
.text-gradient-accent  /* Orange gradient text */

/* Transitions */
.transition-elegant /* 400ms cubic-bezier */
.transition-smooth  /* 300ms cubic-bezier */
.transition-fast    /* 150ms ease-out */

/* Hover effects */
.hover-glow /* Glow effect on hover */
.hover-lift /* Lift up on hover */

/* Scrollbar */
.scrollbar-hide /* Hide scrollbar */
```

---

## Migration Guide

### Before → After Mappings

#### Colors
```
bg-blue-50           → bg-surface-brand-light
bg-gray-50           → bg-surface-muted
bg-background-alt    → bg-surface-muted
bg-background-blue-light → bg-surface-brand-light

text-gray-900        → text-text-primary
text-gray-600        → text-text-secondary
text-gray-500        → text-text-secondary
text-gray-400        → text-text-tertiary

bg-blue-600          → bg-brand
text-blue-600        → text-brand
border-blue-600      → border-brand
```

#### Shadows
```
shadow-lg            → shadow-card-hover
shadow-xl            → shadow-card-elevated
shadow-blue-500/10   → shadow-brand-sm
```

#### Border Radius
```
rounded-2xl          → rounded-card
rounded-3xl          → rounded-card-lg
rounded-full         → rounded-button (for buttons)
```

### Component Migration

#### Old Pattern
```jsx
<section className="py-16 md:py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
      Section Title
    </h2>
    <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
      Description
    </p>
  </div>
</section>
```

#### New Pattern (Using Components)
```jsx
import { SectionWrapper, Container, Heading, Text } from '@/components/ui';

<SectionWrapper background="brand-light">
  <Container>
    <Heading level={2} variant="section" align="center">
      Section Title
    </Heading>
    <Text size="lg" align="center" maxWidth="narrow">
      Description
    </Text>
  </Container>
</SectionWrapper>
```

#### New Pattern (Using CSS Classes)
```jsx
<section className="section-brand">
  <div className="container-default">
    <h2 className="section-heading">Section Title</h2>
    <p className="section-subheading">Description</p>
  </div>
</section>
```

---

## Constants (TypeScript)

Import design constants for JavaScript usage:

```typescript
import {
  LAYOUT,
  ANIMATION,
  COLORS,
  GRADIENTS,
  SHADOWS,
  STYLES
} from '@/lib/constants';

// Layout
const className = `${LAYOUT.maxWidth} ${LAYOUT.containerPadding}`;

// Framer Motion animations
<motion.div {...ANIMATION.framer.fadeInUp}>
  Content
</motion.div>

// Button hover animation
<motion.button
  whileHover={ANIMATION.buttonHover}
  whileTap={ANIMATION.buttonTap}
>
  Click me
</motion.button>

// Colors for dynamic styling
const brandColor = COLORS.brand.primary; // '#0d47c0'

// Pre-built style combinations
<div className={STYLES.container}>
  <h2 className={STYLES.sectionHeading}>Title</h2>
</div>
```

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── index.ts          # Barrel exports
│   │       ├── Button.tsx        # Button component
│   │       ├── Card.tsx          # Card component
│   │       ├── Badge.tsx         # Badge component
│   │       ├── Container.tsx     # Container layout
│   │       ├── SectionWrapper.tsx # Section layout
│   │       ├── Heading.tsx       # Typography
│   │       └── Text.tsx          # Typography
│   │
│   ├── lib/
│   │   ├── constants.ts          # Design tokens for JS
│   │   └── DESIGN_SYSTEM.md      # This file
│   │
│   └── index.css                 # Global styles & utilities
│
└── tailwind.config.js            # Design tokens config
```

---

## Best Practices

1. **Use semantic color names** - Prefer `bg-brand` over `bg-blue-600`
2. **Use components for consistency** - Import from `@/components/ui`
3. **Use CSS classes for simple cases** - `.section-brand` for quick styling
4. **Use constants for JS/Framer** - Import from `@/lib/constants`
5. **Keep animations consistent** - Use `ANIMATION.framer` presets
6. **Responsive by default** - Components handle responsive sizing
