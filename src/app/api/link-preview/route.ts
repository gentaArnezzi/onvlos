import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Validate URL
        let validUrl: URL;
        try {
            validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
        } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Fetch the page HTML
        const response = await fetch(validUrl.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
            },
            redirect: "follow",
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Extract metadata using regex (simple approach)
        // For production, consider using a proper HTML parser
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : null;

        // Try Open Graph tags
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const ogDescriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

        // Try meta description
        const metaDescriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        // Extract domain
        const domain = validUrl.hostname.replace("www.", "");

        // Get favicon
        const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
        let favicon = faviconMatch ? faviconMatch[1] : null;
        if (favicon && !favicon.startsWith("http")) {
            favicon = new URL(favicon, validUrl.origin).toString();
        }

        return NextResponse.json({
            success: true,
            title: ogTitleMatch ? ogTitleMatch[1] : title,
            description: ogDescriptionMatch 
                ? ogDescriptionMatch[1] 
                : metaDescriptionMatch 
                ? metaDescriptionMatch[1] 
                : null,
            image: ogImageMatch ? ogImageMatch[1] : null,
            domain,
            favicon: favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        });
    } catch (error: any) {
        console.error("Error fetching link preview:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch link preview",
            },
            { status: 500 }
        );
    }
}


