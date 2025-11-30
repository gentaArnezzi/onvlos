"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Quote } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import { useState, useEffect } from "react";

const quotes = [
  { en: "The only way to do great work is to love what you do.", id: "Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang Anda lakukan." },
  { en: "Innovation distinguishes between a leader and a follower.", id: "Inovasi membedakan antara pemimpin dan pengikut." },
  { en: "Success is not final, failure is not fatal: it is the courage to continue that counts.", id: "Kesuksesan bukanlah akhir, kegagalan bukanlah fatal: keberanian untuk melanjutkan yang penting." },
];

const timezones = [
  { city: "New York", tz: "America/New_York" },
  { city: "London", tz: "Europe/London" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
  { city: "Sydney", tz: "Australia/Sydney" },
  { city: "Jakarta", tz: "Asia/Jakarta" },
];

export function QuotesWorldClock({ language }: { language: Language }) {
  const { t } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set random quote
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Update times
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      timezones.forEach(({ city, tz }) => {
        const time = new Date().toLocaleTimeString("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
        });
        newTimes[city] = time;
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-sm font-semibold font-primary text-[#02041D] flex items-center gap-2">
          <Quote className="h-4 w-4 text-[#0A33C6]" />
          {language === "id" ? "Kutipan Inspiratif" : "Inspirational Quote"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-primary text-[#606170] italic">
          "{currentQuote[language]}"
        </p>
        <div className="border-t border-[#EDEDED] pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[#0A33C6]" />
            <CardTitle className="text-sm font-semibold font-primary text-[#02041D]">
              {language === "id" ? "Zona Waktu Dunia" : "World Clock"}
            </CardTitle>
          </div>
          <div className="space-y-2">
            {timezones.map(({ city, tz }) => (
              <div key={city} className="flex items-center justify-between text-xs font-primary">
                <span className="text-[#606170]">{city}</span>
                <span className="text-[#02041D] font-medium">{times[city] || "--:--"}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

