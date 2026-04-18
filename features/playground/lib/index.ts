import { TemplateFile, TemplateFolder } from "../types"

export const findFilePath = (file: TemplateFile, folder: TemplateFolder, currentPath: string = ""): string | null => {
    for (const item of folder.items) {
        if ("filename" in item && item.filename === file.filename && item.fileExtension === file.fileExtension) {
            return currentPath ? `${currentPath}/${item.filename}` : item.filename;
        }
        if ("folderName" in item && item.folderName === folder.folderName) {
            const subPath = findFilePath(file, item, currentPath ? `${currentPath}/${item.folderName}` : item.folderName);
            if (subPath) {
                return subPath;
            }
        }
    }
    return null;
};


export const generateFileId = (file: TemplateFile, folder: TemplateFolder) : string => {
    const path = findFilePath(file, folder)?.replace(/^\/+/, "") || "";

    const extension = file.fileExtension?.trim();
    const extensionSuffix = extension ? `.${extension}` : "";
    return path ? `${path}/${file.filename}${extensionSuffix}` : `${file.filename}${extensionSuffix}`;
}