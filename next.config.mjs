/** @type {import('next').NextConfig} */
const nextConfig = {
  // React and Next.js optimizations
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  // Performance optimizations
  experimental: {
    // Enable modern React features
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'clsx',
      'tailwind-merge',
    ],
    
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'yourdomain.com'],
    },
    
    // Enable partial prerendering
    ppr: true,
    
    // Enable turbo
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Enable webpack bundle analyzer
    webpackBuildWorker: true,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Remote image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html',
        })
      );
    }

    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Handle GLSL shaders
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Handle 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf|obj|fbx|dae)$/,
      type: 'asset/resource',
    });

    // Performance hints
    config.performance = {
      hints: dev ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    return config;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/projects/:id/download',
        destination: '/api/projects/:id/download',
        permanent: false,
      },
    ];
  },

  // Rewrites for API proxying
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Enable styled components
    styledComponents: true,
    
    // Enable emotion
    emotion: false,
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },

  // Output configuration
  output: 'standalone',

  // Trailing slash
  trailingSlash: false,

  // Base path
  basePath: '',

  // Asset prefix
  assetPrefix: '',

  // Generate build ID
  generateBuildId: async () => {
    // You can set this to a commit hash or other unique identifier
    return 'arhub-build-' + Date.now();
  },

  // On demand entries
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // DevIndicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Transpile packages
  transpilePackages: [
    '@radix-ui/react-icons',
    '@radix-ui/react-primitive',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
  ],
};

// Bundle analyzer configuration
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

export default withBundleAnalyzer(nextConfig);