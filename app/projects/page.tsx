import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-start md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">AR Projects</h1>
        <Link href="/upload">
          <Button>Upload Project</Button>
        </Link>
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="h-full hover:shadow-sm">
                  <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-gray-600 line-clamp-3">{p.description}</p>
                <p className="text-sm text-gray-500 mt-3">By {p.owner?.name || "Unknown"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
    </main>
  )
}
