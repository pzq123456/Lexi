// Theme Management
export class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = this.getSystemTheme();
        this.applyTheme();
        this.setupListeners();
    }

    getSystemTheme() {
        return this.prefersDarkScheme.matches ? 'dark' : 'light';
    }

    applyTheme() {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(this.currentTheme);
        this.themeToggle.textContent = this.currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        return this.currentTheme;
    }

    setupListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.prefersDarkScheme.addListener((e) => {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme();
        });
    }
}