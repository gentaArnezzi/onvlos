"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        await authClient.signUp.email({
            email,
            password,
            name,
        }, {
            onSuccess: () => {
                router.push("/dashboard");
            },
            onError: (ctx) => {
                setError(ctx.error.message);
                setLoading(false);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-[#ededed] to-blue-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0731c2]/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#010119]/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <Card className="border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-center mb-2">
                            <img
                                src="/logo-onvlo.png"
                                alt="Onvlo"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <CardTitle className="text-3xl font-bold text-slate-900">
                                Create an account
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                Enter your information to get started
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-5 pb-6">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">
                                    Full Name
                                </Label>
                                <Input 
                                    id="name" 
                                    placeholder="John Doe"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#0731c2] focus:ring-[#0731c2]/20"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">
                                    Email
                                </Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="m@example.com"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#0731c2] focus:ring-[#0731c2]/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">
                                    Password
                                </Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#0731c2] focus:ring-[#0731c2]/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6">
                            <Button 
                                className="w-full bg-gradient-to-r from-[#0731c2] to-[#010119] hover:from-[#0525a0] hover:to-[#00000f] text-white shadow-lg shadow-[#0731c2]/30 hover:shadow-xl hover:shadow-[#0731c2]/40 transition-all" 
                                type="submit" 
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                            <div className="text-center text-sm text-slate-600">
                                Already have an account?{" "}
                                <Link 
                                    href="/login" 
                                    className="text-[#0731c2] hover:text-[#0525a0] hover:underline font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
