import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Build with $env:VITE_JOBLENS_API_BASE_URL=\"https://joblenswithai.vercel.app\" then npm run build:extension.",
  "Open chrome://extensions and enable Developer mode.",
  "Click Load unpacked and select apps/extension/dist.",
  "Pin JobLens Recruiter AI to the toolbar.",
  "Click the icon, sign in, then visit a job posting.",
  "Click the floating JobLens button to start analysis."
];

export function ExtensionInstallSteps() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map((step, index) => (
        <Card key={step}>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Step {index + 1}
            </Badge>
            <CardTitle className="text-base">{step}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The extension does not read page content until the floating button is clicked.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
