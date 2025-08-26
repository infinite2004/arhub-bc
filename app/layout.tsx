import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/auth-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Search, Menu } from "lucide-react"
import UserMenu from "@/components/user-menu"
import { Suspense } from "react"

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
                    <div className="hidden md:block relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Link href="/upload">
                      <Button className="hidden md:flex">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </Link>
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
