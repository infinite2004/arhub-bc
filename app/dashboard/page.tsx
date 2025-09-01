import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Eye, Download, Upload, Settings, User, Calendar, TrendingUp, Activity, FileText, Package, Code, Globe, Lock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    redirect("/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      projects: {
        include: {
          tags: { include: { tag: true } },
          assets: true,
          downloads: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    redirect("/signin")
  }

  const totalDownloads = user.projects.reduce((sum, project) => sum + project.downloads.length, 0)
  const totalFiles = user.projects.reduce((sum, project) => sum + project.assets.length, 0)
  const publicProjects = user.projects.filter(p => p.visibility === "PUBLIC")
  const privateProjects = user.projects.filter(p => p.visibility === "PRIVATE")
  const unlistedProjects = user.projects.filter(p => p.visibility === "UNLISTED")

  // Calculate file type breakdown
  const fileTypes = { models: 0, scripts: 0, configs: 0 }
  user.projects.forEach(project => {
    project.assets.forEach(asset => {
      if (asset.kind === "MODEL") fileTypes.models++
      else if (asset.kind === "SCRIPT") fileTypes.scripts++
      else if (asset.kind === "CONFIG") fileTypes.configs++
    })
  })

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentProjects = user.projects.filter(p => p.createdAt >= thirtyDaysAgo)
  const recentDownloads = user.projects.reduce((sum, project) => 
    sum + project.downloads.filter(d => d.createdAt >= thirtyDaysAgo).length, 0
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getFileTypeIcon = (kind: string) => {
    switch (kind) {
      case "MODEL": return <Package className="h-4 w-4 text-blue-500" />
      case "SCRIPT": return <Code className="h-4 w-4 text-purple-500" />
      case "CONFIG": return <FileText className="h-4 w-4 text-green-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC": return <Globe className="h-4 w-4 text-green-500" />
      case "UNLISTED": return <Eye className="h-4 w-4 text-yellow-500" />
      case "PRIVATE": return <Lock className="h-4 w-4 text-red-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.projects.length}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDownloads}</p>
                <p className="text-sm text-gray-600">Total Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFiles}</p>
                <p className="text-sm text-gray-600">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{user.plan}</p>
                <p className="text-sm text-gray-600">Current Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Upload className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">New Projects</p>
                    <p className="text-sm text-gray-600">Created in the last 30 days</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {recentProjects.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Download className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Downloads</p>
                    <p className="text-sm text-gray-600">Received in the last 30 days</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {recentDownloads}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              File Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">3D Models</span>
                </div>
                <span className="text-sm font-medium">{fileTypes.models}</span>
              </div>
              <Progress value={(fileTypes.models / totalFiles) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Code className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm">Scripts</span>
                </div>
                <span className="text-sm font-medium">{fileTypes.scripts}</span>
              </div>
              <Progress value={(fileTypes.scripts / totalFiles) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Configs</span>
                </div>
                <span className="text-sm font-medium">{fileTypes.configs}</span>
              </div>
              <Progress value={(fileTypes.configs / totalFiles) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Projects</h2>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Project
              </Button>
            </Link>
          </div>

          {user.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.projects.map((project) => (
                <Card key={project.id} className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getVisibilityIcon(project.visibility)}
                        <Badge variant={project.visibility === "PUBLIC" ? "default" : "secondary"}>
                          {project.visibility}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {project.assets.length} files
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {project.downloads.length} downloads
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.tag.id} variant="outline" className="text-xs">
                            {tag.tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/projects/${project.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No projects yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by uploading your first AR project and share it with the community
              </p>
              <Link href="/upload">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Your First Project
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan</label>
                  <Badge variant="outline" className="capitalize">{user.plan}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{user.projects.length}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{totalDownloads}</p>
                    <p className="text-sm text-gray-600">Total Downloads</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{publicProjects.length}</p>
                    <p className="text-sm text-gray-600">Public Projects</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{privateProjects.length}</p>
                    <p className="text-sm text-gray-600">Private Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Project Visibility Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-green-500 mr-2" />
                    <span>Public Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(publicProjects.length / user.projects.length) * 100} className="w-24 h-2" />
                    <span className="text-sm font-medium">{publicProjects.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Unlisted Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(unlistedProjects.length / user.projects.length) * 100} className="w-24 h-2" />
                    <span className="text-sm font-medium">{unlistedProjects.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 text-red-500 mr-2" />
                    <span>Private Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(privateProjects.length / user.projects.length) * 100} className="w-24 h-2" />
                    <span className="text-sm font-medium">{privateProjects.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
