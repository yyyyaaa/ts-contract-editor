"use client";
import { useState, useCallback, useEffect } from "react";
import { CodePane } from "@/components/code-pane";
import { codeExamples } from "@/data/code-examples";
import {
  initializeSwc,
  transpileTypeScript,
  isSwcInitialized,
} from "@/lib/swc-utils";
// import { Simulator } from "@/lib/simulation-utils";

export default function Home() {
  const [activeExampleId, setActiveExampleId] = useState<number>(1);
  const [examples, setExamples] = useState(codeExamples);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transpiledCodes, setTranspiledCodes] = useState<
    Record<number, string>
  >(() => ({
    ...Object.fromEntries(
      codeExamples.map((ex) => [ex.id, "// Initializing..."])
    ),
  }));

  // Initialize simulator
  // const simulator = useCallback(
  //   () =>
  //     new Simulator(
  //       ({ exampleId, newCode }) => {
  //         setExamples((prev) =>
  //           prev.map((ex) =>
  //             ex.id === exampleId ? { ...ex, code: newCode } : ex
  //           )
  //         );

  //         // Trigger transpilation for the edited example
  //         const transpiledCode = transpileTypeScript(newCode);
  //         setTranspiledCodes((prev) => ({
  //           ...prev,
  //           [exampleId]: transpiledCode,
  //         }));
  //       },
  //       (tabId) => setActiveExampleId(tabId)
  //     ),
  //   []
  // );

  // const handleSimulation = useCallback(() => {
  //   if (isSimulating) return;

  //   setIsSimulating(true);
  //   const sim = simulator();
  //   sim.start();

  //   setTimeout(() => {
  //     setIsSimulating(false);
  //     // Reset examples after simulation
  //     setExamples(codeExamples);
  //   }, 10000);
  // }, [isSimulating, simulator]);

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
            const result = transpileTypeScript(example.code);
            return [
              example.id,
              result.success && result.code
                ? result.code
                : "// Waiting for valid TypeScript input...",
            ];
          })
        );

        setTranspiledCodes(Object.fromEntries(compiledCodes));
      } catch {
        // If initialization fails, set empty output for all examples
        setTranspiledCodes(
          Object.fromEntries(
            codeExamples.map((ex) => [
              ex.id,
              "// Waiting for valid TypeScript input...",
            ])
          )
        );
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
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
          {/* <button
            onClick={handleSimulation}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                isSimulating
                  ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }
            `}
          >
            {isSimulating ? "Simulating..." : "Start Simulation"}
          </button> */}

          <div className="grid grid-cols-2 gap-8">
            <CodePane
              examples={examples}
              activeExampleId={activeExampleId}
              onExampleChange={setActiveExampleId}
              onTranspiled={(code) => handleTranspiled(code, activeExampleId)}
            />

            <CodePane
              examples={examples}
              activeExampleId={activeExampleId}
              onExampleChange={setActiveExampleId}
              isOutput
              value={transpiledCodes[activeExampleId]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
