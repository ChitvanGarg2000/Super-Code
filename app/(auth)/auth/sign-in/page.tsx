import SignInFormClient from "@/features/auth/components/SignInFormClient"
import Image from "next/image"

const SignInPage = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center gap-8">
            <Image src={"/logo.png"} alt="app-logo" height={120} width={120} />
            <SignInFormClient />
        </div>
    )
}

export default SignInPage