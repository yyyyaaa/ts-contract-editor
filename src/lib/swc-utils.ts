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
      } catch (error: any) {
        throw new Error("Failed to initialize SWC", error);
      }
    })();
  }

  return initializationPromise;
}

export interface TranspileResult {
  success: boolean;
  code?: string;
  error?: string;
}

export function transpileTypeScript(code: string): TranspileResult {
  if (!isInitialized) {
    return {
      success: false,
      error: "SWC is not initialized yet",
    };
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

    return {
      success: true,
      code: output.code,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export function isSwcInitialized(): boolean {
  return isInitialized;
}
