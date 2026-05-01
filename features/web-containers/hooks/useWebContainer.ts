import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useCallback } from 'react';
import { TemplateFolder } from '@/features/playground/lib/path-to-json';
import { UseWebContainerReturn } from '../interfaces';

let sharedInstance: WebContainer | null = null;
let sharedBootPromise: Promise<WebContainer> | null = null;

const getOrBootWebContainer = async (): Promise<WebContainer> => {
    if (sharedInstance) {
        return sharedInstance;
    }

    if (!sharedBootPromise) {
        sharedBootPromise = WebContainer.boot()
            .then((instance) => {
                sharedInstance = instance;
                return instance;
            })
            .catch((error) => {
                sharedBootPromise = null;
                throw error;
            });
    }

    return sharedBootPromise;
};

interface UseWebContainerProps {
    templateData: TemplateFolder
}

interface UseWebContainerReturnValues extends UseWebContainerReturn {
    instance: WebContainer | null;
}

export const useWebContainer = ({ templateData }: UseWebContainerProps): UseWebContainerReturnValues => {
    const [instance, setInstance] = useState<WebContainer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [serverUrl, setServerUrl] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
            setError('WebContainer requires cross-origin isolation. Make sure COOP and COEP headers are enabled and reload the page.');
            setIsLoading(false);
            return;
        }

        let isDisposed = false;
        const initializeWebContainer = async () => {
            try {
                const instance = await getOrBootWebContainer();
                if (isDisposed) {
                    return;
                }
                instance.on('server-ready', (_port, url) => setServerUrl(url));
                setInstance(instance);
                setIsLoading(false);
            } catch (error) {
                if (isDisposed) {
                    return;
                }
                const errorMessage = error instanceof Error ? error.message : String(error);
                setError(errorMessage);
                setIsLoading(false);
            }
        }

        initializeWebContainer();

        return () => {
            isDisposed = true;
        }
    }, []);

    const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
        if (!instance) {
            throw new Error('WebContainer instance is not initialized');
        }
        try {
            const pathElements = path.split('/').filter(Boolean);
            const folderPath = pathElements.slice(0, -1).join('/');
            if (folderPath) {
                await instance.fs.mkdir(folderPath, { recursive: true });
            }

            await instance.fs.writeFile(path, content);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setError(errorMessage);
            throw new Error('Failed to write file sync', { cause: error });
        }
    }, [instance]);

    const destroy = useCallback(() => {
        if (sharedInstance) {
            sharedInstance.teardown();
        }
        sharedInstance = null;
        sharedBootPromise = null;
        setInstance(null);
        setServerUrl(null);
        setError(null);
        setIsLoading(false);
    }, []);


    return {
        instance,
        isLoading,
        error,
        serverUrl,
        writeFileSync,
        destroy
    };
}