// This is the new main entry point.
// It dynamically imports the game logic.
async function main() {
    try {
        // Dynamically import the game logic module.
        // This will execute the code inside game.js, which now handles
        // its own initialization via a DOMContentLoaded listener.
        await import('./game.js');
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
