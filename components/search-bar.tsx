"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/performance";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  suggestions?: string[];
}

interface SearchFilters {
  category?: string;
  tags?: string[];
  sortBy?: "relevance" | "date" | "popularity";
  dateRange?: "all" | "week" | "month" | "year";
}

export function SearchBar({
  onSearch,
  onFilter,
  placeholder = "Search projects...",
  className,
  showFilters = true,
  suggestions = [],
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Debounced search function with better performance
  const debouncedSearch = debounce((searchQuery: string) => {
    onSearch?.(searchQuery);
  }, 250);

  // Handle search input
  const handleSearch = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter?.(updatedFilters);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);
    inputRef.current?.focus();
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    onSearch?.("");
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter active count
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
              setShowFilterPanel(false);
              inputRef.current?.blur();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (!showSuggestions) {
                setShowSuggestions(true);
                setHighlightedIndex(0);
              } else {
                setHighlightedIndex((prev) => {
                  const filtered = suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
                  const next = Math.min((prev + 1), filtered.length - 1);
                  return next < 0 ? 0 : next;
                });
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const filtered = suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
              if (showSuggestions && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
                handleSuggestionClick(filtered[highlightedIndex]);
              } else {
                setShowSuggestions(false);
                onSearch?.(query);
                // Let parent navigate if desired
              }
            }
          }}
          placeholder={placeholder}
          aria-label="Search projects"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-suggestion-list"
          className={cn(
            "pl-10 pr-20 h-12 text-base transition-all duration-200",
            isFocused && "ring-2 ring-blue-500 border-blue-500"
          )}
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Filter button */}
        {showFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0",
              activeFiltersCount > 0 && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div id="search-suggestion-list" role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions
            .filter(suggestion => 
              suggestion.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 8)
            .map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  "w-full px-4 py-2 text-left transition-colors first:rounded-t-md last:rounded-b-md",
                  highlightedIndex === index ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900 dark:text-white">{suggestion}</span>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-4">
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="3d-models">3D Models</option>
                <option value="opencv-scripts">OpenCV Scripts</option>
                <option value="ar-apps">AR Apps</option>
                <option value="tutorials">Tutorials</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Sort By
              </label>
              <select
                value={filters.sortBy || "relevance"}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilters["sortBy"] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Date Range
              </label>
              <select
                value={filters.dateRange || "all"}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as SearchFilters["dateRange"] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Active Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      Category: {filters.category}
                      <button
                        onClick={() => handleFilterChange({ category: undefined })}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.sortBy && filters.sortBy !== "relevance" && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                      Sort: {filters.sortBy}
                      <button
                        onClick={() => handleFilterChange({ sortBy: "relevance" })}
                        className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.dateRange && filters.dateRange !== "all" && (
                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      Date: {filters.dateRange}
                      <button
                        onClick={() => handleFilterChange({ dateRange: "all" })}
                        className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({});
                  onFilter?.({});
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
