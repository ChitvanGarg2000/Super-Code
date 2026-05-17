export const dynamic = "force-dynamic";

import { SidebarProvider } from "@/components/ui/sidebar";
import {DashboardSidebar} from "@/features/dashboard/components/DashboardSidebar";
import { getAllPlaygrounds } from "@/features/dashboard/actions";
import { PlayGround } from "@/interfaces";

const DashboardLayout = async ({ children }: { children: React
    .ReactNode }) => {
    const playgrounds: PlayGround[] | null = await getAllPlaygrounds() || null;

    const techMaps: Record<string, string> = {
        REACT: "Zap",
        NEXTJS: "Lightbulb",
        EXPRESS: "Database",
        VUE: "Compass",
        HONO: "FlameIcon",
        ANGULAR: "Terminal",
    }

    const structuredPlaygrounds = playgrounds?.map((playground: any) => ({
        id: playground.id,
        name: playground.title,
        icon: techMaps[playground.template] || "Code2",
        starred: playground.StarMark.length > 0 ? playground.StarMark[0].isMarked : false,
    }))
    return (
        <SidebarProvider>
            <DashboardSidebar initialPlaygroundData={structuredPlaygrounds || []} />
            <div className="flex min-h-screen w-full overflow-x-hidden">
                <main className="flex-1">{children}</main>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout;