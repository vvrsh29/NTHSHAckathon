import { useState } from 'react'
import { RefreshCw, ExternalLink, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  projectName?: string
}

export default function PreviewPane({ projectName }: Props) {
  const [key, setKey] = useState(0)
  const previewUrl = 'http://localhost:8080'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-9 border-b">
        <span className="text-xs font-mono text-muted-foreground truncate">localhost:8080</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setKey((k) => k + 1)} title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild title="Open in new tab">
            <a href={previewUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-background">
        <iframe
          key={key}
          src={previewUrl}
          className="w-full h-full border-0 bg-white"
          title="Project Preview"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none bg-background">
          <Monitor className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground text-center px-4 max-w-[200px]">
            Run <code className="font-mono text-foreground">python3 -m http.server 8080</code> in your project folder to see a preview here.
          </p>
        </div>
      </div>
    </div>
  )
}
