"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { JsonTable } from "@/components/json-table"
import { JwtDecoder } from "@/components/jwt-decoder"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, FileJson, Key } from "lucide-react"

export function JsonJwtDecoder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [jsonInput, setJsonInput] = useState("")
  const [jwtInput, setJwtInput] = useState("")
  const [activeTab, setActiveTab] = useState(tabParam === "jwt" ? "jwt" : "json")
  const [stringQuotes, setStringQuotes] = useState(true)
  const [cachedJsonData, setCachedJsonData] = useState<any>(null)

  // Create refs for the input fields
  const jsonInputRef = useRef<HTMLTextAreaElement>(null)
  const jwtInputRef = useRef<HTMLTextAreaElement>(null)

  // Load saved data from localStorage
  useEffect(() => {
    const savedJsonInput = localStorage.getItem("jsonInputData")
    const savedJwtInput = localStorage.getItem("jwtInputData")
    const savedStringQuotes = localStorage.getItem("stringQuotes")

    if (savedJsonInput) {
      setJsonInput(savedJsonInput)
      try {
        setCachedJsonData(JSON.parse(savedJsonInput))
      } catch (e) {
        setCachedJsonData(null)
      }
    }

    if (savedJwtInput) {
      setJwtInput(savedJwtInput)
    }

    if (savedStringQuotes) {
      setStringQuotes(savedStringQuotes === "true")
    }

    // Focus the appropriate input field on initial load
    setTimeout(() => {
      if (activeTab === "json") {
        jsonInputRef.current?.focus()
      } else {
        jwtInputRef.current?.focus()
      }
    }, 100)
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", activeTab)
    router.replace(`?${params.toString()}`, { scroll: false })

    // Focus the appropriate input field when tab changes
    setTimeout(() => {
      if (activeTab === "json") {
        jsonInputRef.current?.focus()
      } else {
        jwtInputRef.current?.focus()
      }
    }, 100)
  }, [activeTab, router, searchParams])

  // Handle JSON input changes
  const handleJsonInputChange = (value: string) => {
    setJsonInput(value)
    localStorage.setItem("jsonInputData", value)
    try {
      const parsedData = JSON.parse(value)
      setCachedJsonData(parsedData)
    } catch (e) {
      setCachedJsonData(null)
    }
  }

  // Handle JWT input changes
  const handleJwtInputChange = (value: string) => {
    setJwtInput(value)
    localStorage.setItem("jwtInputData", value)
  }

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle string quotes toggle
  const handleStringQuotesChange = (checked: boolean) => {
    setStringQuotes(checked)
    localStorage.setItem("stringQuotes", String(checked))
  }

  // Clear input
  const clearInput = () => {
    if (activeTab === "json") {
      setJsonInput("")
      setCachedJsonData(null)
      localStorage.removeItem("jsonInputData")
      toast.success("JSON input cleared", {
        description: "Your JSON input has been cleared.",
      })
      // Focus the input after clearing
      setTimeout(() => jsonInputRef.current?.focus(), 100)
    } else {
      setJwtInput("")
      localStorage.removeItem("jwtInputData")
      toast.success("JWT input cleared", {
        description: "Your JWT input has been cleared.",
      })
      // Focus the input after clearing
      setTimeout(() => jwtInputRef.current?.focus(), 100)
    }
  }

  // Format JSON
  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput)
      const formattedJson = JSON.stringify(parsedJson, null, 2)
      setJsonInput(formattedJson)
      localStorage.setItem("jsonInputData", formattedJson)
      toast.success("JSON formatted", {
        description: "Your JSON has been formatted.",
      })
    } catch (e) {
      toast.error("Invalid JSON", {
        description: "Please enter valid JSON to format.",
      })
    }
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="string-quotes"
                checked={stringQuotes}
                onCheckedChange={handleStringQuotesChange}
                className={activeTab === "jwt" ? "hidden" : ""}
              />
              <Label htmlFor="string-quotes" className={activeTab === "jwt" ? "hidden" : ""}>
                Generate String with Quotes
              </Label>
            </div>
            <ModeToggle />
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="json" className="flex items-center gap-1">
                <FileJson className="h-4 w-4" />
                <span>JSON to Table</span>
              </TabsTrigger>
              <TabsTrigger value="jwt" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                <span>JWT Decoder</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="json-input">JSON to Table</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={formatJson} className="text-xs">
                      Format JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearInput} className="text-xs">
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="json-input"
                  ref={jsonInputRef}
                  placeholder="Paste JSON here"
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm resize-y min-h-[200px]"
                />
              </div>
              <JsonTable jsonData={cachedJsonData} stringQuotes={stringQuotes} />
            </TabsContent>

            <TabsContent value="jwt" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="jwt-input">JWT Decoder</Label>
                  <Button variant="outline" size="sm" onClick={clearInput} className="text-xs">
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                </div>
                <Textarea
                  id="jwt-input"
                  ref={jwtInputRef}
                  placeholder="Paste JWT here"
                  value={jwtInput}
                  onChange={(e) => handleJwtInputChange(e.target.value)}
                  rows={5}
                  className="font-mono text-sm resize-y min-h-[120px]"
                />
              </div>
              <JwtDecoder jwtData={jwtInput} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

