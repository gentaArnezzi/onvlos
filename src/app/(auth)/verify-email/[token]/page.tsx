"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;
    
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid verification token");
            setLoading(false);
            return;
        }

        const verifyEmail = async () => {
            try {
                // Better-auth handles email verification through API
                const response = await fetch(`/api/auth/verify-email?token=${token}`, {
                    method: "GET",
                });

                if (response.ok) {
                    setVerified(true);
                    toast.success("Email verified successfully!");
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 2000);
                } else {
                    const data = await response.json();
                    setError(data.message || "Failed to verify email. The link may have expired.");
                    toast.error("Verification failed");
                }
            } catch (err) {
                setError("An error occurred during verification");
                toast.error("Verification failed");
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDEDED] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 -z-10" />
            
            <Card className="w-full max-w-md border-[#EDEDED] shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold font-primary text-[#02041D]">Email Verification</CardTitle>
                    <CardDescription className="font-primary text-[#606170]">
                        {loading ? "Verifying your email..." : verified ? "Email verified!" : "Verification failed"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4 text-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin text-[#0A33C6] mx-auto" />
                            <p className="text-sm font-primary text-[#606170]">Please wait while we verify your email...</p>
                        </div>
                    ) : verified ? (
                        <div className="space-y-4 text-center py-4">
                            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-semibold font-primary text-[#02041D]">Email Verified!</h3>
                            <p className="text-sm font-primary text-[#606170]">
                                Your email has been successfully verified. Redirecting to dashboard...
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full mt-4 bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary font-bold"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center py-4">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold font-primary text-[#02041D]">Verification Failed</h3>
                            <p className="text-sm font-primary text-[#606170]">
                                {error || "The verification link is invalid or has expired."}
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary font-bold"
                                >
                                    Go to Login
                                </Button>
                                <Link href="/signup" className="block text-sm font-primary text-[#0A33C6] hover:text-[#0A33C6]/80">
                                    Sign up again
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

