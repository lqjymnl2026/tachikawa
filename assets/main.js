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
     背景赞美诗轻音乐：升级版钢琴音色 · 每 10 分钟 1 次
  ================================================================ */
  const BG_NOTES = [
    // —— 奇异恩典 ——
    [72,1],[76,.5],[77,.5],[79,1],[76,.5],[74,.5],[72,1],[69,1.5],
    [72,1],[76,.5],[77,.5],[79,1],[76,1],[74,1],[72,1.5],
    [72,1],[76,.5],[77,.5],[79,1],[81,1],[79,1],[77,.5],[76,.5],[74,1],[72,1],[74,1],
    [76,1],[72,.5],[74,.5],[76,1],[72,2],
    [72,1],[76,.5],[77,.5],[79,1],[76,.5],[74,.5],[72,1],[69,1.5],
    [72,1],[76,.5],[77,.5],[79,1],[76,1],[74,1],[72,1.5],
    [72,1],[76,.5],[77,.5],[79,1],[81,1],[79,1],[77,.5],[76,.5],[74,1],[72,1],[74,1],
    [76,1],[72,.5],[74,.5],[76,1],[72,2],
    [0,1],
    // —— 平安夜 ——
    [67,1],[69,1],[67,1],[64,1.5],
    [67,1],[69,1],[67,1],[64,1.5],
    [74,1],[74,1],[71,1],[72,1.5],
    [67,1],[72,1],[76,1],[74,1.5],
    [77,1],[76,1],[74,1],[72,1],[74,1],[76,1],
    [69,1],[67,1],[64,1],[67,2],
    [0,1],
    // —— 奇异恩典 · 结尾 ——
    [72,1],[76,.5],[77,.5],[79,1],[76,.5],[74,.5],[72,1],[69,1.5],
    [76,1],[72,.5],[74,.5],[76,1],[72,3]
  ];
  const bg = { ctx: null, d1: null, d2: null, timer: null, playing: false, unlocked: false };

  function ensureBg() {
    if (!bg.ctx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      bg.ctx = ctx;
      // 双延时混响（更绵长温暖）
      const d1 = ctx.createDelay(1); d1.delayTime.value = 0.3;
      const d2 = ctx.createDelay(1); d2.delayTime.value = 0.52;
      const fb = ctx.createGain(); fb.gain.value = 0.34;
      const rlp = ctx.createBiquadFilter(); rlp.type = "lowpass"; rlp.frequency.value = 1900; rlp.Q.value = 0.4;
      d1.connect(rlp); d2.connect(rlp); rlp.connect(fb); fb.connect(d1); fb.connect(d2);
      rlp.connect(ctx.destination);
      bg.d1 = d1; bg.d2 = d2;
    }
    if (bg.ctx.state === "suspended") bg.ctx.resume();
    return bg.ctx;
  }
  // 钢琴音色：多泛音 + 逐音低通 + 柔和力度包络
  function piano(ctx, midi, t, dur, vel) {
    if (!midi) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);
    const p = ctx.createBiquadFilter(); p.type = "lowpass"; p.frequency.value = Math.min(7500, f * 5); p.Q.value = 0.35;
    [[1, 1], [2, 0.32], [3, 0.14], [4, 0.05]].forEach(([h, amp]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * h;
      const og = ctx.createGain(); og.gain.value = amp;
      o.connect(og); og.connect(p); o.start(t); o.stop(t + dur * 0.85);
    });
    p.connect(g);
    g.connect(ctx.destination);
    if (bg.d1) { const s = ctx.createGain(); s.gain.value = 0.42; g.connect(s); s.connect(bg.d1); s.connect(bg.d2); }
  }
  // 柔和和弦垫底
  function pad(ctx, midis, t, dur, vel) {
    midis.forEach((mm) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 440 * Math.pow(2, (mm - 69) / 12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vel, t + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      if (bg.d1) { const s = ctx.createGain(); s.gain.value = 0.6; g.connect(s); s.connect(bg.d1); s.connect(bg.d2); }
      o.start(t); o.stop(t + dur);
    });
  }
  function playBgOnce() {
    const ctx = ensureBg();
    if (bg.playing) return;
    if (document.getElementById("sixty").classList.contains("open")) return;
    bg.playing = true;
    const bpm = 52, beat = 60 / bpm;
    let t = ctx.currentTime + 0.3;
    pad(ctx, [48, 52, 55], t, beat * 3, 0.05);
    t += beat * 2;
    BG_NOTES.forEach(([midi, d]) => {
      piano(ctx, midi, t, d * beat * 1.05, 0.34);
      if (midi) {
        piano(ctx, midi - 12, t, d * beat * 1.25, 0.08);
        piano(ctx, midi + 7, t, d * beat * 0.9, 0.03);
      }
      t += d * beat;
    });
    pad(ctx, [48, 52, 55, 60], t, beat * 5, 0.06);
    const total = (t - ctx.currentTime) * 1000 + 7000;
    clearTimeout(bg.timer);
    bg.timer = setTimeout(() => { bg.playing = false; }, total);
  }
  function unlockBg() {
    if (bg.unlocked) return;
    bg.unlocked = true;
    playBgOnce();
    setInterval(playBgOnce, 10 * 60 * 1000);
  }
  ["pointerdown", "touchstart", "keydown"].forEach((ev) => document.addEventListener(ev, unlockBg));

})();