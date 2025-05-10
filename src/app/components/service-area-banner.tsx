import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ServiceAreaBanner() {
  return (
    <Alert className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-700 text-amber-200 rounded-none">
      <AlertCircle className="h-4 w-4 text-amber-800" />
      <AlertDescription>
        <strong>Service Area Notice:</strong> Our camera rental services are currently available only in and around
        Gudur.
      </AlertDescription>
    </Alert>
  )
}
