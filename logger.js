export function logToMain(msg, type) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = msg;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[Main Log - ${type}] ${msg}`);
}

export function logToBattle(msg, type) {
    const logContent = document.getElementById('battle-log-content');
    const entry = document.createElement('p');
    const typeToColor = {
        'combat': 'text-red-400',
        'gain': 'text-green-400',
        'system': 'text-primary',
        'default': 'text-[#cbc190]'
    };
    msg = msg.replace(/(\w+'s turn)/g, '<span class="font-bold text-primary">$1</span>');
    entry.innerHTML = `<span class="${typeToColor[type] || typeToColor['default']}">${msg}</span>`;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    console.log(`[Battle Log - ${type}] ${msg}`);
}

let eventTextTimeoutRef;
export function showBattleEventText(message, duration = 1500) {
    const eventTextElement = document.getElementById('battle-event-text');
    if (!eventTextElement) return;

    clearTimeout(eventTextTimeoutRef);

    eventTextElement.innerText = message;
    eventTextElement.classList.add('visible');

    eventTextTimeoutRef = setTimeout(() => {
        eventTextElement.classList.remove('visible');
    }, duration);
}

// Default logger
export let logMessage = logToMain;

export function setLogger(loggerFunc) {
    logMessage = loggerFunc;
    // Expose to window for legacy/inline calls if needed, but modules should use import
    window.logMessage = loggerFunc;
}
