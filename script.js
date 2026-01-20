let allData = [];
let chapterQuestions = [];
let currentIdx = 0;

// פונקציה לניקוי טקסט מוחלט מכל תו נסתר
function superClean(str) {
    if (!str) return "";
    return str.toString()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // ניקוי תווי BOM ורווחים נסתרים
        .trim()
        .replace(/\s+/g, " "); // צמצום רווחים כפולים
}

window.onload = () => {
    Papa.parse("Citizenship-Studies-Game.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            allData = results.data;
            initMenu();
        }
    });
};

function initMenu() {
    // מציאת עמודת הפרק - מחפש כותרת שמכילה את המילה "פרק"
    const chapterKey = Object.keys(allData[0]).find(k => k.includes("פרק"));
    const chapters = [...new Set(allData.map(q => q[chapterKey]))].filter(Boolean);
    
    const container = document.getElementById('chapter-list');
    container.innerHTML = '';
    
    chapters.forEach(name => {
        const btn = document.createElement('button');
        btn.innerText = `📖 ${name}`;
        btn.onclick = () => startQuiz(name, chapterKey);
        container.appendChild(btn);
    });
}

function startQuiz(chapterName, chapterKey) {
    chapterQuestions = allData.filter(q => q[chapterKey] === chapterName);
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
    document.getElementById('question-text').innerText = q["שאלה"];
    document.getElementById('feedback-container').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // שליפת תשובות וניקוין
    const choices = q["תשובות"].split('/').map(c => superClean(c));
    
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        btn.onclick = () => handleAnswer(choice, q);
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById('next-btn').classList.add('hidden');
}

function handleAnswer(selected, q) {
    const feedback = document.getElementById('feedback-container');
    const msg = document.getElementById('feedback-message');
    const exp = document.getElementById('explanation-text');
    
    // מציאת עמודות באופן דינמי לפי מילות מפתח
    const keys = Object.keys(q);
    const correctKey = keys.find(k => k.includes("תשובה נכונה"));
    const conceptKey = keys.find(k => k.includes("שם המושג"));
    const infoKey = keys.find(k => k.includes("הסבר"));

    const correctVal = superClean(q[correctKey]);
    const selectedClean = superClean(selected);
    const conceptName = q[conceptKey] || "מושג כללי";
    const explanation = q[infoKey] || "אין הסבר זמין";

    feedback.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');

    // השוואה לוגית
    if (selectedClean === correctVal && correctVal !== "") {
        msg.innerHTML = `<h3 style="color: #2ecc71">נכון מאוד! ✨</h3>`;
        feedback.className = "success-style";
    } else {
        msg.innerHTML = `<h3 style="color: #e74c3c">טעות... 💡</h3><p>התשובה הנכונה: <b>${correctVal}</b></p>`;
        feedback.className = "error-style";
    }
    
    // הצגת המושג והסבר (כאן התיקון לשם המושג)
    exp.innerHTML = `
        <div style="margin-top:15px; text-align:right; border-top: 2px solid #ddd; padding-top:10px;">
            <p style="font-size: 1.1rem;"><b>שם המושג:</b> <span style="color:#3498db">${conceptName}</span></p>
            <p><b>הסבר מהחומר:</b> ${explanation}</p>
        </div>
    `;
    
    document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);
}

document.getElementById('next-btn').onclick = () => {
    currentIdx++;
    if (currentIdx < chapterQuestions.length) {
        showQuestion();
    } else {
        alert("סיימת את הפרק!");
        location.reload();
    }
};
