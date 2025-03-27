import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 md:py-8 border-t w-full">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>Made with</span>
            <span className="text-red-500">❤</span>
            <span>by</span>
            <Link
              href="http://github.com/whysocket/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary inline-flex items-center gap-1"
            >
              whysocket
              <Github className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JSON to Table / JWT Decoder
          </div>
          <div className="text-xs text-muted-foreground">
            <Link
              href="https://github.com/whysocket/json-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Source Code
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}