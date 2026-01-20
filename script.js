let allData = [];
let chapterQuestions = [];
let currentIdx = 0;

// טעינת הנתונים מה-CSV
window.onload = () => {
    Papa.parse("Citizenship-Studies-Game.csv", {
        download: true,
        header: true,
        complete: function(results) {
            allData = results.data.filter(row => row.שאלה); // סינון שורות ריקות
            initMenu();
        }
    });
};

function initMenu() {
    const chapters = [...new Set(allData.map(q => q.שם_הפרק))];
    const container = document.getElementById('chapter-list');
    
    chapters.forEach(name => {
        const btn = document.createElement('button');
        btn.innerText = `📖 ${name}`;
        btn.onclick = () => startQuiz(name);
        container.appendChild(btn);
    });
}

function startQuiz(chapterName) {
    chapterQuestions = allData.filter(q => q.שם_הפרק === chapterName);
    currentIdx = 0;
    
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('chapter-name').innerText = chapterName;
    
    showQuestion();
}

function showQuestion() {
    const q = chapterQuestions[currentIdx];
    document.getElementById('progress').innerText = `שאלה ${currentIdx + 1} מתוך ${chapterQuestions.length}`;
    document.getElementById('question-text').innerText = q.שאלה;
    document.getElementById('feedback-container').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // חיתוך התשובות לפי התו /
    const choices = q.תשובות.split('/').map(c => c.trim());
    
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        btn.onclick = () => handleAnswer(choice, q);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selected, q) {
    const feedback = document.getElementById('feedback-container');
    const msg = document.getElementById('feedback-message');
    const exp = document.getElementById('explanation-text');
    
    feedback.classList.remove('hidden');
    
    // נטרול לחיצות נוספות
    document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);

    if (selected === q.תשובה_נכונה) {
        msg.innerHTML = "<h3>מעולה! תשובה נכונה ✨</h3>";
        feedback.className = "success-style";
    } else {
        msg.innerHTML = `<h3>טעות... 💡</h3><p>התשובה הנכונה היא: <b>${q.תשובה_נכונה}</b></p>`;
        feedback.className = "error-style";
    }
    
    exp.innerHTML = `<hr><p><b>הסבר המושג:</b> ${q['הסבר המושג (לפי חומר הלימוד)']}</p>`;
}

document.getElementById('next-btn').onclick = () => {
    currentIdx++;
    if (currentIdx < chapterQuestions.length) {
        showQuestion();
    } else {
        alert("כל הכבוד! סיימת את הפרק.");
        location.reload(); // חזרה לתפריט
    }
};