"use client";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import { initializeSwc, transpileTypeScript } from "@/lib/swc-utils";

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

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useEffect(() => {
    initializeSwc().catch((error) => {
      console.error("Failed to initialize SWC:", error);
    });
  }, []);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    setIsLoading(false);

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module "~jsd/banking" {
        export type AccountType = "checking" | "savings" | "investment";
        export interface Transaction {
          id: string;
          amount: number;
          date: Date;
          description: string;
          transactionType: "deposit" | "withdrawal" | "transfer";
          status: "pending" | "completed" | "failed";
        }
        export interface Account {
          id: string;
          accountType: AccountType;
          balance: number;
          currency: string;
          owner: string;
          transactions: Transaction[];
        }
        export class Banking {
          constructor(apiKey: string);
          createAccount(accountType: AccountType, owner: string, initialDeposit?: number): Promise<Account>;
          getAccount(accountId: string): Promise<Account>;
          deposit(accountId: string, amount: number, description?: string): Promise<Transaction>;
          withdraw(accountId: string, amount: number, description?: string): Promise<Transaction>;
          transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<Transaction>;
          getTransactionHistory(accountId: string, limit?: number): Promise<Transaction[]>;
        }
      }
      `,
      "file:///node_modules/@types/banking/index.d.ts"
    );

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      strict: true,
      strictNullChecks: true,
    });
  }, []);

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (!newValue || isOutput) return;

      setEditorValue(newValue);
      onChange?.(newValue);

      if (!isOutput) {
        const result = transpileTypeScript(newValue);
        if (result.success && result.code) {
          onTranspiled?.(result.code);
        }
      }
    },
    [isOutput, onChange, onTranspiled]
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
        onMount={handleEditorDidMount}
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
        className="rounded-md border border-zinc-800"
      />
    </div>
  );
});
