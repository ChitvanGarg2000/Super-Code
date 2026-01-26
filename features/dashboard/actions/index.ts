"use server"

import { getCurrentUser as currentUser } from "@/features/auth/actions"
import { Templates } from "@/interfaces";
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache";

interface CreatePlaygroundParams {
    title: string;
    description?: string;
    template: Templates;
}

export const createPlayground = async (playgroundData: CreatePlaygroundParams) => {
    const { title, description, template } = playgroundData;
    try{
        const user = await currentUser();
        if(!user) throw new Error("Please login to create a playground");

        const playground = await db.playGround.create({
            data: {
                title,
                description,
                template,
                userId: user.id!
            }
        });

        return playground;
    } catch (error) {
        throw new Error("Failed to create playground");
    }
}

export const getAllPlaygrounds = async () => {
    try{
        const user = await currentUser();
        if(!user) throw new Error("Please login to view playgrounds");
        
        const allPlaygrounds = await db.playGround.findMany({
            where: {
                userId: user.id
            },
            include:{
                user: true,
                StarMark: {
                    where: {
                        userId: user.id
                    },
                    select: {
                        isMarked: true
                    }
                }
            }
        })

        return allPlaygrounds;
    }catch (error) {
        console.log(error);
    }
}


export const deletePlaygroundById = async (playgroundId: string) => {
    try {
        const user = await currentUser();
        if(!user) throw new Error("Please login to delete a playground");

        await db.playGround.delete({
            where: {
                id: playgroundId,
            }
        })

        revalidatePath("/dashboard");
    } catch (error) {
        console.error(error);
    }
}

export const updatePlaygroundById = async (playgroundId: string, data: { title: string, description: string, template: Templates }) => {
    try {
        const user = await currentUser();
        if(!user) throw new Error("Please login to update a playground");

        await db.playGround.update({
            where: {
                id: playgroundId,
            },
            data: data
        })
    } catch (error: unknown) {
        console.error(error);
    }
}

export const duplicatePlaygroundById = async (playgroundId: string) => {
    try {
        const user = await currentUser();
        if(!user) throw new Error("Please login to duplicate a playground");

        const playground = await db.playGround.findUnique({
            where: {
                id: playgroundId,
            }
        })

        if(!playground) throw new Error("Playground not found");

        const { title, description, template, userId } = playground;

        const duplicatedPlayground = await db.playGround.create({
            data: {
                title: `${title} - Copy`,
                description: description,
                template: template,
                userId
            }
        });

        return duplicatedPlayground;
    } catch (error) {
        console.error(error)   
    }
}