import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function uploadProfileImage(file: File, userId: string) {
    const supabase = createClient();

    const fileTxt = file.name.split(".").pop();
    const filePath = `${userId}/${crypto.randomUUID()}.jpeg`;

      console.log("UPLOAD PATH:", filePath);

    const { data, error } = await supabase.storage.from("profile-images")
        .upload(filePath, file, { upsert: true });

        console.log("UPLOAD RESPONSE:", data);
    console.log("UPLOAD ERROR:", error);

    if (error) throw error;

    // const { data } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}