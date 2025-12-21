'use client'
import { Button } from "@/components/ui/button"
import { handleGithubSignIn, handleGoogleSignIn } from "@/features/auth/actions"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Chrome, Github } from "lucide-react"

const SignInFormClient = () => {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center font-bold">Welcome back</CardTitle>
            </CardHeader>
            <CardDescription className="text-center mb-4 px-4">
                Choose your preferred sign-in method
            </CardDescription>
            <CardContent className="grid gap-4">
                <form action={handleGoogleSignIn}>
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 mb-3 cursor-pointer">
                    <Chrome className="h-4 w-4" />
                    Sign in with Google
                </Button>
                </form>
                <form action={handleGithubSignIn}>
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 cursor-pointer">
                    <Github className="h-4 w-4" />
                    Sign in with Github
                </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default SignInFormClient