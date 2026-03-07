import { TemplateFolder } from "./lib/path-to-json";

export interface PlayGroundData {
  id: string;
  name?: string;
  [key: string]:any
}

export interface UsePlaygroundReturn {
  playgroundData: PlayGroundData | null;
  templateDate: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
  setTemplateData: (data: TemplateFolder) => Promise<void>;
}