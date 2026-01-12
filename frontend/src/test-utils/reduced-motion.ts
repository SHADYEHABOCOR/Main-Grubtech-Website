import { vi, type MockedFunction } from 'vitest';

/**
 * Test utilities for mocking and testing prefers-reduced-motion behavior
 *
 * This file provides helpers to simplify testing components that use the
 * useReducedMotion hook and respond to reduced motion preferences.
 */

/**
 * Type for the mocked useReducedMotion hook
 */
export type MockedUseReducedMotion = MockedFunction<() => boolean>;

/**
 * Mock the useReducedMotion hook with a specific return value
 *
 * @param returnValue - Whether reduced motion should be enabled (default: false)
 * @returns The mocked function for further assertions
 *
 * @example
 * ```ts
 * import { mockUseReducedMotion } from '@/test-utils/reduced-motion';
 *
 * // In your test file
 * vi.mock('@/hooks/useReducedMotion', () => ({
 *   useReducedMotion: vi.fn(),
 * }));
 *
 * describe('MyComponent', () => {
 *   it('disables animations with reduced motion', () => {
 *     mockUseReducedMotion(true);
 *     render(<MyComponent />);
 *     // ... assertions
 *   });
 * });
 * ```
 */
export function mockUseReducedMotion(returnValue: boolean = false): MockedUseReducedMotion {
  // Dynamically import to avoid module resolution issues
  const { useReducedMotion } = require('../hooks/useReducedMotion');
  const mockedHook = vi.mocked(useReducedMotion) as MockedUseReducedMotion;
  mockedHook.mockReturnValue(returnValue);
  return mockedHook;
}

/**
 * Setup reduced motion mock with beforeEach/afterEach hooks
 *
 * This is a convenience function that sets up the standard test pattern
 * used in most component tests.
 *
 * @param initialValue - Initial reduced motion state (default: false)
 * @returns Object with helper functions to change the state during tests
 *
 * @example
 * ```ts
 * import { setupReducedMotionMock } from '@/test-utils/reduced-motion';
 *
 * // In your test file (after vi.mock declaration)
 * describe('MyComponent', () => {
 *   const { enableReducedMotion, disableReducedMotion, getMock } =
 *     setupReducedMotionMock();
 *
 *   it('renders with animations by default', () => {
 *     render(<MyComponent />);
 *     // ... assertions for animations present
 *   });
 *
 *   it('disables animations with reduced motion', () => {
 *     enableReducedMotion();
 *     render(<MyComponent />);
 *     // ... assertions for animations disabled
 *   });
 * });
 * ```
 */
export function setupReducedMotionMock(initialValue: boolean = false) {
  let mockFn: MockedUseReducedMotion;

  beforeEach(() => {
    mockFn = mockUseReducedMotion(initialValue);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  return {
    /**
     * Enable reduced motion (set useReducedMotion to return true)
     */
    enableReducedMotion: () => {
      mockFn.mockReturnValue(true);
    },

    /**
     * Disable reduced motion (set useReducedMotion to return false)
     */
    disableReducedMotion: () => {
      mockFn.mockReturnValue(false);
    },

    /**
     * Get the mocked function for custom assertions
     */
    getMock: () => mockFn,
  };
}

/**
 * Mock window.matchMedia for testing prefers-reduced-motion media query
 *
 * This is useful for testing the hook itself or components that directly
 * use matchMedia instead of the hook.
 *
 * @param matches - Whether the media query should match (default: false)
 * @returns The mocked matchMedia function
 *
 * @example
 * ```ts
 * import { mockMatchMedia } from '@/test-utils/reduced-motion';
 *
 * describe('useReducedMotion hook', () => {
 *   it('returns true when prefers-reduced-motion matches', () => {
 *     mockMatchMedia(true);
 *     const { result } = renderHook(() => useReducedMotion());
 *     expect(result.current).toBe(true);
 *   });
 * });
 * ```
 */
export function mockMatchMedia(matches: boolean = false) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  const mockMediaQueryList = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(), // Deprecated but still used in some browsers
    removeListener: vi.fn(), // Deprecated but still used in some browsers
    addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(handler);
      }
    }),
    removeEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(handler);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    }),
    dispatchEvent: vi.fn(),
  };

  const matchMediaMock = vi.fn(() => mockMediaQueryList);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  return {
    matchMedia: matchMediaMock,
    mediaQueryList: mockMediaQueryList,
    /**
     * Simulate a change in the user's reduced motion preference
     */
    simulateChange: (newMatches: boolean) => {
      mockMediaQueryList.matches = newMatches;
      const event = { matches: newMatches } as MediaQueryListEvent;
      listeners.forEach(listener => listener(event));
    },
  };
}

/**
 * Common assertions for reduced motion behavior
 */
