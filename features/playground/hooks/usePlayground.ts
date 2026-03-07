import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PlayGroundData } from "../interfaces";
import { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, saveUpdatedCode } from "../actions";


export const usePlayground = (playgroundId: string) => {
    const [playgroundData, setPlaygroundData] = useState<PlayGroundData | null>(null);
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadPlayground = useCallback(async () => {
        if(!playgroundId) return;
        try {
            setIsLoading(true);
            setError(null);
            const playgroundData = await getPlaygroundById(playgroundId);
            console.log("Playground Data", playgroundData)
            // @ts-ignore
            setPlaygroundData(playgroundData || null);

            const rawData = playgroundData?.templateFiles?.[0]?.content;

            if(typeof rawData === 'string'){
                const parsedData: TemplateFolder = JSON.parse(rawData);
                setTemplateData(parsedData);
                toast.success("Playground loaded successfully");
                return;
            }

            const res = await fetch(`/api/template/${playgroundId}`);
            if(!res.ok) throw new Error("Failed to fetch playground template data");

            const templateRes = await res.json();
            if(templateRes.templateJson && Array.isArray(templateRes.templateJson.items)){
                setTemplateData({
                    folderName: "Root",
                    items: templateRes.templateJson.items
                })
            }else{
                setTemplateData({
                    folderName: "Root",
                    items: []
                })
            }

        } catch (error) {
            console.log("Error loading templates", error)
            setError("Failed to load template")
            toast.error("Failed to load template")
        }finally{
            setIsLoading(false)
        }
    }, [playgroundId]);

    const saveTemplateData = useCallback(async (data: TemplateFolder) => {
        try {
            await saveUpdatedCode(playgroundId, data);
            setTemplateData(data);
            toast.success("Template saved successfully");
        } catch (error) {
            console.log("Error in saving")
        }
    }, [])

    useEffect(() => {
        loadPlayground();
    }, [loadPlayground]);

    return {
        templateData,
        playgroundData,
        loadPlayground,
        saveTemplateData,
        isLoading,
        error
    }

}