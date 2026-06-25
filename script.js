"use strict";

const cardElement = document.querySelector("#readingCard");
const randomButton = document.querySelector("#randomButton");
const copyButton = document.querySelector("#copyButton");
const statusElement = document.querySelector("#status");

const fields = {
  date: document.querySelector("#cardDate"),
  title: document.querySelector("#cardTitle"),
  quote: document.querySelector("#cardQuote"),
  source: document.querySelector("#cardSource"),
  tags: document.querySelector("#cardTags"),
  insight: document.querySelector("#cardInsight"),
  question: document.querySelector("#cardQuestion"),
  count: document.querySelector("#cardCount"),
};

// 每套颜色都保持低饱和度和足够对比度，随卡片稳定切换。
const palettes = [
  {
    pageTop: "#eee7d9",
    pageBottom: "#d8ccb7",
    paper: "#f6efe2",
    paperGlow: "rgba(255, 255, 255, 0.52)",
    ink: "#292622",
    inkSoft: "#514b43",
    muted: "#766e63",
    line: "rgba(92, 72, 50, 0.17)",
    accent: "#a8513e",
    accentSoft: "#ead2c8",
    shadow: "rgba(71, 54, 35, 0.17)",
  },
  {
    pageTop: "#e6ece5",
    pageBottom: "#cbd8cf",
    paper: "#f2f3e9",
    paperGlow: "rgba(255, 255, 255, 0.5)",
    ink: "#25302b",
    inkSoft: "#46564f",
    muted: "#69776f",
    line: "rgba(54, 83, 69, 0.16)",
    accent: "#4f7468",
    accentSoft: "#cbded7",
    shadow: "rgba(42, 70, 57, 0.16)",
  },
  {
    pageTop: "#eee7d5",
    pageBottom: "#dbcca9",
    paper: "#f7f0dc",
    paperGlow: "rgba(255, 255, 255, 0.5)",
    ink: "#30291f",
    inkSoft: "#5a5142",
    muted: "#7b705d",
    line: "rgba(104, 78, 39, 0.16)",
    accent: "#9a7135",
    accentSoft: "#ead9b8",
    shadow: "rgba(86, 65, 31, 0.17)",
  },
  {
    pageTop: "#e8ebf0",
    pageBottom: "#ccd3df",
    paper: "#f2f1ec",
    paperGlow: "rgba(255, 255, 255, 0.54)",
    ink: "#252a33",
    inkSoft: "#49515f",
    muted: "#6b7380",
    line: "rgba(56, 68, 92, 0.16)",
    accent: "#596b8b",
    accentSoft: "#d0d7e4",
    shadow: "rgba(46, 57, 79, 0.16)",
  },
  {
    pageTop: "#eee8ed",
    pageBottom: "#d8cad7",
    paper: "#f5f0ee",
    paperGlow: "rgba(255, 255, 255, 0.5)",
    ink: "#302a30",
    inkSoft: "#574e56",
    muted: "#786d76",
    line: "rgba(91, 63, 88, 0.15)",
    accent: "#7a5d79",
    accentSoft: "#ded0dc",
    shadow: "rgba(73, 50, 70, 0.15)",
  },
  {
    pageTop: "#eee6df",
    pageBottom: "#dbc7ba",
    paper: "#f7eee7",
    paperGlow: "rgba(255, 255, 255, 0.5)",
    ink: "#302722",
    inkSoft: "#5b4d45",
    muted: "#7d6d63",
    line: "rgba(105, 68, 47, 0.15)",
    accent: "#a5654b",
    accentSoft: "#e9cfc1",
    shadow: "rgba(83, 54, 38, 0.16)",
  },
  {
    pageTop: "#e7eceb",
    pageBottom: "#c9d6d5",
    paper: "#eff4f0",
    paperGlow: "rgba(255, 255, 255, 0.52)",
    ink: "#25302f",
    inkSoft: "#465756",
    muted: "#687978",
    line: "rgba(45, 78, 77, 0.15)",
    accent: "#477c7b",
    accentSoft: "#c5dddd",
    shadow: "rgba(38, 67, 66, 0.15)",
  },
];

