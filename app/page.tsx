import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, Eye, Download, Users, Code } from "lucide-react"
import { prisma } from "@/lib/db"

export default async function HomePage() {
  // Fetch featured projects and stats
  const [featuredProjects, stats] = await Promise.all([
    prisma.project.findMany({
      where: { visibility: "PUBLIC" },
      include: {
        owner: { select: { name: true } },
        tags: { include: { tag: true } },
        assets: true,
        downloads: true,
      },
      orderBy: { downloads: { _count: "desc" } },
      take: 6,
    }),
    prisma.$transaction([
      prisma.project.count(),
      prisma.user.count(),
      prisma.download.count(),
    ]),
  ])

  const [projectCount, userCount, downloadCount] = stats

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Share and Discover
            <span className="text-blue-600"> AR Projects</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your AR projects with 3D models and OpenCV scripts. Connect with developers, 
            share your work, and discover amazing augmented reality experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Upload className="mr-2 h-5 w-5" />
                Upload Project
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline">
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{projectCount}</h3>
                <p className="text-gray-600">AR Projects</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{userCount}</h3>
                <p className="text-gray-600">Developers</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{downloadCount}</h3>
                <p className="text-gray-600">Downloads</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
            <Link href="/projects">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                          {project.assets.length} files
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {project.owner?.name || "Unknown"}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {project.downloads.length}
                          </span>
                        </div>
                      </div>
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.tag.id} variant="outline" className="text-xs">
                              {tag.tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Be the first to upload an AR project!</p>
              <Link href="/upload">
                <Button>Upload Your First Project</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ARHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Upload your 3D models, scripts, and configs with our intuitive interface.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3D Preview</h3>
              <p className="text-gray-600">
                Preview your 3D models directly in the browser with our built-in viewer.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Connect with other AR developers and share your knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
