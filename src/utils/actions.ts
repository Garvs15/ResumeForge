"use server";

import { Profile, ResumeSummary } from "@/lib/types";
import { createClient } from "./supabase/server";

interface DashboardData {
    profile: Profile | null;
    baseResumes: ResumeSummary[];
    tailoredResumes: ResumeSummary[];
}

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("User is not authenticated!");
    }

    try {
        // Fetch the User Profile data
        let profile;
        const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        profile = data;

        // If profile data doesn't exist, create new one
        if (profileError?.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    user_id: user.id,
                    first_name: null,
                    last_name: null,
                    email: user.email,
                    phone_number: null,
                    location: null,
                    website: null,
                    linkedin_url: null,
                    github_url: null,
                    work_experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                }])
                .select()
                .single();

            if (createError) {
                console.error("Error Creating the Profile:", profileError);
                throw new Error("Error creating the user profile");
            }

            profile = newProfile;
        } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw new Error('Error fetching dashboard data');
        }

        // Fetch Resumes Data
        const { data: resumes, error: resumesError } = await supabase
            .from('resumes')
            .select('id, user_id, name, target_role, is_base_resume, job_id, created_at, updated_at')
            .eq('user_id', user.id);

        if (resumesError) {
            console.error('Error fetching resumes:', resumesError);
            throw new Error('Error fetching dashboard data');
        }

        const sanitizedResumes = resumes?.map((resume) => ({
            ...resume,
            target_role: resume.target_role || '',
        })) ?? [];

        const baseResumes = sanitizedResumes.filter((resume) => resume.is_base_resume);
        const tailoredResumes = sanitizedResumes.filter((resume) => !resume.is_base_resume);

        return {
            profile,
            baseResumes,
            tailoredResumes,
        };
    } catch (error) {
        if (error instanceof Error && error.message === "User not authenticated") {
            return {
                profile: null,
                baseResumes: [],
                tailoredResumes: [],
            };
        }
        throw error;
    }
}