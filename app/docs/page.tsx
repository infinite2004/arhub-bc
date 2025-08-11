import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Book, Code, FileText, HelpCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import DocSidebar from "@/components/doc-sidebar"
import CodeBlock from "@/components/code-block"

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 lg:w-1/5">
          <DocSidebar />
        </div>

        <div className="md:w-3/4 lg:w-4/5">
          <div className="mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search documentation..." className="pl-10" />
            </div>

            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-xl text-gray-600 mb-6">
              Learn how to use the AR Hub platform to create, share, and run AR projects.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/docs/getting-started">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Book className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                    <p className="text-gray-600 text-sm">Learn the basics of using AR Hub</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/api">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <Code className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">API Reference</h3>
                    <p className="text-gray-600 text-sm">Explore the AR Hub API documentation</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/tutorials">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <FileText className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Tutorials</h3>
                    <p className="text-gray-600 text-sm">Step-by-step guides for AR projects</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/faq">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <HelpCircle className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">FAQ</h3>
                    <p className="text-gray-600 text-sm">Answers to common questions</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Getting Started with AR Hub</h2>

            <div className="prose max-w-none">
              <p className="mb-4">
                AR Hub is a platform for creating, sharing, and running augmented reality projects powered by OpenCV.
                This guide will help you get started with using the platform.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Prerequisites</h3>
              <ul className="list-disc pl-6 mb-6">
                <li>Python 3.8 or higher</li>
                <li>OpenCV 4.5 or higher</li>
                <li>Basic understanding of computer vision concepts</li>
                <li>A webcam or camera for testing AR applications</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Installation</h3>
              <p className="mb-4">To run AR projects locally, you'll need to install the AR Hub Python runner:</p>

              <CodeBlock code="pip install arhub-runner" language="bash" />

              <p className="mt-4 mb-4">After installation, verify that it's working correctly:</p>

              <CodeBlock code="arhub-runner --version" language="bash" />

              <h3 className="text-xl font-semibold mt-6 mb-3">Running Your First AR Project</h3>
              <p className="mb-4">
                Once you've downloaded a project from AR Hub, you can run it using the following steps:
              </p>

              <ol className="list-decimal pl-6 mb-6">
                <li className="mb-2">Extract the project files to a directory</li>
                <li className="mb-2">Navigate to the project directory in your terminal</li>
                <li className="mb-2">Install any project-specific dependencies listed in requirements.txt</li>
                <li className="mb-2">Run the project using the AR Hub runner</li>
              </ol>

              <CodeBlock
                code={`# Install project dependencies
pip install -r requirements.txt

# Run the project
arhub-runner run`}
                language="bash"
              />
            </div>

            <div className="mt-8">
              <Link href="/docs/getting-started">
                <Button>
                  Read Full Getting Started Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Tutorials</h2>

            <Tabs defaultValue="beginner">
              <TabsList className="mb-6">
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="beginner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/docs/tutorials/face-tracking-basics">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Face Tracking Basics</h3>
                        <p className="text-gray-600 mb-4">
                          Learn how to implement basic face tracking using OpenCV and AR Hub.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/docs/tutorials/ar-markers">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Working with AR Markers</h3>
                        <p className="text-gray-600 mb-4">
                          Create your first AR application using marker-based tracking.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="intermediate">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/docs/tutorials/3d-model-integration">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">3D Model Integration</h3>
                        <p className="text-gray-600 mb-4">
                          Learn how to integrate 3D models with your AR tracking system.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/docs/tutorials/gesture-recognition">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Gesture Recognition</h3>
                        <p className="text-gray-600 mb-4">
                          Implement hand gesture recognition for interactive AR experiences.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/docs/tutorials/slam-basics">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">SLAM Basics</h3>
                        <p className="text-gray-600 mb-4">
                          Introduction to Simultaneous Localization and Mapping for AR.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/docs/tutorials/neural-networks-ar">
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Neural Networks in AR</h3>
                        <p className="text-gray-600 mb-4">
                          Implementing neural networks for advanced AR object recognition.
                        </p>
                        <div className="text-blue-600 text-sm font-medium flex items-center">
                          Read Tutorial
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <Link href="/docs/tutorials">
                <Button variant="outline">
                  View All Tutorials
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="mb-6">
              Can't find what you're looking for? Check out our community forums or contact our support team.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/community">
                <Button variant="outline">Visit Community Forums</Button>
              </Link>
              <Link href="/contact">
                <Button>Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
