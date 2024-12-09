"use client";
import { useState, useCallback, useEffect } from "react";
import { CodePane } from "@/components/code-pane";
import { codeExamples } from "@/data/code-examples";
import {
  initializeSwc,
  transpileTypeScript,
  isSwcInitialized,
} from "@/lib/swc-utils";

export default function Home() {
  const [activeExampleId, setActiveExampleId] = useState<number>(1);
  const [transpiledCodes, setTranspiledCodes] = useState<
    Record<number, string>
  >(() => ({
    ...Object.fromEntries(
      codeExamples.map((ex) => [ex.id, "// Initializing..."])
    ),
  }));

  // Initialize SWC and compile all examples
  useEffect(() => {
    const compileAllExamples = async () => {
      try {
        await initializeSwc();

        if (!isSwcInitialized()) {
          throw new Error("Failed to initialize SWC");
        }

        const compiledCodes = await Promise.all(
          codeExamples.map(async (example) => {
            try {
              const transpiledCode = transpileTypeScript(example.code);
              return [example.id, transpiledCode];
            } catch (error) {
              console.error(`Error compiling example ${example.id}:`, error);
              return [
                example.id,
                `// Error during transpilation:\n// ${error}`,
              ];
            }
          })
        );

        setTranspiledCodes(Object.fromEntries(compiledCodes));
      } catch (error) {
        console.error("Failed to initialize or compile:", error);
        setTranspiledCodes((prev) => ({
          ...prev,
          ...Object.fromEntries(
            codeExamples.map((ex) => [
              ex.id,
              `// Error initializing SWC:\n// ${error}`,
            ])
          ),
        }));
      }
    };

    compileAllExamples();
  }, []);

  const handleTranspiled = useCallback((code: string, exampleId: number) => {
    setTranspiledCodes((prev) => ({
      ...prev,
      [exampleId]: code,
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 bg-zinc-950">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-multiply" />
      </div>

      <div className="relative w-full min-h-screen overflow-auto p-8">
        <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto">
          <CodePane
            examples={codeExamples}
            activeExampleId={activeExampleId}
            onExampleChange={setActiveExampleId}
            onTranspiled={(code) => handleTranspiled(code, activeExampleId)}
          />

          <CodePane
            examples={codeExamples}
            activeExampleId={activeExampleId}
            onExampleChange={setActiveExampleId}
            isOutput
            value={transpiledCodes[activeExampleId]}
          />
        </div>
      </div>
    </div>
  );
}
