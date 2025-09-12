"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Bug, 
  User, 
  Palette, 
  Code, 
  Edit3,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface AgentActivity {
  agent: string;
  action: string;
  status: "pending" | "in-progress" | "completed" | "error";
  timestamp: string;
  details?: any;
}

export default function SitesPOCDebugPage() {
  const [businessName, setBusinessName] = useState("Tech Innovators Inc");
  const [industry, setIndustry] = useState("Consulting");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const agentIcons: Record<string, any> = {
    "Site Architect": User,
    "Kiko": Palette,
    "Lex": Code,
    "Milo": Edit3,
    "Orchestrator": FileText,
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);
    setActivities([]);
    setGeneratedData(null);

    const steps = [
      { agent: "Orchestrator", action: "Initializing multi-agent system", delay: 500 },
      { agent: "Site Architect", action: "Analyzing business requirements", delay: 1500 },
      { agent: "Site Architect", action: "Designing site structure", delay: 2000 },
      { agent: "Kiko", action: "Creating design system", delay: 1800 },
      { agent: "Milo", action: "Generating content for all sections", delay: 2200 },
      { agent: "Kiko", action: "Generating CSS styles", delay: 1600 },
      { agent: "Lex", action: "Building HTML structure", delay: 2000 },
      { agent: "Orchestrator", action: "Validating and finalizing", delay: 1000 },
    ];

    for (const step of steps) {
      // Add activity as in-progress
      setActivities(prev => [...prev, {
        agent: step.agent,
        action: step.action,
        status: "in-progress",
        timestamp: new Date().toISOString(),
      }]);

      await new Promise(resolve => setTimeout(resolve, step.delay));

      // Update to completed
      setActivities(prev => 
        prev.map((activity, index) => 
          index === prev.length - 1 
            ? { ...activity, status: "completed" }
            : activity
        )
      );
    }

    // Generate mock data
    const mockData = {
      structure: {
        sections: ["hero", "services", "about", "case-studies", "team", "contact"],
        navigation: ["Home", "Services", "About", "Case Studies", "Team", "Contact"],
      },
      designSystem: {
        colors: {
          primary: "#1E40AF",
          secondary: "#0F766E",
          accent: "#7C2D12",
        },
        typography: {
          heading: "Merriweather, serif",
          body: "Source Sans Pro, sans-serif",
        },
      },
      content: {
        hero: {
          headline: "Transform Your Business with Tech Innovators Inc",
          subheadline: "Strategic solutions for sustainable growth and success",
        },
        services: {
          items: [
            "Strategic Planning",
            "Process Optimization",
            "Leadership Development",
          ],
        },
      },
      validation: {
        score: 95,
        issues: [],
      },
    };

    setGeneratedData(mockData);
    setIsGenerating(false);
    toast.success("Debug generation completed!");

    try {
      // Also call the real API
      const response = await fetch("/api/sites/generate-poc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, industry }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Real API response:", data);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-2">
          <Bug className="h-8 w-8 text-purple-500" />
          Multi-Agent Site Generator Debug View
        </h1>
        <p className="text-lg text-muted-foreground">
          Monitor agent activities and debug the generation process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Debug Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="debugBusinessName">Business Name</Label>
                <Input
                  id="debugBusinessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="debugIndustry">Industry</Label>
                <Input
                  id="debugIndustry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <Button 
                onClick={simulateGeneration} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Debug Generation...
                  </>
                ) : (
                  <>
                    <Bug className="mr-2 h-4 w-4" />
                    Start Debug Generation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Monitor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent Activity Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const Icon = agentIcons[activity.agent] || FileText;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.agent}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                      {getStatusIcon(activity.status)}
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No agent activity yet</p>
                    <p className="text-sm">Start a debug generation to monitor agents</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Data Inspector */}
          {generatedData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Generated Data Inspector</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="structure">
                  <TabsList>
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="design">Design System</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="structure" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Sections</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedData.structure.sections.map((section: string) => (
                            <Badge key={section} variant="secondary">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Navigation</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedData.structure.navigation.map((item: string) => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="design" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Color Palette</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(generatedData.designSystem.colors).map(([name, color]) => (
                            <div key={name} className="text-center">
                              <div 
                                className="h-20 rounded-lg mb-2 border"
                                style={{ backgroundColor: color as string }}
                              />
                              <p className="text-sm font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">{color as string}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Typography</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Heading:</span> {generatedData.designSystem.typography.heading}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Body:</span> {generatedData.designSystem.typography.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="mt-4">
                    <div className="space-y-4">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(generatedData.content, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="validation" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium text-lg">Validation Score: {generatedData.validation.score}%</p>
                          <p className="text-sm text-muted-foreground">
                            {generatedData.validation.issues.length === 0 
                              ? "No issues found" 
                              : `${generatedData.validation.issues.length} issues found`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}