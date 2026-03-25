"use client";

import { Education, Project, Resume, WorkExperience } from "@/lib/types";
// import { pdf } from "@react-pdf/renderer";
import { ResumePDFDocument } from "./resume-pdf-document";
import { toast } from "@/hooks/use-toast";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Copy, Download } from "lucide-react";

interface ResumeContextMenuProps {
    children: React.ReactNode;
    resume: Resume;
}

export function ResumeContextMenu({ children, resume }: ResumeContextMenuProps) {
    const handleDownloadPDF = async () => {
        try {
            const { pdf } = await await import("@react-pdf/renderer");
            const blob = await pdf(<ResumePDFDocument resume={resume} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resume.first_name}_${resume.last_name}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast({
                title: "Yeah, Download Started! 🚀✨",
                description: "Your resume PDF is being downloaded."
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Download Failed! ❌",
                description: "Unable to download your resume. Please try again later...",
                variant: "destructive",
            });
        }
    };

    const formatWorkExperience = (exp: WorkExperience) => {
        const lines = [
            `${exp.position} at ${exp.company}`,
            exp.location ? `Location: ${exp.location}` : '',
            `Date: ${exp.date}`,
            '',
            ...exp.description.map(desc => `• ${desc}`),
            exp.technologies ? `Technologies: ${exp.technologies.join(', ')}` : '',
        ];
        return lines.filter(Boolean).join('\n');
    };

    const formatEducation = (edu: Education) => {
        const lines = [
            `${edu.degree} in ${edu.field}`,
            edu.school,
            edu.location ? `Location: ${edu.location}` : '',
            `Date: ${edu.date}`,
            edu.gpa ? `GPA: ${edu.gpa}` : '',
            ...(edu.achievements || []).map((achievement: string) => `• ${achievement}`),
        ];
        return lines.filter(Boolean).join('\n');
    };

    const formatProject = (project: Project) => {
        const lines = [
            project.name,
            ...(project.description || []).map((desc: string) => `• ${desc}`),
            project.date ? `Date: ${project.date}` : '',
            project.technologies ? `Technologies: ${project.technologies.join(', ')}` : '',
            project.url ? `URL: ${project.url}` : '',
            project.github_url ? `GitHub: ${project.github_url}` : '',
        ];
        return lines.filter(Boolean).join('\n');
    };

    const handleCopyToClipboard = async () => {
        try {
            const sections: string[] = [];

            // BASIC INFORMATION
            sections.push('BASIC INFORMATION');
            sections.push('-----------------');
            sections.push(`${resume.first_name} ${resume.last_name}`);
            sections.push(resume.email);
            if (resume.phone_number) sections.push(resume.phone_number);
            if (resume.location) sections.push(resume.location);
            if (resume.website) sections.push(`Website: ${resume.website}`);
            if (resume.github_url) sections.push(`Github: ${resume.github_url}`);
            if (resume.linkedin_url) sections.push(`LinkedIn: ${resume.linkedin_url}`);
            sections.push('\n');

            // SKILLS
            if (resume.skills.length > 0) {
                sections.push('SKILLS');
                sections.push('------');
                resume.skills.forEach(skillGroup => {
                    sections.push(`${skillGroup.category}`);
                    sections.push(skillGroup.items.join(', '));
                });
                sections.push('\n');
            }

            // WORK EXPERIENCE
            if (resume.work_experience.length > 0) {
                sections.push('WORK EXPERIENCE');
                sections.push('---------------');
                resume.work_experience.forEach(exp => {
                    sections.push(formatWorkExperience(exp));
                    sections.push('');
                });
                sections.push('\n');
            }

            // PROJECTS
            if (resume.projects.length > 0) {
                sections.push('PROJECTS');
                sections.push('--------');
                resume.projects.forEach(project => {
                    sections.push(formatProject(project));
                    sections.push('');
                });
                sections.push('\n');
            }

            // EDUCATION
            if (resume.education.length > 0) {
                sections.push('EDUCATION');
                sections.push('---------');
                resume.education.forEach(edu => {
                    sections.push(formatEducation(edu));
                    sections.push('');
                });
            };

            const formattedText = sections.join('\n');
            await navigator.clipboard.writeText(formattedText);

            toast({
                title: "Copied to Clipboard!",
                description: "Resume content has been copied to your clipboard.",
            });
        } catch (error: unknown) {
            void error;
            toast({
                title: "Failed to Copy!",
                description: "Could not copy resume content to clipboard.",
                variant: "destructive",
            });
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full h-full">
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={handleDownloadPDF}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    <span>Download as PDF</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Copy className="w-4 h-4" />
                    <span>Copy to Clipboard</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}