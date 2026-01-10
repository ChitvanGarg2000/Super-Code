import { SidebarProvider } from "@/components/ui/sidebar";
import {DashboardSidebar} from "@/features/dashboard/components/DashboardSidebar";

const DashboardLayout = async ({ children }: { children: React
    .ReactNode }) => {
    return (
        <SidebarProvider>
            <DashboardSidebar initialPlaygroundData={[]} />
            <div className="flex min-h-screen w-full overflow-x-hidden">
                <main className="flex-1">{children}</main>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout;