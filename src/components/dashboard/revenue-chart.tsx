"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

interface RevenueChartProps {
    data?: Array<{ month: string; revenue: number }>;
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
    const { theme } = useTheme();

    const isDark = theme === "dark";

    // Transform data to match chart format
    const chartData = data.length > 0 
        ? data.map(item => ({
            name: item.month,
            revenue: Number(item.revenue) || 0,
            expenses: 0 // Expenses can be added later if needed
        }))
        : [
            { name: "Jan", revenue: 0, expenses: 0 },
            { name: "Feb", revenue: 0, expenses: 0 },
            { name: "Mar", revenue: 0, expenses: 0 },
            { name: "Apr", revenue: 0, expenses: 0 },
            { name: "May", revenue: 0, expenses: 0 },
            { name: "Jun", revenue: 0, expenses: 0 },
        ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#fff",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                />
                <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
