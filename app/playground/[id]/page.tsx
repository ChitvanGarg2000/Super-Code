'use client'

import { useParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePlayground } from "@/features/playground/hooks/usePlayground"
import { TemplateFiletree } from "@/features/playground/components/playgroundExplorer"

export default function Page() {
    const { id } = useParams<{ id: string }>()
    const { playgroundData, templateData, saveTemplateData, isLoading, error} = usePlayground(id);
    console.log("Template Data", templateData)
  return (
    <>
        <TemplateFiletree data={templateData} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
             <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-col flex-1">
                  {playgroundData?.title || "Code Playground"}
                </div>
              </div>
          </header>
        </SidebarInset>
    </>
  )
}
