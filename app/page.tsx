import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, Eye, Download, Users, Code, Sparkles, Globe, Shield, Zap } from "lucide-react"
import { prisma } from "@/lib/db"
import { SkeletonCard, SkeletonList } from "@/components/loading-spinner"
import { Suspense } from "react"

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
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <Sparkles className="h-4 w-4 animate-spin" />
              The Ultimate AR Project Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight animate-fade-in-up">
              Share and Discover
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient"> AR Projects</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Upload your AR projects with 3D models and OpenCV scripts. Connect with developers, 
              share your work, and discover amazing augmented reality experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400">
              <Link href="/upload">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Upload className="mr-3 h-6 w-6" />
                  Upload Project
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  Explore Projects
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Global Community</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platform Statistics</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of developers who are already sharing and discovering AR projects
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-8 pb-6">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-count-up">{projectCount.toLocaleString()}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">AR Projects</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-8 pb-6">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-count-up">{userCount.toLocaleString()}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Developers</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-8 pb-6">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-count-up">{downloadCount.toLocaleString()}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Downloads</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Projects</h2>
              <p className="text-gray-600 dark:text-gray-300">Discover the most popular AR projects from our community</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <Suspense fallback={<SkeletonList items={6} />}>
            {featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2 text-gray-900 dark:text-white">{project.title}</CardTitle>
                          <Badge variant="secondary" className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {project.assets.length} files
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">{project.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="font-medium">By {project.owner?.name || "Unknown"}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{project.downloads.length}</span>
                          </div>
                        </div>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.tag.id} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
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
              <div className="text-center py-16">
                <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No projects yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Be the first to upload an AR project and inspire the community!
                </p>
                <Link href="/upload">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your First Project
                  </Button>
                </Link>
              </div>
            )}
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose ARHub?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Everything you need to share, discover, and collaborate on AR projects
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-blue-100 dark:bg-blue-900 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Easy Upload</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Upload your 3D models, scripts, and configs with our intuitive drag-and-drop interface. 
                Support for multiple file formats and automatic validation.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-green-100 dark:bg-green-900 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3D Preview</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Preview your 3D models directly in the browser with our built-in viewer. 
                Interactive controls and real-time rendering for the best experience.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-purple-100 dark:bg-purple-900 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Community</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect with other AR developers, share your knowledge, and get feedback on your projects. 
                Build your network in the AR community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Share Your AR Project?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already sharing their amazing AR experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                <Upload className="mr-3 h-6 w-6" />
                Start Uploading
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-white text-white hover:bg-white hover:text-blue-600">
                Browse Projects
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
