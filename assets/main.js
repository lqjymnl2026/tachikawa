/* ================================================================
   東京中神教会 — 交互脚本
================================================================ */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- 基础工具 ---------- */
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  /* ---------- 锚点平滑滚动 + 顶栏 ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      if (id && document.getElementById(id)) { e.preventDefault(); scrollTo(id); }
      closeMenu();
    });
  });
  $$("section[id]").forEach((s) => { s.style.scrollMarginTop = "78px"; });

  const header = $("#siteHeader");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
    const y = window.scrollY + 120;
    let cur = "home";
    $$("section[id]").forEach((s) => { if (s.offsetTop <= y) cur = s.id; });
    $$(".nav-link").forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + cur));
    $$(".bn-item").forEach((l) => l.classList.toggle("active", l.dataset.sec === cur));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动菜单 ---------- */
  const burger = $("#burger"), menu = $("#mobileMenu");
  function closeMenu() { burger.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); }
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
  });

  /* ---------- 预加载 ---------- */
  const pre = $("#preloader");
  const hidePre = () => pre.classList.add("done");
  window.addEventListener("load", () => setTimeout(hidePre, 650));
  setTimeout(hidePre, 2600);

  /* ---------- 楼群背景（运行时生成） ---------- */
  (function skyline() {
    const svg = $("#skyline");
    if (!svg) return;
    const W = 1440, H = 240, ground = H;
    const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    let d = "M0 240 ";
    let x = -8;
    let i = 0;
    while (x < W + 40) {
      const w = 34 + rnd(i) * 42;
      const h = 42 + rnd(i + 7) * 118;
      const top = ground - h;
      d += `V${top.toFixed(1)} h${w.toFixed(1)} V240 h${(14 + rnd(i + 13) * 26).toFixed(1)} `;
      if (rnd(i + 3) > 0.72) d += `M${(x + w * 0.5).toFixed(1)} ${top.toFixed(1)} v${(-10 - rnd(i + 5) * 18).toFixed(1)} `;
      x += w + 14 + rnd(i + 13) * 26;
      i++;
    }
    d += "V240 H1440 Z";
    svg.innerHTML = `<path d="${d}"/>`;
  })();

  /* ---------- 滚动显现 ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- 弹窗通用 ---------- */
  function openModal(m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeModal(m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); if (!$(".modal.open") && !$("#sixty").classList.contains("open")) document.body.style.overflow = ""; }
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(m); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { $$(".modal.open").forEach(closeModal); if (sixtyOpen) stopSixty(); }
  });

  /* ================================================================
     05/06｜60 秒安静体验
  ================================================================ */
  const sixty = $("#sixty"), sixtyStep = $("#sixtyStep");
  let sixtyTimers = [], sixtyOpen = false;
  const SIXTY = [
    { dur: 3, cls: "count", title: "60 秒", sub: "找一个舒服的姿势，把手机放在一旁。" },
    { dur: 11, cls: "orb", title: "深呼吸", sub: "跟着圆圈：吸气 4 秒，停 2 秒，慢慢呼气 6 秒。把注意力放回呼吸上。" },
    { dur: 10, cls: "quiet", title: "安静", sub: "什么都不做。让周围的声音进来，也让心里的声音出来。" },
    { dur: 12, cls: "think", title: "想一想这一周", sub: "这一周，有什么让你微笑的瞬间？又有什么让你疲惫的事？都让它浮现出来。" },
    { dur: 14, cls: "input", title: "感谢一件事情", sub: "在下面写下一件这周值得感谢的小事（也可以不写，心里想一想就好）。", placeholder: "例如：今天天气很好……" },
    { dur: 12, cls: "input", title: "把一件担心的事情交给上帝", sub: "把那件一直压着你的担心，写下来，然后交出去。", placeholder: "我担心的是……" },
    { dur: 0, cls: "end", title: "愿你得享安息。", verse: "凡劳苦担重担的人，可以到我这里来，我就使你们得安息。—— 马太福音 11:28" }
  ];
  const renderSixty = (i, countdown) => {
    const s = SIXTY[i];
    let html = "";
    if (s.dur) html += `<div class="sixty__count">${s.dur ? Math.max(1, Math.ceil(s.dur - countdown)) + "s" : ""}</div>`;
    if (s.cls === "orb") {
      html += `<div class="sixty__orb pulse"><svg class="ic"><use href="#i-leaf"/></svg></div>`;
    } else if (s.cls === "quiet") {
      html += `<div class="sixty__orb"><svg class="ic"><use href="#i-moon"/></svg></div>`;
    } else if (s.cls === "think") {
      html += `<div class="sixty__orb"><svg class="ic"><use href="#i-sparkle"/></svg></div>`;
    } else if (s.cls === "input") {
      html += `<input class="sixty__input" maxlength="80" placeholder="${s.placeholder || ""}" autocomplete="off">`;
    } else if (s.cls === "end") {
      html += `<div class="sixty__end">${s.title}</div>
        <div class="sixty__verse">${s.verse}</div>
        <div class="sixty__actions">
          <button class="btn btn--primary" data-go="again">再来一次</button>
          <button class="btn btn--ghost" data-go="verse">看信仰告白 →</button>
        </div>`;
    }
    if (s.title && s.cls !== "end") html += `<div class="sixty__title">${s.title}</div>`;
    if (s.sub && s.cls !== "end") html += `<div class="sixty__sub">${s.sub}</div>`;
    sixtyStep.innerHTML = html;
    const bg = $(".sixty__bg");
    bg.classList.toggle("warm", i === 5);
  };
  const runSixty = (i, elapsed) => {
    if (!sixtyOpen) return;
    const s = SIXTY[i];
    if (!s) { stopSixty(false); return; }
    if (s.dur === 0) { renderSixty(i, 0); return; }
    let t = 0;
    const tick = () => {
      if (!sixtyOpen) return;
      renderSixty(i, t);
      t += 0.5;
      if (t >= s.dur) runSixty(i + 1, 0);
    };
    tick();
    sixtyTimers.push(setInterval(tick, 500));
  };
  function startSixty() {
    if (audio.playing) stopMusic();
    sixtyOpen = true;
    sixty.classList.add("open");
    sixty.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    runSixty(0, 0);
  }
  function stopSixty(clean = true) {
    sixtyOpen = false;
    sixtyTimers.forEach(clearInterval); sixtyTimers = [];
    sixty.classList.remove("open");
    sixty.setAttribute("aria-hidden", "true");
    if (clean && !$(".modal.open")) document.body.style.overflow = "";
    if (!$(".modal.open") && !sixty.classList.contains("open")) document.body.style.overflow = "";
  }
  $("#sixtySkip").addEventListener("click", () => stopSixty());
  sixtyStep.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    if (b.dataset.go === "again") { stopSixty(false); startSixty(); }
    else { stopSixty(); scrollTo("creeds"); }
  });
  $("#quietStart").addEventListener("click", startSixty);


  /* ================================================================
     赞美诗轻音乐播放器（WebAudio 合成）
  ================================================================ */
  const MUSIC = [
    { name: "奇异恩典", bpm: 80, notes: [
      [72,1],[76,.5],[77,.5],[79,1],[76,.5],[74,.5],[72,1],[69,1.5],
      [72,1],[76,.5],[77,.5],[79,1],[76,1],[74,1],[72,1.5],
      [72,1],[76,.5],[77,.5],[79,1],[81,1],[79,1],[77,.5],[76,.5],[74,1],[72,1],[74,1],
      [76,1],[72,.5],[74,.5],[76,1],[72,2]
    ] },
    { name: "平安夜", bpm: 78, notes: [
      [67,1],[69,1],[67,1],[64,1.5],
      [67,1],[69,1],[67,1],[64,1.5],
      [74,1],[74,1],[71,1],[72,1.5],
      [67,1],[72,1],[76,1],[74,1.5],
      [77,1],[76,1],[74,1],[72,1],[74,1],[76,1],
      [69,1],[67,1],[64,1],[67,2]
    ] }
  ];
  const musicEl = $("#music"), musicCard = $("#musicCard"), musicFab = $("#musicFab");
  const musicPlay = $("#musicPlay"), musicNow = $("#musicNow"), musicMute = $("#musicMute");
  const musicTracks = $("#musicTracks");
  const audio = { ctx: null, playing: false, track: 0, vol: 0.6, endTimer: null, muted: false };

  function ensureAudio() {
    if (!audio.ctx) audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }
  function pianoNote(ctx, midi, t, dur, gain) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = "triangle"; o.frequency.value = f;
    o2.type = "sine"; o2.frequency.value = f * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.92);
    const o2g = ctx.createGain(); o2g.gain.value = 0.3;
    o2.connect(o2g); o2g.connect(g); o.connect(g); g.connect(ctx.destination);
    o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
  }
  function scheduleTrack(ctx, trackIdx) {
    const tr = MUSIC[trackIdx];
    const beat = 60 / tr.bpm;
    let t = ctx.currentTime + 0.08;
    tr.notes.forEach(([midi, d]) => {
      pianoNote(ctx, midi, t, d * beat * 1.05, audio.vol * 0.5);
      pianoNote(ctx, midi - 12, t, d * beat * 1.2, audio.vol * 0.16); // 低八度柔伴
      t += d * beat;
    });
    const total = t - ctx.currentTime + 0.6;
    clearTimeout(audio.endTimer);
    audio.endTimer = setTimeout(() => { if (audio.playing) stopMusic(); }, total * 1000);
  }
  function playMusic() {
    const ctx = ensureAudio();
    audio.playing = true;
    musicPlay.textContent = "⏸";
    musicNow.textContent = MUSIC[audio.track].name;
    scheduleTrack(ctx, audio.track);
    renderTracks();
  }
  function stopMusic() {
    audio.playing = false;
    clearTimeout(audio.endTimer);
    musicPlay.textContent = "▶";
    renderTracks();
  }
  function togglePlay() {
    if (audio.playing) { stopMusic(); return; }
    playMusic();
  }
  function renderTracks() {
    musicTracks.innerHTML = MUSIC.map((tr, i) =>
      `<button class="music__track" data-i="${i}">${tr.name}<span class="music__track-state">${audio.playing && i === audio.track ? "播放中" : ""}</span></button>`).join("");
  }
  function paintMute() { musicMute.textContent = audio.muted ? "🔇" : "🔊"; }
  function setMuted(v) {
    audio.muted = v;
    audio.vol = v ? 0 : 0.6;
    paintMute();
  }
  musicFab.addEventListener("click", () => {
    const open = musicCard.hidden;
    musicCard.hidden = !open;
    musicFab.setAttribute("aria-expanded", open);
    if (open) renderTracks();
  });
  musicCard.addEventListener("click", (e) => {
    const close = e.target.closest("#musicClose");
    if (close) { musicCard.hidden = true; musicFab.setAttribute("aria-expanded", "false"); }
    const track = e.target.closest(".music__track");
    if (track) {
      audio.track = +track.dataset.i;
      stopMusic(); playMusic(); renderTracks();
    }
  });
  musicPlay.addEventListener("click", togglePlay);
  musicMute.addEventListener("click", () => setMuted(!audio.muted));
  renderTracks();

})();