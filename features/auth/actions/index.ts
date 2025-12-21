"use server"

import { db } from "@/lib/db";
import { auth, signIn } from "@/auth";

export const getUserById = async (id: string) => {
    try{
        const user = db.user.findUnique({
            where: { id},
            include: {accounts: true}
        });
        return user;
    }catch(error){
        console.error("Error fetching user by ID:", error);
    }
}

export const getAccountByUserId = async (userId: string) => {
    try {
        const account = await db.account.findFirst({
            where: { userId }
        })
        return account;
    } catch (error) {
        console.error("Error fetching account by user ID:", error);
    }
};

export const getCurrentUser = async () => {
    try {
        const session = await auth();
        return session?.user || null;    
    } catch (error) {
        console.error("Error fetching current user:", error);
    }
}

export const handleGoogleSignIn = async () => await signIn("google")
export const handleGithubSignIn = async () => await signIn("github")