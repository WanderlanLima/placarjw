const volleyball = {
    scores: { a: 0, b: 0 },
    sets: { a: 0, b: 0 },

    // Add point
    addPoint: (team) => {
        volleyball.scores[team]++;
        volleyball.updateUI();
        volleyball.checkSetWinner();
    },

    // Remove point (correction)
    remPoint: (team) => {
        if (volleyball.scores[team] > 0) {
            volleyball.scores[team]--;
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
            volleyball.updateUI();
        }
    },

    resetGame: () => {
        app.confirm("Reiniciar jogo de Vôlei?", () => {
            volleyball.scores = { a: 0, b: 0 };
            volleyball.sets = { a: 0, b: 0 };
            volleyball.updateUI();
        });
    },

    updateUI: () => {
        const teamA = document.querySelector('#v-team-a .score-btn');
        const teamB = document.querySelector('#v-team-b .score-btn');

        teamA.innerText = volleyball.scores.a;
        teamB.innerText = volleyball.scores.b;

        document.getElementById('v-sets-a').innerText = volleyball.sets.a;
        document.getElementById('v-sets-b').innerText = volleyball.sets.b;
    }
};
