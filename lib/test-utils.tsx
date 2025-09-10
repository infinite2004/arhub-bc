// Testing utilities and mocks for comprehensive test coverage

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';

// Mock Next.js router
export const mockRouter: Partial<NextRouter> = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
};

// Mock Next.js useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock Next.js useSession hook
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession, status: 'authenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch
export const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock IntersectionObserver
export const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
export const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<NextRouter>;
  session?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    router = mockRouter,
    session = mockSession,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Update mock router
  Object.assign(mockRouter, router);

  // Update mock session
  jest.mocked(require('next-auth/react').useSession).mockReturnValue({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test data factories
export const testData = {
  user: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ...overrides,
  }),

  project: (overrides = {}) => ({
    id: '1',
    title: 'Test Project',
    description: 'A test project description',
    visibility: 'PUBLIC' as const,
    tags: ['test', 'example'],
    userId: '1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    assets: [],
    ...overrides,
  }),

  asset: (overrides = {}) => ({
    id: '1',
    kind: 'SCRIPT' as const,
    fileKey: 'test-file.js',
    fileName: 'test-file.js',
    mime: 'application/javascript',
    sizeBytes: 1024,
    projectId: '1',
    createdAt: new Date('2023-01-01'),
    ...overrides,
  }),

  apiResponse: <T>(data: T, overrides = {}) => ({
    success: true,
    data,
    message: 'Success',
    timestamp: new Date().toISOString(),
    path: '/api/test',
    ...overrides,
  }),

  apiError: (message = 'Test error', overrides = {}) => ({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: '/api/test',
    ...overrides,
  }),
};

// Mock API responses
export const mockApiResponses = {
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: async () => testData.apiResponse(data),
  }),

  error: (status = 400, message = 'Test error') => ({
    ok: false,
    status,
    json: async () => testData.apiError(message),
  }),

  networkError: () => {
    const error = new Error('Network error');
    error.name = 'TypeError';
    throw error;
  },
};

// Test utilities for async operations
export const asyncUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  waitForElement: async (selector: string, timeout = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await asyncUtils.waitFor(10);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },

  waitForText: async (text: string, timeout = 1000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (document.body.textContent?.includes(text)) {
        return true;
      }
      await asyncUtils.waitFor(10);
    }
    throw new Error(`Text "${text}" not found within ${timeout}ms`);
  },
};

// Mock file upload utilities
export const mockFileUpload = {
  createFile: (name: string, type: string, size: number) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  createImageFile: (name = 'test.jpg', size = 1024) => 
    mockFileUpload.createFile(name, 'image/jpeg', size),

  createModelFile: (name = 'test.glb', size = 1024 * 1024) => 
    mockFileUpload.createFile(name, 'model/gltf-binary', size),

  createScriptFile: (name = 'test.js', size = 1024) => 
    mockFileUpload.createFile(name, 'application/javascript', size),
};

// Performance testing utilities
export const performanceUtils = {
  measureRender: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    await asyncUtils.waitFor(0); // Wait for render to complete
    const end = performance.now();
    return end - start;
  },

  measureAsync: async (asyncFn: () => Promise<any>) => {
    const start = performance.now();
    await asyncFn();
    const end = performance.now();
    return end - start;
  },
};

// Accessibility testing utilities
export const a11yUtils = {
  getByRole: (container: HTMLElement, role: string) => {
    return container.querySelector(`[role="${role}"]`);
  },

  getByLabel: (container: HTMLElement, label: string) => {
    return container.querySelector(`[aria-label="${label}"]`);
  },

  hasAriaLabel: (element: HTMLElement) => {
    return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
  },

  isFocusable: (element: HTMLElement) => {
    const focusableSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },
};

// Form testing utilities
export const formUtils = {
  fillInput: (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },

  submitForm: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  },

  getFormData: (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  },
};

// Mock service worker utilities
export const mswUtils = {
  createHandler: (method: string, url: string, response: any) => ({
    method,
    url,
    response,
  }),

  createErrorHandler: (method: string, url: string, status: number, message: string) => ({
    method,
    url,
    response: { status, message },
  }),
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    mockFetch.mockClear();
  });

  // Clean up after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });
};

// Custom matchers for Jest
export const customMatchers = {
  toBeInTheDocument: (received: HTMLElement) => {
    const pass = document.body.contains(received);
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },

  toHaveFocus: (received: HTMLElement) => {
    const pass = document.activeElement === received;
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to have focus`,
    };
  },

  toBeAccessible: (received: HTMLElement) => {
    const hasRole = received.hasAttribute('role');
    const hasAriaLabel = a11yUtils.hasAriaLabel(received);
    const isFocusable = a11yUtils.isFocusable(received);
    
    const pass = hasRole || hasAriaLabel || isFocusable;
    
    return {
      pass,
      message: () => `Expected element to be accessible (has role, aria-label, or is focusable)`,
    };
  },
};

// Export all utilities
export * from '@testing-library/react';
export { renderWithProviders as render };

