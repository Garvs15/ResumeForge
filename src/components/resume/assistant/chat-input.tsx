"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop: () => void;
}

function ChatInput({ isLoading, onSubmit, onStop }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🔁 Track renders
  const renderCount = useRef(0);


useEffect(() => {
  const renderStart = performance.now();

  const duration = performance.now() - renderStart;
  console.log("✅ Actual render time:", duration.toFixed(2), "ms");
});

  // 📏 Resize textarea (optimized)
  const resizeTextarea = (el: HTMLTextAreaElement) => {
    const start = performance.now();

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 144) + "px";

    const duration = performance.now() - start;
    if (duration > 5) {
      console.warn("🐢 Slow resize:", duration.toFixed(2), "ms");
    }
  };

  // ⌨️ Handle typing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const start = performance.now();

      const el = e.target;
      const value = el.value;

      // ⚠️ Reduce console spam
      if (value.length % 10 === 0) {
        console.log("⌨️ Typing:", value);
      }

      setInputValue(value);

      // Resize instantly
      resizeTextarea(el);

      const duration = performance.now() - start;
      if (duration > 8) {
        console.warn("🐢 Slow typing handler:", duration.toFixed(2), "ms");
      }
    },
    []
  );

  // 🚀 Handle submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      const start = performance.now();

      e.preventDefault();

      const trimmed = inputValue.trim();
      if (!trimmed) return;

      onSubmit(trimmed);
      setInputValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      const duration = performance.now() - start;
      console.log("🚀 Submit time:", duration.toFixed(2), "ms");
    },
    [inputValue, onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 p-1 border-t border-purple-200/60 bg-white/40 backdrop-blur-sm flex gap-1.5"
    >
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleChange}
        rows={1}
        placeholder="Ask me anything about your resume..."
        className="flex-1 bg-white/60 border-purple-200/60 focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 text-sm min-h-[32px] max-h-[144px] resize-none overflow-y-auto px-2 py-1.5"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      <Button
        type={isLoading ? "button" : "submit"}
        onClick={isLoading ? onStop : undefined}
        size="sm"
        className="text-white px-2 h-8"
      >
        {isLoading ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </Button>
    </form>
  );
}

// 🔥 Prevent unnecessary re-renders
export default React.memo(ChatInput);