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
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Proposals & Contracts",
    description: "Create beautiful proposals and get them signed electronically in minutes.",
    gradient: "from-[#0731c2] to-[#010119]",
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
    gradient: "from-[#0731c2] to-[#010119]",
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
    <section className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1 mb-6 text-sm font-medium bg-blue-100 text-[#0731c2] dark:bg-blue-900/50 dark:text-[#0731c2] rounded-full">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#0731c2] to-[#010119] dark:from-[#0731c2] dark:to-[#010119]">
              run your agency
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
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
              <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
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
            <h4 className="font-semibold text-gray-900 dark:text-white">Bank-level Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              256-bit SSL encryption
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-[#0731c2] to-[#010119] mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Global CDN</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Lightning fast worldwide
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Smart Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Never miss an update
            </p>
          </div>
          <div>
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 mb-4">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">API Access</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Integrate with anything
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
