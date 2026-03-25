"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useApiKeys, useDefaultModel } from "@/hooks/use-api-keys";
import { useChatApi } from "@/hooks/use-chat-api";
import { useCustomPrompts } from "@/hooks/use-custom-prompts";
import { Education, Job, Project, Resume, Skill, WorkExperience } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertDialogContent } from "@radix-ui/react-alert-dialog";
import { Bot, ChevronDown, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { QuickSuggestion } from "./quick-suggestions";
import { Textarea } from "@/components/ui/textarea";
import { MemoizedMarkdown } from "@/components/ui/memoized-markdown";
import type { UIToolInvocation } from "ai";
import { ChatMessage } from "@/lib/chat-types";
import { ResumeTools } from "@/lib/ai-tools";
import { Suggestion, WholeResumeSuggestion } from "./suggestions";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ApiKeyErrorAlert } from "@/components/ui/api-key-error-alert";
import ChatInput from "./chat-input";
// import { useChat } from "ai/react";

interface ChatbotProps {
    resume: Resume;
    onResumeChange: (field: keyof Resume, value: Resume[typeof field]) => void;
    job?: Job | null;
}


function ScrollToBottom() {
    const { isAtBottom, scrollToBottom } = useStickToBottomContext();

    return (
        !isAtBottom && (
            <button
                className={cn(
                    "absolute z-50 rounded-full p-2",
                    "bg-white/80 hover:bg-white",
                    "border border-purple-200/60 hover:border-purple-300/60",
                    "shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10",
                    "transition-all duration-300",
                    "left-[50%] translate-x-[-50%] bottom-4"
                )}
                onClick={() => scrollToBottom()}
            >
                <ChevronDown className="h-4 w-4 text-purple-600" />
            </button>
        )
    );
}

// interface Message {
//     id: string;
//     role: "user" | "assistant";
//     content: string;
// }

