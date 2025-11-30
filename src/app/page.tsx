"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileSignature,
  Receipt,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Filter,
  MessageSquare,
  Kanban,
  Calendar,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Layout,
  Workflow,
  Building2,
  Target
} from "lucide-react";
import { useState } from "react";

const processSteps = [
  {
    number: 1,
    title: "Digital Process Engineering",
    description: "We audit your operations, map workflows, identify inefficiencies, and redesign systems for growth."
  },
  {
    number: 2,
    title: "AI & Automation Implementation",
    description: "We implement AI and automation across workflows, integrate systems, and focus on reliability, security, and speed."
  },
  {
    number: 3,
    title: "Modern Client Experience Systems",
    description: "We craft digital systems for client journeys, custom-branded portals, automated updates, and reducing friction."
  },
  {
    number: 4,
    title: "Ongoing Transformation as a Service",
    description: "We provide continuous partnership, refining systems, onboarding new members, and adapting infrastructure."
  }
];

const solutions = [
  {
    title: "Smart Client Onboarding Funnels",
    description: "Simplify your onboarding process with a single link. No need for 5+ different softwares."
  },
  {
    title: "Centralized Client Portals",
    description: "Give each client their own branded portal with chat, tasks, files, and invoices."
  },
  {
    title: "Optimized Proposals & Contracts",
    description: "Create, send, and track proposals and contracts with e-signatures."
  },
  {
    title: "Lead Management System Upgrade",
    description: "Manage leads from first contact to conversion with visual boards."
  },
  {
    title: "Booking System Simplified",
    description: "Streamline appointment scheduling and calendar management."
  },
  {
    title: "Smarter Invoicing & Payment Flows",
    description: "Create invoices, accept payments, and track everything automatically."
  },
  {
    title: "Business Operations Streamlined",
    description: "Automate workflows and integrate all your business tools in one place."
  },
  {
    title: "Website & Link-in-Bio Optimization",
    description: "Create beautiful landing pages and optimize your online presence."
  },
  {
    title: "AI Workflows Tailored to Your Business",
    description: "Implement AI-powered automation that adapts to your specific needs."
  }
];

const caseStudies = [
  {
    title: "Global Wealth Manager",
    subtitle: "50+ Employees | $7.5B+ In Asset Under Management",
    problem: "The client struggled with fragmented systems, inefficient client management, and manual processes that slowed growth.",
    solution: "We conducted a comprehensive operational audit, implemented an enterprise-grade CRM, and built a branded client portal.",
    result: "The transformation unlocked $8 million in new revenue, increased client retention by 30%, and reduced time spent managing client requests by 65%.",
    metrics: [
      { value: "$8M", label: "New Revenue Generated" },
      { value: "30%", label: "Increase in Client Retentions" },
      { value: "65%", label: "Faster Client Request Resolution" }
    ]
  }
];

