import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, Home, Search, Upload } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline - AR Hub',
  description: 'You are currently offline. Some features may be limited.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              You're Offline
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              It looks like you've lost your internet connection. Don't worry, you can still access some features while offline.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Available Offline
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• View cached projects</li>
                <li>• Browse downloaded content</li>
                <li>• Access your profile</li>
                <li>• Use basic navigation</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Limited Offline
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Upload new projects</li>
                <li>• Search functionality</li>
                <li>• Real-time updates</li>
                <li>• Social features</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </Link>
                
                <Link href="/projects">
                  <Button variant="outline" size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Projects
                  </Button>
                </Link>
                
                <Link href="/upload">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Your data will sync automatically when you're back online.</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? Check your internet connection or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}
