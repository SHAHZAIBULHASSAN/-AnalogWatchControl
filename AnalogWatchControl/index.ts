import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "./CSS/AnalogWatchControl.css";

export class AnalogWatchControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private hourHand!: HTMLElement;
    private minuteHand!: HTMLElement;
    private secondHand!: HTMLElement;
    private timeLabel!: HTMLElement;
    private dateLabel!: HTMLElement;
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private intervalId?: number;
    private stopwatchInterval?: number;
    private stopwatchTime = 0;
    private alarmTime: string | null = null;
    private alarmTriggered = false;

    constructor() {
        // Empty constructor
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.context = context;

        // Render HTML
        this.container.innerHTML = this.getWatchHTML();

        // Get references
        this.hourHand = this.getElement(".hour-hand");
        this.minuteHand = this.getElement(".minute-hand");
        this.secondHand = this.getElement(".second-hand");
        this.timeLabel = this.getElement(".time-label");
        this.dateLabel = this.getElement(".date-label");

        const themeSelector = this.getElement<HTMLSelectElement>(".theme-selector");
        const alarmInput = this.getElement<HTMLInputElement>(".alarm-input");
        const setAlarmBtn = this.getElement<HTMLButtonElement>(".set-alarm-btn");
        const weatherWidget = this.getElement(".weather-widget");
        const startStopwatchBtn = this.getElement<HTMLButtonElement>(".start-stopwatch-btn");
        const stopStopwatchBtn = this.getElement<HTMLButtonElement>(".stop-stopwatch-btn");
        const resetStopwatchBtn = this.getElement<HTMLButtonElement>(".reset-stopwatch-btn");
        const stopwatchDisplay = this.getElement(".stopwatch-display");

        // Initialize clock
        this.updateClock();
        this.updateDateLabel();
        this.intervalId = window.setInterval(() => this.updateClock(), 1000);

        // Theme Switching
        themeSelector.addEventListener("change", (e) => {
            const theme = (e.target as HTMLSelectElement).value;
            this.switchTheme(theme);
            this.showCustomAlert(`🎨 Theme changed to ${theme}`);
        });

        // Alarm Feature
        setAlarmBtn.addEventListener("click", () => {
            if (alarmInput.value) {
                this.alarmTime = alarmInput.value;
                this.alarmTriggered = false; // Reset alarm trigger
                this.showCustomAlert(`⏰ Alarm set for ${alarmInput.value}`);
            }
        });

        // Stopwatch Feature
        startStopwatchBtn.addEventListener("click", () => {
            this.startStopwatch(stopwatchDisplay, startStopwatchBtn, stopStopwatchBtn, resetStopwatchBtn);
            this.showCustomAlert("⏱ Stopwatch started!");
        });

        stopStopwatchBtn.addEventListener("click", () => {
            this.stopStopwatch(startStopwatchBtn, stopStopwatchBtn);
            this.showCustomAlert("⏹ Stopwatch stopped!");
        });

        resetStopwatchBtn.addEventListener("click", () => {
            this.resetStopwatch(stopwatchDisplay, resetStopwatchBtn);
            this.showCustomAlert("🔄 Stopwatch reset!");
        });

        // Weather Widget (Placeholder)
        weatherWidget.textContent = "25°C";

        // Start checking for the alarm every second
        setInterval(() => this.checkAlarm(), 1000);
    }
    startStopwatch(stopwatchDisplay: HTMLElement, startStopwatchBtn: HTMLButtonElement, stopStopwatchBtn: HTMLButtonElement, resetStopwatchBtn: HTMLButtonElement) {
        throw new Error("Method not implemented.");
    }
    stopStopwatch(startStopwatchBtn: HTMLButtonElement, stopStopwatchBtn: HTMLButtonElement) {
        throw new Error("Method not implemented.");
    }
    resetStopwatch(stopwatchDisplay: HTMLElement, resetStopwatchBtn: HTMLButtonElement) {
        throw new Error("Method not implemented.");
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;
        this.updateClock();
    }

    private checkAlarm(): void {
        if (!this.alarmTime || this.alarmTriggered) return;

        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // Format: HH:MM

        if (currentTime === this.alarmTime) {
            this.showCustomAlert("🔔 Alarm is ringing!");
            this.alarmTriggered = true; // Prevent multiple alerts
            setTimeout(() => {
                this.alarmTime = null; // Reset alarm after triggering
            }, 60000); // Clear alarm after 1 minute
        }
    }

    private updateClock(): void {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        this.hourHand.style.transform = `rotate(${(hours + minutes / 60) * 30}deg)`;
        this.minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
        this.secondHand.style.transform = `rotate(${seconds * 6}deg)`;

        this.timeLabel.textContent = now.toLocaleTimeString();
    }

    private updateDateLabel(): void {
        this.dateLabel.textContent = new Date().toDateString();
    }

    private showCustomAlert(message: string): void {
        const alertBox = this.getElement<HTMLDivElement>("#custom-alert");
        const alertMessage = this.getElement<HTMLSpanElement>("#alert-message");

        alertMessage.textContent = message;
        alertBox.classList.add("show");

        setTimeout(() => {
            alertBox.classList.remove("show");
        }, 3000);
    }

    private switchTheme(theme: string): void {
        document.body.className = theme;
    }

    private getWatchHTML(): string {
        return `
            <div class="analog-watch-container">
                <div class="analog-watch">
                    <div class="clock-face">
                        ${this.generateClockNumbers()}
                        <div class="hand hour-hand"></div>
                        <div class="hand minute-hand"></div>
                        <div class="hand second-hand"></div>
                        <div class="center-dot"></div>
                    </div>
                </div>
                <div class="time-label">--:--</div>
                <div class="date-label">--</div>
                <div class="theme-switcher">
                    <label>Theme:</label>
                    <select class="theme-selector">
                        <option value="default">Default</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
                <div class="alarm-settings">
                    <label>Set Alarm:</label>
                    <input type="time" class="alarm-input"/>
                    <button class="set-alarm-btn">Set Alarm</button>
                </div>
                <div class="weather-widget">--°C</div>
                <div class="stopwatch-timer">
                    <button class="start-stopwatch-btn">Start Stopwatch</button>
                    <button class="stop-stopwatch-btn" disabled>Stop Stopwatch</button>
                    <button class="reset-stopwatch-btn" disabled>Reset Stopwatch</button>
                    <div class="stopwatch-display">00:00:00</div>
                </div>
                <div id="custom-alert" class="custom-alert">
                    <span id="alert-message"></span>
                </div>
            </div>
        `;
    }

    private generateClockNumbers(): string {
        return Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30;
            return `
                <div class="hour-marker" style="transform: rotate(${angle}deg) translateY(-90px) rotate(-${angle}deg);">
                    ${i === 0 ? 12 : i}
                </div>
            `;
        }).join("");
    }

    private getElement<T extends HTMLElement>(selector: string): T {
        const element = this.container.querySelector(selector);
        if (!element) throw new Error(`Element not found: ${selector}`);
        return element as T;
    }
    public destroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.stopwatchInterval) {
            clearInterval(this.stopwatchInterval);
        }
    }
    
}
