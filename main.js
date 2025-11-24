// This is the new main entry point.
// It dynamically imports the game logic after ensuring all data modules are loaded.
async function main() {
    try {
        // Dynamically import the game logic module.
        // This ensures all its dependencies (data modules) are parsed before execution.
        const game = await import('./game.js');

        // The DOM is ready because this script is at the end of the body.
        // No need to wait for DOMContentLoaded, which can cause race conditions with modules.
        game.initUI();
        game.showCharacterCreation();
    } catch (error) {
        console.error("Failed to load the game module:", error);
        document.body.innerHTML = `<div style="color: white; padding: 20px;">
            <h1>Fatal Error</h1>
            <p>Could not load game files. Please check the console for details.</p>
            <p>Error: ${error.message}</p>
        </div>`;
    }
}

main();
