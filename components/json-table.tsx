"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Copy, Check, ChevronRight, ChevronDown, Plus, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface JsonTableProps {
  jsonData: any
  stringQuotes: boolean
}

export function JsonTable({ jsonData, stringQuotes }: JsonTableProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([""]))
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  // Initialize with all paths expanded
  useEffect(() => {
    if (jsonData) {
      const allPaths = new Set<string>([""])
      collectAllPaths(jsonData, "", allPaths)
      setExpandedPaths(allPaths)
    }
  }, [jsonData])

  // Helper function to collect all paths in the JSON data
  const collectAllPaths = (obj: any, path = "", paths: Set<string>) => {
    if (obj && typeof obj === "object") {
      paths.add(path)

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const newPath = path ? `${path}[${index}]` : `[${index}]`
          collectAllPaths(item, newPath, paths)
        })
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key
          collectAllPaths(value, newPath, paths)
        })
      }
    }
  }

  if (!jsonData) {
    return <p className="text-muted-foreground">No JSON data to display.</p>
  }

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedField(path)
        setSelectedPath(path)
        setTimeout(() => setCopiedField(null), 2000)

        toast.success("Copied to clipboard", {
          description: (
            <div className="break-all">
              <div>
                <span className="font-medium">Path:</span> {path || "root"}
              </div>
              <div>
                <span className="font-medium">Value:</span> {text}
              </div>
            </div>
          ),
        })
      },
      (err) => {
        console.error("Unable to copy to clipboard", err)
        toast.error("Unable to copy to clipboard")
      },
    )
  }

  const toggleExpand = (path: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setExpandedPaths((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const isExpanded = (path: string) => {
    return expandedPaths.has(path)
  }

  const expandAll = () => {
    const allPaths = new Set<string>([""])
    collectAllPaths(jsonData, "", allPaths)
    setExpandedPaths(allPaths)
  }

  const collapseAll = () => {
    setExpandedPaths(new Set([""]))
  }

  const getDataType = (value: any): string => {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"
    return typeof value
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400"
      case "number":
        return "text-blue-600 dark:text-blue-400"
      case "boolean":
        return "text-purple-600 dark:text-purple-400"
      case "null":
        return "text-gray-500 dark:text-gray-400"
      case "object":
        return "text-orange-600 dark:text-orange-400"
      case "array":
        return "text-pink-600 dark:text-pink-400"
      default:
        return "text-gray-800 dark:text-gray-200"
    }
  }

  const getTypeBadge = (type: string) => {
    let color: "default" | "secondary" | "outline" | "destructive" | null = "default"

    switch (type) {
      case "string":
        color = "default"
        break
      case "number":
        color = "secondary"
        break
      case "boolean":
        color = "outline"
        break
      case "null":
        color = "destructive"
        break
      case "object":
        color = "default"
        break
      case "array":
        color = "default"
        break
    }

    return (
      <Badge variant={color} className="ml-2 text-[10px] py-0 h-4">
        {type}
      </Badge>
    )
  }

  const formatValue = (value: any, type: string): string => {
    if (type === "string" && stringQuotes) {
      return `"${value}"`
    }
    if (type === "object" || type === "array") {
      return type === "object" ? "{...}" : "[...]"
    }
    return String(value)
  }

  const renderJsonNode = (data: any, path = "", level = 0) => {
    const type = getDataType(data)
    const isExpandable = type === "object" || type === "array"
    const expanded = isExpanded(path)
    const isSelected = selectedPath === path

    // For primitive values or collapsed objects/arrays
    if (!isExpandable || !expanded) {
      const displayValue = formatValue(data, type)

      return (
        <div
          className={cn(
            "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors",
            level % 2 === 0 ? "bg-muted/30" : "",
            isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/70 border-l-2 border-transparent",
          )}
          onClick={(e) => {
            setSelectedPath(path)

            if (!isExpandable) {
              copyToClipboard(String(data), path)
            } else {
              toggleExpand(path, e)
            }
          }}
        >
          {isExpandable && (
            <ChevronRight
              className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => toggleExpand(path, e)}
            />
          )}

          <div className="flex-1 flex items-center overflow-hidden">
            {path.includes(".") || path.includes("[") ? (
              <span className="font-medium truncate">{path.split(".").pop()?.split("[")[0]}</span>
            ) : path ? (
              <span className="font-medium truncate">{path}</span>
            ) : (
              <span className="font-medium text-muted-foreground italic">root</span>
            )}

            {getTypeBadge(type)}
          </div>

          {!isExpandable && (
            <div className="flex items-center gap-1 ml-2">
              <span className={cn("truncate max-w-[300px] md:max-w-[500px]", getTypeColor(type))}>{displayValue}</span>
              {copiedField === path ? (
                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              )}
            </div>
          )}

          {isExpandable && (
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-muted-foreground">
                {type === "array" ? `${data.length} items` : `${Object.keys(data).length} properties`}
              </span>
            </div>
          )}
        </div>
      )
    }

    // For expanded objects and arrays
    return (
      <div className={cn("rounded-md overflow-hidden border", isSelected ? "border-primary/50" : "border-muted")}>
        <div
          className={cn(
            "flex items-center py-1.5 px-2 cursor-pointer transition-colors",
            isSelected ? "bg-primary/10" : "bg-muted/50 hover:bg-muted",
          )}
          onClick={(e) => {
            toggleExpand(path, e);
            setSelectedPath(path)
          }}
        >
          <ChevronDown
            className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => toggleExpand(path, e)}
          />

          <div className="flex-1 flex items-center overflow-hidden">
            {path ? (
              <span className="font-medium truncate">{path.split(".").pop()?.split("[")[0] || path}</span>
            ) : (
              <span className="font-medium text-muted-foreground italic">root</span>
            )}

            {getTypeBadge(type)}
          </div>

          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-muted-foreground">
              {type === "array" ? `${data.length} items` : `${Object.keys(data).length} properties`}
            </span>
          </div>
        </div>

        <div className={cn("pl-4 border-l-2", isSelected ? "border-primary/50" : "border-muted")}>
          {type === "array"
            ? data.map((item: any, index: number) => {
              const itemPath = path ? `${path}[${index}]` : `[${index}]`
              return (
                <div key={itemPath} className="py-0.5">
                  {renderJsonNode(item, itemPath, level + 1)}
                </div>
              )
            })
            : Object.entries(data).map(([key, value]) => {
              const propPath = path ? `${path}.${key}` : key
              return (
                <div key={propPath} className="py-0.5">
                  {renderJsonNode(value, propPath, level + 1)}
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2">
        <button
          onClick={expandAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
        >
          <Plus className="h-3 w-3" />
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
        >
          <Minus className="h-3 w-3" />
          Collapse All
        </button>
      </div>

      <div className="rounded-md overflow-hidden">{renderJsonNode(jsonData)}</div>
    </div>
  )
}

