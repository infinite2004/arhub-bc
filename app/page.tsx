import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Download, Eye } from "lucide-react"
import FeaturedProjects from "@/components/featured-projects"
import HeroSection from "@/components/hero-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured AR Projects</h2>
            <Link href="/projects">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <FeaturedProjects />
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload</h3>
              <p className="text-gray-600">
                Upload your AR projects powered by OpenCV, including scripts and 3D models.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Preview</h3>
              <p className="text-gray-600">
                Preview your 3D models directly in the browser using our Three.js/WebGL viewer.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Download & Run</h3>
              <p className="text-gray-600">
                Download complete AR project bundles and run them locally using our Python runner.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Share Your AR Project?</h2>
            <p className="mb-6 text-lg">
              Join our community of AR developers and showcase your OpenCV-powered creations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/upload">
                <Button variant="secondary" size="lg">
                  Upload Project
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/10"
                  size="lg"
                >
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
