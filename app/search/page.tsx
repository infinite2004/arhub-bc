"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { LoadingSpinner, SkeletonCard } from "@/components/loading-spinner";
import { EnhancedCard } from "@/components/animated-card";
import { Eye, Download, Calendar, User, Filter, SortAsc } from "lucide-react";
import Link from "next/link";
import { debounce } from "@/lib/performance";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
  assets: Array<{
    id: string;
    filename: string;
    type: string;
  }>;
  downloads: Array<{
    id: string;
  }>;
  _count: {
    downloads: number;
    assets: number;
  };
}

interface SearchResults {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  suggestions: string[];
  filters: {
    query: string;
    category?: string;
    tags: string[];
    sortBy: string;
    dateRange: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState(searchParams.get("q") || "");
  const [currentFilters, setCurrentFilters] = useState({
    category: searchParams.get("category") || undefined,
    tags: searchParams.get("tags")?.split(",") || [],
    sortBy: searchParams.get("sortBy") || "relevance",
    dateRange: searchParams.get("dateRange") || "all",
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: any) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (filters.category) params.set("category", filters.category);
        if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.dateRange) params.set("dateRange", filters.dateRange);

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error || "Search failed");
        }
      } catch (err) {
        setError("Failed to search projects");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Update URL when search parameters change
  const updateURL = (query: string, filters: any) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.category) params.set("category", filters.category);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.sortBy && filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
    if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange);

    const newURL = params.toString() ? `/search?${params.toString()}` : "/search";
    router.push(newURL, { scroll: false });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    updateURL(query, currentFilters);
    debouncedSearch(query, currentFilters);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setCurrentFilters(updatedFilters);
    updateURL(currentQuery, updatedFilters);
    debouncedSearch(currentQuery, updatedFilters);
  };

  // Load initial results
  useEffect(() => {
    if (currentQuery || Object.values(currentFilters).some(v => v && v !== "relevance" && v !== "all")) {
      debouncedSearch(currentQuery, currentFilters);
    }
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "3d-models": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      "opencv-scripts": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      "ar-apps": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      "tutorials": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Search Projects
        </h1>
        <div className="max-w-2xl">
          <SearchBar
            placeholder="Search for AR projects, 3D models, OpenCV scripts..."
            suggestions={results?.suggestions || []}
            onSearch={handleSearch}
            onFilter={handleFilterChange}
            showFilters={true}
          />
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Search Error
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <Button
              onClick={() => debouncedSearch(currentQuery, currentFilters)}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {results && !loading && (
        <>
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {results.pagination.totalCount > 0 ? (
                <>
                  Found <span className="font-semibold">{results.pagination.totalCount}</span> project
                  {results.pagination.totalCount !== 1 ? "s" : ""}
                  {currentQuery && (
                    <> for "<span className="font-semibold">{currentQuery}</span>"</>
                  )}
                </>
              ) : (
                <>
                  No projects found
                  {currentQuery && (
                    <> for "<span className="font-semibold">{currentQuery}</span>"</>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Projects Grid */}
          {results.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.projects.map((project, index) => (
                <EnhancedCard
                  key={project.id}
                  delay={index * 100}
                  hoverEffect="lift"
                  className="h-full"
                >
                  <Link href={`/projects/${project.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg line-clamp-2 text-gray-900 dark:text-white">
                            {project.title}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${getCategoryColor(project.category)}`}
                          >
                            {project.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{project.owner.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(project.createdAt)}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{project._count.downloads}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>{project._count.assets} files</span>
                            </div>
                          </div>
                        </div>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag.tag.id}
                                variant="outline"
                                className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
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
                </EnhancedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  setCurrentQuery("");
                  setCurrentFilters({
                    category: undefined,
                    tags: [],
                    sortBy: "relevance",
                    dateRange: "all",
                  });
                  updateURL("", {});
                }}
                variant="outline"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                disabled={!results.pagination.hasPrevPage}
                onClick={() => {
                  const newPage = results.pagination.page - 1;
                  const params = new URLSearchParams(window.location.search);
                  params.set("page", newPage.toString());
                  router.push(`/search?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, results.pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === results.pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set("page", pageNum.toString());
                        router.push(`/search?${params.toString()}`);
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={!results.pagination.hasNextPage}
                onClick={() => {
                  const newPage = results.pagination.page + 1;
                  const params = new URLSearchParams(window.location.search);
                  params.set("page", newPage.toString());
                  router.push(`/search?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
