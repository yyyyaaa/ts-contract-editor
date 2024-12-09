import initSwc, { transformSync } from "@swc/wasm-web";

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeSwc() {
  if (isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await initSwc();
        isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize SWC:", error);
        throw error;
      }
    })();
  }

  return initializationPromise;
}

export function transpileTypeScript(code: string): string {
  if (!isInitialized) {
    throw new Error("SWC is not initialized yet");
  }

  try {
    const output = transformSync(code, {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: false,
        },
        target: "es2022",
      },
      module: {
        type: "es6",
      },
      minify: false,
    });

    return output.code;
  } catch (error) {
    console.error("Transpilation error:", error);
    return `// Error during transpilation:\n// ${error}`;
  }
}

// Add a check function to verify initialization status
export function isSwcInitialized(): boolean {
  return isInitialized;
}
