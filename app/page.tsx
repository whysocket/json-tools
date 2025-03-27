import { JsonJwtDecoder } from "@/components/json-jwt-decoder"
import { Footer } from "@/components/footer"
import { Suspense } from "react"

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-8 px-4">
                <div className="w-full max-w-3xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">JSON to Table / JWT Decoder</h1>
                    <Suspense>
                        <JsonJwtDecoder />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    )
}

