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
     07｜探索
  ================================================================ */
  const TOPICS = {
    suffering: {
      tag: "人生 · 痛苦", title: "为什么人会痛苦？",
      verse: "神要擦去他们一切的眼泪；不再有死亡，也不再有悲哀、哭号、疼痛，因为以前的事都过去了。—— 启示录 21:4",
      body: "痛苦不是一个「好答案」能解决的问题，但圣经从不回避它：上帝看见眼泪，也进入过眼泪。耶稣自己也曾哭过。痛苦不是被上帝遗忘的证明，而恰恰是祂愿意靠近的地方。",
      ask: "聊聊吧：如果你可以向上帝问一个关于苦难的问题，你会问什么？"
    },
    meaning: {
      tag: "人生 · 意义", title: "人活着到底为了什么？",
      verse: "这些事都已听见了，总意就是敬畏神，谨守他的诫命，这是人所当尽的本分。—— 传道书 12:13",
      body: "在末班电车和加不完的班之间，我们偶尔会问自己：这样活着，到底为了什么？圣经说，人被造不是为了「有用」，而是为了「有关系」——与上帝、与人、与这个世界，有真实的关系。",
      ask: "聊聊吧：你上一次感到「活着真好」，是什么时候？"
    },
    bible: {
      tag: "圣经", title: "为什么要相信圣经？",
      verse: "圣经都是神所默示的，于教训、督责、使人归正、教导人学义都是有益的。—— 提摩太后书 3:16",
      body: "圣经不是一本「成功学」，而是一本关于人的真实记录：有软弱、有失败、也有救赎。几千年来，无数人在其中找到方向和力量。你不必先「相信」再读它——可以先读，再决定。",
      ask: "聊聊吧：如果圣经真的记录了上帝的话，你最想先读哪一卷？"
    },
    return: {
      tag: "耶稣 · 再来", title: "耶稣真的会再来吗？",
      verse: "我若去为你们预备了地方，就必再来接你们到我那里去；我在哪里，叫你们也在那里。—— 约翰福音 14:3",
      body: "这不是遥远的传说，而是我们真实盼望的事。圣经说，耶稣会再来，把眼泪、死亡和分离彻底终结。所以「末世」对我们不是恐惧，而是「故事还没有结束」的确定。",
      ask: "聊聊吧：如果明天耶稣就来，你今天最想做什么？"
    },
    death: {
      tag: "信仰 · 死亡", title: "死亡以后会发生什么？",
      verse: "复活在我，生命也在我；信我的人虽然死了，也必复活。—— 约翰福音 11:25",
      body: "面对告别，我们其实都想知道答案。圣经给的答案不是「灵魂不朽」的安慰，而是「复活」的盼望：死亡不是终点，而是被吞灭的仇敌。那些在主里睡了的人，会在耶稣再来时醒来。",
      ask: "聊聊吧：如果有一个人你很想再见一面，你会是谁？"
    },
    "why-god": {
      tag: "信仰 · 苦难", title: "为什么上帝允许苦难？",
      verse: "我们晓得万事都互相效力，叫爱神的人得益处。—— 罗马书 8:28",
      body: "这是最难的问题，没有轻飘飘的答案。但我们相信：上帝没有站在苦难「外面」观看——祂在十字架上亲身进入了苦难。祂没有应许天色常蓝，却应许与我们同在，并把苦难变成成长与靠近祂的机会。",
      ask: "聊聊吧：你愿意带着这个问题，和我们一起慢慢寻找答案吗？"
    }
  };
  const topicModal = $("#topicModal"), topicBody = $("#topicBody");
  $$(".explore-card").forEach((card) => {
    card.addEventListener("click", () => {
      const t = TOPICS[card.dataset.topic];
      if (!t) return;
      topicBody.innerHTML = `
        <span class="topic__tag">${t.tag}</span>
        <h3>${t.title}</h3>
        <div class="topic__verse">${t.verse}</div>
        <p>${t.body}</p>
        <div class="topic__ask"><b>💬 讨论时间</b>${t.ask}</div>
        <div class="topic__actions">
          <button class="btn btn--primary" data-go="contact">微信联系我们</button>
          <button class="btn btn--ghost" data-go="contact">看看联系方式</button>
        </div>`;
      openModal(topicModal);
    });
  });
  topicBody.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { closeModal(topicModal); scrollTo(b.dataset.go); }
  });

  /* 探索筛选 */
  $$("#exploreChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#exploreChips .chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      $$(".explore-card").forEach((c) => {
        const show = f === "all" || c.dataset.cat === f;
        c.classList.toggle("hide", !show);
        if (show && !c.classList.contains("in")) { c.classList.add("in"); }
      });
    });
  });


})();