export default function Chatbot({ resume, onResumeChange, job }: ChatbotProps) {
    const router = useRouter();
    const [accordionValue, setAccordionValue] = React.useState<string>("");

    // Use synchronized hooks for instant updates when settings change
    const { apiKeys } = useApiKeys();
    const { defaultModel } = useDefaultModel();
    const { customPrompts } = useCustomPrompts();

    const [originalResume, setOriginalResume] = React.useState<Resume | null>(null);
    const [isInitialLoading, setIsInitialLoading] = React.useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

    const config = {
        model: defaultModel,
        apiKeys,
        customPrompts: Object.keys(customPrompts).length > 0 ? customPrompts : undefined,
    };

    const { messages, error, append, isLoading, sendMessage, setMessages, addToolResult, stop } = useChatApi({
        resume,
        job,
        config,
        onResumeChange,
        setOriginalResume,
    });

    // Memoize the submit handler
    const handleSubmit = useCallback((message: string) => {
        setIsInitialLoading(true);
        append({
            content: message.replace(/\s+$/, ''),
            role: 'user',
        });

        setAccordionValue("chat");
    }, [append]);

    // Add delete handler
    const handleDelete = (id: string) => {
        setMessages(messages.filter(message => message.id !== id));
    };

    // Add Edit handler
    const handleEdit = (id: string, content: string) => {
        setEditingMessageId(id);
        setEditContent(content);
    }

    // Add Save handler
    const handleSaveEdit = (id: string) => {
        setMessages(messages.map(message => message.id === id ? { ...message, content: editContent }
            : message
        ));
        setEditingMessageId(null);
        setEditContent("");
    };

    const handleClearChat = useCallback(() => {
        setMessages([]);
        setOriginalResume(null);
        setEditingMessageId(null);
        setEditContent("");
    }, [setMessages]);

    const [retryTime] = useState(() => {
        return new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleString();
    });


    return (
        <Card className={cn(
            "flex flex-col w-full l mx-auto pt-0.5 mt-6",
            "bg-gradient-to-br from-purple-400/20 via-purple-400/50 to-indigo-400/50",
            "border-2 border-purple-200/60",
            "shadow-lg shadow-purple-500/5",
            "transition-all duration-500",
            "hover:shadow-xl hover:shadow-purple-500/10",
            "overflow-hidden",
            "relative",
            "data-[state=closed]:shadow-md data-[state=closed]:border data-[state=closed]:border-purple-200/40 "
        )}>
            <Accordion type="single"
                collapsible
                value={accordionValue}
                onValueChange={setAccordionValue}
                className="relative z-10"
            >
                <AccordionItem value="chat" className="border-none py-0 my-0">

                    {/* Accordion Trigger */}
                    <div className="relative">
                        <AccordionTrigger className={cn(
                            "px-2 py-2",
                            "hover:no-underline",
                            "group",
                            "transition-all duration-300",
                            "data-[state=open]:border-b border-purple-200/60",
                            "data-[state=closed]:opacity-80 data-[state=closed]:hover:opacity-100",
                            "data-[state=closed]:py-1"
                        )}>
                            <div className={cn(
                                "flex items-center w-full",
                                "transition-transform duration-300",
                                "group-hover:scale-[0.99]",
                                "group-data-[state=closed]:scale-95"
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "p-1 rounded-lg",
                                        "bg-purple-100/80 text-purple-600",
                                        "group-hover:bg-purple-200/80",
                                        "transition-colors duration-300",
                                        "group-data-[state=closed]:bg-white/60",
                                        "group-data-[state=closed]:p-0.5"
                                    )}>
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <Logo className="text-xs" asLink={false} />
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                            <AlertDialogTrigger asChild>
                                <Button className={cn(
                                    "absolute right-8 top-1/2 -translate-y-1/2",
                                    "px-3 py-1 rounded-lg",
                                    "bg-purple-100/40 text-purple-500/80 border border-purple-500",
                                    "hover:bg-purple-200/60 hover:text-purple-600",
                                    "transition-all duration-300",
                                    "focus:outline-none focus:ring-2 focus:ring-purple-400/40",
                                    "disabled:opacity-50",
                                    "flex items-center gap-2",
                                    (accordionValue !== "chat" || isAlertOpen) && "hidden",
                                )}
                                    disabled={messages.length === 0}
                                    aria-label="Clear chat history"
                                    variant="ghost"
                                    size="sm"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    <span className="text-xs font-medium">Clear Chat History</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className={cn(
                                "bg-white/95 backdrop-blur-xl",
                                "border-purple-200/60",
                                "shadow-lg shadow-purple-500/5"
                            )}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove all messages and reset the chat. This action can&apos;t be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className={cn(
                                        "border-purple-200/60",
                                        "hover:bg-purple-50/50",
                                        "hover:text-purple-700"
                                    )}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearChat}
                                        className={cn(
                                            "bg-purple-500 text-white",
                                            "hover:bg-purple-600",
                                            "focus:ring-purple-400"
                                        )}
                                    >
                                        Clear Chat
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Accordion Content */}
                    <AccordionContent className="space-y-4">
                        <StickToBottom className="h-[60vh] px-4 relative custom-scrollbar" resize="smooth" initial="smooth">
                            <StickToBottom.Content className="flex flex-col custom-scrollbar">
                                {messages.length === 0 ? (
                                    <QuickSuggestion onSuggestionClick={handleSubmit} />
                                ) : (
                                    <>
                                        {/* Messages */}
                                        {messages.map((m: ChatMessage, index) => (
                                            <React.Fragment key={index}>
                                                {/* Regular Message Content */}
                                                {m.content ? (
                                                    <div className="my-2">
                                                        <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={cn(
                                                                "rounded-2xl px-4 py-2 max-w-[90%] text-sm relative group items-center",
                                                                m.role === 'user' ? [
                                                                    "bg-gradient-to-br from-purple-500 to-indigo-500",
                                                                    "text-white",
                                                                    "shadow-md shadow-purple-500/10",
                                                                    "ml-auto pb-0 text-white"
                                                                ] : [
                                                                    "bg-white/60",
                                                                    "border border-purple-200/60",
                                                                    "shadow-sm",
                                                                    "backdrop-blur-sm pb-0"
                                                                ]
                                                            )}>
                                                                {/* Edit Message */}
                                                                {editingMessageId === m.id ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        <Textarea
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            className={cn(
                                                                                "w-full min-h-[100px] p-2 rounded-lg",
                                                                                "bg-white/80 backdrop-blur-sm",
                                                                                m.role === 'user'
                                                                                    ? "text-purple-900 placeholder-purple-400"
                                                                                    : "text-gray-900 placeholder-gray-400",
                                                                                "border border-purple-200/60 focus:border-purple-400/60",
                                                                                "focus:outline-none focus:ring-1 focus:ring-purple-400/60"
                                                                            )}
                                                                        />
                                                                        <button
                                                                            onClick={() => handleSaveEdit(m.id)}
                                                                            className={cn(
                                                                                "self-end px-3 py-1 rounded-lg text-xs",
                                                                                "bg-purple-500 text-white",
                                                                                "hover:bg-purple-600",
                                                                                "transition-colors duration-200"
                                                                            )}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <MemoizedMarkdown id={m.id} content={m.content} />
                                                                )}

                                                                {/* Message Actions */}
                                                                <div className="absolute -bottom-4 left-2 flex gap-2">
                                                                    <button
                                                                        onClick={() => handleDelete(m.id)}
                                                                        className={cn(
                                                                            "transition-colors duration-200",
                                                                            m.role === 'user' ? "text-purple-500/60 hover:text-purple-600"
                                                                                : "text-purple-400/60 hover:text-purple-500"
                                                                        )}
                                                                        aria-label="Delete Message"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEdit(m.id, m.content)}
                                                                        className={cn(
                                                                            "transition-colors duration-200",
                                                                            m.role === 'user'
                                                                                ? "text-purple-500/60 hover:text-purple-600"
                                                                                : "text-purple-400/60 hover:text-purple-500"
                                                                        )}
                                                                        aria-label="Edit message"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {/* Tool Invocations as Seperate Bubbles */}
                                                {m.toolInvocations?.map((toolInvocation) => {
                                                    const { toolCallId, toolName, result } = toolInvocation;

                                                    const toolConfig = {
                                                        suggest_work_experience_improvement: {
                                                            type: 'work_experience' as const,
                                                            field: 'work_experience' as const,
                                                            contentKey: 'improved_experience',
                                                        },
                                                        suggest_project_improvement: {
                                                            type: 'project' as const,
                                                            field: 'projects' as const,
                                                            contentKey: 'improved_project',
                                                        },
                                                        suggest_skill_improvement: {
                                                            type: 'skill' as const,
                                                            field: 'skills' as const,
                                                            contentKey: 'improved_skill',
                                                        },
                                                        suggest_education_improvement: {
                                                            type: 'education' as const,
                                                            field: 'education' as const,
                                                            contentKey: 'improved_education',
                                                        },
                                                    } as const;

                                                    // ------getResume-----
                                                    if (toolName === 'getResume') {
                                                        return (
                                                            <div key={toolCallId} className="mt-2 w-[90%]">
                                                                <div className="flex justify-start">
                                                                    <div className={cn(
                                                                        "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                                                        "bg-white/60 border border-purple-200/60",
                                                                        "shadow-sm backdrop-blur-sm"
                                                                    )}>
                                                                        <p>
                                                                            Read Resume ({result?.sections?.join(', ') || 'all'})
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // ------------modifyWholeResume-------------
                                                    if (toolName === 'modifyWholeResume') {
                                                        return (
                                                            <div key={toolCallId} className="mt-2 w-[90%]">
                                                                <WholeResumeSuggestion onReject={() => {
                                                                    if (originalResume) {
                                                                        Object.keys(originalResume).forEach((key) => {
                                                                            if (key !== 'id' && key !== 'created_at'
                                                                                && key !== 'updated_at'
                                                                            ) {
                                                                                onResumeChange(key as keyof Resume,
                                                                                    originalResume[key as keyof Resume]);
                                                                            }
                                                                        });
                                                                        setOriginalResume(null);
                                                                    }
                                                                }} />
                                                            </div>
                                                        );
                                                    }

                                                    // ------- suggestion tools ------
                                                    const config = toolConfig[toolName as keyof typeof toolConfig];
                                                    if (!config) return null;

                                                    return (
                                                        <div key={toolCallId} className="mt-2 w-[90%]">
                                                            <Suggestion
                                                                type={config.type}
                                                                content={result[config.contentKey]}
                                                                currentContent={resume[config.field][result.index]}
                                                                onAccept={() => onResumeChange(config.field, resume[config.field].map(
                                                                    (item: WorkExperience | Education | Project | Skill,
                                                                        i: number
                                                                    ) => i === result.index
                                                                            ? result[config.contentKey]
                                                                            : item))}
                                                                onReject={() => { }}
                                                            />
                                                        </div>
                                                    );
                                                })}

                                                {/* Laoding Dots Message - Modified Condition */}
                                                {((isInitialLoading && index === messages.length - 1 && m.role === 'user') || (isLoading && index === messages.length - 1 && m.role === 'assistant')) &&
                                                    (
                                                        <div className="mt-2">
                                                            <div className="flex justify-start">
                                                                <div className={cn(
                                                                    "rounded-2xl px-4 py-2.5 min-w-[60px]",
                                                                    "bg-white/60",
                                                                    "border border-purple-200/60",
                                                                    "shadow-sm",
                                                                    "backdrop-blur-sm"
                                                                )}>
                                                                    <LoadingDots className="text-purple-800" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}

                                {error && (
                                    error.message === "Rate limit exceeded. Try again later." ? (
                                        <div className={cn(
                                            "rounded-lg p-4 text-sm",
                                            "bg-pink-50 border border-pink-200",
                                            "text-pink-700"
                                        )}>
                                            <p>You&apos;ve used all your available messages. Please try again after:</p>
                                            <p className="font-medium mt-2">
                                                {/* {new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleString()}     5 hours from now */}
                                                {retryTime}
                                            </p>
                                        </div>
                                    ) : (
                                        <ApiKeyErrorAlert
                                            error={error}
                                            router={router}
                                        />
                                    )
                                )}
                            </StickToBottom.Content>

                            <ScrollToBottom />
                        </StickToBottom>

                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Input Bar */}
            <ChatInput
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onStop={stop}
            />
        </Card>
    );

    //   <Card className="flex flex-col w-full mx-auto h-[80vh] bg-gradient-to-br from-purple-400/20 via-purple-400/50 to-indigo-400/50
    //   border-2 border-purple-200/60 shadow-lg shadow-purple-500/5 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden relative">

    //   {/* Chat messages container */}
    //   <div className="flex-1 flex flex-col overflow-hidden">
    //     <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="flex-1 flex flex-col overflow-hidden">
    //       <AccordionItem value="chat" className="flex-1 flex flex-col">
    //         <AccordionTrigger className="px-2 py-2 border-b border-purple-200/60">
    //           <div className="flex items-center gap-1">
    //             <Bot className="h-3 w-3 text-purple-600" />
    //             <Logo className="text-xs" asLink={false} />
    //           </div>
    //         </AccordionTrigger>

    //         <AccordionContent className="flex-1 flex flex-col overflow-hidden">
    //           <StickToBottom className="flex-1 overflow-auto px-4 custom-scrollbar" resize="smooth" initial="smooth">
    //             <StickToBottom.Content className="flex flex-col gap-2">
    //               {messages.length === 0 ? (
    //                 <QuickSuggestion onSuggestionClick={handleSubmit} />
    //               ) : (
    //                 messages.map((m) => (
    //                   <div key={m.id} className={m.role === 'user' ? "self-end" : "self-start"}>
    //                     <MemoizedMarkdown id={m.id} content={m.content} />
    //                   </div>
    //                 ))
    //               )}
    //               <ScrollToBottom />
    //             </StickToBottom.Content>
    //           </StickToBottom>
    //         </AccordionContent>
    //       </AccordionItem>
    //     </Accordion>
    //   </div>

    //   {/* ChatInput pinned at bottom */}
    //   <div className="flex-none w-full border-t border-purple-200/40">
    //     <ChatInput isLoading={isLoading} onSubmit={handleSubmit} onStop={stop} />
    //   </div>
    // </Card>
}