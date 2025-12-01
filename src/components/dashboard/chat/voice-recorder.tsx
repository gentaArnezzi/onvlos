"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    className?: string;
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 120) {
                        // Max 2 minutes
                        stopRecording();
                        return 120;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRecording(false);
        setIsPaused(false);
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        chunksRef.current = [];
    };

    const sendRecording = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob);
            cancelRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (audioBlob && audioUrl) {
        // Preview mode
        return (
            <div className={cn("flex items-center gap-2 p-2 bg-gray-100 rounded-lg", className)}>
                <audio src={audioUrl} controls className="flex-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={cancelRecording}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 bg-[#0A33C6] hover:bg-[#0A33C6]/90"
                    onClick={sendRecording}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    if (isRecording) {
        // Recording mode
        return (
            <div className={cn("flex items-center gap-2 p-2 bg-red-50 rounded-lg", className)}>
                <div className="flex-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                    {recordingTime >= 120 && (
                        <span className="text-xs text-red-500">Max duration reached</span>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={cancelRecording}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={stopRecording}
                >
                    <Square className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // Default mic button
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-[#606170] hover:text-[#0A33C6] rounded-full", className)}
            onClick={startRecording}
            title="Record voice message"
        >
            <Mic className="h-4 w-4" />
        </Button>
    );
}
