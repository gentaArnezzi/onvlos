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
      href: "mailto:support@flazy.com"
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
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Help & Support
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Get help, find answers, and learn how to make the most of Flazy.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search for help articles, FAQs, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Options */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Get Support
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {supportOptions.map((option, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-fit mb-2">
                  <option.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
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
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Quick Start Guides
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {quickStartGuides.map((guide, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50 hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <guide.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {guide.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {guide.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          {faqCategories.map((category, catIndex) => (
            <Card key={catIndex} className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                      {faq.q}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
      <Card className="border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Still need help?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our support team is here to assist you 24/7.
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              asChild
            >
              <a href="mailto:support@flazy.com">
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

