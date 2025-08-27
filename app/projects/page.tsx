import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Search, Filter, Upload } from "lucide-react"

export const dynamic = "force-dynamic"

interface SearchParams {
  q?: string
  tags?: string
  page?: string
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const query = searchParams.q || ""
  const tags = searchParams.tags ? searchParams.tags.split(",") : []
  const page = parseInt(searchParams.page || "1")
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

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        tags: { include: { tag: true } },
        assets: true,
        downloads: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

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
          <Button className="mt-4 md:mt-0">
            <Upload className="mr-2 h-4 w-4" />
            Upload Project
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <form className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              name="q"
              placeholder="Search projects..."
              defaultValue={query}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-gray-600">
          {totalCount} project{totalCount !== 1 ? "s" : ""} found
          {query && ` for "${query}"`}
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
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
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>By {project.owner?.name || "Unknown"}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {project.downloads.length}
                      </span>
                    </div>
                  </div>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag.tag.id} variant="outline" className="text-xs">
                          {tag.tag.name}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
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
