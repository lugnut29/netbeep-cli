const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL = 80;

export function createSpinner(message: string) {
  let i = 0;
  const timer = setInterval(() => {
    const frame = FRAMES[i % FRAMES.length];
    process.stdout.write(`\r\x1b[K${frame} ${message}`);
    i++;
  }, INTERVAL);

  return {
    stop() {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[K`);
    },
  };
}
