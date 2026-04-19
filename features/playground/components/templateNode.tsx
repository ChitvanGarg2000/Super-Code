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
import { TemplateFile, TemplateFolder } from "../types"
import RenameFolderDialog from "./Dialog/RenameFolderDialog"
import NewFolderDialog from "./Dialog/NewFolderDialog"
import { DeleteDialog } from "./Dialog/DeleteDialog"
import RenameFileDialog from "./Dialog/RenameFileDialog"
import NewFileDialog from "./Dialog/NewFileDialog"
import { useFileExplorer } from "../hooks/useFileExplorer"

export interface TemplateNodeProps {
    item: TemplateFile | TemplateFolder,
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

function isFolder(item: TemplateFile | TemplateFolder): item is TemplateFolder {
    return item && typeof item === "object" && "folderName" in item
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
    const isValidItem = item && typeof item === "object";
    if (!isValidItem) {
        return null; // or render an error message
    }
    const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false);
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = React.useState(false);
    const [isRenameFileDialogOpen, setIsRenameFileDialogOpen] = React.useState(false);
    const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(level < 2); // Root level folders are open by default

    if (isFolder(item)) {
        const currentPath = parentPath ? `${parentPath}/${item.folderName}` : item.folderName
        const folder = item as TemplateFolder;

        const handleRenameSubmit = (newName: string) => {
            onRenameFolder?.(item, newName, parentPath);
            setIsRenameFolderDialogOpen(false);
        }

        const confirmDeleteFolder = () => {
            onDeleteFolder?.(folder, parentPath);
            setIsDeleteDialogOpen(false);
        }


        const handleCreateFile = (filename: string, extension: string) => {
            onAddFile?.(
                {
                    filename,
                    fileExtension: extension,
                    content: "",
                },
                parentPath
            );
            setIsNewFileDialogOpen(false);
        }

        const handleCreateFolder = (folderName: string) => {
            onAddFolder?.(
                {
                    folderName,
                    items: [],
                },
                currentPath
            );
            setIsNewFolderDialogOpen(false);
        }

        return (
            <SidebarMenuItem>
                <Collapsible
                    className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                    defaultOpen={level < 1}
                    open={isOpen}
                    onOpenChange={setIsOpen}
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
                            <DropdownMenuItem onClick={() => setIsNewFileDialogOpen(true)}>
                                <FilePlus className="mr-2 h-4 w-4" />
                                New File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsNewFolderDialogOpen(true)}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                New Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsRenameFolderDialogOpen(true)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
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
                <NewFileDialog
                    isOpen={isNewFileDialogOpen}
                    onClose={() => setIsNewFileDialogOpen(false)}
                    onCreateFile={handleCreateFile}
                />
                <RenameFolderDialog
                    isOpen={isRenameFolderDialogOpen}
                    onClose={() => setIsRenameFolderDialogOpen(false)}
                    onRename={handleRenameSubmit}
                    currentFolderName={item.folderName}
                />
                <NewFolderDialog
                    isOpen={isNewFolderDialogOpen}
                    onClose={() => setIsNewFolderDialogOpen(false)}
                    onCreateFolder={handleCreateFolder}
                />
                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    setIsOpen={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDeleteFolder}
                />
            </SidebarMenuItem>
        )
    }

    const confirmDelete = () => {
        onDeleteFile?.(item, parentPath);
        setIsDeleteDialogOpen(false);
    }

    const handleRenameFileSubmit = (newFilename: string, newExtension: string) => {
        onRenameFile?.(item, newFilename, newExtension, parentPath);
        setIsRenameFileDialogOpen(false);
    }


    // It's a file
    const isSelected =
        selectedFile &&
        selectedFile.filename === item.filename &&
        selectedFile.fileExtension === item.fileExtension

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isSelected}
                onClick={() => onFileSelect?.(item)}
                className="font-normal flex-1 cursor-pointer"
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
                    <DropdownMenuItem onClick={() => setIsRenameFileDialogOpen(true)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <RenameFileDialog
                isOpen={isRenameFileDialogOpen}
                onClose={() => setIsRenameFileDialogOpen(false)}
                onRename={handleRenameFileSubmit}
                currentFilename={item.filename}
                currentExtension={item.fileExtension}
            />
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                setIsOpen={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
            />
        </SidebarMenuItem>
    )
}
