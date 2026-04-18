'use client'

import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePlayground } from "@/features/playground/hooks/usePlayground"
import { TemplateFiletree } from "@/features/playground/components/playgroundExplorer"
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer"
import { TemplateFile, TemplateFolder } from "@/features/playground/types"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const { playgroundData, templateData, saveTemplateData, isLoading, error } = usePlayground(id);
  const { setTemplateData,
    openFiles,
    activeFileId,
    editorContent,
    setEditorContent,
    setOpenFiles,
    setActiveFileId,
    openFile,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    setPlaygroundId,
    updateFileContent,
  } = useFileExplorer();
  // const wrappedHandleAddFile = useCallback(
  //   (newFile: TemplateFile, parentPath: string) => {
  //     return handleAddFile(
  //       newFile,
  //       parentPath,
  //       writeFileSync!,
  //       instance,
  //       saveTemplateData
  //     );
  //   },
  //   [handleAddFile, writeFileSync, instance, saveTemplateData]
  // );

  // const wrappedHandleAddFolder = useCallback(
  //   (newFolder: TemplateFolder, parentPath: string) => {
  //     return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
  //   },
  //   [handleAddFolder, instance, saveTemplateData]
  // );

  // const wrappedHandleDeleteFile = useCallback(
  //   (file: TemplateFile, parentPath: string) => {
  //     return handleDeleteFile(file, parentPath, saveTemplateData);
  //   },
  //   [handleDeleteFile, saveTemplateData]
  // );

  // const wrappedHandleDeleteFolder = useCallback(
  //   (folder: TemplateFolder, parentPath: string) => {
  //     return handleDeleteFolder(folder, parentPath, saveTemplateData);
  //   },
  //   [handleDeleteFolder, saveTemplateData]
  // );

  // const wrappedHandleRenameFile = useCallback(
  //   (
  //     file: TemplateFile,
  //     newFilename: string,
  //     newExtension: string,
  //     parentPath: string
  //   ) => {
  //     return handleRenameFile(
  //       file,
  //       newFilename,
  //       newExtension,
  //       parentPath,
  //       saveTemplateData
  //     );
  //   },
  //   [handleRenameFile, saveTemplateData]
  // );

  // const wrappedHandleRenameFolder = useCallback(
  //   (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
  //     return handleRenameFolder(
  //       folder,
  //       newFolderName,
  //       parentPath,
  //       saveTemplateData
  //     );
  //   },
  //   [handleRenameFolder, saveTemplateData]
  // );

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
