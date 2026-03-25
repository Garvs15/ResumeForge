import type { Tool, UITool, UIToolInvocation } from "ai";
import { Education, Job, Project, Resume, Skill, WorkExperience } from "@/lib/types";
import { useCallback, useState } from "react";
import type { AppToolResult, ChatMessage } from "@/lib/chat-types";

// type AppToolInvocation = UIToolInvocation<Tool | UITool> & {
//     toolName: string;
// }

// interface AppToolResult {
//     toolCallId: string;
//     toolName: string;
//     result: any;
// }

// interface Message {
//     id: string;
//     role: "user" | "assistant";
//     content: string;
//     toolInvocations?: AppToolResult[];
// }

export function useChatApi({
    resume,
    job,
    config,
    onResumeChange,
    setOriginalResume,
}: {
    resume: Resume;
    job?: Job | null;
    config?: Record<string, unknown>;
    onResumeChange?: <K extends keyof Resume>(
        field: K,
        value: Resume[K]
    ) => void;
    setOriginalResume?: (r: Resume | null) => void;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const append = useCallback((message: Omit<ChatMessage, "id">) => {
        setMessages((prev) => [...prev, { ...message, id: Date.now().toString() }]);
    }, []);

    const addToolResult = useCallback(
        ({ toolCallId, toolName, result }: AppToolResult) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === toolCallId
                        ? {
                            ...msg,
                            toolInvocations: [
                                ...(msg.toolInvocations || []),
                                { toolCallId, toolName, result },
                            ],
                        }
                        : msg
                )
            );
        },
        []
    );


    const sendMessage = useCallback(async (userMessage: string) => {
        append({ role: "user", content: userMessage });
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume, job, userMessage, config }),
            });

            const data = await res.json();

            if (data.toolCalls) {
                for (const toolCall of data.toolCalls) {
                    // handle tools exactly as you already do
                    addToolResult({
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName,
                        result: toolCall.args,
                    });
                }
            }

            if (data.output) {
                append({ role: "assistant", content: data.output });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err);
            } else {
                setError(new Error("Unknown error"));
            }
        } finally {
            setIsLoading(false);
        }
    }, [append, resume, job, config, addToolResult]);

    const stop = useCallback(() => {
        setIsLoading(false);
    }, []);

    return {
        messages,
        error,
        isLoading,
        append,
        sendMessage,
        setMessages,
        addToolResult,
        stop
    };
}