let cards = [];
let currentCard = null;
let currentIndex = -1;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 简单、稳定的字符串哈希：相同日期会得到相同索引。
function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function setPalette(card) {
  const seed = String(card.id ?? card.title);
  const palette = palettes[hashString(seed) % palettes.length];
  const rootStyle = document.documentElement.style;

  Object.entries(palette).forEach(([name, value]) => {
    const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    rootStyle.setProperty(`--${cssName}`, value);
  });
}

function renderCard(card, index) {
  currentCard = card;
  currentIndex = index;
  setPalette(card);

  cardElement.classList.remove("is-flipped");
  cardElement.setAttribute("aria-pressed", "false");
  fields.date.textContent = getLocalDateKey().replaceAll("-", " / ");
  fields.title.textContent = card.title;
  fields.quote.textContent = card.quote;
  fields.source.textContent = `出处：${card.source}`;
  fields.insight.textContent = card.insight;
  fields.question.textContent = card.question;
  fields.count.textContent = `${index + 1} / ${cards.length}`;
  fields.tags.replaceChildren(
    ...card.tags.map((tag) => {
      const item = document.createElement("span");
      item.className = "tag";
      item.textContent = tag;
      return item;
    }),
  );
}

function showDailyCard() {
  const dailyIndex = hashString(getLocalDateKey()) % cards.length;
  renderCard(cards[dailyIndex], dailyIndex);
}

function showRandomCard() {
  if (cards.length < 2) return;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * cards.length);
  }
  renderCard(cards[nextIndex], nextIndex);
}

function toggleCard() {
  if (!currentCard) return;
  const isFlipped = cardElement.classList.toggle("is-flipped");
  cardElement.setAttribute("aria-pressed", String(isFlipped));
}

function getShareText(card) {
  return [
    `今日毛选卡片：《${card.title}》`,
    `摘录：${card.quote}`,
    `启发：${card.insight}`,
    `出处：${card.source}`,
  ].join("\n");
}

async function copyShareText() {
  if (!currentCard) return;
  const text = getShareText(currentCard);

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 兼容不支持 Clipboard API 或非安全上下文的浏览器。
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  const originalText = copyButton.textContent;
  copyButton.textContent = "已复制";
  window.setTimeout(() => {
    copyButton.textContent = originalText;
  }, 1400);
}

function validateCards(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("cards.json 中没有可用卡片");
  }

  const requiredFields = ["title", "quote", "source", "tags", "insight", "question"];
  data.forEach((card, index) => {
    const missing = requiredFields.filter((field) => card[field] == null);
    if (missing.length || !Array.isArray(card.tags)) {
      throw new Error(`第 ${index + 1} 条卡片格式不完整`);
    }
  });

  return data;
}

async function loadCards() {
  randomButton.disabled = true;
  copyButton.disabled = true;

  try {
    const response = await fetch("./cards.json");
    if (!response.ok) {
      throw new Error(`读取失败（HTTP ${response.status}）`);
    }

    cards = validateCards(await response.json());
    showDailyCard();
    randomButton.disabled = cards.length < 2;
    copyButton.disabled = false;
    statusElement.textContent = "今日卡片已就位，点击卡片可翻面。";
  } catch (error) {
    fields.title.textContent = "卡片暂未载入";
    fields.quote.textContent = "浏览器直接打开本地文件时，通常会阻止读取 cards.json。";
    fields.source.textContent = "请在当前目录运行：python3 -m http.server";
    statusElement.classList.add("is-error");
    statusElement.textContent = `${error.message}。启动后访问 http://localhost:8000`;
  }
}

cardElement.addEventListener("click", toggleCard);
randomButton.addEventListener("click", showRandomCard);
copyButton.addEventListener("click", copyShareText);

loadCards();
