import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useCallback } from 'react';
import { TemplateFolder } from '@/features/playground/lib/path-to-json';
import { UseWebContainerReturn } from '../interfaces';

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
        let instanceMounted = false;
        const initializeWebContainer = async () => {
            try {
                const instance = await WebContainer.boot();
                instance.on('server-ready', (_port, url) => setServerUrl(url));
                setInstance(instance);
                setIsLoading(false);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                setError(errorMessage);
                setIsLoading(false);
            }
        }

        if (!instanceMounted) {
            initializeWebContainer();
            instanceMounted = true;
        }

        return () => {
            instance?.teardown();
            instanceMounted = false;
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
        if (instance) {
            instance.teardown();
            setInstance(null);
            setServerUrl(null);
        }
    }, [instance]);


    return {
        instance,
        isLoading,
        error,
        serverUrl,
        writeFileSync,
        destroy
    };
}