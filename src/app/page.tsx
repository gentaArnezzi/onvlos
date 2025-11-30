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
    gradient: "from-[#0A33C6] to-[#0A33C6]"
  },
  {
    icon: Users,
    title: "Client Portals",
    description: "Give each client their own portal with chat, tasks, files, and invoices - all in one place.",
    gradient: "bg-[#EDEDED]0 to-cyan-500"
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
    gradient: "from-[#0A33C6] to-[#0A33C6]"
  },
  {
    icon: Calendar,
    title: "Calendar & Scheduling",
    description: "Manage events, meetings, and deadlines. Never miss an important date.",
    gradient: "from-cyan-500 0"
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
    <div className="flex flex-col min-h-screen bg-[#EDEDED]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 px-6 lg:px-12 h-20 flex items-center border-b border-[#EDEDED]/50 bg-[#EDEDED]/80 backdrop-blur-xl z-50">
        <Link className="flex items-center gap-3 group" href="/">
          <img
            src="/logo-onvlo.png"
            alt="Onvlo"
            className="w-10 h-10 object-contain transition-all duration-300 group-hover:scale-105"
          />
          <span className="text-xl font-bold font-primary text-[#0A33C6]">
            Onvlo
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-medium font-primary text-[#606170] hover:text-[#0A33C6] transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium font-primary text-[#606170] hover:text-[#0A33C6] transition-colors" href="#solutions">
            Solutions
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="font-primary text-[#02041D] hover:text-[#0A33C6]">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/30 hover:shadow-xl hover:shadow-[#0A33C6]/40 transition-all font-primary">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden bg-[#EDEDED]">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[#EDEDED]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0A33C6]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0A33C6]/10 rounded-full blur-3xl animate-float delay-300" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#EDEDED] mb-8 animate-fade-in-down">
                <Sparkles className="h-4 w-4 text-[#0A33C6]" />
                <span className="text-sm font-medium font-primary text-[#0A33C6]">
                  The all-in-one platform for modern agencies
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-primary tracking-tight mb-6 animate-fade-in-up">
                <span className="text-[#02041D]">
                  Streamline Client
                </span>
                <br />
                <span className="text-[#0A33C6]">
                  Onboarding & Collaboration
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl font-primary text-[#606170] mb-10 max-w-3xl animate-fade-in-up delay-100">
                Replace Notion, Trello, Slack, and invoicing tools with one integrated workspace.
                From first contact to final payment — all in one beautiful platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up delay-200">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white px-8 h-14 text-lg shadow-2xl shadow-[#0A33C6]/40 hover:shadow-[#0A33C6]/60 transition-all hover:scale-105 group font-primary font-bold">
                    Start for Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/onboard/demo">
                  <Button variant="outline" size="lg" className="border-2 border-[#0A33C6] text-[#0A33C6] hover:bg-[#0A33C6]/10 px-8 h-14 text-lg backdrop-blur-xl transition-all hover:scale-105 font-primary">
                    View Demo Funnel
                    <Rocket className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 w-full max-w-3xl animate-fade-in-up delay-300">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-[#EDEDED]">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-[#0A33C6] group-hover:scale-110 transition-transform" />
                    <div className="text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-primary text-[#606170] font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-[#EDEDED] relative overflow-hidden">

          <div className="container px-6 mx-auto relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#EDEDED] mb-6">
                <Zap className="h-4 w-4 text-[#0A33C6]" />
                <span className="text-sm font-medium font-primary text-[#0A33C6]">
                  Powerful Features
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-6">
                Everything You Need,{" "}
                <span className="text-[#0A33C6]">
                  Nothing You Don't
                </span>
              </h2>
              <p className="text-lg font-primary text-[#606170] max-w-3xl mx-auto">
                Built specifically for agencies and service businesses. Every feature designed to save you time and impress your clients.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden bg-white border-[#EDEDED] hover:border-[#0A33C6]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0A33C6]/20 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-[#0A33C6] p-3 mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-3 group-hover:text-[#0A33C6] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-primary text-[#606170] leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="solutions" className="py-24 lg:py-32 relative overflow-hidden bg-[#EDEDED]">

          <div className="container px-6 mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-6">
                How{" "}
                <span className="text-[#0A33C6]">
                  Onvlo
                </span>
                {" "}Works
              </h2>
              <p className="text-lg font-primary text-[#606170] max-w-2xl mx-auto">
                From lead to long-term client in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Create Your Funnel",
                  description: "Build custom onboarding flows with forms, contracts, and payment collection. Share one link with clients.",
                  gradient: "from-[#0A33C6] to-[#0A33C6]"
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
                    <div className="relative h-20 w-20 rounded-2xl bg-[#0A33C6] flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-300">
                      <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse-glow" />
                      <span className="relative z-10 font-primary">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-4">
                      {item.title}
                    </h3>
                    <p className="font-primary text-[#606170] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-[#0A33C6]/30 -z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden bg-[#0A33C6]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Sparkles className="h-16 w-16 text-white/80 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl md:text-5xl font-bold font-primary text-[#EDEDED] mb-6">
                Ready to Transform Your Client Experience?
              </h2>
              <p className="text-xl font-primary text-[#EDEDED]/90 mb-12 leading-relaxed">
                Join agencies that have cut onboarding time by 10x and replaced 5+ tools with Onvlo.
                Start your journey to better client relationships today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white px-10 h-16 text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group font-primary font-bold">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="border-2 border-[#EDEDED] text-[#EDEDED] hover:bg-[#EDEDED]/10 px-10 h-16 text-lg backdrop-blur-xl transition-all hover:scale-105 font-primary">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EDEDED] py-12 px-6 bg-[#EDEDED]">
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-onvlo.png"
                alt="Onvlo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-bold font-primary text-[#0A33C6]">
                Onvlo
              </span>
            </div>
            <div className="flex gap-8 text-sm font-primary text-[#606170]">
              <Link href="#" className="hover:text-[#0A33C6] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#0A33C6] transition-colors">Terms</Link>
              <Link href="#" className="hover:text-[#0A33C6] transition-colors">Contact</Link>
            </div>
            <div className="text-sm font-primary text-[#606170]">
              © 2024 Onvlo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
