"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, AlertCircle, CheckCircle2, Clock, Key, FileJson, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface JwtDecoderProps {
  jwtData: string
}

export function JwtDecoder({ jwtData }: JwtDecoderProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!jwtData) {
    return null
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedField(label)
        setTimeout(() => setCopiedField(null), 2000)

        toast.success("Copied to clipboard", {
          description: (
            <div className="break-all">
              <div>
                <span className="font-medium">Field:</span> {label}
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

  let jwtString = jwtData
  if (jwtString.startsWith('"') && jwtString.endsWith('"')) {
    jwtString = jwtString.slice(1, -1)
  }

  try {
    const parts = jwtString.split(".")
    if (parts.length !== 3) {
      return (
        <Card className="border-destructive/50">
          <CardHeader className="bg-destructive/10 pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid JWT Format
            </CardTitle>
            <CardDescription>JWT tokens must have three parts separated by dots.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p>Please check your JWT token and try again.</p>
          </CardContent>
        </Card>
      )
    }

    // Base64 decode and parse JSON
    const decodeBase64 = (str: string) => {
      // Replace non-url compatible chars with base64 standard chars
      let input = str.replace(/-/g, "+").replace(/_/g, "/")

      // Add padding if needed
      switch (input.length % 4) {
        case 0:
          break
        case 2:
          input += "=="
          break
        case 3:
          input += "="
          break
        default:
          throw new Error("Invalid base64 string")
      }

      try {
        return JSON.parse(atob(input))
      } catch (e) {
        return null
      }
    }

    const header = decodeBase64(parts[0])
    const payload = decodeBase64(parts[1])
    const signature = parts[2]

    if (!header || !payload) {
      return (
        <Card className="border-destructive/50">
          <CardHeader className="bg-destructive/10 pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Decoding JWT
            </CardTitle>
            <CardDescription>Could not decode the JWT header or payload.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p>The JWT token may be malformed or using an unsupported encoding.</p>
          </CardContent>
        </Card>
      )
    }

    // Format date for better display
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp * 1000)
      return {
        full: date.toUTCString(),
        relative: getRelativeTime(date),
      }
    }

    // Get relative time (e.g., "in 2 days" or "2 days ago")
    const getRelativeTime = (date: Date) => {
      const now = new Date()
      const diffMs = date.getTime() - now.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSecs < 0) {
        // Past
        if (diffSecs > -60) return `${Math.abs(diffSecs)} seconds ago`
        if (diffMins > -60) return `${Math.abs(diffMins)} minutes ago`
        if (diffHours > -24) return `${Math.abs(diffHours)} hours ago`
        return `${Math.abs(diffDays)} days ago`
      } else {
        // Future
        if (diffSecs < 60) return `in ${diffSecs} seconds`
        if (diffMins < 60) return `in ${diffMins} minutes`
        if (diffHours < 24) return `in ${diffHours} hours`
        return `in ${diffDays} days`
      }
    }

    // Check if token is expired
    const isExpired = payload.exp && new Date(payload.exp * 1000) < new Date()

    // Get token type from header
    const tokenType = header.typ || "JWT"

    // Get algorithm from header
    const algorithm = header.alg || "Unknown"

    return (
      <div className="space-y-6">
        {/* Token Overview Card */}
        <Card className={cn("border-primary/20", isExpired && "border-destructive/50")}>
          <CardHeader className={cn("bg-primary/5 pb-3", isExpired && "bg-destructive/10")}>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                {tokenType} Token
              </CardTitle>
              {isExpired ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Expired
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-primary/10 text-primary flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Valid
                </Badge>
              )}
            </div>
            <CardDescription>
              Algorithm: <span className="font-medium">{algorithm}</span>
              {payload.iat && (
                <span className="ml-4">
                  Issued: <span className="font-medium">{formatDate(payload.iat).relative}</span>
                </span>
              )}
              {payload.exp && (
                <span className="ml-4">
                  Expires:{" "}
                  <span className={cn("font-medium", isExpired ? "text-destructive" : "text-primary")}>
                    {formatDate(payload.exp).relative}
                  </span>
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Header Card */}
        <Card>
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileJson className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              Header
            </CardTitle>
            <CardDescription>Contains metadata about the token type and signing algorithm</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-2">
              {Object.entries(header).map(([key, value]) => (
                <div
                  key={`header-${key}`}
                  className="flex flex-wrap justify-between items-center p-2 rounded-md hover:bg-muted group cursor-pointer"
                  onClick={() => copyToClipboard(JSON.stringify(value), key)}
                >
                  <div className="font-medium">{key}:</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">{JSON.stringify(value)}</span>
                    {copiedField === key ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payload Card */}
        <Card>
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileJson className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              Payload
            </CardTitle>
            <CardDescription>Contains the claims and data stored in the token</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-2">
              {Object.entries(payload).map(([key, value]) => {
                // Special handling for exp and iat
                if (key === "exp" || key === "iat") {
                  const timestamp = value as number
                  const dateInfo = formatDate(timestamp)
                  const isExpired = key === "exp" && new Date(timestamp * 1000) < new Date()

                  return (
                    <div
                      key={`payload-${key}`}
                      className="flex flex-wrap justify-between items-center p-2 rounded-md hover:bg-muted group cursor-pointer"
                      onClick={() => copyToClipboard(JSON.stringify(value), key)}
                    >
                      <div className="font-medium flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {key === "exp" ? "Expires" : "Issued at"}:
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm flex items-center gap-1">
                          <span className="text-emerald-600 dark:text-emerald-400">{timestamp}</span>
                          {copiedField === key ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <Badge
                          variant={key === "exp" ? (isExpired ? "destructive" : "outline") : "secondary"}
                          className="whitespace-nowrap"
                        >
                          {dateInfo.relative}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{dateInfo.full}</span>
                      </div>
                    </div>
                  )
                }

                // Regular fields
                return (
                  <div
                    key={`payload-${key}`}
                    className="flex flex-wrap justify-between items-center p-2 rounded-md hover:bg-muted group cursor-pointer"
                    onClick={() => copyToClipboard(JSON.stringify(value), key)}
                  >
                    <div className="font-medium">{key}:</div>
                    <div className="flex items-center gap-1 text-sm max-w-full overflow-hidden">
                      <span className="truncate max-w-[300px] md:max-w-[500px] text-emerald-600 dark:text-emerald-400">
                        {JSON.stringify(value)}
                      </span>
                      {copiedField === key ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        <Card>
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              Signature
            </CardTitle>
            <CardDescription>Verifies the token's integrity and authenticity</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div
              className="p-2 rounded-md hover:bg-muted group cursor-pointer"
              onClick={() => copyToClipboard(signature, "Signature")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Signature:</span>
                {copiedField === "Signature" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="break-all text-sm text-purple-600 dark:text-purple-400 bg-muted/50 p-3 rounded-md">
                {signature}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="bg-destructive/10 pb-3">
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Decoding JWT
          </CardTitle>
          <CardDescription>An error occurred while processing the JWT token.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-destructive">{error instanceof Error ? error.message : String(error)}</p>
        </CardContent>
      </Card>
    )
  }
}

