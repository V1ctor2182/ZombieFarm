/**
 * Component Test Template
 *
 * Purpose: Test React components using React Testing Library.
 * Use this template for UI components, forms, and interactive elements.
 *
 * INSTRUCTIONS:
 * 1. Replace all [PLACEHOLDER] text with your actual values
 * 2. Remove sections that don't apply to your component
 * 3. Test user-visible behavior, not implementation details
 * 4. Use accessible queries (getByRole, getByLabelText, etc.)
 * 5. Test interactions as users would perform them
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [COMPONENT_NAME] } from '@components/[COMPONENT_FILE]';
import { create[TYPE] } from '@lib/test-utils/factories';
import type { [TYPE] } from '@types';

describe('[COMPONENT_NAME]', () => {
  /**
   * SETUP AND TEARDOWN
   * Common setup for component tests
   */
  const defaultProps: [PROPS_TYPE] = {
    [PROP]: [VALUE],
    on[EVENT]: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  /**
   * RENDERING TESTS
   * Test that the component renders correctly
   */
  describe('rendering', () => {
    it('should render with required props', () => {
      // Arrange & Act
      render(<[COMPONENT_NAME] {...defaultProps} />);

      // Assert
      expect(screen.getByText(/[TEXT_CONTENT]/i)).toBeInTheDocument();
      expect(screen.getByRole('[ROLE]')).toBeInTheDocument();
    });

    it('should display [ELEMENT] when [CONDITION]', () => {
      // Arrange
      const props = {
        ...defaultProps,
        [CONDITIONAL_PROP]: true,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByTestId('[TEST_ID]')).toBeVisible();
    });

    it('should not render [ELEMENT] when [OPPOSITE_CONDITION]', () => {
      // Arrange
      const props = {
        ...defaultProps,
        [CONDITIONAL_PROP]: false,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.queryByTestId('[TEST_ID]')).not.toBeInTheDocument();
    });

    it('should render with data from props', () => {
      // Arrange
      const data = create[TYPE]({
        [PROPERTY]: '[VALUE]',
      });

      const props = {
        ...defaultProps,
        [DATA_PROP]: data,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByText('[VALUE]')).toBeInTheDocument();
    });
  });

  /**
   * INTERACTION TESTS
   * Test user interactions
   */
  describe('user interactions', () => {
    it('should call callback when [INTERACTION] occurs', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = jest.fn();

      const props = {
        ...defaultProps,
        on[EVENT]: handleClick,
      };

      render(<[COMPONENT_NAME] {...props} />);

      // Act
      await user.click(screen.getByRole('button', { name: /[BUTTON_TEXT]/i }));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith([EXPECTED_ARGS]);
    });

    it('should update display when user types in input', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<[COMPONENT_NAME] {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /[LABEL]/i });

      // Act
      await user.type(input, '[TEXT_TO_TYPE]');

      // Assert
      expect(input).toHaveValue('[TEXT_TO_TYPE]');
    });

    it('should select option from dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<[COMPONENT_NAME] {...defaultProps} onChange={handleChange} />);

      // Act
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '[OPTION_VALUE]');

      // Assert
      expect(handleChange).toHaveBeenCalledWith('[OPTION_VALUE]');
      expect(select).toHaveValue('[OPTION_VALUE]');
    });

    it('should toggle checkbox state', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<[COMPONENT_NAME] {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /[LABEL]/i });

      // Act
      await user.click(checkbox);

      // Assert
      expect(checkbox).toBeChecked();

      // Act again
      await user.click(checkbox);

      // Assert
      expect(checkbox).not.toBeChecked();
    });
  });

  /**
   * FORM SUBMISSION TESTS
   * Test form handling and validation
   */
  describe('form submission', () => {
    it('should submit form with correct data', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleSubmit = jest.fn();

      render(<[COMPONENT_NAME] {...defaultProps} onSubmit={handleSubmit} />);

      // Act - Fill form
      await user.type(screen.getByLabelText(/[FIELD_1]/i), '[VALUE_1]');
      await user.type(screen.getByLabelText(/[FIELD_2]/i), '[VALUE_2]');

      // Act - Submit
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      expect(handleSubmit).toHaveBeenCalledWith({
        [FIELD_1]: '[VALUE_1]',
        [FIELD_2]: '[VALUE_2]',
      });
    });

    it('should show validation errors for invalid input', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<[COMPONENT_NAME] {...defaultProps} />);

      // Act - Submit without filling required field
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Assert
      expect(screen.getByText(/[ERROR_MESSAGE]/i)).toBeInTheDocument();
    });

    it('should disable submit button when form is invalid', () => {
      // Arrange
      render(<[COMPONENT_NAME] {...defaultProps} />);

      // Assert
      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<[COMPONENT_NAME] {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();

      // Act
      await user.type(screen.getByLabelText(/[REQUIRED_FIELD]/i), '[VALID_VALUE]');

      // Assert
      expect(submitButton).toBeEnabled();
    });
  });

  /**
   * STATE MANAGEMENT TESTS
   * Test component state changes
   */
  describe('state management', () => {
    it('should update state when prop changes', () => {
      // Arrange
      const { rerender } = render(<[COMPONENT_NAME] {...defaultProps} [PROP]={[INITIAL_VALUE]} />);

      expect(screen.getByText(/[INITIAL_DISPLAY]/i)).toBeInTheDocument();

      // Act
      rerender(<[COMPONENT_NAME] {...defaultProps} [PROP]={[NEW_VALUE]} />);

      // Assert
      expect(screen.getByText(/[NEW_DISPLAY]/i)).toBeInTheDocument();
    });

    it('should maintain internal state across re-renders', async () => {
      // Arrange
      const user = userEvent.setup();
      const { rerender } = render(<[COMPONENT_NAME] {...defaultProps} />);

      // Act - Interact with component
      await user.click(screen.getByRole('button', { name: /[ACTION]/i }));

      // Act - Re-render with new props
      rerender(<[COMPONENT_NAME] {...defaultProps} [UNRELATED_PROP]={[NEW_VALUE]} />);

      // Assert - Internal state preserved
      expect(screen.getByText(/[STATE_DEPENDENT_TEXT]/i)).toBeInTheDocument();
    });
  });

  /**
   * ASYNC BEHAVIOR TESTS
   * Test loading states and async operations
   */
  describe('async behavior', () => {
    it('should show loading state while data loads', async () => {
      // Arrange
      const props = {
        ...defaultProps,
        isLoading: true,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByRole('[MAIN_CONTENT_ROLE]')).not.toBeInTheDocument();
    });

    it('should display data after loading completes', async () => {
      // Arrange
      const { rerender } = render(<[COMPONENT_NAME] {...defaultProps} isLoading={true} />);

      // Assert - Loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Act - Data loaded
      const data = create[TYPE]();
      rerender(<[COMPONENT_NAME] {...defaultProps} isLoading={false} data={data} />);

      // Assert - Content displayed
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        expect(screen.getByText(/[DATA_TEXT]/i)).toBeInTheDocument();
      });
    });

    it('should show error message when data fails to load', () => {
      // Arrange
      const props = {
        ...defaultProps,
        error: '[ERROR_MESSAGE]',
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByText(/[ERROR_MESSAGE]/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument(); // Error message should be in alert role
    });
  });

  /**
   * ACCESSIBILITY TESTS
   * Test accessibility features
   */
  describe('accessibility', () => {
    it('should have accessible name for interactive elements', () => {
      // Arrange & Act
      render(<[COMPONENT_NAME] {...defaultProps} />);

      // Assert
      expect(screen.getByRole('button', { name: /[BUTTON_TEXT]/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/[INPUT_LABEL]/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleAction = jest.fn();

      render(<[COMPONENT_NAME] {...defaultProps} onAction={handleAction} />);

      const button = screen.getByRole('button', { name: /[BUTTON_TEXT]/i });

      // Act - Tab to button and press Enter
      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');

      // Assert
      expect(handleAction).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(<[COMPONENT_NAME] {...defaultProps} />);

      // Assert
      const element = screen.getByRole('[ROLE]');
      expect(element).toHaveAttribute('aria-label', '[LABEL]');
      // Or aria-expanded, aria-selected, etc.
    });
  });

  /**
   * CONDITIONAL RENDERING TESTS
   * Test different rendering states
   */
  describe('conditional rendering', () => {
    it('should render empty state when no data', () => {
      // Arrange
      const props = {
        ...defaultProps,
        data: [],
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByText(/no [ITEMS] available/i)).toBeInTheDocument();
    });

    it('should render list when data is available', () => {
      // Arrange
      const items = [
        create[TYPE]({ id: '1', [PROPERTY]: '[VALUE_1]' }),
        create[TYPE]({ id: '2', [PROPERTY]: '[VALUE_2]' }),
      ];

      const props = {
        ...defaultProps,
        data: items,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByText('[VALUE_1]')).toBeInTheDocument();
      expect(screen.getByText('[VALUE_2]')).toBeInTheDocument();
    });

    it('should show disabled state when [CONDITION]', () => {
      // Arrange
      const props = {
        ...defaultProps,
        disabled: true,
      };

      // Act
      render(<[COMPONENT_NAME] {...props} />);

      // Assert
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('disabled'); // If applicable
    });
  });
});

/**
 * EXAMPLES OF COMMON COMPONENT PATTERNS
 */

// Example 1: Testing a simple display component
describe('ZombieCard', () => {
  it('displays zombie information', () => {
    const zombie = createTestZombie({
      name: 'Brutus',
      type: 'brute',
      stats: { currentHp: 80, maxHp: 100 },
    });

    render(<ZombieCard zombie={zombie} />);

    expect(screen.getByText('Brutus')).toBeInTheDocument();
    expect(screen.getByText(/brute/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
  });
});

// Example 2: Testing user interaction
describe('PlantSeedButton', () => {
  it('calls onPlant when clicked', async () => {
    const user = userEvent.setup();
    const handlePlant = jest.fn();

    render(<PlantSeedButton onPlant={handlePlant} />);

    await user.click(screen.getByRole('button', { name: /plant/i }));

    expect(handlePlant).toHaveBeenCalledTimes(1);
  });
});

// Example 3: Testing with context/providers
describe('FarmView', () => {
  it('displays zombies from game state', () => {
    const gameState = createTestGameState({
      farm: { activeZombies: ['z1', 'z2'] },
    });

    render(
      <GameProvider initialState={gameState}>
        <FarmView />
      </GameProvider>
    );

    expect(screen.getByText(/2 active zombies/i)).toBeInTheDocument();
  });
});

// Example 4: Testing async updates
describe('BattleResults', () => {
  it('shows results after battle completes', async () => {
    const onClose = jest.fn();

    render(<BattleResults battleId="battle-1" onClose={onClose} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/victory/i)).toBeInTheDocument();
    });
  });
});