export const reducedMotionAssertions = {
  /**
   * Assert that an element does not have scale animation classes
   */
  expectNoScaleAnimation: (element: HTMLElement) => {
    expect(element.className).not.toMatch(/hover:scale-/);
    expect(element.className).not.toMatch(/active:scale-/);
  },

  /**
   * Assert that an element has scale animation classes
   */
  expectScaleAnimation: (element: HTMLElement) => {
    expect(element.className).toMatch(/hover:scale-|active:scale-/);
  },

  /**
   * Assert that an element does not have transition duration classes
   */
  expectNoTransitionDuration: (element: HTMLElement) => {
    expect(element.className).not.toMatch(/duration-\d+/);
  },

  /**
   * Assert that an element has transition duration classes
   */
  expectTransitionDuration: (element: HTMLElement) => {
    expect(element.className).toMatch(/duration-\d+/);
  },

  /**
   * Assert that an element does not have transform transitions
   */
  expectNoTransformTransition: (element: HTMLElement) => {
    expect(element.className).not.toMatch(/transition-transform/);
    expect(element.className).not.toMatch(/transition-all/);
  },

  /**
   * Assert that an element has only color transitions (reduced motion friendly)
   */
  expectColorTransitionOnly: (element: HTMLElement) => {
    expect(element.className).toMatch(/transition-colors/);
    expect(element.className).not.toMatch(/transition-all/);
    expect(element.className).not.toMatch(/transition-transform/);
  },

  /**
   * Assert that an animation keyframe class is not present
   */
  expectNoAnimationClass: (element: HTMLElement, animationName: string) => {
    expect(element.className).not.toMatch(new RegExp(`animate-${animationName}`));
    expect(element.className).not.toMatch(new RegExp(`animate-\\[.*${animationName}.*\\]`));
  },

  /**
   * Assert that an animation keyframe class is present
   */
  expectAnimationClass: (element: HTMLElement, animationName: string) => {
    const regex = new RegExp(`(animate-${animationName}|animate-\\[.*${animationName}.*\\])`);
    expect(element.className).toMatch(regex);
  },
};

/**
 * Test scenario builder for reduced motion tests
 *
 * Provides a fluent API for building common test scenarios.
 *
 * @example
 * ```ts
 * import { testReducedMotionScenario } from '@/test-utils/reduced-motion';
 *
 * describe('MyComponent animations', () => {
 *   testReducedMotionScenario('button hover effects')
 *     .withReducedMotion()
 *     .expectNoAnimation('.hover-effect')
 *     .run();
 *
 *   testReducedMotionScenario('button hover effects')
 *     .withoutReducedMotion()
 *     .expectAnimation('.hover-effect')
 *     .run();
 * });
 * ```
 */
export class ReducedMotionTestScenario {
  private description: string;
  private reducedMotion: boolean = false;
  private assertions: Array<() => void> = [];

  constructor(description: string) {
    this.description = description;
  }

  /**
   * Set the test to use reduced motion
   */
  withReducedMotion(): this {
    this.reducedMotion = true;
    return this;
  }

  /**
   * Set the test to not use reduced motion
   */
  withoutReducedMotion(): this {
    this.reducedMotion = false;
    return this;
  }

  /**
   * Add an expectation that an element should not have animations
   */
  expectNoAnimation(selector: string): this {
    this.assertions.push(() => {
      const element = document.querySelector(selector);
      expect(element).toBeInTheDocument();
      if (element) {
        reducedMotionAssertions.expectNoScaleAnimation(element as HTMLElement);
      }
    });
    return this;
  }

  /**
   * Add an expectation that an element should have animations
   */
  expectAnimation(selector: string): this {
    this.assertions.push(() => {
      const element = document.querySelector(selector);
      expect(element).toBeInTheDocument();
      if (element) {
        reducedMotionAssertions.expectScaleAnimation(element as HTMLElement);
      }
    });
    return this;
  }

  /**
   * Add a custom assertion
   */
  expect(assertion: () => void): this {
    this.assertions.push(assertion);
    return this;
  }

  /**
   * Run the test scenario
   */
  run(): void {
    const testFn = this.reducedMotion
      ? `disables animations for: ${this.description}`
      : `enables animations for: ${this.description}`;

    it(testFn, () => {
      mockUseReducedMotion(this.reducedMotion);
      this.assertions.forEach(assertion => assertion());
    });
  }
}

/**
 * Create a new test scenario builder
 */
export function testReducedMotionScenario(description: string): ReducedMotionTestScenario {
  return new ReducedMotionTestScenario(description);
}

/**
 * Helper to verify the useReducedMotion hook was called
 *
 * @example
 * ```ts
 * import { expectUseReducedMotionCalled } from '@/test-utils/reduced-motion';
 *
 * it('calls useReducedMotion hook', () => {
 *   render(<MyComponent />);
 *   expectUseReducedMotionCalled();
 * });
 * ```
 */
export function expectUseReducedMotionCalled() {
  const { useReducedMotion } = require('../hooks/useReducedMotion');
  expect(useReducedMotion).toHaveBeenCalled();
}

/**
 * Helper to verify the useReducedMotion hook was called a specific number of times
 *
 * @param times - Expected number of calls
 */
export function expectUseReducedMotionCalledTimes(times: number) {
  const { useReducedMotion } = require('../hooks/useReducedMotion');
  expect(useReducedMotion).toHaveBeenCalledTimes(times);
}
