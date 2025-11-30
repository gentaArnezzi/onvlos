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
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-primary text-[#0A33C6]">
          Documentation
        </h2>
        <p className="font-primary text-[#606170] mt-1">
          Comprehensive guides and references for all Onvlo features.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border border-[#EDEDED] shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 font-primary text-[#606170]" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <div>
        <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4 flex items-center gap-2">
          <Book className="h-5 w-5 text-[#0A33C6]" />
          Getting Started
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2">
          {gettingStarted.map((guide, index) => (
            <Card key={index} className="border border-[#EDEDED] shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6] group-hover:bg-[#0A33C6]/10 transition-colors">
                    <guide.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold font-primary text-[#02041D] mb-1 group-hover:text-[#0A33C6] transition-colors">
                      {guide.title}
                    </h4>
                    <p className="text-sm font-primary text-[#606170]">
                      {guide.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 font-primary text-[#606170] group-hover:text-[#0A33C6] transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Guides */}
      <div>
        <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4">
          Feature Guides
        </h3>
        <div className="space-y-6">
          {filteredGuides.map((category, catIndex) => (
            <Card key={catIndex} className="border border-[#EDEDED] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-primary text-[#02041D] flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
                    <category.icon className="h-4 w-4" />
                  </div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2">
                  {category.guides.map((guide, guideIndex) => (
                    <div 
                      key={guideIndex}
                      className="p-4 rounded-lg border border-[#EDEDED] hover:border-[#0731c2] hover:bg-[#EDEDED] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170] group-hover:bg-[#EDEDED] group-hover:text-[#0A33C6] transition-colors">
                          <guide.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium font-primary text-[#02041D] mb-1 group-hover:text-[#0A33C6] transition-colors">
                            {guide.title}
                          </h4>
                          <p className="text-sm font-primary text-[#606170]">
                            {guide.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 font-primary text-[#606170] group-hover:text-[#0A33C6] transition-colors opacity-0 group-hover:opacity-100" />
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
      <Card className="border border-[#EDEDED] bg-gradient-to-r bg-[#EDEDED] ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
                <Code className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-1">
                  API Documentation
                </h3>
                <p className="text-sm font-primary text-[#606170]">
                  Integrate Onvlo with your applications using our REST API.
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="border-[#0731c2] text-[#0A33C6] hover:bg-blue-50 hover:border-[#0525a0]"
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
        <Card className="border border-[#EDEDED] shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 font-primary text-[#606170] mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
              No results found
            </h3>
            <p className="text-sm font-primary text-[#606170]">
              Try adjusting your search query or browse the categories above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

