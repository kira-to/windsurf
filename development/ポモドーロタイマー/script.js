class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.shortBreakTime = 5 * 60; // 5 minutes in seconds
        this.longBreakTime = 15 * 60; // 15 minutes in seconds
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.timer = null;
        this.sessionType = 'work';
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        this.updateDisplay();
        this.updateSessionTypeUI();
    }

    setupEventListeners() {
        document.getElementById('start').addEventListener('click', () => this.start());
        document.getElementById('stop').addEventListener('click', () => this.stop());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        
        const sessionTypeButtons = document.querySelectorAll('.session-type-btn');
        sessionTypeButtons.forEach(button => {
            button.addEventListener('click', () => this.changeSessionType(button.dataset.type));
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.timer = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateDisplay();
            } else {
                this.stop();
                this.playSound();
                this.changeSessionType();
            }
        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timer);
    }

    reset() {
        this.stop();
        this.currentTime = this.getSessionTime();
        this.updateDisplay();
    }

    changeSessionType(type) {
        if (type) {
            this.sessionType = type;
        } else {
            // Automatically switch session type
            switch (this.sessionType) {
                case 'work':
                    this.sessionType = 'short';
                    break;
                case 'short':
                    this.sessionType = 'work';
                    break;
                case 'long':
                    this.sessionType = 'work';
                    break;
            }
        }
        this.currentTime = this.getSessionTime();
        this.updateDisplay();
        this.updateSessionTypeUI();
    }

    getSessionTime() {
        switch (this.sessionType) {
            case 'work':
                return this.workTime;
            case 'short':
                return this.shortBreakTime;
            case 'long':
                return this.longBreakTime;
            default:
                return this.workTime;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateSessionTypeUI() {
        const buttons = document.querySelectorAll('.session-type-btn');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.type === this.sessionType);
        });
    }

    playSound() {
        const audio = new Audio('https://notificationsounds.com/notification-sounds/cheerful-421/download-2');
        audio.play();
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
