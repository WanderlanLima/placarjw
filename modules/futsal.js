const futsal = {
    scores: { a: 0, b: 0 },
    fouls: { a: 0, b: 0 },
    timer: 10 * 60, // Default 10 minutes
    timerInterval: null,
    isPaused: true,

    // Set custom time
    setTime: () => {
        if (!futsal.isPaused) return app.alert("Pause o cronômetro para alterar o tempo.");

        app.input("Tempo em minutos:", "10", (val) => {
            const minutes = parseInt(val);
            if (!isNaN(minutes) && minutes > 0) {
                futsal.timer = minutes * 60;
                futsal.updateUI();
            } else {
                app.alert("Tempo inválido!");
            }
        }, 'number');
    },

    // Score
    addGoal: (team) => {
        futsal.scores[team]++;
        futsal.updateUI();
    },
    remGoal: (team) => {
        if (futsal.scores[team] > 0) {
            futsal.scores[team]--;
            futsal.updateUI();
        }
    },

    // Fouls
    addFoul: (team) => {
        futsal.fouls[team]++;
        if (futsal.fouls[team] >= 6) {
            // Visual alert for 6th foul (shootout)
            app.alert("6ª Falta! Tiro Livre Direto.");
        }
        futsal.updateUI();
    },

    // Timer
    toggleTimer: () => {
        const timerBtn = document.getElementById('f-timer');
        if (futsal.isPaused) {
            futsal.isPaused = false;
            timerBtn.classList.remove('paused');
            futsal.timerInterval = setInterval(() => {
                if (futsal.timer > 0) {
                    futsal.timer--;
                    futsal.updateUI();
                } else {
                    futsal.toggleTimer();
                    app.alert("Fim do Tempo!");
                }
            }, 1000);
        } else {
            futsal.isPaused = true;
            timerBtn.classList.add('paused');
            clearInterval(futsal.timerInterval);
        }
    },

    resetGame: () => {
        app.confirm("Reiniciar jogo de Futsal?", () => {
            futsal.scores = { a: 0, b: 0 };
            futsal.fouls = { a: 0, b: 0 };
            // Reset to default 10 min
            futsal.timer = 10 * 60;
            futsal.isPaused = true;
            clearInterval(futsal.timerInterval);
            document.getElementById('f-timer').classList.add('paused');
            futsal.updateUI();
        });
    },

    formatTime: (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateUI: () => {
        // Find buttons by their parent containers roughly
        const view = document.getElementById('futsal-view');
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
