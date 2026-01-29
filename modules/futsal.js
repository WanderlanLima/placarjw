const futsal = {
    scores: { a: 0, b: 0 },
    fouls: { a: 0, b: 0 },
    timer: 10 * 60, // Remaining seconds
    lastTick: null, // For drift correction
    timerInterval: null,
    isPaused: true,
    history: [], // For Undo

    // Init
    init: () => {
        const saved = app.loadState('placar_futsal');
        if (saved) {
            futsal.scores = saved.scores;
            futsal.fouls = saved.fouls;
            futsal.timer = saved.timer;
            // Always start paused when restoring to prevent confusion
            futsal.isPaused = true;
            futsal.updateUI();
        }
    },

    save: () => {
        app.saveState('placar_futsal', {
            scores: futsal.scores,
            fouls: futsal.fouls,
            timer: futsal.timer
        });
    },

    pushState: () => {
        futsal.history.push(JSON.stringify({
            scores: futsal.scores,
            fouls: futsal.fouls
            // We don't undo timer changes usually, just score/fouls
        }));
        if (futsal.history.length > 50) futsal.history.shift();
    },

    undo: () => {
        if (futsal.history.length > 0) {
            const prevState = JSON.parse(futsal.history.pop());
            futsal.scores = prevState.scores;
            futsal.fouls = prevState.fouls;
            futsal.save();
            futsal.updateUI();
            app.vibrate();
        } else {
            app.alert("Nada para desfazer!");
        }
    },

    // Set custom time
    setTime: () => {
        if (!futsal.isPaused) return app.alert("Pause o cronômetro para alterar o tempo.");

        app.input("Tempo em minutos:", "10", (val) => {
            const minutes = parseInt(val);
            if (!isNaN(minutes) && minutes > 0) {
                futsal.timer = minutes * 60;
                futsal.save();
                futsal.updateUI();
            } else {
                app.alert("Tempo inválido!");
            }
        }, 'number');
    },

    // Score
    addGoal: (team) => {
        futsal.pushState();
        futsal.scores[team]++;
        futsal.save();
        app.vibrate();
        futsal.updateUI();
    },
    remGoal: (team) => {
        if (futsal.scores[team] > 0) {
            futsal.pushState();
            futsal.scores[team]--;
            futsal.save();
            app.vibrate();
            futsal.updateUI();
        }
    },

    // Fouls
    addFoul: (team) => {
        futsal.pushState();
        futsal.fouls[team]++;
        if (futsal.fouls[team] >= 6) {
            app.alert("6ª Falta! Tiro Livre Direto.");
            app.beep('alert');
        }
        futsal.save();
        app.vibrate();
        futsal.updateUI();
    },

    // Timer Logic (Driftless)
    toggleTimer: () => {
        const timerBtn = document.getElementById('f-timer');
        if (futsal.isPaused) {
            futsal.isPaused = false;
            futsal.lastTick = Date.now();
            timerBtn.classList.remove('paused');

            futsal.timerInterval = setInterval(() => {
                const now = Date.now();
                const delta = now - futsal.lastTick;

                if (delta >= 1000) {
                    // Reduce timer by rounded seconds passed
                    const secondsPassed = Math.floor(delta / 1000);
                    futsal.timer -= secondsPassed;
                    // Adjust lastTick by the exact amount consumed
                    futsal.lastTick += secondsPassed * 1000;

                    if (futsal.timer <= 0) {
                        futsal.timer = 0;
                        futsal.toggleTimer(); // Pause
                        futsal.updateUI();
                        app.beep('success'); // Whistle/Beep
                        app.alert("Fim do Tempo!");
                    } else {
                        // Persist timer state occasionally or on pause?
                        // Saving on every second might be too much I/O, 
                        // but good for safety. localStorage is sync though.
                        // Let's safe every 5s or just on pause. 
                        // For robustness against crash, maybe every tick is fine for lightweight app.
                        // We'll save only on Pause for performance, or use page visibility to save.
                    }
                    futsal.updateUI();
                }
            }, 100); // Check every 100ms for responsiveness
        } else {
            futsal.isPaused = true;
            timerBtn.classList.add('paused');
            clearInterval(futsal.timerInterval);
            futsal.save(); // Save state on pause
        }
    },

    resetGame: () => {
        app.confirm("Reiniciar jogo de Futsal?", () => {
            futsal.pushState();
            futsal.scores = { a: 0, b: 0 };
            futsal.fouls = { a: 0, b: 0 };
            // Reset to default 10 min
            futsal.timer = 10 * 60;
            futsal.isPaused = true;
            clearInterval(futsal.timerInterval);
            document.getElementById('f-timer').classList.add('paused');
            futsal.save();
            futsal.updateUI();
        });
    },

    formatTime: (seconds) => {
        if (seconds < 0) seconds = 0;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateUI: () => {
        // Find buttons by their parent containers roughly
        const view = document.getElementById('futsal-view');
        if (!view) return; // Guard clause

        const scoreBtns = view.querySelectorAll('.score-btn');
        // Update scores
        if (scoreBtns[0]) scoreBtns[0].innerText = futsal.scores.a;
        if (scoreBtns[1]) scoreBtns[1].innerText = futsal.scores.b;

        // Update fouls
        const foulA = document.getElementById('f-fouls-a');
        const foulB = document.getElementById('f-fouls-b');
        if (foulA) foulA.innerText = futsal.fouls.a;
        if (foulB) foulB.innerText = futsal.fouls.b;

        // Update timer
        const timerEl = document.getElementById('f-timer');
        if (timerEl) timerEl.innerText = futsal.formatTime(futsal.timer);
    }
};

// Auto init
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts loaded if needed
    setTimeout(futsal.init, 100);

    // Save timer on visibility change to avoid loss on sudden close
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            futsal.save();
        }
    });
});
