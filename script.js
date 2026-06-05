/* Star-World interaction layer
   Each module is written in plain JavaScript so teachers can read and modify it
   without a build step. The comments explain the science model and the UI logic. */

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupBackground();
  setupLifecycle();
  setupTemperatureLab();
  setupComparisonTool();
  setupConstellationPuzzle();
  setupSeasonMatch();
  setupPlanetGame();
  setupSkyExplorer();
  setupPlanisphere();
  setupQuiz();
  refreshIcons();
});

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupNavigation() {
  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.jump);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("zh-Hant", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

/* Background starfield -----------------------------------------------------
   The background canvas supplies the animated stars and soft nebula particles.
   It stays decorative and does not interfere with the learning canvases. */
function setupBackground() {
  const canvas = document.getElementById("space-canvas");
  const ctx = canvas.getContext("2d");
  const stars = [];
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars.length = 0;
    particles.length = 0;
    const starCount = Math.round(Math.min(260, Math.max(120, width * height / 6200)));
    for (let i = 0; i < starCount; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.25,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.006,
      });
    }

    const colors = ["rgba(110,231,216,0.08)", "rgba(255,166,210,0.07)", "rgba(255,209,102,0.06)", "rgba(120,183,255,0.08)"];
    for (let i = 0; i < 34; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 80 + 34,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        color: colors[i % colors.length],
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -p.r) p.x = width + p.r;
      if (p.x > width + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = height + p.r;
      if (p.y > height + p.r) p.y = -p.r;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    stars.forEach((star) => {
      star.twinkle += star.speed;
      const alpha = 0.36 + Math.sin(star.twinkle) * 0.32 + star.r * 0.12;
      ctx.fillStyle = `rgba(245,250,255,${Math.max(0.2, Math.min(1, alpha))})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

/* Module 1: stellar life cycle --------------------------------------------
   The model is simplified for learning: mass is the main driver. Low and
   Sun-like stars end as white dwarfs; high-mass stars explode as supernovae. */
function setupLifecycle() {
  const massSlider = document.getElementById("massSlider");
  const massValue = document.getElementById("massValue");
  const lifeSpan = document.getElementById("lifeSpan");
  const lifeResult = document.getElementById("lifeResult");
  const timeline = document.getElementById("timeline");
  const stageStar = document.querySelector("#stageStar span");
  let activeStage = 0;
  let currentTrack = [];

  const tracks = {
    low: [
      ["星雲", "氣體與塵埃受到重力吸引，開始聚集。", "#78b7ff"],
      ["原恆星", "中心逐漸變熱，但核融合尚未穩定。", "#ffa6d2"],
      ["紅矮主序星", "質量小、燃料用得慢，壽命非常長。", "#ff8a7a"],
      ["白矮星", "燃料耗盡後留下緻密核心，慢慢冷卻。", "#e9f1ff"],
    ],
    sun: [
      ["星雲", "重力讓星際物質收縮，形成新恆星的材料。", "#78b7ff"],
      ["原恆星", "溫度升高，中心壓力逐漸足以點燃核融合。", "#ffa6d2"],
      ["主序星", "氫核融合穩定發光，太陽目前就在這個階段。", "#ffd166"],
      ["紅巨星", "核心氫燃料減少，外層膨脹變紅。", "#ff8a7a"],
      ["行星狀星雲", "外層氣體被拋出，形成美麗的發光雲氣。", "#6ee7d8"],
      ["白矮星", "核心殘骸繼續發熱，但不再進行穩定核融合。", "#e9f1ff"],
    ],
    massive: [
      ["星雲", "大量物質聚集，形成更重、更熱的恆星。", "#78b7ff"],
      ["原恆星", "收縮速度快，中心溫度迅速上升。", "#ffa6d2"],
      ["大質量主序星", "非常明亮，燃料消耗也非常快。", "#b9d2ff"],
      ["紅超巨星", "外層巨大膨脹，體積可能遠大於太陽。", "#ff8a7a"],
      ["超新星", "核心塌縮引發猛烈爆炸，製造許多重元素。", "#ffd166"],
      ["中子星或黑洞", "殘骸依質量不同，可能成為中子星或黑洞。", "#bda5ff"],
    ],
  };

  function chooseTrack(mass) {
    if (mass < 0.8) return tracks.low;
    if (mass < 8) return tracks.sun;
    return tracks.massive;
  }

  function describeLifeSpan(mass) {
    const billionYears = 10 * Math.pow(mass, -2.5);
    if (billionYears > 1000) return "超過 1 兆年";
    if (billionYears >= 1) return `約 ${formatNumber(billionYears, 1)} 億年`;
    return `約 ${formatNumber(billionYears * 1000, 0)} 百萬年`;
  }

  function finalFate(mass) {
    if (mass < 0.8) return "白矮星，需經極長時間";
    if (mass < 8) return "白矮星";
    if (mass < 20) return "超新星後形成中子星";
    return "超新星後可能形成黑洞";
  }

  function updateTimeline() {
    timeline.innerHTML = "";
    currentTrack.forEach(([name, detail, color], index) => {
      const item = document.createElement("li");
      item.className = index === activeStage ? "is-active" : "";
      item.innerHTML = `
        <span class="stage-dot" style="color:${color}; background:${color}"></span>
        <span><strong>${name}</strong><small>${detail}</small></span>
      `;
      timeline.appendChild(item);
    });

    const active = currentTrack[activeStage];
    if (active) {
      stageStar.style.background = active[2];
      stageStar.style.color = active[2];
    }
  }

  function updateLifecycle() {
    const mass = Number(massSlider.value);
    massValue.textContent = mass.toFixed(1);
    lifeSpan.textContent = describeLifeSpan(mass);
    lifeResult.textContent = finalFate(mass);
    currentTrack = chooseTrack(mass);
    activeStage = 0;

    const visualSize = Math.max(56, Math.min(190, 76 + Math.log10(mass + 1) * 86));
    stageStar.style.width = `${visualSize}px`;
    stageStar.style.height = `${visualSize}px`;
    updateTimeline();
  }

  massSlider.addEventListener("input", updateLifecycle);
  setInterval(() => {
    if (currentTrack.length) {
      activeStage = (activeStage + 1) % currentTrack.length;
      updateTimeline();
    }
  }, 1800);

  updateLifecycle();
}

/* Module 2: color and temperature -----------------------------------------
   A compact blackbody approximation converts Kelvin to RGB. It is not meant
   for precision photometry, but it shows the correct red-to-blue trend. */
function setupTemperatureLab() {
  const slider = document.getElementById("tempSlider");
  const star = document.getElementById("temperatureStar");
  const kelvinValue = document.getElementById("kelvinValue");
  const celsiusValue = document.getElementById("celsiusValue");
  const spectralType = document.getElementById("spectralType");
  const hint = document.getElementById("temperatureHint");

  function kelvinToRgb(kelvin) {
    const temp = kelvin / 100;
    let red;
    let green;
    let blue;

    if (temp <= 66) {
      red = 255;
      green = 99.4708025861 * Math.log(temp) - 161.1195681661;
      blue = temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    } else {
      red = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
      green = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
      blue = 255;
    }

    const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));
    return `rgb(${clamp(red)}, ${clamp(green)}, ${clamp(blue)})`;
  }

  function spectralInfo(kelvin) {
    if (kelvin >= 30000) return ["O 型", "藍色 O 型恆星非常炙熱，通常質量大、壽命短。"];
    if (kelvin >= 10000) return ["B 型", "藍白色 B 型恆星溫度高，發出強烈藍白光。"];
    if (kelvin >= 7500) return ["A 型", "白色 A 型恆星很明亮，織女星接近這類。"];
    if (kelvin >= 6000) return ["F 型", "黃白色 F 型恆星比太陽稍熱。"];
    if (kelvin >= 5200) return ["G 型", "太陽屬於 G 型，表面溫度約 5,800 K。"];
    if (kelvin >= 3700) return ["K 型", "橙色 K 型恆星比太陽冷，常見且穩定。"];
    return ["M 型", "紅色 M 型恆星溫度較低，許多紅矮星屬於這類。"];
  }

  function update() {
    const kelvin = Number(slider.value);
    const color = kelvinToRgb(kelvin);
    const [type, text] = spectralInfo(kelvin);
    kelvinValue.textContent = `${formatNumber(kelvin)} K`;
    celsiusValue.textContent = `${formatNumber(kelvin - 273.15)} °C`;
    spectralType.textContent = type;
    hint.textContent = text;
    star.style.background = color;
    star.style.color = color;
  }

  slider.addEventListener("input", update);
  update();
}

/* Module 3: comparison tool ------------------------------------------------ */
function setupComparisonTool() {
  const stars = [
    { name: "天狼星 A", radius: 1.71, luminosity: 25.4, temp: 9940, distance: 8.6, color: "#c8dcff", note: "夜空中看起來最亮的恆星之一，星等約 -1.46。" },
    { name: "織女星", radius: 2.36, luminosity: 40, temp: 9602, distance: 26, color: "#d7e6ff", note: "夏季大三角的亮星，屬於天琴座。" },
    { name: "比鄰星", radius: 0.154, luminosity: 0.0017, temp: 3042, distance: 4.24, color: "#ff7a62", note: "離太陽最近的恆星，是低溫紅矮星。" },
    { name: "參宿四", radius: 764, luminosity: 126000, temp: 3600, distance: 548, color: "#ff8a61", note: "獵戶座紅超巨星，生命晚期可能發生超新星。" },
    { name: "參宿七", radius: 78.9, luminosity: 120000, temp: 12100, distance: 860, color: "#bcd3ff", note: "獵戶座藍超巨星，非常明亮且高溫。" },
    { name: "心宿二", radius: 680, luminosity: 75000, temp: 3400, distance: 550, color: "#ff6c58", note: "天蠍座紅色亮星，中文星名又稱大火。" },
  ];

  const select = document.getElementById("starSelect");
  const facts = document.getElementById("starFacts");
  const bars = document.getElementById("compareBars");
  const disc = document.getElementById("selectedDisc");

  stars.forEach((star, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = star.name;
    select.appendChild(option);
  });

  function logPercent(value, max) {
    return Math.max(2, Math.min(100, (Math.log10(value + 1) / Math.log10(max + 1)) * 100));
  }

  function update() {
    const star = stars[Number(select.value)];
    const size = Math.max(30, Math.min(240, 46 + Math.log10(star.radius + 1) * 70));
    disc.textContent = star.name;
    disc.style.width = `${size}px`;
    disc.style.height = `${size}px`;
    disc.style.background = star.color;
    disc.style.color = star.color;

    facts.innerHTML = `
      <div><dt>半徑</dt><dd>${formatNumber(star.radius, star.radius < 1 ? 3 : 1)} 倍太陽</dd></div>
      <div><dt>亮度</dt><dd>${formatNumber(star.luminosity, star.luminosity < 1 ? 4 : 0)} 倍太陽</dd></div>
      <div><dt>表面溫度</dt><dd>${formatNumber(star.temp)} K</dd></div>
      <div><dt>距離地球</dt><dd>${formatNumber(star.distance, 1)} 光年</dd></div>
    `;

    const rows = [
      ["大小", star.radius, 800, `${formatNumber(star.radius, star.radius < 1 ? 3 : 1)}x`],
      ["亮度", star.luminosity, 130000, `${formatNumber(star.luminosity, star.luminosity < 1 ? 4 : 0)}x`],
      ["溫度", star.temp / 5778, 6, `${formatNumber(star.temp)} K`],
    ];
    bars.innerHTML = rows.map(([label, value, max, text]) => `
      <div class="bar-row">
        <span><strong>${label}</strong><em>${text}</em></span>
        <div class="bar-track"><i style="width:${logPercent(value, max)}%"></i></div>
      </div>
    `).join("") + `<p class="hint-box">${star.note}</p>`;
  }

  select.addEventListener("change", update);
  update();
}

/* Module 4: constellation puzzle ------------------------------------------
   Students drag each visible star into the target constellation skeleton.
   Coordinates use an SVG viewBox, so the puzzle works on mobile and desktop. */
function setupConstellationPuzzle() {
  const svg = document.getElementById("constellationPuzzle");
  const nameEl = document.getElementById("puzzleName");
  const hint = document.getElementById("puzzleHint");
  const nextButton = document.getElementById("nextConstellation");
  let constellationIndex = 0;
  let pieces = [];
  let dragging = null;

  const constellations = [
    {
      name: "獵戶座",
      season: "冬季",
      story: "獵戶座腰帶由參宿一、參宿二、參宿三排成一直線，是冬季星空中很容易辨認的圖案。",
      targets: [[27, 20], [55, 19], [36, 33], [46, 35], [56, 37], [29, 52], [65, 52]],
      lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
    },
    {
      name: "北斗七星",
      season: "春夏",
      story: "北斗七星像勺子，可用勺口兩星延長約五倍距離尋找北極星。",
      targets: [[20, 23], [32, 18], [45, 22], [55, 31], [66, 35], [76, 30], [84, 22]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    },
    {
      name: "仙后座",
      season: "秋冬",
      story: "仙后座常被看成 W 形，秋冬季可用它協助尋找北極星。",
      targets: [[22, 28], [36, 42], [51, 26], [66, 43], [80, 27]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    },
    {
      name: "天蠍座",
      season: "夏季",
      story: "天蠍座有彎鉤般的形狀，紅色亮星心宿二位在天蠍的心臟附近。",
      targets: [[24, 20], [35, 25], [45, 32], [55, 40], [64, 52], [75, 55], [82, 45], [76, 35]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    },
  ];

  function startPuzzle() {
    const current = constellations[constellationIndex];
    nameEl.textContent = `${current.name}（${current.season}）`;
    hint.textContent = "把亮星拖到淡色目標點附近，成功後會出現星座故事。";
    hint.className = "hint-box";
    pieces = current.targets.map((target, index) => ({
      target,
      x: 12 + (index * 12) % 76,
      y: 61 + (index % 2) * 5,
      snapped: false,
    }));
    renderPuzzle();
  }

  function renderPuzzle() {
    const current = constellations[constellationIndex];
    svg.innerHTML = "";

    for (let i = 0; i < 34; i += 1) {
      const tiny = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      tiny.setAttribute("cx", (Math.random() * 100).toFixed(1));
      tiny.setAttribute("cy", (Math.random() * 70).toFixed(1));
      tiny.setAttribute("r", (Math.random() * 0.45 + 0.15).toFixed(2));
      tiny.setAttribute("fill", "rgba(255,255,255,0.42)");
      svg.appendChild(tiny);
    }

    current.lines.forEach(([a, b]) => {
      const p1 = pieces[a];
      const p2 = pieces[b];
      if (p1.snapped && p2.snapped) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.target[0]);
        line.setAttribute("y1", p1.target[1]);
        line.setAttribute("x2", p2.target[0]);
        line.setAttribute("y2", p2.target[1]);
        line.setAttribute("class", "puzzle-line");
        svg.appendChild(line);
      }
    });

    current.targets.forEach(([x, y]) => {
      const target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      target.setAttribute("cx", x);
      target.setAttribute("cy", y);
      target.setAttribute("r", 3.2);
      target.setAttribute("class", "puzzle-target");
      svg.appendChild(target);
    });

    pieces.forEach((piece, index) => {
      const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      star.setAttribute("cx", piece.snapped ? piece.target[0] : piece.x);
      star.setAttribute("cy", piece.snapped ? piece.target[1] : piece.y);
      star.setAttribute("r", piece.snapped ? 2.9 : 3.5);
      star.setAttribute("class", `puzzle-star${piece.snapped ? " is-snapped" : ""}`);
      star.dataset.index = index;
      svg.appendChild(star);
    });
  }

  function svgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  svg.addEventListener("pointerdown", (event) => {
    if (!event.target.classList.contains("puzzle-star")) return;
    dragging = Number(event.target.dataset.index);
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (dragging === null) return;
    const point = svgPoint(event);
    const piece = pieces[dragging];
    if (!piece.snapped) {
      piece.x = Math.max(4, Math.min(96, point.x));
      piece.y = Math.max(4, Math.min(66, point.y));
      renderPuzzle();
    }
  });

  svg.addEventListener("pointerup", (event) => {
    if (dragging === null) return;
    const piece = pieces[dragging];
    const dx = piece.x - piece.target[0];
    const dy = piece.y - piece.target[1];
    if (Math.hypot(dx, dy) < 8) {
      piece.snapped = true;
    }
    dragging = null;
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    renderPuzzle();
    if (pieces.every((pieceItem) => pieceItem.snapped)) {
      hint.textContent = constellations[constellationIndex].story;
      hint.className = "hint-box feedback-line is-good";
    }
  });

  nextButton.addEventListener("click", () => {
    constellationIndex = (constellationIndex + 1) % constellations.length;
    startPuzzle();
  });

  startPuzzle();
}

function setupSeasonMatch() {
  const seasonButtons = document.getElementById("seasonButtons");
  const patternButtons = document.getElementById("patternButtons");
  const feedback = document.getElementById("seasonFeedback");
  const matched = new Set();
  let selectedSeason = null;

  const data = [
    { season: "春季", pattern: "春季大三角", direction: "東方到南方", stars: "大角星、角宿一、五帝座一" },
    { season: "夏季", pattern: "夏季大三角", direction: "東方到天頂附近", stars: "織女星、牛郎星、天津四" },
    { season: "秋季", pattern: "秋季四邊形", direction: "東南方", stars: "室宿一、室宿二、壁宿一、壁宿二" },
    { season: "冬季", pattern: "冬季大三角", direction: "南方", stars: "參宿四、天狼星、南河三" },
  ];

  function render() {
    seasonButtons.innerHTML = "";
    patternButtons.innerHTML = "";

    data.forEach((item) => {
      const seasonButton = document.createElement("button");
      seasonButton.textContent = item.season;
      seasonButton.className = selectedSeason === item.season ? "is-selected" : "";
      seasonButton.addEventListener("click", () => {
        selectedSeason = item.season;
        feedback.textContent = `已選擇 ${item.season}，請找出對應星空圖案。`;
        feedback.className = "feedback-line";
        render();
      });
      seasonButtons.appendChild(seasonButton);

      const patternButton = document.createElement("button");
      patternButton.innerHTML = `<strong>${item.pattern}</strong><br><small>${item.direction}：${item.stars}</small>`;
      patternButton.disabled = matched.has(item.season);
      patternButton.addEventListener("click", () => {
        if (!selectedSeason) {
          feedback.textContent = "先選一個季節，再選星空圖案。";
          feedback.className = "feedback-line is-bad";
          return;
        }
        if (selectedSeason === item.season) {
          matched.add(item.season);
          feedback.textContent = `配對成功：${item.season}常見 ${item.pattern}，可朝${item.direction}尋找。`;
          feedback.className = "feedback-line is-good";
        } else {
          feedback.textContent = `${selectedSeason}不是 ${item.pattern} 的代表季節，再想想星座盤上的月份。`;
          feedback.className = "feedback-line is-bad";
        }
        selectedSeason = null;
        render();
      });
      patternButtons.appendChild(patternButton);
    });
  }

  render();
}

/* Planet classification game ---------------------------------------------- */
function setupPlanetGame() {
  const orbitBoard = document.getElementById("orbitBoard");
  const tokens = document.getElementById("planetTokens");
  const bins = document.getElementById("planetBins");
  const info = document.getElementById("planetInfo");
  let selectedPlanet = null;

  const planets = [
    { name: "水星", type: "rocky", color: "#b7b1a5", distance: 0.39, detail: "距離太陽最近，體積最小，表面溫差很大。" },
    { name: "金星", type: "rocky", color: "#f5c16c", distance: 0.72, detail: "厚重大氣造成強烈溫室效應，是表面最熱的行星。" },
    { name: "地球", type: "rocky", color: "#6ee7d8", distance: 1.0, detail: "目前已知唯一有生命的行星，有液態水與大氣層。" },
    { name: "火星", type: "rocky", color: "#ff8a7a", distance: 1.52, detail: "含氧化鐵的地表呈橘紅色，有太陽系最高火山。" },
    { name: "木星", type: "gas", color: "#e4b07d", distance: 5.2, detail: "太陽系最大行星，擁有明顯條紋與大紅斑。" },
    { name: "土星", type: "gas", color: "#f0d38a", distance: 9.58, detail: "以巨大明亮的環聞名，主要由氫與氦組成。" },
    { name: "天王星", type: "ice", color: "#8fe3da", distance: 19.2, detail: "冰巨行星，自轉軸傾斜很大，呈藍綠色。" },
    { name: "海王星", type: "ice", color: "#78b7ff", distance: 30.1, detail: "距離太陽最遠，藍色外觀與甲烷吸收紅光有關。" },
  ];

  const typeNames = {
    rocky: "岩石行星",
    gas: "氣體巨行星",
    ice: "冰巨行星",
  };

  function showInfo(planet) {
    selectedPlanet = planet.name;
    info.innerHTML = `
      <strong>${planet.name}｜${typeNames[planet.type]}</strong>
      <p>${planet.detail}</p>
      <p>平均距離太陽：約 ${planet.distance} AU。點擊分類箱或拖曳行星完成挑戰。</p>
    `;
    document.querySelectorAll(".planet-token").forEach((token) => {
      token.classList.toggle("is-selected", token.dataset.name === planet.name);
    });
  }

  function renderOrbitBoard() {
    orbitBoard.innerHTML = "";
    planets.forEach((_, index) => {
      const ring = document.createElement("span");
      ring.className = "orbit-ring";
      const size = 90 + index * 38;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      orbitBoard.appendChild(ring);
    });

    planets.forEach((planet, index) => {
      const button = document.createElement("button");
      button.className = "orbit-planet";
      button.dataset.index = index;
      button.style.background = planet.color;
      button.style.color = planet.color;
      button.title = planet.name;
      button.textContent = planet.name.slice(0, 1);
      button.addEventListener("click", () => showInfo(planet));
      orbitBoard.appendChild(button);
    });
  }

  function animateOrbits(time = 0) {
    const boardRect = orbitBoard.getBoundingClientRect();
    const centerX = boardRect.width * 0.48;
    const centerY = boardRect.height * 0.5;
    orbitBoard.querySelectorAll(".orbit-planet").forEach((button) => {
      const index = Number(button.dataset.index);
      const radius = 45 + index * 19;
      const speed = 0.00024 / (index + 1.4);
      const angle = time * speed + index * 0.72;
      const size = index < 4 ? 28 : index < 6 ? 40 : 34;
      button.style.width = `${size}px`;
      button.style.height = `${size}px`;
      button.style.left = `${centerX + Math.cos(angle) * radius - size / 2}px`;
      button.style.top = `${centerY + Math.sin(angle) * radius - size / 2}px`;
    });
    requestAnimationFrame(animateOrbits);
  }

  function renderTokensAndBins() {
    tokens.innerHTML = "";
    bins.innerHTML = "";

    planets.forEach((planet) => {
      const token = document.createElement("button");
      token.className = "planet-token";
      token.draggable = true;
      token.dataset.name = planet.name;
      token.style.borderColor = planet.color;
      token.textContent = planet.name;
      token.addEventListener("click", () => showInfo(planet));
      token.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", planet.name);
      });
      tokens.appendChild(token);
    });

    Object.entries(typeNames).forEach(([type, label]) => {
      const bin = document.createElement("section");
      bin.className = "planet-bin";
      bin.dataset.type = type;
      bin.innerHTML = `<span class="bin-title">${label}</span><small>${binHint(type)}</small>`;
      bin.addEventListener("dragover", (event) => {
        event.preventDefault();
        bin.classList.add("is-hover");
      });
      bin.addEventListener("dragleave", () => bin.classList.remove("is-hover"));
      bin.addEventListener("drop", (event) => {
        event.preventDefault();
        bin.classList.remove("is-hover");
        judgePlanet(event.dataTransfer.getData("text/plain"), type, bin);
      });
      bin.addEventListener("click", () => {
        if (selectedPlanet) judgePlanet(selectedPlanet, type, bin);
      });
      bins.appendChild(bin);
    });
  }

  function binHint(type) {
    if (type === "rocky") return "靠近太陽，表面多岩石";
    if (type === "gas") return "巨大，主要由氫與氦組成";
    return "遙遠寒冷，含水、氨、甲烷等冰物質";
  }

  function judgePlanet(name, type, bin) {
    const planet = planets.find((item) => item.name === name);
    if (!planet) return;
    if (planet.type === type) {
      const token = document.querySelector(`.planet-token[data-name="${name}"]`);
      if (token && !token.classList.contains("is-done")) {
        token.classList.add("is-done");
        token.draggable = false;
        const placed = document.createElement("span");
        placed.textContent = name;
        placed.style.color = planet.color;
        placed.style.fontWeight = "900";
        bin.appendChild(placed);
      }
      info.innerHTML = `<strong>分類正確：${name}</strong><p>${name}屬於${typeNames[type]}。${planet.detail}</p>`;
    } else {
      info.innerHTML = `<strong>再試一次：${name}</strong><p>${name}不是${typeNames[type]}。想想它距離太陽的位置與主要組成。</p>`;
    }
  }

  renderOrbitBoard();
  renderTokensAndBins();
  animateOrbits();
}

/* Module 5: pannable and zoomable sky map --------------------------------- */
function setupSkyExplorer() {
  const canvas = document.getElementById("skyCanvas");
  const ctx = canvas.getContext("2d");
  const info = document.getElementById("skyInfo");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const reset = document.getElementById("resetSky");
  let dpr = 1;
  let width = 0;
  let height = 0;
  const state = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0, moved: false };

  const stars = [
    { name: "北極星", constellation: "小熊座", x: 0, y: -210, mag: 2.0, temp: 6015, distance: 433, tip: "接近正北方，位置幾乎不動，可用來辨認方位。" },
    { name: "天狼星", constellation: "大犬座", x: -260, y: 145, mag: -1.46, temp: 9940, distance: 8.6, tip: "夜空最亮恆星，冬季容易在南方天空看到。" },
    { name: "織女星", constellation: "天琴座", x: 210, y: -110, mag: 0.03, temp: 9602, distance: 26, tip: "夏季大三角之一，顏色偏白。" },
    { name: "牛郎星", constellation: "天鷹座", x: 260, y: 80, mag: 0.76, temp: 7550, distance: 16.7, tip: "夏季大三角之一，位在銀河附近。" },
    { name: "天津四", constellation: "天鵝座", x: 90, y: -20, mag: 1.25, temp: 8525, distance: 2600, tip: "夏季大三角之一，是非常明亮的超巨星。" },
    { name: "參宿四", constellation: "獵戶座", x: -120, y: 75, mag: 0.5, temp: 3600, distance: 548, tip: "紅超巨星，顏色偏紅，代表低表面溫度。" },
    { name: "參宿七", constellation: "獵戶座", x: -70, y: 180, mag: 0.12, temp: 12100, distance: 860, tip: "藍超巨星，比太陽高溫且明亮許多。" },
    { name: "心宿二", constellation: "天蠍座", x: 330, y: 160, mag: 0.96, temp: 3400, distance: 550, tip: "紅色亮星，也被稱為大火。" },
    { name: "大角星", constellation: "牧夫座", x: -20, y: 45, mag: -0.04, temp: 4286, distance: 35, tip: "春季大三角的一員，呈橙色。" },
    { name: "角宿一", constellation: "室女座", x: 110, y: 160, mag: 0.91, temp: 22400, distance: 260, tip: "春季大三角的一員，實際上是雙星系統。" },
  ];

  const constellationLines = [
    ["織女星", "天津四"],
    ["天津四", "牛郎星"],
    ["牛郎星", "織女星"],
    ["參宿四", "參宿七"],
    ["大角星", "角宿一"],
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = Math.max(380, canvas.clientHeight || 420);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function worldToScreen(star) {
    return {
      x: width / 2 + state.x + star.x * state.scale,
      y: height / 2 + state.y + star.y * state.scale,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#061126");
    gradient.addColorStop(1, "#101b3f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 120; i += 1) {
      const x = (i * 97) % width;
      const y = (i * 53) % height;
      ctx.fillStyle = `rgba(255,255,255,${0.12 + (i % 7) * 0.04})`;
      ctx.beginPath();
      ctx.arc(x, y, (i % 3) * 0.3 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(110,231,216,0.26)";
    ctx.lineWidth = 1.2;
    constellationLines.forEach(([a, b]) => {
      const starA = stars.find((star) => star.name === a);
      const starB = stars.find((star) => star.name === b);
      const p1 = worldToScreen(starA);
      const p2 = worldToScreen(starB);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    stars.forEach((star) => {
      const point = worldToScreen(star);
      const radius = Math.max(3, 8 - star.mag * 1.2);
      const color = star.temp > 9000 ? "#cfe1ff" : star.temp < 4300 ? "#ff9378" : "#fff2bd";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(243,248,255,0.86)";
      ctx.font = "13px Microsoft JhengHei, sans-serif";
      ctx.fillText(star.name, point.x + radius + 5, point.y - radius);
    });
  }

  function findStar(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best = null;
    let bestDistance = Infinity;
    stars.forEach((star) => {
      const point = worldToScreen(star);
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < bestDistance) {
        best = star;
        bestDistance = distance;
      }
    });
    return bestDistance < 22 ? best : null;
  }

  function showStar(star) {
    info.innerHTML = `
      <strong>${star.name}｜${star.constellation}</strong>
      <p>視星等：${star.mag}；距離：約 ${formatNumber(star.distance, 1)} 光年；表面溫度：約 ${formatNumber(star.temp)} K。</p>
      <p>${star.tip}</p>
    `;
  }

  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.moved = false;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    if (Math.hypot(dx, dy) > 2) state.moved = true;
    state.x += dx;
    state.y += dy;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    draw();
  });

  canvas.addEventListener("pointerup", (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    state.dragging = false;
    if (!state.moved) {
      const star = findStar(event.clientX, event.clientY);
      if (star) showStar(star);
    }
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    state.scale = Math.max(0.45, Math.min(2.8, state.scale * factor));
    draw();
  }, { passive: false });

  zoomIn.addEventListener("click", () => {
    state.scale = Math.min(2.8, state.scale * 1.18);
    draw();
  });
  zoomOut.addEventListener("click", () => {
    state.scale = Math.max(0.45, state.scale / 1.18);
    draw();
  });
  reset.addEventListener("click", () => {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    draw();
  });

  window.addEventListener("resize", resize);
  resize();
}

/* Planisphere workshop -----------------------------------------------------
   This canvas behaves like a simplified star wheel. The time slider rotates
   the sky, while dragging a star lets learners create their own star chart. */
function setupPlanisphere() {
  const canvas = document.getElementById("planisphereCanvas");
  const ctx = canvas.getContext("2d");
  const monthSelect = document.getElementById("monthSelect");
  const timeSlider = document.getElementById("timeSlider");
  const timeValue = document.getElementById("timeValue");
  const directionSelect = document.getElementById("directionSelect");
  const resetButton = document.getElementById("resetPlanisphere");
  const hint = document.getElementById("planisphereHint");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dragging = null;

  const originalStars = [
    { id: "polaris", name: "北極星", x: 0, y: -0.58, season: "all" },
    { id: "arcturus", name: "大角星", x: -0.36, y: -0.12, season: "spring" },
    { id: "spica", name: "角宿一", x: -0.08, y: 0.25, season: "spring" },
    { id: "denebola", name: "五帝座一", x: -0.58, y: 0.18, season: "spring" },
    { id: "vega", name: "織女星", x: 0.2, y: -0.32, season: "summer" },
    { id: "altair", name: "牛郎星", x: 0.48, y: 0.18, season: "summer" },
    { id: "deneb", name: "天津四", x: 0.02, y: -0.02, season: "summer" },
    { id: "scheat", name: "室宿一", x: -0.28, y: -0.22, season: "autumn" },
    { id: "markab", name: "室宿二", x: -0.02, y: -0.2, season: "autumn" },
    { id: "alpheratz", name: "壁宿一", x: 0.0, y: 0.08, season: "autumn" },
    { id: "algenib", name: "壁宿二", x: -0.3, y: 0.06, season: "autumn" },
    { id: "betelgeuse", name: "參宿四", x: 0.12, y: 0.08, season: "winter" },
    { id: "sirius", name: "天狼星", x: 0.42, y: 0.4, season: "winter" },
    { id: "procyon", name: "南河三", x: -0.12, y: 0.38, season: "winter" },
  ];

  let stars = originalStars.map((star) => ({ ...star }));
  const patternLines = {
    spring: [["arcturus", "spica"], ["spica", "denebola"], ["denebola", "arcturus"]],
    summer: [["vega", "deneb"], ["deneb", "altair"], ["altair", "vega"]],
    autumn: [["scheat", "markab"], ["markab", "alpheratz"], ["alpheratz", "algenib"], ["algenib", "scheat"]],
    winter: [["betelgeuse", "sirius"], ["sirius", "procyon"], ["procyon", "betelgeuse"]],
  };

  const directionAngles = { north: 0, east: Math.PI / 2, south: Math.PI, west: Math.PI * 1.5 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = Math.max(380, canvas.clientHeight || 430);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function rotationAngle() {
    const hour = Number(timeSlider.value);
    return (hour - 21) * (Math.PI / 12) + directionAngles[directionSelect.value];
  }

  function starToScreen(star) {
    const angle = rotationAngle();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = star.x * cos - star.y * sin;
    const ry = star.x * sin + star.y * cos;
    const radiusX = width * 0.42;
    const radiusY = height * 0.34;
    return {
      x: width / 2 + rx * radiusX,
      y: height / 2 + ry * radiusY,
    };
  }

  function screenToStar(x, y) {
    const angle = -rotationAngle();
    const radiusX = width * 0.42;
    const radiusY = height * 0.34;
    const nx = (x - width / 2) / radiusX;
    const ny = (y - height / 2) / radiusY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: Math.max(-0.88, Math.min(0.88, nx * cos - ny * sin)),
      y: Math.max(-0.88, Math.min(0.88, nx * sin + ny * cos)),
    };
  }

  function draw() {
    const season = monthSelect.value;
    timeValue.textContent = `${String(Number(timeSlider.value) % 24).padStart(2, "0")}:00`;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#061126";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width * 0.14 * i, height * 0.11 * i, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,209,102,0.48)";
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * 0.44, height * 0.36, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.76)";
    ctx.font = "14px Microsoft JhengHei, sans-serif";
    ctx.fillText("北", width / 2 - 7, height * 0.1);
    ctx.fillText("南", width / 2 - 7, height * 0.92);
    ctx.fillText("東", width * 0.08, height / 2);
    ctx.fillText("西", width * 0.9, height / 2);
    ctx.fillText("天頂 90°", width / 2 + 16, height / 2 - 8);
    ctx.fillText("地平線 0°", width / 2 + width * 0.3, height / 2 + height * 0.3);

    ctx.strokeStyle = "rgba(110,231,216,0.74)";
    ctx.lineWidth = 2;
    (patternLines[season] || []).forEach(([a, b]) => {
      const starA = stars.find((star) => star.id === a);
      const starB = stars.find((star) => star.id === b);
      const p1 = starToScreen(starA);
      const p2 = starToScreen(starB);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    stars.forEach((star) => {
      const point = starToScreen(star);
      const isSeason = star.season === season || star.season === "all";
      const radius = star.id === "polaris" ? 6 : isSeason ? 5 : 3;
      const color = star.id === "polaris" ? "#ffd166" : isSeason ? "#a8f3bd" : "rgba(255,255,255,0.45)";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSeason ? 16 : 0;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = isSeason ? "#f3f8ff" : "rgba(243,248,255,0.56)";
      ctx.font = "13px Microsoft JhengHei, sans-serif";
      ctx.fillText(star.name, point.x + 8, point.y - 8);
    });
  }

  function findNearest(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let nearest = null;
    let distance = Infinity;
    stars.forEach((star, index) => {
      const point = starToScreen(star);
      const d = Math.hypot(point.x - x, point.y - y);
      if (d < distance) {
        distance = d;
        nearest = index;
      }
    });
    return distance < 22 ? { index: nearest, x, y } : null;
  }

  canvas.addEventListener("pointerdown", (event) => {
    const found = findNearest(event.clientX, event.clientY);
    if (found) {
      dragging = found.index;
      canvas.setPointerCapture(event.pointerId);
      hint.textContent = `正在移動 ${stars[dragging].name}。`;
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (dragging === null) return;
    const rect = canvas.getBoundingClientRect();
    const coords = screenToStar(event.clientX - rect.left, event.clientY - rect.top);
    stars[dragging].x = coords.x;
    stars[dragging].y = coords.y;
    draw();
  });

  canvas.addEventListener("pointerup", (event) => {
    if (dragging !== null) {
      hint.textContent = `${stars[dragging].name} 已移動。你可以比較它和原本星座骨架的關係。`;
    }
    dragging = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  });

  [monthSelect, timeSlider, directionSelect].forEach((control) => {
    control.addEventListener("input", draw);
    control.addEventListener("change", draw);
  });
  resetButton.addEventListener("click", () => {
    stars = originalStars.map((star) => ({ ...star }));
    hint.textContent = "星點已重置。調整時間可觀察星星由東往西移動的規律。";
    draw();
  });

  window.addEventListener("resize", resize);
  resize();
}

/* Module 6: quiz ----------------------------------------------------------- */
function setupQuiz() {
  const questionCounter = document.getElementById("questionCounter");
  const scoreText = document.getElementById("scoreText");
  const questionEl = document.getElementById("quizQuestion");
  const optionsEl = document.getElementById("quizOptions");
  const feedback = document.getElementById("quizFeedback");
  const nextButton = document.getElementById("nextQuestion");
  const badges = document.querySelectorAll("[data-badge]");
  let index = 0;
  let score = 0;
  let answered = false;

  const questions = [
    {
      q: "太陽為什麼被分類為恆星？",
      options: ["會自己發光發熱", "繞著地球運行", "表面一定是固體", "不會產生能量"],
      answer: 0,
      explain: "恆星的核心能進行核融合，因此能自己發光、發熱。",
    },
    {
      q: "行星和恆星最大的差異是什麼？",
      options: ["行星不會自己發光", "行星一定比恆星大", "行星不會移動", "行星都很熱"],
      answer: 0,
      explain: "行星主要反射恆星的光，並繞著恆星運行。",
    },
    {
      q: "星等數字越小，代表星星看起來如何？",
      options: ["越亮", "越暗", "越遠", "越冷"],
      answer: 0,
      explain: "視星等數字越小越亮；天狼星的星等甚至是負值。",
    },
    {
      q: "藍白色恆星和紅色恆星相比，通常代表什麼？",
      options: ["表面溫度較高", "表面溫度較低", "一定比較小", "一定是行星"],
      answer: 0,
      explain: "恆星顏色和表面溫度有關，藍白色通常比紅色更高溫。",
    },
    {
      q: "大質量恆星生命晚期可能發生什麼劇烈事件？",
      options: ["超新星爆發", "變成普通行星", "停止所有重力", "立刻變成月球"],
      answer: 0,
      explain: "大質量恆星核心塌縮後可能發生超新星，殘骸成為中子星或黑洞。",
    },
    {
      q: "在臺灣觀測北極星，它最接近哪個方位？",
      options: ["正北方", "正南方", "正東方", "正西方"],
      answer: 0,
      explain: "北極星非常接近正北方，因此可協助辨認方向。",
    },
    {
      q: "下列哪一組都是太陽系的冰巨行星？",
      options: ["天王星、海王星", "水星、金星", "地球、火星", "木星、土星"],
      answer: 0,
      explain: "天王星與海王星含有較多冰物質，分類為冰巨行星。",
    },
    {
      q: "為什麼不同季節夜晚看到的星座不完全相同？",
      options: ["地球公轉使夜晚面向宇宙方向改變", "星座每天都會解散", "星星只在冬天發光", "太陽系行星會擋住全部星星"],
      answer: 0,
      explain: "地球繞太陽公轉，夜晚面向的星空方向會隨季節改變。",
    },
  ];

  function renderQuestion() {
    answered = false;
    const item = questions[index];
    questionCounter.textContent = `第 ${index + 1} 題 / ${questions.length}`;
    scoreText.textContent = `分數 ${score} / ${questions.length}`;
    questionEl.textContent = item.q;
    feedback.textContent = "選擇答案後會立即顯示解析。";
    feedback.className = "feedback-line";
    nextButton.disabled = true;
    optionsEl.innerHTML = "";

    item.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.addEventListener("click", () => answer(optionIndex));
      optionsEl.appendChild(button);
    });
  }

  function answer(optionIndex) {
    if (answered) return;
    answered = true;
    const item = questions[index];
    const buttons = [...optionsEl.querySelectorAll("button")];
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === item.answer) button.classList.add("is-correct");
      if (buttonIndex === optionIndex && optionIndex !== item.answer) button.classList.add("is-wrong");
    });

    if (optionIndex === item.answer) {
      score += 1;
      feedback.textContent = `答對了。${item.explain}`;
      feedback.className = "feedback-line is-good";
    } else {
      feedback.textContent = `差一點。${item.explain}`;
      feedback.className = "feedback-line is-bad";
    }
    scoreText.textContent = `分數 ${score} / ${questions.length}`;
    updateBadges();
    nextButton.disabled = false;
  }

  function updateBadges() {
    badges.forEach((badge) => {
      const threshold = Number(badge.dataset.badge);
      badge.classList.toggle("is-earned", score >= threshold);
    });
  }

  nextButton.addEventListener("click", () => {
    if (index < questions.length - 1) {
      index += 1;
      renderQuestion();
    } else {
      questionEl.textContent = "測驗完成";
      optionsEl.innerHTML = "";
      feedback.textContent = `你的總分是 ${score} / ${questions.length}。回到上方模組再操作一次，可以把錯題概念補起來。`;
      feedback.className = score >= 6 ? "feedback-line is-good" : "feedback-line";
      nextButton.disabled = true;
      nextButton.innerHTML = '<i data-lucide="check"></i>完成';
      refreshIcons();
    }
  });

  renderQuestion();
}
