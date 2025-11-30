"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Copy, ExternalLink, MoreVertical, Edit, Trash } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingLinkCardProps {
    link: any;
    baseUrl: string;
}

export function BookingLinkCard({ link, baseUrl }: BookingLinkCardProps) {
    const bookingUrl = `${baseUrl}/book/${link.slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        alert("Link copied to clipboard");
    };

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 border-[#EDEDED] bg-white overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#0A33C6] to-[#0A33C6]" />
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold font-primary text-[#02041D]">
                        {link.title}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {link.description && (
                    <CardDescription className="line-clamp-2">{link.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm font-primary text-[#606170]">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {link.duration_minutes}m
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="capitalize">{link.location_type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant={link.is_active ? "default" : "secondary"} className={link.is_active ? "bg-[#EDEDED] text-emerald-700 hover:bg-emerald-200" : ""}>
                        {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EDEDED] border border-[#EDEDED]">
                    <Input
                        value={bookingUrl}
                        readOnly
                        className="h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-0 shadow-none"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-white"
                        onClick={copyToClipboard}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="outline" className="w-full group-hover:border-blue-500 group-hover:text-[#0A33C6] transition-colors" asChild>
                    <Link href={`/book/${link.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview Booking Page
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
