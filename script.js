let allData = [];
let chapterQuestions = [];
let currentIdx = 0;

// פונקציית עזר לניקוי טקסט אגרסיבי (מנקה תווים נסתרים, רווחים כפולים ותווי BOM)
function cleanText(str) {
    if (!str) return "";
    return str.toString()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // מנקה תווים בלתי נראים
        .replace(/\s+/g, " ")               // הופך רווחים כפולים לרווח יחיד
        .trim();                             // מנקה רווחים מהצדדים
}

window.onload = () => {
    Papa.parse("Citizenship-Studies-Game.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // ניקוי יסודי של כל הנתונים כבר בטעינה
            allData = results.data.map(row => {
                let cleanRow = {};
                for (let key in row) {
                    cleanRow[cleanText(key)] = cleanText(row[key]);
                }
                return cleanRow;
            });
            initMenu();
        }
    });
};

function initMenu() {
    // מציאת עמודת הפרק באופן דינמי
    const chapterKey = Object.keys(allData[0]).find(k => k.includes("פרק")) || "שם הפרק";
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
    
    // פיצול התשובות
    const choicesStr = q["תשובות"] || "";
    const choices = choicesStr.split('/').map(c => cleanText(c));
    
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
    
    feedback.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');

    // איתור עמודות התשובה והמושגים
    const correctAns = cleanText(q["תשובה נכונה"] || q["תשובה_נכונה"]);
    const conceptName = q["שם המושג בקובץ הלימוד"] || "מושג כללי";
    const explanation = q["הסבר המושג (לפי חומר הלימוד)"] || "";

    const selectedClean = cleanText(selected);

    // לוגיקת בדיקה חסינה
    if (selectedClean === correctAns && correctAns !== "") {
        msg.innerHTML = `<h3 style="color: #155724">נכון מאוד! ✨</h3>`;
        feedback.className = "success-style";
    } else {
        msg.innerHTML = `<h3 style="color: #721c24">טעות... 💡</h3><p>התשובה הנכונה: <b>${correctAns}</b></p>`;
        feedback.className = "error-style";
    }
    
    exp.innerHTML = `
        <div style="margin-top:15px; text-align:right; border-top: 1px dotted #666; padding-top:10px;">
            <p><b>מושג:</b> ${conceptName}</p>
            <p><b>הסבר:</b> ${explanation}</p>
        </div>
    `;
    
    document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);
}

document.getElementById('next-btn').onclick = () => {
    currentIdx++;
    if (currentIdx < chapterQuestions.length) {
        showQuestion();
    } else {
        alert("סיימת את הפרק בהצלחה!");
        location.reload();
    }
};
