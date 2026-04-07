"use client"

import * as React from "react"
import { Plus, FilePlus, FolderPlus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { TemplateFileTreeProps, TemplateFolder } from "@/interfaces"
import { TemplateNode } from "./templateNode"

export const TemplateFiletree = ({
  data,
  onFileSelect,
  selectedFile,
  title = "Files Explorer",
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
}: TemplateFileTreeProps) => {
    const isRootFolder = data != null && typeof data === "object" && "folderName" in data;
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarGroupLabel>{title}</SidebarGroupLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarGroupAction>
                                  <Plus className="w-4 h-4" color="#fff" />
                            </SidebarGroupAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {}}>
                              <FolderPlus />
                              New Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                              <FilePlus />
                              New File
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarGroupContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {isRootFolder ? (data as TemplateFolder).items.map((item, index) => (
                          <TemplateNode key={index} item={item} level={0} onFileSelect={onFileSelect} selectedFile={selectedFile} onAddFile={onAddFile} onAddFolder={onAddFolder} onDeleteFile={onDeleteFile} onDeleteFolder={onDeleteFolder} onRenameFile={onRenameFile} onRenameFolder={onRenameFolder} />
                        )) : data != null ? <TemplateNode item={data} level={0} onFileSelect={onFileSelect} selectedFile={selectedFile} onAddFile={onAddFile} onAddFolder={onAddFolder} onDeleteFile={onDeleteFile} onDeleteFolder={onDeleteFolder} onRenameFile={onRenameFile} onRenameFolder={onRenameFolder} /> : null}
                      </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}