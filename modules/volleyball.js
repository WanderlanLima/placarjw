const volleyball = {
    scores: { a: 0, b: 0 },
    sets: { a: 0, b: 0 },
    history: [], // For Undo

    // Init
    init: () => {
        const saved = app.loadState('placar_volleyball');
        if (saved) {
            volleyball.scores = saved.scores;
            volleyball.sets = saved.sets;
            volleyball.updateUI();
        }
    },

    save: () => {
        app.saveState('placar_volleyball', {
            scores: volleyball.scores,
            sets: volleyball.sets
        });
    },

    pushState: () => {
        // Deep copy state for history
        volleyball.history.push(JSON.stringify({
            scores: volleyball.scores,
            sets: volleyball.sets
        }));
        // Limit history size if needed (e.g. 50 items)
        if (volleyball.history.length > 50) volleyball.history.shift();
    },

    undo: () => {
        if (volleyball.history.length > 0) {
            const prevState = JSON.parse(volleyball.history.pop());
            volleyball.scores = prevState.scores;
            volleyball.sets = prevState.sets;
            volleyball.save();
            volleyball.updateUI();
            app.vibrate();
        } else {
            app.alert("Nada para desfazer!");
        }
    },

    // Add point
    addPoint: (team) => {
        volleyball.pushState();
        volleyball.scores[team]++;
        volleyball.save();
        app.vibrate();
        volleyball.updateUI();
        volleyball.checkSetWinner();
    },

    // Remove point (correction)
    remPoint: (team) => {
        if (volleyball.scores[team] > 0) {
            volleyball.pushState();
            volleyball.scores[team]--;
            volleyball.save();
            app.vibrate();
            volleyball.updateUI();
        }
    },

    // Check if someone won the set
    checkSetWinner: () => {
        const scoreA = volleyball.scores.a;
        const scoreB = volleyball.scores.b;
        const isTieBreak = (volleyball.sets.a + volleyball.sets.b) === 4;
        const limit = isTieBreak ? 15 : 25;

        // Must reach limit AND have 2 point difference
        if ((scoreA >= limit || scoreB >= limit) && Math.abs(scoreA - scoreB) >= 2) {
            app.beep('success'); // Sound feedback
            if (scoreA > scoreB) {
                volleyball.sets.a++;
                app.alert(`Time A venceu o set! ${scoreA} x ${scoreB}`);
            } else {
                volleyball.sets.b++;
                app.alert(`Time B venceu o set! ${scoreB} x ${scoreA}`);
            }
            // Reset points for next set
            volleyball.scores.a = 0;
            volleyball.scores.b = 0;
            volleyball.save();
            volleyball.updateUI();
        }
    },

    resetGame: () => {
        app.confirm("Reiniciar jogo de Vôlei?", () => {
            volleyball.pushState();
            volleyball.scores = { a: 0, b: 0 };
            volleyball.sets = { a: 0, b: 0 };
            volleyball.save();
            volleyball.updateUI();
        });
    },

    updateUI: () => {
        const teamA = document.querySelector('#v-team-a .score-btn');
        const teamB = document.querySelector('#v-team-b .score-btn');

        if (teamA) teamA.innerText = volleyball.scores.a;
        if (teamB) teamB.innerText = volleyball.scores.b;

        const setA = document.getElementById('v-sets-a');
        const setB = document.getElementById('v-sets-b');
        if (setA) setA.innerText = volleyball.sets.a;
        if (setB) setB.innerText = volleyball.sets.b;
    }
};

// Auto init
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts loaded if needed, 
    // but usually direct call is fine if script order is correct.
    setTimeout(volleyball.init, 100);
});
