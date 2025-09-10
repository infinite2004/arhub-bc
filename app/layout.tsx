import type React from "react"
import "@/app/globals.css"
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider"
import AuthProvider from "@/components/auth-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Search, Menu } from "lucide-react"
import UserMenu from "@/components/user-menu"
import { Suspense } from "react"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { SearchBar } from "@/components/search-bar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Link href="/" className="text-2xl font-bold text-blue-600 mr-8">
                      AR Hub
                    </Link>
                    <nav className="hidden md:flex space-x-6">
                      <Link href="/projects" className="text-gray-600 hover:text-blue-600">
                        Projects
                      </Link>
                      <Link href="/docs" className="text-gray-600 hover:text-blue-600">
                        Documentation
                      </Link>
                      <Link href="/community" className="text-gray-600 hover:text-blue-600">
                        Community
                      </Link>
                    </nav>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden md:block w-80">
                      <SearchBar 
                        placeholder="Search projects..."
                        suggestions={["3D Models", "OpenCV Scripts", "AR Apps", "Tutorials"]}
                        onSearch={(query) => {
                          // Navigate to search results page
                          const params = new URLSearchParams();
                          if (query) params.set("q", query);
                          const searchURL = params.toString() ? `/search?${params.toString()}` : "/search";
                          window.location.href = searchURL;
                        }}
                        onFilter={(filters) => {
                          // Navigate to search results page with filters
                          const params = new URLSearchParams();
                          if (filters.category) params.set("category", filters.category);
                          if (filters.tags && filters.tags.length > 0) params.set("tags", filters.tags.join(","));
                          if (filters.sortBy && filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
                          if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange);
                          const searchURL = params.toString() ? `/search?${params.toString()}` : "/search";
                          window.location.href = searchURL;
                        }}
                      />
                    </div>
                    <Link href="/upload">
                      <Button className="hidden md:flex">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </Link>
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Search className="h-5 w-5" />
                    </Button>
                    <UserMenu />
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </header>
            <Suspense>{children}</Suspense>
            <PerformanceMonitor showDetails={process.env.NODE_ENV === "development"} />
            <footer className="mt-auto border-t py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AR Hub</h3>
                    <p className="text-gray-600">
                      A platform for sharing and discovering AR projects powered by OpenCV.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resources</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/docs" className="text-gray-600 hover:text-blue-600">
                          Documentation
                        </Link>
                      </li>
                      <li>
                        <Link href="/tutorials" className="text-gray-600 hover:text-blue-600">
                          Tutorials
                        </Link>
                      </li>
                      <li>
                        <Link href="/api" className="text-gray-600 hover:text-blue-600">
                          API Reference
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Community</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/forum" className="text-gray-600 hover:text-blue-600">
                          Forum
                        </Link>
                      </li>
                      <li>
                        <Link href="/discord" className="text-gray-600 hover:text-blue-600">
                          Discord
                        </Link>
                      </li>
                      <li>
                        <Link href="/github" className="text-gray-600 hover:text-blue-600">
                          GitHub
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/terms" className="text-gray-600 hover:text-blue-600">
                          Terms of Service
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/licenses" className="text-gray-600 hover:text-blue-600">
                          Licenses
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-gray-500">
                  <p>&copy; {new Date().getFullYear()} AR Hub. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
