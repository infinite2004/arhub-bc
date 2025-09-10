# AR Hub - Modern AR/VR Content Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-blue)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)

A modern, high-performance platform for AR/VR content creators and developers. Built with Next.js 15, React 19, TypeScript, and modern web technologies.

## ✨ Features

### Core Platform
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript 5
- **3D Content Support**: WebGL, Three.js, React Three Fiber
- **Authentication**: NextAuth.js with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 integration with UploadThing
- **Real-time Features**: WebSocket support for live collaboration

### Performance & Monitoring
- **Performance Dashboard**: Real-time Core Web Vitals tracking
- **Performance Budgets**: Automated performance monitoring and alerts
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Memory Monitoring**: Heap memory usage tracking
- **Optimization Suggestions**: Automated performance recommendations
- **Caching Layer**: Redis + in-memory caching for optimal performance

### User Experience
- **Drag & Drop Upload**: Intuitive file upload with preview
- **Loading States**: Comprehensive skeleton components and loading indicators
- **Error Boundaries**: Advanced error handling with recovery options
- **Progressive Loading**: Multi-stage loading with progress indicators
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant with screen reader support

### Security & Validation
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: API rate limiting with Redis backend
- **Security Headers**: Comprehensive security headers configuration
- **CSRF Protection**: Cross-site request forgery prevention
- **Password Security**: Advanced password strength validation
- **Security Auditing**: Automated security vulnerability detection

