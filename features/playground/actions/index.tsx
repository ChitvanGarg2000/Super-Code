'use server'

import { db } from "@/lib/db";
import { getCurrentUser as currentUser } from "@/features/auth/actions"
import { TemplateFolder } from "../lib/path-to-json";
import { revalidatePath } from "next/cache";

export const getPlaygroundById = async (id: string) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");
        const playground = await db.playGround.findUnique({
            where: { id },
            select: {
                title: true,
                description: true,
                templateFiles: {
                    select: { content: true }
                }
            }
        });

        return playground;
    } catch (error) {
        console.log("Error fetching playground:", error);
    }
}


export const saveUpdatedCode = async (playgroundId: string, playgroundData: TemplateFolder) => {

    const user = await currentUser();

    if(!user) throw new Error("User not found");

    try {
        const playground = await db.templateFile.upsert({
            where: {
                playgroundId: playgroundId
            }, 
            update: {
                content: JSON.stringify(playgroundData)
            },
            create: {
                playgroundId,
                content: JSON.stringify(playgroundData)
            }
        })
    } catch (error) {
        console.log(error)
    }
}