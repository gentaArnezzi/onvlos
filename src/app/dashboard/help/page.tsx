"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Video, 
  BookOpen, 
  Search,
  ChevronRight,
  ExternalLink,
  LifeBuoy
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "How do I create my first client?",
          a: "Navigate to the Clients page and click the 'Add Client' button. Fill in the client's information including name, email, and company details."
        },
        {
          q: "How do I create an invoice?",
          a: "Go to the Invoices page, click 'Create Invoice', select a client, add line items, and set the due date. You can then send it directly to your client."
        },
        {
          q: "How do I set up a workflow?",
          a: "Visit the Flows page and click 'Create Workflow'. You can drag and drop tasks to create your automation workflow."
        }
      ]
    },
    {
      title: "Features",
      questions: [
        {
          q: "How does the AI Brain assistant work?",
          a: "The Brain assistant can help you query your data, get insights about tasks, invoices, and clients. Simply ask questions in natural language."
        },
        {
          q: "Can I customize my boards?",
          a: "Yes! You can create custom columns, set WIP limits, and organize your tasks using the drag-and-drop interface."
        },
        {
          q: "How do I track time on tasks?",
          a: "Time tracking is available on individual tasks. Click on a task to open details and use the time tracking feature."
        }
      ]
    },
    {
      title: "Billing & Subscriptions",
      questions: [
        {
          q: "How do I upgrade my plan?",
          a: "Go to Settings > Billing and click 'Upgrade Plan'. You'll be redirected to our secure payment portal."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards and process payments securely through Stripe."
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, you can cancel your subscription at any time from the Billing section in Settings."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      icon: Mail,
      action: "Send Email",
      href: "mailto:support@onvlo.com"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: MessageSquare,
      action: "Start Chat",
      href: "#"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: Video,
      action: "Watch Videos",
      href: "#"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive documentation",
      icon: BookOpen,
      action: "View Docs",
      href: "/dashboard/docs"
    }
  ];

  const quickStartGuides = [
    {
      title: "Setting Up Your Workspace",
      description: "Learn how to configure your workspace settings and preferences",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Managing Clients",
      description: "Complete guide to adding, editing, and managing your clients",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Creating Invoices",
      description: "Step-by-step guide to creating and sending invoices",
      icon: BookOpen,
      href: "#"
    },
    {
      title: "Using Workflows",
      description: "Master automation with our workflow builder tutorial",
      icon: BookOpen,
      href: "#"
    }
  ];

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
          Help & Support
        </h2>
        <p className="font-primary text-[#606170] mt-1">
          Get help, find answers, and learn how to make the most of Onvlo.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border border-[#EDEDED] shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 font-primary text-[#606170]" />
            <Input
              placeholder="Search for help articles, FAQs, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Options */}
      <div>
        <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4 flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-[#0A33C6]" />
          Get Support
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {supportOptions.map((option, index) => (
            <Card key={index} className="border border-[#EDEDED] shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6] w-fit mb-2">
                  <option.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold font-primary text-[#02041D]">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm font-primary text-[#606170]">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-[#EDEDED] font-primary text-[#02041D] hover:bg-[#EDEDED]"
                  asChild
                >
                  <a href={option.href}>
                    {option.action}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Start Guides */}
      <div>
        <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#0A33C6]" />
          Quick Start Guides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2">
          {quickStartGuides.map((guide, index) => (
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

      {/* FAQ Section */}
      <div>
        <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#0A33C6]" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          {faqCategories.map((category, catIndex) => (
            <Card key={catIndex} className="border border-[#EDEDED] shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-primary text-[#02041D]">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="border-b border-[#EDEDED] last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium font-primary text-[#02041D] mb-2">
                      {faq.q}
                    </h4>
                    <p className="text-sm font-primary text-[#606170]">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <Card className="border border-[#EDEDED] bg-gradient-to-r bg-[#EDEDED] ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-1">
                Still need help?
              </h3>
              <p className="text-sm font-primary text-[#606170]">
                Our support team is here to assist you 24/7.
              </p>
            </div>
            <Button 
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary font-bold"
              asChild
            >
              <a href="mailto:support@onvlo.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