### Development & Testing
- **Comprehensive Testing**: Jest, React Testing Library, MSW
- **Test Utilities**: Custom testing utilities and mocks
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Reporting**: Advanced error tracking and reporting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+ or pnpm
- PostgreSQL 12+
- AWS S3 bucket (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/arhub-bc.git
   cd arhub-bc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/arhub"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # AWS S3
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your-bucket-name"
   
   # UploadThing
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   
   # Redis (for caching and rate limiting)
   REDIS_URL="redis://localhost:6379"
   
   # Performance Monitoring
   NEXT_PUBLIC_APP_VERSION="1.0.0"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # (Optional) Run migrations
   pnpm db:migrate
   
   # (Optional) Seed with sample data
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
arhub-bc/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── projects/          # Project management
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── utils.ts          # General utilities
│   └── api-response.ts   # API response handlers
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── styles/               # Additional styles
└── tests/                # Test files
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm clean` | Clean build artifacts |

## 🧪 Testing

The project includes comprehensive testing setup with custom utilities, mocks, and extensive coverage.

### Testing Stack

- **Jest**: Test runner with custom configuration
- **React Testing Library**: Component testing with accessibility focus
- **MSW**: API mocking and service worker integration
- **Custom Test Utilities**: Comprehensive testing helpers and mocks
- **Coverage**: 80% minimum coverage requirement

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test __tests__/upload-page.test.tsx

# Run tests with verbose output
pnpm test --verbose
```

### Test Utilities

```typescript
import { 
  renderWithProviders, 
  testData, 
  mockFileUpload, 
  asyncUtils,
  a11yUtils,
  formUtils 
} from '@/lib/test-utils';

// Render with providers
renderWithProviders(<MyComponent />, {
  router: { pathname: '/test' },
  session: testData.user()
});

// Test data factories
const user = testData.user({ name: 'Custom User' });
const project = testData.project({ title: 'Test Project' });

// File upload testing
const file = mockFileUpload.createScriptFile('test.js', 1024);

// Async utilities
await asyncUtils.waitFor(100);
await asyncUtils.waitForElement('.my-element');

// Accessibility testing
const element = a11yUtils.getByRole(container, 'button');
expect(a11yUtils.isFocusable(element)).toBe(true);

// Form testing
formUtils.fillInput(input, 'test value');
formUtils.submitForm(form);
```

### Test Structure

```
__tests__/
├── components/          # Component tests
├── lib/                # Utility tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests

lib/
├── test-utils.tsx      # Custom testing utilities
└── __mocks__/         # Mock implementations
```

### Writing Tests

```typescript
import { renderWithProviders, testData } from '@/lib/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    renderWithProviders(<MyComponent />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clicked!')).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    renderWithProviders(<MyComponent />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
```

## 📊 Performance Monitoring

The project includes comprehensive performance monitoring with real-time tracking and optimization suggestions.

### Performance Dashboard

Access the performance dashboard to monitor your application's health:

```typescript
import { PerformanceDashboard } from '@/components/performance-dashboard';

// Use in your admin or dashboard page
<PerformanceDashboard />
```

### Core Web Vitals Tracking

```typescript
import { performanceMonitor, realTimeTracker } from '@/lib/performance';

// Get performance score (0-100)
const score = performanceMonitor.getPerformanceScore();

// Get detailed metrics
const metrics = performanceMonitor.getMetrics();

// Get optimization insights
const insights = performanceMonitor.getPerformanceInsights();

// Track real-time metrics
realTimeTracker.trackMetric('api-response-time', 150);
const averageResponseTime = realTimeTracker.getAverageMetric('api-response-time');
```

### Performance Budgets

```typescript
import { checkPerformanceBudget, DEFAULT_BUDGET } from '@/lib/performance';

const budget = {
  lcp: 2500,  // ms
  fid: 100,   // ms
  cls: 0.1,   // score
  tbt: 200,   // ms
};

const result = checkPerformanceBudget(metrics, budget);
if (!result.passed) {
  console.log('Budget violations:', result.violations);
}
```

### Performance Utilities

```typescript
import { 
  debounce, 
  throttle, 
  measurePerformance,
  preloadImage,
  lazyLoadImages 
} from '@/lib/performance';

// Debounce expensive operations
const debouncedSearch = debounce(searchFunction, 300);

// Throttle scroll events
const throttledScroll = throttle(handleScroll, 100);

// Measure function performance
const result = measurePerformance('expensive-operation', () => {
  // Your expensive operation
});

// Preload critical images
await preloadImage('/critical-image.jpg');

// Enable lazy loading
lazyLoadImages();
```

## 🚀 Caching & Performance

The project includes a comprehensive caching layer with Redis and in-memory caching for optimal performance.

### Caching Features

- **Multi-layer Caching**: Redis + in-memory caching
- **Cache Invalidation**: Tag-based cache invalidation
- **Performance Optimization**: Automatic cache warming and optimization
- **API Response Caching**: Intelligent API response caching
- **Static Asset Caching**: Optimized static asset delivery

### Cache Usage

```typescript
import { cache, cacheUtils } from '@/lib/cache';

// Basic caching
await cache.set('user:123', userData, { ttl: 3600 });
const user = await cache.get('user:123');

// Cache with tags for invalidation
await cache.set('project:456', projectData, { 
  ttl: 1800, 
  tags: ['projects', 'user:123'] 
});

// Invalidate by tags
await cache.invalidateByTags(['projects']);

// Cache API responses
const data = await cacheUtils.cacheApiResponse(
  'api:projects',
  () => fetchProjects(),
  { ttl: 300, tags: ['projects'] }
);

// Cache with automatic key generation
const result = await cacheUtils.cacheWithKey(
  '/api/projects',
  () => fetchProjects(),
  { userId: '123' },
  { ttl: 600 }
);
```

### Cache Decorators

```typescript
import { cached } from '@/lib/cache';

class ProjectService {
  @cached({ ttl: 300, tags: ['projects'] })
  async getProject(id: string) {
    // This method will be automatically cached
    return await this.fetchProjectFromDB(id);
  }
}
```

### Cache Configuration

```typescript
// Environment variables
REDIS_URL="redis://localhost:6379"

// Cache options
const cacheOptions = {
  ttl: 3600,           // Time to live in seconds
  tags: ['projects'],  // Cache tags for invalidation
  compress: true,      // Compress large data
  serialize: true      // Serialize complex objects
};
```

## 🔒 Security Features

### Authentication & Authorization
- **Authentication**: JWT-based with NextAuth.js
- **Authorization**: Role-based access control
- **Session Management**: Secure session handling with CSRF protection

### Input Validation & Sanitization
- **Input Validation**: Zod schema validation with custom sanitization
- **XSS Prevention**: HTML sanitization and CSP headers
- **SQL Injection Protection**: Parameterized queries and input sanitization
- **File Upload Security**: File type validation and size limits

### Rate Limiting & Protection
- **Rate Limiting**: Redis-backed API rate limiting
- **CSRF Protection**: Cross-site request forgery prevention
- **Security Headers**: Comprehensive security headers configuration
- **Security Auditing**: Automated vulnerability detection

### Security Utilities

```typescript
import { 
  InputSanitizer, 
  RateLimiter, 
  PasswordSecurity,
  withSecurity 
} from '@/lib/security';

// Sanitize user input
const cleanHtml = InputSanitizer.sanitizeHtml(userInput);
const cleanFileName = InputSanitizer.sanitizeFileName(fileName);

// Rate limiting
const rateLimiter = RateLimiter.getInstance();
const result = await rateLimiter.checkLimit('user-123', 100, 60000);

// Password security
const strength = PasswordSecurity.checkStrength(password);
const securePassword = PasswordSecurity.generatePassword(16);

// Security middleware for API routes
export default withSecurity(apiHandler);
```

### Security Configuration

```typescript
// Security headers configuration
export const securityHeaders = {
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    // ... more CSP rules
  },
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000',
    // ... more security headers
  }
};
```

## 🌐 API Documentation

### Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  path: string;
}
```

### Error Handling

```typescript
import { handleApiError, badRequestResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    // Your logic here
    return successResponse(data);
  } catch (error) {
    return handleApiError(error, '/api/endpoint');
  }
}
```

## 🎨 UI Components

Built with a modern design system featuring comprehensive loading states, error handling, and accessibility.

### Core Components

- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework with custom AR/VR themes
- **Lucide Icons**: Beautiful icon set
- **Skeleton Components**: Comprehensive loading states
- **Error Boundaries**: Advanced error handling with recovery

### Loading States & Skeletons

```typescript
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList, 
  LoadingSpinner,
  LoadingOverlay,
  ProgressiveLoader 
} from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton className="h-4 w-3/4" />

