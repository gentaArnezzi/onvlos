"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Zap,
  Globe,
  Shield,
  Palette,
  Rocket,
  CreditCard,
  Bell
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Management",
    description: "Organize all your clients in one place with detailed profiles and interaction history.",
    gradient: "bg-[#EDEDED]0 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Proposals & Contracts",
    description: "Create beautiful proposals and get them signed electronically in minutes.",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Let clients book meetings with you automatically based on your availability.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track revenue, client growth, and team performance with beautiful charts.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Communicate with clients instantly through integrated messaging.",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    icon: CreditCard,
    title: "Invoice & Payments",
    description: "Send professional invoices and get paid faster with integrated payments.",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 relative bg-[#EDEDED]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1 mb-6 text-sm font-medium font-primary bg-white/80 backdrop-blur-sm border border-[#EDEDED] text-[#0A33C6] rounded-full">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-primary text-[#02041D] mb-6">
            Everything you need to
            <span className="block text-[#0A33C6]">
              run your agency
            </span>
          </h2>
          <p className="text-xl font-primary text-[#606170]">
            Powerful features designed to streamline your workflow and delight your clients
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative h-full bg-white rounded-2xl p-8 shadow-lg border border-[#EDEDED] overflow-hidden hover:shadow-xl transition-shadow">
                {/* Icon */}
                <div className="inline-flex p-3 rounded-lg bg-[#0A33C6] mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold font-primary mb-3 text-[#02041D]">
                  {feature.title}
                </h3>
                <p className="font-primary text-[#606170]">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 grid md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold font-primary text-[#02041D]">Bank-level Security</h4>
            <p className="text-sm font-primary text-[#606170] mt-2">
              256-bit SSL encryption
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-[#0A33C6] mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold font-primary text-[#02041D]">Global CDN</h4>
            <p className="text-sm font-primary text-[#606170] mt-2">
              Lightning fast worldwide
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-[#0A33C6] mb-4">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold font-primary text-[#02041D]">Smart Notifications</h4>
            <p className="text-sm font-primary text-[#606170] mt-2">
              Never miss an update
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-[#0A33C6] mb-4">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold font-primary text-[#02041D]">API Access</h4>
            <p className="text-sm font-primary text-[#606170] mt-2">
              Integrate with anything
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
