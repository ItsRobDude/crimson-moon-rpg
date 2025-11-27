// main.js - The real entry point

async function main() {
  try {
    // Dynamically import the game module. This allows us to catch errors
    // if the module or any of its dependencies fail to load.
    const game = await import('./game.js');

    function bootstrap() {
      console.log("DOM fully loaded and parsed");
      game.initUI(); // This wires up all the buttons

      // Check for save data. If none, go to creation.
      const hasSave = localStorage.getItem('crimson_moon_save');
      if (hasSave) {
        console.log("Save data found, loading game.");
        game.loadGame(); // This should handle updating UI and going to the right scene
      } else {
        console.log("No save data, showing character creation.");
        game.showCharacterCreation();
      }

      // This is the signal for our test script.
      window.gameReady = true;
      console.log("Game is ready.");
    }

    // Wait for the DOM to be ready before running the bootstrap logic.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      // The DOM was already ready, just run it.
      bootstrap();
    }
  } catch (error) {
    console.error("Failed to load or initialize the game:", error);
    // Display an error message to the user
    document.body.innerHTML = `<div style="color: white; padding: 20px;">
        <h1>Fatal Error</h1>
        <p>Could not load game files. Please check the console for details.</p>
        <p>Error: ${error.message}</p>
    </div>`;
  }
}

main();
