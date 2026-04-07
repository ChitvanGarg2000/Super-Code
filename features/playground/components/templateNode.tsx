"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FilePlus, FolderPlus, MoreHorizontal, Trash2, Edit3 } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { TemplateFolder, TemplateFile, TemplateItem } from "@/interfaces"

export interface TemplateNodeProps {
  item: TemplateItem
  level: number
  onFileSelect?: (file: TemplateFile) => void
  selectedFile?: TemplateFile
  onAddFile?: (file: TemplateFile, parentPath: string) => void
  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void
  onDeleteFile?: (file: TemplateFile, parentPath: string) => void
  onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void
  onRenameFile?: (file: TemplateFile, newFilename: string, newExtension: string, parentPath: string) => void
  onRenameFolder?: (folder: TemplateFolder, newFolderName: string, parentPath: string) => void
  parentPath?: string
}

function isFolder(item: TemplateItem): item is TemplateFolder {
  return "folderName" in item
}

export const TemplateNode = ({
  item,
  level,
  onFileSelect,
  selectedFile,
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
  parentPath = "",
}: TemplateNodeProps) => {
  if (isFolder(item)) {
    const currentPath = parentPath ? `${parentPath}/${item.folderName}` : item.folderName

    return (
      <SidebarMenuItem>
        <Collapsible
          className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
          defaultOpen={level < 1}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="font-medium">
              <ChevronRight className="transition-transform" />
              <Folder className="text-blue-400" />
              <span>{item.folderName}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={() => onAddFile?.({ filename: "", fileExtension: "", content: "" }, currentPath)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddFolder?.({ folderName: "", items: [] }, currentPath)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRenameFolder?.(item, "", currentPath)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteFolder?.(item, parentPath)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenu>
                {item.items.map((child, index) => (
                  <TemplateNode
                    key={index}
                    item={child}
                    level={level + 1}
                    onFileSelect={onFileSelect}
                    selectedFile={selectedFile}
                    onAddFile={onAddFile}
                    onAddFolder={onAddFolder}
                    onDeleteFile={onDeleteFile}
                    onDeleteFolder={onDeleteFolder}
                    onRenameFile={onRenameFile}
                    onRenameFolder={onRenameFolder}
                    parentPath={currentPath}
                  />
                ))}
              </SidebarMenu>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }

  // It's a file
  const isSelected =
    selectedFile &&
    selectedFile.filename === item.filename &&
    selectedFile.fileExtension === item.fileExtension

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={!!isSelected}
        onClick={() => onFileSelect?.(item)}
        className="font-normal"
      >
        <File className="text-muted-foreground" />
        <span>{item.filename}{item.fileExtension ? `.${item.fileExtension}` : ""}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => onRenameFile?.(item, "", "", parentPath)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDeleteFile?.(item, parentPath)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
