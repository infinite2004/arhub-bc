"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface DocSection {
  title: string
  href: string
  subsections?: { title: string; href: string }[]
  expanded?: boolean
}

export default function DocSidebar() {
  const [sections, setSections] = useState<DocSection[]>([
    {
      title: "Getting Started",
      href: "/docs/getting-started",
      expanded: true,
      subsections: [
        { title: "Installation", href: "/docs/getting-started/installation" },
        { title: "Quick Start", href: "/docs/getting-started/quick-start" },
        { title: "Configuration", href: "/docs/getting-started/configuration" },
      ],
    },
    {
      title: "Tutorials",
      href: "/docs/tutorials",
      expanded: false,
      subsections: [
        { title: "Face Tracking", href: "/docs/tutorials/face-tracking-basics" },
        { title: "AR Markers", href: "/docs/tutorials/ar-markers" },
        { title: "3D Models", href: "/docs/tutorials/3d-model-integration" },
        { title: "Gesture Recognition", href: "/docs/tutorials/gesture-recognition" },
      ],
    },
    {
      title: "API Reference",
      href: "/docs/api",
      expanded: false,
      subsections: [
        { title: "Core API", href: "/docs/api/core" },
        { title: "Tracking API", href: "/docs/api/tracking" },
        { title: "Rendering API", href: "/docs/api/rendering" },
        { title: "Utilities", href: "/docs/api/utilities" },
      ],
    },
    {
      title: "Python Runner",
      href: "/docs/python-runner",
      expanded: false,
      subsections: [
        { title: "Installation", href: "/docs/python-runner/installation" },
        { title: "Commands", href: "/docs/python-runner/commands" },
        { title: "Configuration", href: "/docs/python-runner/configuration" },
        { title: "Troubleshooting", href: "/docs/python-runner/troubleshooting" },
      ],
    },
    {
      title: "Advanced Topics",
      href: "/docs/advanced",
      expanded: false,
      subsections: [
        { title: "SLAM", href: "/docs/advanced/slam-basics" },
        { title: "Neural Networks", href: "/docs/advanced/neural-networks-ar" },
        { title: "Performance", href: "/docs/advanced/performance-optimization" },
      ],
    },
    {
      title: "FAQ",
      href: "/docs/faq",
      expanded: false,
    },
  ])

  const toggleSection = (index: number) => {
    setSections(
      sections.map((section, i) => {
        if (i === index) {
          return { ...section, expanded: !section.expanded }
        }
        return section
      }),
    )
  }

  return (
    <div className="sticky top-4">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-lg mb-4">Documentation</h3>
        <nav>
          <ul className="space-y-1">
            {sections.map((section, index) => (
              <li key={index}>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link href={section.href} className="text-gray-700 hover:text-blue-600 py-1 flex-grow">
                      {section.title}
                    </Link>
                    {section.subsections && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleSection(index)}>
                        {section.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  {section.subsections && section.expanded && (
                    <ul className="pl-4 mt-1 space-y-1 border-l">
                      {section.subsections.map((subsection, subIndex) => (
                        <li key={subIndex}>
                          <Link href={subsection.href} className="text-gray-600 hover:text-blue-600 py-1 block text-sm">
                            {subsection.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
