# AR Hub - Modern AR/VR Content Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-blue)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)

A modern, high-performance platform for AR/VR content creators and developers. Built with Next.js 15, React 19, TypeScript, and modern web technologies.

## ✨ Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript 5
- **3D Content Support**: WebGL, Three.js, React Three Fiber
- **Authentication**: NextAuth.js with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 integration
- **Real-time Features**: WebSocket support for live collaboration
- **Performance Optimized**: Core Web Vitals, lazy loading, code splitting
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Testing**: Jest, React Testing Library, comprehensive test coverage
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

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

The project includes comprehensive testing setup:

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Coverage**: 70% minimum coverage requirement

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test components/Button.test.tsx
```

### Test Structure

```
tests/
├── __mocks__/           # Mock files
├── components/          # Component tests
├── lib/                # Utility tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests
```

## 📊 Performance Monitoring

The project includes built-in performance monitoring:

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: Webpack bundle analyzer
- **Memory Usage**: Heap memory monitoring
- **Performance Insights**: Automated optimization suggestions

### Performance Metrics

```typescript
import { performanceMonitor } from '@/lib/performance';

// Get performance score (0-100)
const score = performanceMonitor.getPerformanceScore();

// Get detailed metrics
const metrics = performanceMonitor.getMetrics();

// Get optimization insights
const insights = performanceMonitor.getPerformanceInsights();
```

## 🔒 Security Features

- **Authentication**: JWT-based with NextAuth.js
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting
- **CORS**: Configurable CORS policies
- **Security Headers**: Helmet.js integration

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

Built with a modern design system:

- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Lucide Icons**: Beautiful icon set

### Component Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyComponent() {
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