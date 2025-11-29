"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Filter,
  Receipt,
  MessageSquare,
  Kanban,
  Calendar,
  Zap,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Rocket
} from "lucide-react";

const features = [
  {
    icon: Filter,
    title: "Smart Onboarding Funnels",
    description: "Create custom funnels with forms, contracts, and payments. Share one link and onboard clients in minutes.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Client Portals",
    description: "Give each client their own portal with chat, tasks, files, and invoices - all in one place.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: FileText,
    title: "Contracts & E-Signatures",
    description: "Send professional contracts and collect signatures digitally. No more back-and-forth emails.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description: "Create and send invoices instantly. Accept online payments and track everything automatically.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Kanban,
    title: "Visual Project Boards",
    description: "Manage leads and projects with Kanban boards. Drag and drop to update status instantly.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: MessageSquare,
    title: "Built-in Chat",
    description: "Communicate with clients without leaving the platform. Keep all conversations organized.",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    icon: Calendar,
    title: "Calendar & Scheduling",
    description: "Manage events, meetings, and deadlines. Never miss an important date.",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Automate repetitive tasks. Trigger actions when invoices are paid or clients onboard.",
    gradient: "from-yellow-500 to-orange-500"
  }
];

const stats = [
  { value: "10x", label: "Faster Onboarding", icon: TrendingUp },
  { value: "5+", label: "Tools Replaced", icon: Shield },
  { value: "100%", label: "Organized", icon: CheckCircle2 },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 px-6 lg:px-12 h-20 flex items-center border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/60 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Onvlo
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" href="#solutions">
            Solutions
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float delay-300" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in-down">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  The all-in-one platform for modern agencies
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
                <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                  Streamline Client
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Onboarding & Collaboration
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl animate-fade-in-up delay-100">
                Replace Notion, Trello, Slack, and invoicing tools with one integrated workspace.
                From first contact to final payment — all in one beautiful platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up delay-200">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 h-14 text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all hover:scale-105 group">
                    Start for Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/onboard/demo">
                  <Button variant="outline" size="lg" className="border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 px-8 h-14 text-lg backdrop-blur-xl transition-all hover:scale-105">
                    View Demo Funnel
                    <Rocket className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 w-full max-w-3xl animate-fade-in-up delay-300">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-card p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Powerful Features
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Everything You Need,{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Nothing You Don't
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Built specifically for agencies and service businesses. Every feature designed to save you time and impress your clients.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-6 relative z-10">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <feature.icon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="solutions" className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 dark:from-purple-950/20 dark:via-transparent dark:to-blue-950/20" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                How{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Onvlo
                </span>
                {" "}Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                From lead to long-term client in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Create Your Funnel",
                  description: "Build custom onboarding flows with forms, contracts, and payment collection. Share one link with clients.",
                  gradient: "from-purple-600 to-purple-700"
                },
                {
                  step: 2,
                  title: "Client Completes Onboarding",
                  description: "Clients fill out forms, sign contracts, and pay invoices — all in one seamless experience.",
                  gradient: "from-blue-600 to-blue-700"
                },
                {
                  step: 3,
                  title: "Collaborate & Deliver",
                  description: "Clients get their own portal to chat, view tasks, access files, and pay invoices.",
                  gradient: "from-pink-600 to-pink-700"
                }
              ].map((item, index) => (
                <div key={item.step} className="relative group">
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative h-20 w-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-300`}>
                      <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse-glow" />
                      <span className="relative z-10">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-blue-500/50 -z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] animate-gradient" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Sparkles className="h-16 w-16 text-white/80 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Client Experience?
              </h2>
              <p className="text-xl text-white/90 mb-12 leading-relaxed">
                Join agencies that have cut onboarding time by 10x and replaced 5+ tools with Onvlo.
                Start your journey to better client relationships today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 px-10 h-16 text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-10 h-16 text-lg backdrop-blur-xl transition-all hover:scale-105">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Onvlo
              </span>
            </div>
            <div className="flex gap-8 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 Onvlo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
