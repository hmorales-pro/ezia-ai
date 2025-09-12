export abstract class BaseAgent {
  protected name: string;
  protected role: string;
  protected capabilities: string[];

  constructor(name: string, role: string, capabilities: string[] = []) {
    this.name = name;
    this.role = role;
    this.capabilities = capabilities;
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return this.role;
  }

  getCapabilities(): string[] {
    return this.capabilities;
  }

  protected log(message: string): void {
    console.log(`[${this.name}]: ${message}`);
  }

  protected async simulateThinking(duration: number = 1000): Promise<void> {
    // Simulate agent "thinking" time
    await new Promise((resolve) => setTimeout(resolve, duration));
  }
}