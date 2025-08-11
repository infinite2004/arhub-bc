import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AR Project Hub
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Upload, preview, and share your OpenCV-powered AR projects. Our platform makes it easy to showcase your work
            and collaborate with others.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/upload">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Upload Project <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="w-full h-[400px] relative">
            <ModelViewer />
          </div>
        </div>
      </div>
    </div>
  )
}

function ModelViewer() {
  return (
    <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
      <div className="text-center p-6">
        <p className="text-gray-500 mb-4">3D Model Preview</p>
        <p className="text-sm text-gray-400">Interactive 3D preview will be displayed here</p>
      </div>
    </div>
  )
}
