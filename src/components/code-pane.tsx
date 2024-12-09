"use client";
import { Card } from "@/components/ui/card";
import { Editor } from "@/components/editor";
import { codeExamples } from "@/data/code-examples";
import { memo, useRef, useEffect } from "react";

interface CodePaneProps {
  examples: typeof codeExamples;
  activeExampleId: number;
  onTranspiled?: (code: string) => void;
  isOutput?: boolean;
  onExampleChange?: (exampleId: number) => void;
  value?: string;
}

export const CodePane = memo(function CodePane({
  examples,
  activeExampleId,
  onTranspiled,
  isOutput = false,
  onExampleChange,
  value,
}: CodePaneProps) {
  const activeExample = examples.find((ex) => ex.id === activeExampleId);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (isOutput && activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeExampleId, isOutput]);

  return (
    <Card className="p-6 backdrop-blur-sm bg-zinc-900/50 border-zinc-800/30">
      <div className="flex flex-col gap-4">
        <div className="relative border-b border-zinc-800">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-md rounded-md" />
              <span className="relative px-3 py-1.5 text-xs font-mono rounded-md bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                {isOutput ? ".js" : ".ts"}
              </span>
            </div>
          </div>

          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1 overflow-x-auto pr-24 pb-0.5 relative z-10 scroll-smooth"
          >
            {examples.map((example) => (
              <button
                key={example.id}
                ref={example.id === activeExampleId ? activeTabRef : null}
                className={`px-4 py-2 text-sm transition-colors relative min-w-[100px]
                  ${
                    activeExampleId === example.id
                      ? "text-zinc-100 bg-zinc-800/50"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                  }
                  ${
                    activeExampleId === example.id
                      ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-400"
                      : ""
                  }
                `}
                onClick={() => !isOutput && onExampleChange?.(example.id)}
                disabled={isOutput}
              >
                <span className="relative z-10 truncate">
                  Example {example.id}
                </span>
              </button>
            ))}
          </div>
        </div>
        <Editor
          language={isOutput ? "javascript" : "typescript"}
          value={isOutput ? value : activeExample?.code || ""}
          onTranspiled={onTranspiled}
          readOnly={isOutput}
          isOutput={isOutput}
        />
      </div>
    </Card>
  );
});
