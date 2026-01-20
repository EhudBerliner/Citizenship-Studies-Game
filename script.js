let allData = [];
let chapterQuestions = [];
let currentIdx = 0;

function superClean(str) {
    if (!str) return "";
    return str.toString()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") 
        .trim()
        .replace(/\s+/g, " ");
}

window.onload = () => {
    Papa.parse("Citizenship-Studies-Game.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
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
    const keys = Object.keys(allData[0]);
    const chapterKey = keys.find(k => k.includes("פרק"));
    const chapters = [...new Set(allData.map(q => q[chapterKey]))].filter(Boolean);
    
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('stats').classList.add('hidden');

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
    const keys = Object.keys(allData[0]);
    const conceptKey = keys.find(k => k.includes("מושג"));
    
    // 1. סינון שאלות הפרק
    const filtered = allData.filter(q => q[chapterKey] === chapterName);
    
    // 2. קיבוץ שאלות לפי מושג (כדי להבטיח שאלה אחת למושג)
    const groupedByConcept = {};
    filtered.forEach(q => {
        const cName = q[conceptKey] || "כללי";
        if (!groupedByConcept[cName]) groupedByConcept[cName] = [];
        groupedByConcept[cName].push(q);
    });

    // 3. הגרלת שאלה אחת מכל מושג
    chapterQuestions = Object.values(groupedByConcept).map(questions => {
        return questions[Math.floor(Math.random() * questions.length)];
    });

    // 4. ערבוב סדר המושגים
    chapterQuestions.sort(() => Math.random() - 0.5);

    currentIdx = 0;
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('chapter-name').innerText = chapterName;
    showQuestion();
}

function showQuestion() {
    const q = chapterQuestions[currentIdx];
    document.getElementById('progress').innerText = `מושג ${currentIdx + 1}/${chapterQuestions.length}`;
    document.getElementById('question-text').innerText = q["שאלה"];
    document.getElementById('feedback-container').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // ערבוב תשובות בתוך השאלה
    const choices = q["תשובות"].split('/').map(c => superClean(c)).sort(() => Math.random() - 0.5);
    
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
    
    const keys = Object.keys(q);
    const correctVal = q[keys.find(k => k.includes("נכונה"))];
    const conceptName = q[keys.find(k => k.includes("מושג"))];
    const explanation = q[keys.find(k => k.includes("הסבר"))];

    feedback.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.querySelectorAll('#options-container button').forEach(b => b.disabled = true);

    if (superClean(selected) === correctVal) {
        msg.innerHTML = `<h3 style="color: #2ecc71; margin:0;">נכון מאוד! ✅</h3>`;
        feedback.className = "success-style";
    } else {
        msg.innerHTML = `<h3 style="color: #e74c3c; margin:0;">טעות ❌</h3><p>התשובה: <b>${correctVal}</b></p>`;
        feedback.className = "error-style";
    }
    
    exp.innerHTML = `<div style="margin-top:10px; border-top:1px solid #ccc; padding-top:10px;">
        <b>מושג: ${conceptName}</b><br>${explanation}</div>`;
}

document.getElementById('next-btn').onclick = () => {
    currentIdx++;
    if (currentIdx < chapterQuestions.length) {
        showQuestion();
    } else {
        alert("סיימת את הפרק!");
        initMenu();
    }
};

// כפתור חזרה לתפריט
function backToMenu() {
    if (confirm("האם בטוח שברצונך לחזור לתפריט? ההתקדמות בפרק זה תאבד.")) {
        initMenu();
    }
}