// Card skeleton
<SkeletonCard />

// List skeleton
<SkeletonList items={5} />

// Loading spinner
<LoadingSpinner size="lg" />

// Loading overlay
<LoadingOverlay isLoading={loading} message="Processing...">
  <YourContent />
</LoadingOverlay>

// Progressive loading
<ProgressiveLoader 
  stages={['Uploading', 'Processing', 'Complete']}
  currentStage={1}
/>
```

### Error Handling

```typescript
import { ErrorBoundary, withErrorBoundary } from '@/components/error-boundary';

// Wrap components with error boundary
<ErrorBoundary 
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Error caught:', error);
  }}
  resetKeys={[someKey]}
>
  <YourComponent />
</ErrorBoundary>

// HOC for error boundaries
const SafeComponent = withErrorBoundary(YourComponent, {
  fallback: <div>Something went wrong</div>
});
```

### Performance Dashboard

```typescript
import { PerformanceDashboard } from '@/components/performance-dashboard';

// Use in admin dashboard
<PerformanceDashboard className="w-full" />
```

### Component Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MyComponent({ loading, data }) {
  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build image
docker build -t arhub .

# Run container
docker run -p 3000:3000 arhub
```

### Environment Variables

Make sure to set all required environment variables in production:

```env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Format code: `pnpm format`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Follow the established code style (ESLint + Prettier)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Three.js](https://threejs.org/) - 3D graphics library

## 📞 Support

- **Documentation**: [docs.arhub.com](https://docs.arhub.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/arhub-bc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/arhub-bc/discussions)
- **Email**: support@arhub.com

---

Made with ❤️ by the AR Hub Team