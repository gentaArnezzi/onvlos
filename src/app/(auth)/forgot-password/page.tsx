"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Better-auth has built-in forgot password functionality
            await authClient.forgetPassword({
                email,
            }, {
                onSuccess: () => {
                    setSent(true);
                    toast.success("Password reset email sent! Check your inbox.");
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Failed to send reset email");
                }
            });
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDEDED] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 -z-10" />
            
            <Card className="w-full max-w-md border-[#EDEDED] shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold font-primary text-[#02041D]">Forgot Password</CardTitle>
                    <CardDescription className="font-primary text-[#606170]">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="space-y-4 text-center py-4">
                            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold font-primary text-[#02041D]">Email Sent!</h3>
                            <p className="text-sm font-primary text-[#606170]">
                                We've sent a password reset link to <strong>{email}</strong>. 
                                Please check your inbox and click the link to reset your password.
                            </p>
                            <p className="text-xs font-primary text-[#A2A2AA] mt-4">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSent(false);
                                    setEmail("");
                                }}
                                className="w-full mt-4"
                            >
                                Send Another Email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-primary text-[#02041D]">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:text-[#606170] focus:border-[#0A33C6] focus:ring-[#0A33C6]/20"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary font-bold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center font-primary text-[#606170]">
                        Remember your password?{" "}
                        <Link href="/login" className="text-[#0A33C6] hover:text-[#0A33C6]/80 font-medium">
                            Back to Login
                        </Link>
                    </div>
                    <Link href="/login" className="flex items-center justify-center text-sm font-primary text-[#606170] hover:text-[#02041D]">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

