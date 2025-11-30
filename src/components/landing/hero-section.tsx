"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Globe, Users, BarChart3 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#EDEDED]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-[#0A33C6]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-10 w-72 h-72 bg-[#0A33C6]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium font-primary bg-white/80 backdrop-blur-sm border border-[#EDEDED] text-[#0A33C6] mb-6">
              <Sparkles className="w-4 h-4" />
              The Future of Client Management
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-primary tracking-tight"
          >
            <span className="text-[#0A33C6]">
              All-in-One Platform
            </span>
            <br />
            <span className="text-[#02041D]">
              for Modern Agencies
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl font-primary text-[#606170] max-w-3xl mx-auto"
          >
            Replace dozens of tools with one powerful platform. Manage clients, projects, 
            invoices, and team collaboration in a single, beautiful interface.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white shadow-lg shadow-[#0A33C6]/25 group font-primary font-bold"
              asChild
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#0A33C6] text-[#0A33C6] hover:bg-[#0A33C6]/10 font-primary"
              asChild
            >
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2 font-primary text-[#606170]">
              <Shield className="w-5 h-5 text-green-500" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 font-primary text-[#606170]">
              <Users className="w-5 h-5 text-[#0A33C6]" />
              <span>10,000+ Teams</span>
            </div>
            <div className="flex items-center gap-2 font-primary text-[#606170]">
              <Globe className="w-5 h-5 text-[#0A33C6]" />
              <span>150+ Countries</span>
            </div>
            <div className="flex items-center gap-2 font-primary text-[#606170]">
              <Zap className="w-5 h-5 text-[#0A33C6]" />
              <span>99.9% Uptime</span>
            </div>
          </motion.div>

          {/* Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20"
          >
            <div className="relative mx-auto max-w-6xl">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
              <div className="rounded-xl overflow-hidden shadow-2xl border border-[#EDEDED] bg-white">
                <div className="p-2 bg-[#EDEDED] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-8 bg-[#EDEDED]">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-32 bg-white/50 rounded-lg backdrop-blur" />
                    <div className="h-32 bg-white/50 rounded-lg backdrop-blur" />
                    <div className="h-32 bg-white/50 rounded-lg backdrop-blur" />
                  </div>
                  <div className="h-64 bg-white/50 rounded-lg backdrop-blur" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
