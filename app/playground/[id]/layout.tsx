import { SidebarProvider } from "@/components/ui/sidebar"

const PlaygroundLayout = ({ children }: { children: React.ReactNode }) => {
    return <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
}

export default PlaygroundLayout