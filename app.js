var alphabetCards = [
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
  { letter: "פ", word: "פרפר" },
  { letter: "צ", word: "צחוק" },
  { letter: "ק", word: "קוף" },
  { letter: "ר", word: "ראש" },
  { letter: "ש", word: "שלום" },
  { letter: "ת", word: "תודה" }
];

var letterIcons = {
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
  "פ": "🦋",
  "צ": "😄",
  "ק": "🐒",
  "ר": "🧠",
  "ש": "🕊️",
  "ת": "🙏"
};

var cardsTray = document.getElementById("cardsTray");
var dropTrack = document.getElementById("dropTrack");
var shuffleBtn = document.getElementById("shuffleBtn");
var statusEl = document.getElementById("status");
var cardTemplate = document.getElementById("cardTemplate");

var draggedCard = null;
var hasWon = false;
var expectedLetters = alphabetCards.map(function (card) {
  return card.letter;
});

function shuffleArray(items) {
  var arr = items.slice();
  var i;
  var j;
  var temp;

  for (i = arr.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function buildCardImage(cardData) {
  var icon = letterIcons[cardData.letter] || "🔤";
  var svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">',
    '<text x="60" y="82" text-anchor="middle" font-size="82">' + icon + "</text>",
    "</svg>"
  ].join("");

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function triggerWinCelebration() {
  if (hasWon) {
    return;
  }

  hasWon = true;

  var overlay = document.createElement("div");
  overlay.className = "win-overlay";
  overlay.innerHTML = '<div class="win-badge">🎉 אלופים! סידרתם את כל האותיות נכון 🎉</div>';

  document.body.appendChild(overlay);

  var totalPieces = 180;
  var colors = ["#ef8b2c", "#1f7a62", "#ffd166", "#4cc9f0", "#f94144"];
  var i;

  for (i = 0; i < totalPieces; i += 1) {
    var piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDelay = Math.random() * 1.15 + "s";
    piece.style.animationDuration = 2.8 + Math.random() * 2.6 + "s";
    piece.style.background = colors[i % 5];
    piece.style.width = 8 + Math.random() * 10 + "px";
    piece.style.height = 10 + Math.random() * 14 + "px";
    piece.style.opacity = 0.65 + Math.random() * 0.35;
    piece.style.setProperty("--drift", -180 + Math.random() * 360 + "px");
    piece.style.setProperty("--spin", 360 + Math.random() * 1080 + "deg");
    piece.style.setProperty("--tilt", -35 + Math.random() * 70 + "deg");
    if (Math.random() > 0.6) {
      piece.style.borderRadius = "999px";
    }
    overlay.appendChild(piece);
  }

  setTimeout(function () {
    overlay.classList.add("fade-out");
  }, 3000);

  setTimeout(function () {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 4200);
}

function placeCardInTrack(card) {
  var originId = "";
  var parent = card.parentElement || card.parentNode;
  if (parent && parent.id) {
    originId = parent.id;
  }

  if (originId === "dropTrack") {
    statusEl.textContent = "לא ניתן להזיז כרטיס שכבר הונח. המשיכו עם האות הבאה.";
    statusEl.className = "status warn";
    return false;
  }

  var nextIndex = dropTrack.querySelectorAll(".card").length;
  var expectedLetter = expectedLetters[nextIndex];
  var droppedLetter = card.getAttribute("data-letter");

  if (droppedLetter !== expectedLetter) {
    statusEl.textContent = "טעות: עכשיו צריך להניח את האות " + expectedLetter + ".";
    statusEl.className = "status warn";
    return false;
  }

  dropTrack.appendChild(card);
  validateProgress();
  return true;
}

function createCard(cardData) {
  var fragment = cardTemplate.content.cloneNode(true);
  var card = fragment.querySelector(".card");
  var image = fragment.querySelector(".card-image");
  card.setAttribute("data-letter", cardData.letter);

  image.src = buildCardImage(cardData);
  image.alt = "איור לאות " + cardData.letter + " - " + cardData.word;

  fragment.querySelector(".letter").textContent = cardData.letter;
  fragment.querySelector(".word").textContent = cardData.word;

  card.addEventListener("dragstart", function () {
    draggedCard = card;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", function () {
    card.classList.remove("dragging");
  });

  // Mobile-friendly behavior: tap works like dropping into the ordered track.
  card.addEventListener("click", function () {
    placeCardInTrack(card);
  });

  return fragment;
}

function renderTray() {
  var shuffled = shuffleArray(alphabetCards);
  hasWon = false;
  cardsTray.innerHTML = "";
  dropTrack.innerHTML = "";
  statusEl.textContent = "";
  statusEl.className = "status";

  shuffled.forEach(function (card) {
    cardsTray.appendChild(createCard(card));
  });
}

function insertByCursor(container, element, clientX) {
  var siblings = container.querySelectorAll(".card:not(.dragging)");
  var isRtl = getComputedStyle(container).direction === "rtl";
  var inserted = false;
  var i;

  for (i = 0; i < siblings.length; i += 1) {
    var sibling = siblings[i];
    var rect = sibling.getBoundingClientRect();
    var center = rect.left + rect.width / 2;
    var shouldInsertBefore = isRtl ? clientX > center : clientX < center;
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
  zone.addEventListener("dragover", function (event) {
    event.preventDefault();
    if (!draggedCard) {
      return;
    }

    if (zone === dropTrack) {
      return;
    }

    insertByCursor(zone, draggedCard, event.clientX);
  });

  zone.addEventListener("drop", function (event) {
    event.preventDefault();
    if (!draggedCard) {
      return;
    }

    if (zone === dropTrack) {
      placeCardInTrack(draggedCard);
      draggedCard = null;
      return;
    }

    insertByCursor(zone, draggedCard, event.clientX);
    draggedCard = null;
    validateProgress();
  });
}

function validateProgress() {
  var cards = dropTrack.querySelectorAll(".card");
  var orderedLetters = [];
  var i;

  for (i = 0; i < cards.length; i += 1) {
    orderedLetters.push(cards[i].getAttribute("data-letter"));
  }

  if (orderedLetters.length === 0) {
    statusEl.textContent = "";
    statusEl.className = "status";
    return;
  }

  var wrongIndex = -1;
  for (i = 0; i < orderedLetters.length; i += 1) {
    if (orderedLetters[i] !== expectedLetters[i]) {
      wrongIndex = i;
      break;
    }
  }

  if (wrongIndex !== -1) {
    statusEl.textContent = "יש טעות בסדר ליד האות " + orderedLetters[wrongIndex] + ". נסו להזיז את הכרטיס למקום הנכון.";
    statusEl.className = "status warn";
    return;
  }

  if (orderedLetters.length === expectedLetters.length) {
    statusEl.textContent = "כל הכבוד! סידרת נכון את כל האותיות.";
    statusEl.className = "status ok";
    triggerWinCelebration();
    return;
  }

  statusEl.textContent = "מצוין, בינתיים הסדר נכון. ממשיכים...";
  statusEl.className = "status ok";
}

shuffleBtn.addEventListener("click", renderTray);

setupDropZone(cardsTray);
setupDropZone(dropTrack);
renderTray();
