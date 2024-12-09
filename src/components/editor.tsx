"use client";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { initializeSwc, transpileTypeScript } from "@/lib/swc-utils";
import { useDebouncedCallback } from "use-debounce";

interface EditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  onTranspiled?: (code: string) => void;
  isOutput?: boolean;
}

export const Editor = memo(function Editor({
  value = "",
  onChange,
  language = "typescript",
  readOnly = false,
  className,
  onTranspiled,
  isOutput = false,
}: EditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [editorValue, setEditorValue] = useState(value);
  const [isSwcInitialized, setIsSwcInitialized] = useState(false);

  // Only update editor value when switching tabs
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Initialize SWC only once
  useEffect(() => {
    initializeSwc().catch(console.error);
  }, []);

  // Debounce the transpilation to avoid unnecessary compilations
  const debouncedTranspile = useDebouncedCallback(
    (code: string) => {
      if (!isOutput && isSwcInitialized) {
        try {
          const transpiledCode = transpileTypeScript(code);
          onTranspiled?.(transpiledCode);
        } catch (error) {
          console.error("Transpilation error:", error);
          onTranspiled?.(`// Error during transpilation:\n// ${error}`);
        }
      }
    },
    300 // 300ms debounce delay
  );

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (!newValue || isOutput) return;

      setEditorValue(newValue);
      onChange?.(newValue);
      debouncedTranspile(newValue);
    },
    [isOutput, onChange, debouncedTranspile]
  );

  return (
    <div className={cn("relative h-[calc(100vh-12rem)] w-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      )}
      <MonacoEditor
        height="100%"
        width="100%"
        defaultLanguage={language}
        theme="vs-dark"
        value={editorValue}
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          cursorStyle: "line",
          automaticLayout: true,
          wordWrap: "on",
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        onMount={() => setIsLoading(false)}
        className="rounded-md border border-zinc-800"
      />
    </div>
  );
});
