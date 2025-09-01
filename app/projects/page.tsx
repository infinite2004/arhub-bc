import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Filter, Upload, Calendar, User, FileText, TrendingUp, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

interface SearchParams {
  q?: string
  tags?: string
  page?: string
  sort?: string
  category?: string
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const query = searchParams.q || ""
  const tags = searchParams.tags ? searchParams.tags.split(",") : []
  const page = parseInt(searchParams.page || "1")
  const sort = searchParams.sort || "newest"
  const category = searchParams.category || "all"
  const pageSize = 12

  // Build where clause
  const where: any = { visibility: "PUBLIC" }
  
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  if (tags.length > 0) {
    where.tags = { some: { tag: { slug: { in: tags } } } }
  }

  // Build order by clause
  let orderBy: any = { createdAt: "desc" }
  if (sort === "popular") {
    orderBy = { downloads: { _count: "desc" } }
  } else if (sort === "oldest") {
    orderBy = { createdAt: "asc" }
  }

  const [projects, totalCount, popularTags] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        tags: { include: { tag: true } },
        assets: true,
        downloads: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count({ where }),
    prisma.tag.findMany({
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: {
        projects: { _count: "desc" }
      },
      take: 10
    })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getFileTypeCount = (assets: any[]) => {
    const types = { models: 0, scripts: 0, configs: 0 }
    assets.forEach(asset => {
      if (asset.kind === "MODEL") types.models++
      else if (asset.kind === "SCRIPT") types.scripts++
      else if (asset.kind === "CONFIG") types.configs++
    })
    return types
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AR Projects</h1>
          <p className="text-gray-600">
            Discover and explore amazing AR projects from the community
          </p>
        </div>
        <Link href="/upload">
          <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Project
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              name="q"
              placeholder="Search projects by title or description..."
              defaultValue={query}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2">
            <Select name="sort" defaultValue={sort}>
              <SelectTrigger className="w-40 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline" className="flex items-center h-12">
              <Filter className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">Popular tags:</span>
            {popularTags.slice(0, 8).map((tag) => (
              <Link
                key={tag.id}
                href={`/projects?tags=${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {tag.name}
                <span className="ml-1 text-xs text-gray-500">({tag._count.projects})</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <p className="text-gray-600 mb-2 sm:mb-0">
          {totalCount.toLocaleString()} project{totalCount !== 1 ? "s" : ""} found
          {query && ` for "${query}"`}
        </p>
        {query && (
          <Link href="/projects">
            <Button variant="outline" size="sm">
              Clear Search
            </Button>
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => {
            const fileTypes = getFileTypeCount(project.assets)
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {project.assets.length} files
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* File type breakdown */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      {fileTypes.models > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {fileTypes.models} models
                        </span>
                      )}
                      {fileTypes.scripts > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {fileTypes.scripts} scripts
                        </span>
                      )}
                      {fileTypes.configs > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {fileTypes.configs} configs
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{project.owner?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.downloads.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      {project.downloads.length > 10 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>Popular</span>
                        </div>
                      )}
                    </div>

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.tag.id} variant="outline" className="text-xs bg-gray-50">
                            {tag.tag.name}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            +{project.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No projects found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {query ? `No projects match "${query}"` : "No projects available yet"}
          </p>
          {query && (
            <Link href="/projects">
              <Button variant="outline">Clear Search</Button>
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/projects?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <Link
                  key={pageNum}
                  href={`/projects?${new URLSearchParams({ ...searchParams, page: String(pageNum) })}`}
                >
                  <Button
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                </Link>
              )
            })}
          </div>

          {page < totalPages && (
            <Link href={`/projects?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
