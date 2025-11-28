// main.js - The real entry point

async function main() {
  try {
    // Dynamically import the game module
    const game = await import('./game.js');

    function bootstrap() {
      // Delegate all startup logic to game.js
      game.bootstrapGame();
    }

    // Wait for the DOM to be ready before running the bootstrap logic.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      bootstrap();
    }
  } catch (error) {
    console.error("Failed to load or initialize the game:", error);
    document.body.innerHTML = `<div style="color: white; padding: 20px;">
        <h1>Fatal Error</h1>
        <p>Could not load game files. Please check the console for details.</p>
        <p>Error: ${error.message}</p>
    </div>`;
  }
}

main();
