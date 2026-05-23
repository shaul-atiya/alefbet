const alphabetCards = [
  { letter: "א", word: "אוהל" },
  { letter: "ב", word: "בית" },
  { letter: "ג", word: "גמל" },
  { letter: "ד", word: "דלת" },
  { letter: "ה", word: "הדס" },
  { letter: "ו", word: "ורד" },
  { letter: "ז", word: "זית" },
  { letter: "ח", word: "חלב" },
  { letter: "ט", word: "טוב" },
  { letter: "י", word: "יופי" },
  { letter: "כ", word: "כוכב" },
  { letter: "ל", word: "לב" },
  { letter: "מ", word: "מים" },
  { letter: "נ", word: "נוצה" },
  { letter: "ס", word: "ספר" },
  { letter: "ע", word: "עין" },
  { letter: "פ", word: "פרח" },
  { letter: "צ", word: "צחוק" },
  { letter: "ק", word: "קוף" },
  { letter: "ר", word: "ראש" },
  { letter: "ש", word: "שלום" },
  { letter: "ת", word: "תודה" }
];

const letterIcons = {
  "א": "⛺",
  "ב": "🏠",
  "ג": "🐪",
  "ד": "🚪",
  "ה": "🌿",
  "ו": "🌹",
  "ז": "🫒",
  "ח": "🥛",
  "ט": "👍",
  "י": "✨",
  "כ": "⭐",
  "ל": "❤️",
  "מ": "💧",
  "נ": "🪶",
  "ס": "📘",
  "ע": "👁️",
  "פ": "🌸",
  "צ": "😄",
  "ק": "🐒",
  "ר": "🧠",
  "ש": "🕊️",
  "ת": "🙏"
};

const cardsTray = document.getElementById("cardsTray");
const dropTrack = document.getElementById("dropTrack");
const shuffleBtn = document.getElementById("shuffleBtn");
const checkBtn = document.getElementById("checkBtn");
const statusEl = document.getElementById("status");
const cardTemplate = document.getElementById("cardTemplate");

let draggedCard = null;
let dragOriginId = "";
const expectedLetters = alphabetCards.map((card) => card.letter);

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCardImage(cardData) {
  const icon = letterIcons[cardData.letter] || "🔤";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <text x="60" y="82" text-anchor="middle" font-size="82">${icon}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createCard(cardData) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");
  const image = fragment.querySelector(".card-image");
  card.dataset.letter = cardData.letter;

  image.src = buildCardImage(cardData);
  image.alt = `איור לאות ${cardData.letter} - ${cardData.word}`;

  fragment.querySelector(".letter").textContent = cardData.letter;
  fragment.querySelector(".word").textContent = cardData.word;

  card.addEventListener("dragstart", () => {
    draggedCard = card;
    dragOriginId = card.parentElement?.id || "";
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    dragOriginId = "";
  });

  return fragment;
}

function renderTray() {
  const shuffled = shuffleArray(alphabetCards);
  cardsTray.innerHTML = "";
  dropTrack.innerHTML = "";
  statusEl.textContent = "";
  statusEl.className = "status";

  shuffled.forEach((card) => {
    cardsTray.appendChild(createCard(card));
  });
}

function insertByCursor(container, element, clientX) {
  const siblings = [...container.querySelectorAll(".card:not(.dragging)")];
  const isRtl = getComputedStyle(container).direction === "rtl";
  let inserted = false;

  for (const sibling of siblings) {
    const rect = sibling.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const shouldInsertBefore = isRtl ? clientX > center : clientX < center;
    if (shouldInsertBefore) {
      container.insertBefore(element, sibling);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    container.appendChild(element);
  }
}

function setupDropZone(zone) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (!draggedCard) {
      return;
    }

    if (zone === dropTrack) {
      return;
    }

    insertByCursor(zone, draggedCard, event.clientX);
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!draggedCard) {
      return;
    }

    if (zone === dropTrack) {
      if (dragOriginId === "dropTrack") {
        statusEl.textContent = "לא ניתן להזיז כרטיס שכבר הונח. המשיכו עם האות הבאה.";
        statusEl.className = "status warn";
        draggedCard = null;
        return;
      }

      const nextIndex = dropTrack.querySelectorAll(".card").length;
      const expectedLetter = expectedLetters[nextIndex];
      const droppedLetter = draggedCard.dataset.letter;

      if (droppedLetter !== expectedLetter) {
        statusEl.textContent = `טעות: עכשיו צריך להניח את האות ${expectedLetter}.`;
        statusEl.className = "status warn";
        draggedCard = null;
        return;
      }

      dropTrack.appendChild(draggedCard);
      draggedCard = null;
      validateProgress();
      return;
    }

    insertByCursor(zone, draggedCard, event.clientX);
    draggedCard = null;
    validateProgress();
  });
}

function validateProgress() {
  const orderedLetters = [...dropTrack.querySelectorAll(".card")].map((card) => card.dataset.letter);

  if (orderedLetters.length === 0) {
    statusEl.textContent = "";
    statusEl.className = "status";
    return;
  }

  const wrongIndex = orderedLetters.findIndex((letter, index) => letter !== expectedLetters[index]);

  if (wrongIndex !== -1) {
    statusEl.textContent = `יש טעות בסדר ליד האות ${orderedLetters[wrongIndex]}. נסו להזיז את הכרטיס למקום הנכון.`;
    statusEl.className = "status warn";
    return;
  }

  if (orderedLetters.length === expectedLetters.length) {
    statusEl.textContent = "כל הכבוד! סידרת נכון את כל האותיות.";
    statusEl.className = "status ok";
    return;
  }

  statusEl.textContent = "מצוין, בינתיים הסדר נכון. ממשיכים...";
  statusEl.className = "status ok";
}

function checkOrder() {
  const orderedLetters = [...dropTrack.querySelectorAll(".card")].map((card) => card.dataset.letter);

  if (orderedLetters.length !== alphabetCards.length) {
    statusEl.textContent = "יש להעביר את כל הכרטיסיות למסלול הסדר לפני הבדיקה.";
    statusEl.className = "status warn";
    return;
  }

  const isCorrect = orderedLetters.every((letter, i) => letter === expectedLetters[i]);

  if (isCorrect) {
    statusEl.textContent = "כל הכבוד! סידרת נכון את כל האותיות.";
    statusEl.className = "status ok";
  } else {
    statusEl.textContent = "כמעט! נסו שוב ולסדר את האותיות לפי סדר הא-ב.";
    statusEl.className = "status warn";
  }
}

shuffleBtn.addEventListener("click", renderTray);
checkBtn.addEventListener("click", checkOrder);

setupDropZone(cardsTray);
setupDropZone(dropTrack);
renderTray();
