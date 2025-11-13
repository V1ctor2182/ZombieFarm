# Shared Components

This directory contains reusable React components used across multiple features.

## Structure

Components are organized by type:

```
components/
├── ui/                    # Base UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   ├── Tooltip.tsx
│   └── ...
├── game/                  # Game-specific shared components
│   ├── ResourceCounter.tsx
│   ├── ProgressBar.tsx
│   ├── Card.tsx
│   └── ...
├── layout/                # Layout components
│   ├── Panel.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   └── ...
├── feedback/              # Feedback components
│   ├── Toast.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   └── ...
└── index.ts               # Public exports
```

## Component Guidelines

### Base Components (ui/)

- Generic, reusable across any project
- No game logic
- Highly customizable via props
- Support variants, sizes, states
- Accessible (ARIA labels, keyboard nav)

### Game Components (game/)

- Game-specific but reusable
- May use game types and state
- Examples: resource displays, zombie cards, stat bars

### Layout Components (layout/)

- Structural components
- Manage spacing, alignment, positioning
- Responsive design support

### Feedback Components (feedback/)

- User feedback mechanisms
- Toasts, loading states, error handling
- Success/error/info/warning variants

## Development Guidelines

1. **TypeScript**: Strict typing for props and state
2. **Composition**: Prefer composition over inheritance
3. **Accessibility**: Include ARIA labels, keyboard support
4. **Styling**: Use Tailwind CSS utility classes
5. **Testing**: Test with React Testing Library
6. **Documentation**: PropTypes in JSDoc or TypeScript interfaces

## Example Component Structure

```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
};
```

## Testing

All components should have corresponding test files:

- `Button.tsx` → `Button.test.tsx`
- Test rendering, props, user interactions
- Use custom render utilities from `@lib/test-utils`
