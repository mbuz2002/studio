import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Cog className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Settings</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Manage your application preferences and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Profile settings form will be here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your EduAI Planner experience.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Theme, notifications, and other preferences will be managed here.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Export/Import Data</CardTitle>
                <CardDescription>Manage your curriculum data.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Options to export all data or import from supported formats will be here.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
