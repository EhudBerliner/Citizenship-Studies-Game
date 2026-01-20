let allData = [];
let chapterQuestions = [];
let currentIdx = 0;

// פונקציית ניקוי אגרסיבית לכל סוגי התווים הנסתרים והרווחים
function superClean(str) {
    if (!str) return "";
    return str.toString()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // מנקה תווים בלתי נראים (BOM)
        .trim()
        .replace(/\s+/g, " "); // הופך רווחים כפולים לרווח יחיד
}

window.onload = () => {
    Papa.parse("Citizenship-Studies-Game.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // ניקוי יסודי של המפתחות (הכותרות) והערכים כבר בשלב הטעינה
            allData = results.data.map(row => {
                let cleanRow = {};
                for (let key in row) {
                    cleanRow[superClean(key)] = superClean(row[key]);
                }
                return cleanRow;
            });
            initMenu();
        }
    });
};

function initMenu() {
    // מציאת עמודת הפרק באופן דינמי
    const keys = Object.keys(allData[0]);
    const chapterKey = keys.find(k => k.includes("פרק")) || "שם הפרק";
    
    // יצירת רשימת פרקים ייחודית
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
    document.getElementById('progress').innerText = `שאלה ${currentIdx + 1}/${chapterQuestions.length}`;
    document.getElementById('question-text').innerText = q["שאלה"];
    document.getElementById('feedback-container').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // פיצול תשובות (תומך בשימוש בלוכסן)
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
    
    // איתור עמודות חכם
    const keys = Object.keys(q);
    const correctKey = keys.find(k => k.includes("נכונה"));
    const conceptKey = keys.find(k => k.includes("מושג"));
    const infoKey = keys.find(k => k.includes("הסבר"));

    const correctVal = q[correctKey];
    const selectedClean = superClean(selected);
    const conceptName = q[conceptKey] || "מושג כללי";
    const explanation = q[infoKey] || "אין הסבר זמין";

    feedback.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);

    if (selectedClean === correctVal) {
        msg.innerHTML = `<h3 style="color: #2ecc71">נכון מאוד! ✅</h3>`;
        feedback.className = "success-style";
    } else {
        msg.innerHTML = `<h3 style="color: #e74c3c">טעות... ❌</h3><p>התשובה הנכונה: <b>${correctVal}</b></p>`;
        feedback.className = "error-style";
    }
    
    // הצגת המושג והסבר בביאור - התיקון הסופי להצגת שם המושג
    exp.innerHTML = `
        <div style="margin-top:15px; text-align:right; border-top: 2px solid #ddd; padding-top:10px;">
            <p style="font-size: 1.1rem; margin-bottom: 5px;"><b>מושג הלימוד:</b> <span style="color:#3498db; font-weight:bold;">${conceptName}</span></p>
            <p><b>הסבר:</b> ${explanation}</p>
        </div>
    `;
}

document.getElementById('next-btn').onclick = () => {
    currentIdx++;
    if (currentIdx < chapterQuestions.length) {
        showQuestion();
    } else {
        alert("הפרק הושלם בהצלחה!");
        location.reload();
    }
};
