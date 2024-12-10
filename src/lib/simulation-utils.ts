import { codeExamples } from "@/data/code-examples";

// Valid TypeScript code snippets that can be inserted
const validTsSnippets = [
  `interface User {
  id: string;
  name: string;
  age: number;
}`,
  `function processData<T>(data: T[]): T[] {
  return data.filter(Boolean);
}`,
  `type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};`,
  `const handler = async (event: Event): Promise<void> => {
  console.log(event);
};`,
];

// Helper to get a random item from an array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper to get a random position in code
function getRandomPosition(code: string): number {
  const lines = code.split("\n");
  const targetLine = Math.floor(Math.random() * lines.length);
  return lines.slice(0, targetLine).join("\n").length;
}

export interface SimulationEdit {
  exampleId: number;
  newCode: string;
}

export class Simulator {
  private isRunning: boolean = false;
  private timeoutIds: NodeJS.Timeout[] = [];

  constructor(
    private onEdit: (edit: SimulationEdit) => void,
    private onTabChange: (tabId: number) => void
  ) {}

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const scheduleEdit = () => {
      const delay = Math.random() * 1000 + 500; // Random delay between 500-1500ms
      const timeoutId = setTimeout(() => {
        if (!this.isRunning) return;

        // 30% chance to switch tabs, 70% chance to edit
        if (Math.random() < 0.3) {
          const randomTabId = getRandomItem(codeExamples).id;
          this.onTabChange(randomTabId);
        } else {
          const example = getRandomItem(codeExamples);
          const snippet = getRandomItem(validTsSnippets);
          const position = getRandomPosition(example.code);

          const newCode =
            example.code.slice(0, position) +
            "\n\n" +
            snippet +
            "\n" +
            example.code.slice(position);

          this.onEdit({
            exampleId: example.id,
            newCode,
          });
        }

        scheduleEdit();
      }, delay);

      this.timeoutIds.push(timeoutId);
    };

    scheduleEdit();

    // Stop after 10 seconds
    const stopTimeoutId = setTimeout(() => {
      this.stop();
    }, 10000);

    this.timeoutIds.push(stopTimeoutId);
  }

  stop() {
    this.isRunning = false;
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
  }
}
