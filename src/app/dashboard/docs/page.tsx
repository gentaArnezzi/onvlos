"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Book, 
  Code,
  ChevronRight,
  ExternalLink,
  Users,
  Receipt,
  CheckSquare,
  Workflow,
  Brain,
  MessageSquare,
  Kanban,
  Calendar,
  Zap
} from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const gettingStarted = [
    {
      title: "Introduction to Onvlo",
      description: "Learn about Onvlo's core features and how it can help your agency",
      icon: Book,
      href: "#"
    },
    {
      title: "Setting Up Your Account",
      description: "Complete guide to configuring your workspace and preferences",
      icon: Book,
      href: "#"
    },
    {
      title: "Your First Client",
      description: "Step-by-step guide to adding and managing your first client",
      icon: Book,
      href: "#"
    },
    {
      title: "Creating Your First Invoice",
      description: "Learn how to create, customize, and send invoices",
      icon: Book,
      href: "#"
    }
  ];

  const featureGuides = [
    {
      category: "Core Features",
      icon: Zap,
      guides: [
        {
          title: "Dashboard Overview",
          description: "Understanding your dashboard and key metrics",
          icon: FileText
        },
        {
          title: "Client Management",
          description: "Complete guide to managing clients and contacts",
          icon: Users
        },
        {
          title: "Task Management",
          description: "Creating, organizing, and tracking tasks",
          icon: CheckSquare
        },
        {
          title: "Invoice Management",
          description: "Creating, sending, and tracking invoices",
          icon: Receipt
        }
      ]
    },
    {
      category: "Advanced Features",
      icon: Brain,
      guides: [
        {
          title: "Workflows & Automation",
          description: "Building and managing automated workflows",
          icon: Workflow
        },
        {
          title: "AI Brain Assistant",
          description: "Using AI to get insights and automate tasks",
          icon: Brain
        },
        {
          title: "Kanban Boards",
          description: "Organizing work with visual boards",
          icon: Kanban
        },
        {
          title: "Client Chat",
          description: "Communicating with clients in real-time",
          icon: MessageSquare
        }
      ]
    },
    {
      category: "Integrations & API",
      icon: Code,
      guides: [
        {
          title: "API Overview",
          description: "Introduction to Onvlo's REST API",
          icon: Code
        },
        {
          title: "Authentication",
          description: "How to authenticate API requests",
          icon: Code
        },
        {
          title: "Webhooks",
          description: "Setting up and managing webhooks",
          icon: Code
        },
        {
          title: "Third-party Integrations",
          description: "Connect Onvlo with your favorite tools",
          icon: Code
        }
      ]
    }
  ];

  const filteredGuides = featureGuides.map(category => ({
    ...category,
    guides: category.guides.filter(guide => 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.guides.length > 0);

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0731c2] via-[#0731c2] to-[#010119] bg-clip-text text-transparent">
          Documentation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Comprehensive guides and references for all Onvlo features.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Book className="h-5 w-5 text-[#0731c2] dark:text-[#0731c2]" />
          Getting Started
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {gettingStarted.map((guide, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50 hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0731c2] dark:text-[#0731c2] group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <guide.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors">
                      {guide.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {guide.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Guides */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Feature Guides
        </h3>
        <div className="space-y-6">
          {filteredGuides.map((category, catIndex) => (
            <Card key={catIndex} className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0731c2] dark:text-[#0731c2]">
                    <category.icon className="h-4 w-4" />
                  </div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.guides.map((guide, guideIndex) => (
                    <div 
                      key={guideIndex}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0731c2] dark:hover:border-[#0731c2] hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors">
                          <guide.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-1 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors">
                            {guide.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {guide.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0731c2] dark:text-[#0731c2]">
                <Code className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  API Documentation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Integrate Onvlo with your applications using our REST API.
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="border-[#0731c2] dark:border-[#0731c2] text-[#0731c2] dark:text-[#0731c2] hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-[#0525a0] dark:hover:border-[#0525a0]"
              asChild
            >
              <a href="#" target="_blank">
                View API Docs
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Results */}
      {searchQuery && filteredGuides.length === 0 && (
        <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try adjusting your search query or browse the categories above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

