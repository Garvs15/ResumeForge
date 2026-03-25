"use client";

import { Resume } from "@/lib/types";
import { TextImportDialog } from "./management/dialogs/text-import-dialog";
import { Button } from "../ui/button";
import { FileText } from "lucide-react";

interface TextImportProps {
    resume: Resume;
    onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
    className?: string;
}

export function TextImport({
    resume,
    onResumeChange,
    className
}: TextImportProps) {
    return (
        <TextImportDialog
            resume={resume}
            onResumeChange={onResumeChange}
            trigger={
                <Button
                    size="sm"
                    className={className}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <FileText className="mr-2 h-4 w-4" />
                    Import
                </Button>
            }
        />
    );
}