# @chotter/ui

Shared React component library for Chotter applications, built with React 18, TypeScript, and Tailwind CSS.

## Installation

This package is part of the Chotter monorepo and is automatically available to other workspace packages.

```typescript
import { Button, Input, Card } from '@chotter/ui';
```

## Components

### Base Components

#### Button

A versatile button component with multiple variants, sizes, and loading states.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger'` - Visual style (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `isLoading?: boolean` - Show loading spinner
- All standard button HTML attributes

**Usage:**
```tsx
import { Button } from '@chotter/ui';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="danger" isLoading>
  Deleting...
</Button>
```

#### Input

A text input component with label, error states, and validation feedback.

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message to display
- `helperText?: string` - Helper text below input
- `fullWidth?: boolean` - Take full width of container
- All standard input HTML attributes

**Usage:**
```tsx
import { Input } from '@chotter/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
  fullWidth
/>

<Input
  label="Password"
  type="password"
  error="Password is too short"
/>
```

#### Card

A container component with optional header, body, and footer sections.

**Props:**
- `variant?: 'default' | 'outlined' | 'elevated'` - Card style (default: 'default')

**Components:**
- `Card` - Main container
- `CardHeader` - Header section with bottom border
- `CardBody` - Main content area
- `CardFooter` - Footer section with top border and gray background

**Usage:**
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@chotter/ui';

<Card variant="elevated">
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Modal

A dialog component with backdrop, close button, and keyboard navigation.

**Props:**
- `isOpen: boolean` - Control modal visibility
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal width (default: 'md')
- `closeOnBackdropClick?: boolean` - Close on backdrop click (default: true)
- `showCloseButton?: boolean` - Show X button (default: true)

**Features:**
- Escape key to close
- Focus trap
- Body scroll lock when open
- Backdrop click to close
- ARIA attributes for accessibility

**Usage:**
```tsx
import { Modal } from '@chotter/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

#### Badge

Status indicators with multiple variants and sizes.

**Props:**
- `variant?: 'success' | 'warning' | 'error' | 'info' | 'default'` - Color scheme (default: 'default')
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')

**Usage:**
```tsx
import { Badge } from '@chotter/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

#### Spinner

A loading indicator component.

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Spinner size (default: 'md')
- `color?: 'primary' | 'secondary' | 'white'` - Color (default: 'primary')

**Usage:**
```tsx
import { Spinner } from '@chotter/ui';

<Spinner size="md" color="primary" />
```

### Layout Components

#### Container

A max-width container with responsive padding.

**Props:**
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` - Maximum width (default: 'lg')
- `padding?: boolean` - Apply responsive padding (default: true)

**Usage:**
```tsx
import { Container } from '@chotter/ui';

<Container maxWidth="lg">
  <h1>Page Content</h1>
</Container>
```

#### Grid

A responsive CSS Grid layout component.

**Props:**
- `cols?: 1 | 2 | 3 | 4 | 6 | 12` - Number of columns (default: 1)
- `gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'` - Gap between items (default: 'md')
- `responsive?: boolean` - Enable responsive breakpoints (default: true)

**Usage:**
```tsx
import { Grid } from '@chotter/ui';

<Grid cols={3} gap="lg" responsive>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

#### Stack

A Flexbox layout component for vertical or horizontal stacking.

**Props:**
- `direction?: 'horizontal' | 'vertical'` - Stack direction (default: 'vertical')
- `spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'` - Gap between items (default: 'md')
- `align?: 'start' | 'center' | 'end' | 'stretch'` - Align items (default: 'stretch')
- `justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'` - Justify content (default: 'start')
- `wrap?: boolean` - Enable flex wrap (default: false)

**Usage:**
```tsx
import { Stack } from '@chotter/ui';

<Stack direction="vertical" spacing="lg" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

<Stack direction="horizontal" spacing="md" justify="between">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</Stack>
```

## TypeScript Support

All components are fully typed with TypeScript. Props interfaces are exported for convenience:

```typescript
import type { ButtonProps, InputProps, CardProps } from '@chotter/ui';
```

## Accessibility

All components follow WCAG 2.1 AA accessibility guidelines:
- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Proper color contrast

## Styling

Components use Tailwind CSS utility classes. The Tailwind configuration is available at `src/theme/tailwind.config.js`.

### Color Scheme
- Primary: Blue (blue-600/700)
- Secondary: Gray (gray-200/300)
- Danger: Red (red-600/700)
- Success: Green (green-100/800)
- Warning: Yellow (yellow-100/800)
- Info: Blue (blue-100/800)

### Customization

All components accept a `className` prop for custom styling:

```tsx
<Button className="custom-class">Click me</Button>
```

## Development

```bash
# Type check
bun run type-check

# Build
bun run build
```

## Architecture

- Built with React 18+ and TypeScript 5+
- Uses `forwardRef` for proper ref handling
- Extends native HTML element props
- Uses `clsx` for conditional className composition
- Follows compound component pattern (e.g., Card with CardHeader, CardBody, CardFooter)
