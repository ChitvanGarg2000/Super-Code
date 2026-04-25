export interface UseWebContainerReturn {
    isLoading: boolean;
    error: string | null;
    serverUrl?: string | null;
    writeFileSync?: (path: string, content: string) => Promise<void>;
    destroy: () => void;
}