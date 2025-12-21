import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
const LogoutButton = ({children}: {children: React.ReactNode}) => {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.refresh();
    }

    return (
        <button onClick={handleLogout} className="cursor-pointer">
            {children}
        </button>
    )
}

export default LogoutButton