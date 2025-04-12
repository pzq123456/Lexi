import { ThemeManager } from "./src/ThemeManager.js";
import { initCanvasKitEngine, CanvasKitApp } from "./src/CanvasKitApp.js";

// Main Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme manager
    const themeManager = new ThemeManager();

    // Initialize CanvasKit application
    try {
        const { CanvasKit, robotoData } = await initCanvasKitEngine();
        const app = new CanvasKitApp(CanvasKit, robotoData);
        
        // Clean up when page unloads
        window.addEventListener('beforeunload', () => {
            app.cleanup();
        });
        
    } catch (error) {
        console.error('Failed to initialize CanvasKit:', error);
    }
});