export default function Home() {
  const [currentCaseStudy, setCurrentCaseStudy] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-[#EDEDED]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center border-b border-[#EDEDED] bg-white/80 backdrop-blur-xl z-50">
        <Link className="flex items-center gap-2 sm:gap-3 group" href="/">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#0A33C6] flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-lg sm:text-xl font-bold font-primary text-[#02041D]">
            Onvlo
          </span>
        </Link>
        <nav className="ml-auto">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-primary text-[#02041D] hover:text-[#0A33C6]">
              Login
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden bg-white">
          <div className="container px-4 sm:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-primary tracking-tight mb-6 text-[#02041D]">
                Enterprise-Grade Digital & AI Transformation
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl md:text-2xl font-primary text-[#606170] mb-10 max-w-4xl leading-relaxed">
                We partner with large scale businesses to modernise workflows, implement AI, rebuild internal systems, and streamline client experiences.
              </p>

              {/* CTA Button */}
              <Link href="/signup">
                <Button size="lg" className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white px-8 h-14 text-lg shadow-lg font-primary font-bold mb-16">
                  Request a demo
                  </Button>
                </Link>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold font-primary text-[#02041D] mb-2">
                    150,000+
                  </div>
                  <div className="text-sm sm:text-base font-primary text-[#606170]">
                    Hours Saved Across Client Operations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold font-primary text-[#02041D] mb-2">
                    $35M+
                  </div>
                  <div className="text-sm sm:text-base font-primary text-[#606170]">
                    Revenue Unlocked by Our Clients
              </div>
                    </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold font-primary text-[#02041D] mb-2">
                    50,000+
                    </div>
                  <div className="text-sm sm:text-base font-primary text-[#606170]">
                    Users Have Used Our Systems and Tools
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Process Section */}
        <section className="py-16 sm:py-20 lg:py-32 bg-[#EDEDED]">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-4">
                Our Process
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {processSteps.map((step) => (
                <Card key={step.number} className="bg-white border-[#EDEDED] hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-[#0A33C6] flex items-center justify-center text-white text-xl font-bold font-primary flex-shrink-0">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-primary text-[#02041D] mb-2">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="font-primary text-[#606170]">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Built-for-Purpose Section */}
        <section className="py-16 sm:py-20 lg:py-32 bg-white">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-4">
                Solutions Built-for-Purpose
              </h2>
              <p className="text-lg sm:text-xl font-primary text-[#606170] max-w-3xl mx-auto mb-8">
                What we build reflects how your business works: modern, efficient, and aligned with your team. These solutions are tailored to reduce friction and drive results.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white px-8 h-14 text-lg shadow-lg font-primary font-bold mb-12">
                  Request a demo
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* Solutions List */}
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-[#EDEDED] transition-colors">
                    <ArrowRight className="h-5 w-5 text-[#0A33C6] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold font-primary text-[#02041D] mb-1">
                        {solution.title}
                      </h3>
                      <p className="text-sm font-primary text-[#606170]">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Screenshot/Dashboard Preview */}
              <div className="relative">
                <Card className="bg-white border-[#EDEDED] shadow-xl">
                  <CardContent className="p-6">
                    <div className="bg-[#EDEDED] rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <Layout className="h-16 w-16 text-[#0A33C6] mx-auto mb-4" />
                        <p className="font-primary text-[#606170]">
                          Dashboard Preview
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
            </div>
          </div>
        </section>

        {/* Real Impact Section */}
        <section className="py-16 sm:py-20 lg:py-32 bg-[#EDEDED]">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-4">
                Real Impact
              </h2>
              <p className="text-lg sm:text-xl font-primary text-[#606170] max-w-4xl mx-auto">
                Digital transformation, delivered with precision. We partner with firms where trust, efficiency, and operational clarity are non-negotiable. What follows is a glimpse into the kind of results we deliver at scale.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              {caseStudies.map((study, index) => (
                <Card key={index} className="bg-white border-[#EDEDED] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-primary text-[#02041D] mb-2">
                      {study.title}
                    </CardTitle>
                    <CardDescription className="text-base font-primary text-[#606170]">
                      {study.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold font-primary text-[#02041D] mb-2">Problem</h4>
                      <p className="font-primary text-[#606170] leading-relaxed">
                        {study.problem}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold font-primary text-[#02041D] mb-2">Solution</h4>
                      <p className="font-primary text-[#606170] leading-relaxed">
                        {study.solution}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold font-primary text-[#02041D] mb-2">Result</h4>
                      <p className="font-primary text-[#606170] leading-relaxed">
                        {study.result}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#EDEDED]">
                      {study.metrics.map((metric, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl sm:text-4xl font-bold font-primary text-[#0A33C6] mb-2">
                            {metric.value}
                          </div>
                          <div className="text-sm font-primary text-[#606170]">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => setCurrentCaseStudy(0)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          currentCaseStudy === 0 ? "bg-[#0A33C6]" : "bg-[#EDEDED]"
                        }`}
                        aria-label="Case study 1"
                      />
                      <button
                        onClick={() => setCurrentCaseStudy(1)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          currentCaseStudy === 1 ? "bg-[#0A33C6]" : "bg-[#EDEDED]"
                        }`}
                        aria-label="Case study 2"
                      />
                      <button
                        onClick={() => setCurrentCaseStudy(2)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          currentCaseStudy === 2 ? "bg-[#0A33C6]" : "bg-[#EDEDED]"
                        }`}
                        aria-label="Case study 3"
                      />
                      <button
                        onClick={() => setCurrentCaseStudy(3)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          currentCaseStudy === 3 ? "bg-[#0A33C6]" : "bg-[#EDEDED]"
                        }`}
                        aria-label="Case study 4"
                      />
                      <button
                        onClick={() => setCurrentCaseStudy(4)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          currentCaseStudy === 4 ? "bg-[#0A33C6]" : "bg-[#EDEDED]"
                        }`}
                        aria-label="Case study 5"
                      />
              </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EDEDED] py-12 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0A33C6] flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-lg font-bold font-primary text-[#02041D]">
                Onvlo
              </span>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold font-primary text-[#02041D] mb-4">PRODUCTS</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    What's New
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Try For Free
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="font-semibold font-primary text-[#02041D] mb-4">SOLUTIONS</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Client Communication
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Team Communication
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Client Billing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Task Management
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold font-primary text-[#02041D] mb-4">COMPANY</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm font-primary text-[#606170] hover:text-[#0A33C6] transition-colors">
                    Terms & Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#EDEDED]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#0A33C6]"></div>
              <span className="text-sm font-bold font-primary text-[#02041D]">
                Onvlo
              </span>
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
