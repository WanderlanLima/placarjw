const app = {
    // Navigate between views
    navigateTo: (view) => {
        // If navigating to a game view, push state
        if (view !== 'menu') {
            history.pushState({ view: view }, '', `#${view}`);
            app.showView(view);
        } else {
            // If navigating to menu, just show it (popstate handles the rest or direct call)
            app.showView('menu');
        }
    },

    // Internal function to actually switch DOM elements
    showView: (view) => {
        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));

        // Show target view
        document.getElementById(`${view}-view`).classList.add('active');

        // Update header
        const titleMap = {
            'menu': 'Placar Esportivo',
            'volleyball': 'Vôlei',
            'futsal': 'Futsal'
        };
        document.getElementById('page-title').innerText = titleMap[view] || 'Placar';

        // Show/Hide back button
        document.getElementById('back-btn').style.display = view === 'menu' ? 'none' : 'block';
    },

    goBack: () => {
        // If using browser history, going back is just history.back()
        if (history.state && history.state.view) {
            history.back();
        } else {
            // Fallback if accessed directly or state is missing
            app.navigateTo('menu');
        }
    },

    editName: (el) => {
        const currentName = el.innerText.replace(" ✏️", "");
        // Use text input for names
        app.input("Nome do time:", currentName, (newName) => {
            if (newName && newName.trim() !== "") {
                el.innerText = newName + " ✏️";
            }
        }, 'text');
    },

    // Custom Modal Logic
    closeModal: () => {
        document.getElementById('custom-modal').classList.remove('active');
    },

    alert: (message) => {
        const modal = document.getElementById('custom-modal');
        const msgEl = document.getElementById('modal-msg');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.querySelector('.modal-btn.cancel');

        msgEl.innerText = message;

        // Setup for Alert (Single Button)
        cancelBtn.style.display = 'none';
        confirmBtn.innerText = "OK";

        // Remove old listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            app.closeModal();
        });

        modal.classList.add('active');
    },

    confirm: (message, onConfirm) => {
        const modal = document.getElementById('custom-modal');
        const msgEl = document.getElementById('modal-msg');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.querySelector('.modal-btn.cancel');

        msgEl.innerText = message;

        // Setup for Confirm (Two Buttons)
        cancelBtn.style.display = 'block';
        confirmBtn.innerText = "Sim";

        // Remove old listeners to prevent multiple firings
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            onConfirm();
            app.closeModal();
        });

        modal.classList.add('active');
    },

    // Custom Input Modal Logic
    closeInputModal: () => {
        document.getElementById('input-modal').classList.remove('active');
    },

    input: (message, defaultValue, onConfirm, type = 'number') => {
        const modal = document.getElementById('input-modal');
        const msgEl = document.getElementById('input-modal-msg');
        const inputEl = document.getElementById('input-modal-field');
        const confirmBtn = document.getElementById('input-modal-confirm-btn');

        // Configure input type
        if (type === 'text') {
            inputEl.type = 'text';
            inputEl.removeAttribute('inputmode');
        } else {
            inputEl.type = 'number';
            inputEl.setAttribute('inputmode', 'numeric');
        }

        msgEl.innerText = message;
        inputEl.value = "";
        inputEl.placeholder = defaultValue;

        // Cloning to remove listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            if (inputEl.value) {
                onConfirm(inputEl.value);
                app.closeInputModal();
            }
        });

        modal.classList.add('active');
        setTimeout(() => {
            inputEl.focus();
        }, 100); // Focus after animation starts
    },

    // === Helpers ===

    // Fullscreen Toggle
    toggleFullscreen: () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    },

    // Wake Lock
    wakeLock: null,
    requestWakeLock: async () => {
        if ('wakeLock' in navigator) {
            try {
                app.wakeLock = await navigator.wakeLock.request('screen');
                app.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                });
                console.log('Wake Lock active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    },

    // Haptic Feedback
    vibrate: () => {
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short tick
        }
    },

    // Sound Feedback
    beep: (type = 'success') => {
        // Simple AudioContext beep
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.value = 600; // Hz
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.2); // 200ms
        } else if (type === 'alert') {
            osc.type = 'triangle';
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    },

    // Persistence
    saveState: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadState: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};

// Handle System Back Button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view) {
        app.showView(event.state.view);
    } else {
        // If no state, assume menu (root)
        app.showView('menu');
    }
});

// App Extension for Theme
app.toggleTheme = () => {
    const body = document.body;
    const btn = document.getElementById('theme-btn');

    // Toggle Class
    body.classList.toggle('light-mode');

    // Check Status
    const isLight = body.classList.contains('light-mode');

    // Update Icon
    btn.innerText = isLight ? '☀️' : '🌙';

    // Persist
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
};

app.initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.classList.add('light-mode');
        document.getElementById('theme-btn').innerText = '☀️';
    } else {
        // Default Dark
        document.getElementById('theme-btn').innerText = '🌙';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Replace current state with menu to handle initial back properly
    history.replaceState({ view: 'menu' }, '', '#menu');
    app.showView('menu');
    app.initTheme();

    // Request Wake Lock
    app.requestWakeLock();
    // Re-request wake lock when visibility changes (if it was lost)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            app.requestWakeLock();
        }
    });

    // Check for SW updates
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload if controller changed
            // window.location.reload(); 
            // We can prompt user instead
        });
    }
});
