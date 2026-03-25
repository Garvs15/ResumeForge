"use client";

import { Loader2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface ProfileEditorHeaderProps {
    isSubmitting: boolean;
    isResetting: boolean;
    onSave: () => void;
    onReset: () => void;
}

export function ProfileEditorHeader({
    isSubmitting,
    isResetting,
    onSave,
    onReset,
}: ProfileEditorHeaderProps) {
    return (
        <div className="z-50 mt-4">
            <div className="max-w-[200px] mx-auto">
                <div className="mx-6 mb-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-4 flex items-center justify-between gap-4">

                        {/* Left Label */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Profile Editor
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Reset */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm"
                                        variant="outline"
                                        disabled={isResetting}
                                        className="bg-white/50 hover:bg-white/60 border-rose-500/20 text-rose-600"
                                    >
                                        {isResetting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Reset
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reset Profile</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will clear your entire profile. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isResetting}>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction onClick={onReset}
                                            disabled={isResetting}
                                            className="bg-destructive text-destructive-foreground"
                                        >
                                            Reset Profile
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Save */}
                            <Button onClick={onSave}
                                disabled={isSubmitting}
                                size="sm"
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}