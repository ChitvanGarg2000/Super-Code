'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePlayground } from "@/features/playground/hooks/usePlayground"
import { TemplateFiletree } from "@/features/playground/components/playgroundExplorer"
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer"
import { TemplateFile } from "@/features/playground/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Bot, Save, Settings2, FileText, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable"
import PlaygroundEditor from "@/features/playground/components/PlaygroundEditor"

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
    closeFile,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    setPlaygroundId,
    updateFileContent,
  } = useFileExplorer();

  useEffect(() => {
    if (id) {
      setPlaygroundId(id);
    }
  }, [id, setPlaygroundId])
  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length])
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const activeFile = openFiles.find(file => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some(file => file.hasUnsavedChanges);

  const closeAllFiles = () => {
    setOpenFiles([]);
    setActiveFileId(null);
  }

  const handleFileSelect = (file: TemplateFile) => {
    console.log("Selected file:", file);
    openFile(file);
  }
  return (
    <TooltipProvider>
      <TemplateFiletree data={templateData} onFileSelect={handleFileSelect} selectedFile={activeFile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code Playground"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {openFiles.length} files open
                {hasUnsavedChanges && " - Unsaved changes"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-md bg-transparent p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none data-[state=open]:bg-muted"
                    onClick={() => saveTemplateData(templateData)}
                    disabled={!activeFile || !activeFile.hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save (Ctrl+S)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-md p-1 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none data-[state=open]:bg-muted"
                    onClick={() => saveTemplateData(templateData)}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4" /> All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save All (Ctrl+Shift+S)</p>
                </TooltipContent>
              </Tooltip>

              {/* Tooggle AI */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none data-[state=open]:bg-muted"
                    onClick={() => saveTemplateData(templateData)}
                    disabled={!hasUnsavedChanges}
                  >
                    <Bot className="h-4 w-4" color="#000" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle AI Assistant</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={"sm"} variant="outline">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsPreviewVisible((preview) => !preview)}>
                    {isPreviewVisible ? "Hide" : "Show"} Preview
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={closeAllFiles}>
                    Close All Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-4rem)]">
          {
            openFiles.length > 0 ? (<div className="h-full flex flex-col">
              <div className="border-b bg-muted/30">
                <Tabs value={activeFileId || undefined} onValueChange={(value) => setActiveFileId(value)}>
                  <div className="flex items-center justify-between px-4 py-2">
                    <TabsList className="h-8 bg-transparent p-0">
                      {openFiles.map((file) => (
                        <TabsTrigger
                          key={file.id}
                          value={file.id}
                          className="relative h-8 data-[state=active]:border-primary/80 data-[state=active]:border-b-2 data-[state=active]:text-foreground/90 rounded-t-md text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{file.filename}.{file.fileExtension}</span>
                            {file.hasUnsavedChanges && <span className="w-1 h-1 bg-white rounded-full"></span>}
                            <span
                              role="button"
                              className="cursor-pointer inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Close ${file.filename}.${file.fileExtension}`}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                closeFile(file.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </div>
                        </TabsTrigger>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-t-md px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={closeAllFiles}
                      >
                        Close All
                      </Button>

                    </TabsList>
                  </div>
                </Tabs>
              </div>
              <div className="flex-1">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel minSize={200} defaultSize={isPreviewVisible ? 50 : 100}>
                    <PlaygroundEditor
                      activeFile={activeFile}
                      content={activeFile ? activeFile.content : ""}
                      onContentChange={(nextContent) => {
                        if (activeFileId) {
                          updateFileContent(activeFileId, nextContent);
                        }
                      }}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-4">
                <FileText className="size-16 h-8 w-8" />
                <p className="text-sm">No file opened. Please open a file to start coding.</p>
              </div>
            )}
        </div>
      </SidebarInset>
    </TooltipProvider>
  )
}
