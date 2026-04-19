import { useRef, useEffect, useCallback, useMemo } from 'react'
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import { configureMonaco, getEditorLanguage, defaultEditorOptions } from '../lib/editor-config';
import { TemplateFile } from '../types'

interface PlaygroundEditorProps {
    activeFile: TemplateFile | undefined;
    content: string;
    onContentChange: (content: string) => void;
}

const PlaygroundEditor = ({ activeFile, content, onContentChange }: PlaygroundEditorProps) => {
  const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const activeFilePath = useMemo(() => {
        if (!activeFile) return "untitled.txt";
        return activeFile.fileExtension
            ? `${activeFile.filename}.${activeFile.fileExtension}`
            : activeFile.filename;
    }, [activeFile]);

    const editorLanguage = useMemo(() => {
        if (!activeFile) return "plaintext";
        return getEditorLanguage(activeFilePath);
    }, [activeFile, activeFilePath]);

  const handleEditorDidMount = useCallback<OnMount>((editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        configureMonaco(monaco);

    }, []);

    const updateEditorContent = () => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const model = editor.getModel();
            if(!model) return;

            const language = editorLanguage;

            try {
                monacoRef.current?.editor.setModelLanguage(model, language);
            } catch (error) {
                console.error('Error setting editor language:', error);
            }
        }
    }

    useEffect(() => {
        updateEditorContent();
    }, [activeFile, editorLanguage]);

  return (
    <div className='h-full relative'>
        <Editor height="100%" value={content} onChange={onContentChange} onMount={handleEditorDidMount} language={editorLanguage} path={activeFilePath}
        // @ts-ignore
        options={defaultEditorOptions}/>
    </div>
  )
}

export default PlaygroundEditor