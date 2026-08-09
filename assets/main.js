/* ================================================================
   立川华人教会 — 交互脚本
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

  /* ================================================================
     02｜一小时选择
  ================================================================ */
  const HOURS = {
    coffee: {
      emoji: "☕", title: "和朋友聊聊天",
      text: "真正的朋友，是能坐下来慢慢说话的人。在东京，这样的时间很难得，也很珍贵。我们每周都有 Coffee Talk——一杯咖啡，一段真心话。",
      verse: "朋友乃时常亲爱，弟兄为患难而生。—— 箴言 17:17",
      actions: [{ label: "看看 Coffee Talk", id: "youth" }, { label: "找到我的小组", id: "groups", primary: true }]
    },
    park: {
      emoji: "🌿", title: "去公园走走",
      text: "有时候，我们需要的不是更多答案，而是停下来，看一看天空。风、树、光和一只路过的鸟，都在说话。",
      verse: "诸天述说神的荣耀，穹苍传扬他的手段。—— 诗篇 19:1",
      actions: [{ label: "今天出去走走", id: "health", primary: true }, { label: "加入户外活动", id: "youth" }]
    },
    book: {
      emoji: "📖", title: "读一本书",
      text: "翻开一页，世界就安静下来。读圣经也是读书——一本改变了无数人生命的书，也许也会改变你。",
      verse: "你的话是我脚前的灯，是我路上的光。—— 诗篇 119:105",
      actions: [{ label: "看看圣经探索", id: "explore", primary: true }, { label: "加入 Bible Night", id: "youth" }]
    },
    quiet: {
      emoji: "🙏", title: "安静一下",
      text: "在安静里，我们听见自己，也听见上帝。有时候，停下来，就是最好的前进。",
      verse: "你们要休息，要知道我是神。—— 诗篇 46:10",
      actions: [{ label: "给自己 60 秒", id: "__sixty", primary: true }, { label: "了解安静时光", id: "quiet" }]
    },
    family: {
      emoji: "👨‍👩‍👧", title: "陪陪家人",
      text: "有些陪伴，错过了就很难补回来。我们相信，家是信仰开始的地方。",
      verse: "你们作父亲的，不要惹儿女的气，只要照着主的教训和警戒养育他们。—— 以弗所书 6:4",
      actions: [{ label: "看看家庭小组", id: "family", primary: true }, { label: "7 天健康挑战", id: "health" }]
    }
  };
  const hourModal = $("#hourModal"), hourResult = $("#hourResult");
  $$(".hour-card").forEach((card) => {
    card.addEventListener("click", () => {
      const h = HOURS[card.dataset.hour];
      if (!h) return;
      hourResult.innerHTML = `
        <div class="hour-result__emoji">${h.emoji}</div>
        <h3>${h.title}</h3>
        <p class="hr-text">${h.text}</p>
        <div class="hr-verse">${h.verse}</div>
        <div class="hr-actions">${h.actions.map((a) =>
          `<button class="btn ${a.primary ? "btn--primary" : "btn--ghost"}" data-go="${a.id}">${a.label}</button>`).join("")}</div>`;
      openModal(hourModal);
    });
  });
  hourResult.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    closeModal(hourModal);
    if (b.dataset.go === "__sixty") startSixty();
    else scrollTo(b.dataset.go);
  });

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
     04｜小组测验
  ================================================================ */
  const QUIZ = [
    { q: "你现在的状态？", opts: ["学生", "工作", "家庭", "正在寻找方向"], score: { 学生: { student: 2, youth: 1 }, 工作: { work: 2 }, 家庭: { family: 3 }, 正在寻找方向: { student: 1, work: 1 } } },
    { q: "你更喜欢？", opts: ["聊天", "读圣经", "户外", "一起吃饭"], score: { 聊天: { youth: 2 }, 读圣经: { work: 1, youth: 1 }, 户外: { youth: 2, student: 1 }, 一起吃饭: { student: 2, youth: 1 } } },
    { q: "你来到教会是因为？", opts: ["想认识耶稣", "想认识朋友", "想寻找人生方向", "想让家庭更好"], score: { 想认识耶稣: { work: 1, youth: 1 }, 想认识朋友: { youth: 2, student: 1 }, 想寻找人生方向: { student: 1, work: 1 }, 想让家庭更好: { family: 3 } } },
    { q: "你希望多久参加一次？", opts: ["每周一次", "偶尔", "先试试看", "有空就来"], score: { 每周一次: { youth: 1 }, 偶尔: { work: 1 }, 先试试看: { student: 1 }, 有空就来: { youth: 1 } } },
    { q: "你希望收获什么？", opts: ["一群朋友", "人生的意义", "心里的安稳", "更好的自己"], score: { 一群朋友: { youth: 2 }, 人生的意义: { work: 2 }, 心里的安稳: { family: 1, student: 1 }, 更好的自己: { youth: 1, work: 1 } } }
  ];
  const RESULT = {
    youth: {
      name: "立川青年小组", time: "每周五 · 一起吃饭、聊天、读圣经", icon: "i-coffee",
      desc: "看起来你很在意真实的联结——有人能说话、能一起吃饭、能一起成长。青年小组就是这样一个小而暖的地方：没有压力，做你自己就好。",
      cta: "第一次参加"
    },
    work: {
      name: "立川职场小组", time: "每月两次 · 周六上午", icon: "i-briefcase",
      desc: "你正在认真生活，也在认真寻找意义。职场小组聚集了一群同样在工作与信仰之间探索的人：聊聊压力、方向，也一起读圣经。",
      cta: "第一次参加"
    },
    family: {
      name: "立川家庭小组", time: "每月一次 · 家庭聚餐", icon: "i-home",
      desc: "你把家放在心上。家庭小组是给夫妻和父母的地方：一起学习怎么爱、怎么教、怎么在忙碌里守住家。欢迎带孩子一起来。",
      cta: "第一次参加"
    },
    student: {
      name: "立川留学生小组", time: "每周六 · 中文 + 日语欢迎", icon: "i-globe",
      desc: "刚来到东京，或者正在找方向——不用一个人扛。留学生小组里有同样在适应新生活的人，也有已经走过这段路的人。",
      cta: "第一次参加"
    }
  };
  const quizIntro = $("#quizIntro"), quizBox = $("#quizBox"), quizResult = $("#quizResult");
  const qQ = $("#quizQ"), qOpts = $("#quizOpts"), qStep = $("#quizStep"), qBar = $("#quizBar"), qBack = $("#quizBack");
  let qIdx = 0, qAns = [];
  const startQuiz = () => {
    qIdx = 0; qAns = [];
    quizIntro.hidden = true; quizResult.hidden = true; quizBox.hidden = false;
    quizBox.classList.add("in");
    renderQ();
    scrollTo("quiz");
  };
  const renderQ = () => {
    const item = QUIZ[qIdx];
    qStep.textContent = `${qIdx + 1} / ${QUIZ.length}`;
    qBar.style.width = `${((qIdx) / QUIZ.length) * 100}%`;
    qQ.textContent = item.q;
    qBack.hidden = qIdx === 0;
    qOpts.innerHTML = item.opts.map((o) => `<button class="quiz__opt">${o}</button>`).join("");
    $$(".quiz__opt", qOpts).forEach((b) => {
      b.addEventListener("click", () => {
        $$(".quiz__opt", qOpts).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        setTimeout(() => { qAns[qIdx] = b.textContent; qIdx++; if (qIdx < QUIZ.length) renderQ(); else showResult(); }, 260);
      });
    });
  };
  qBack.addEventListener("click", () => { if (qIdx > 0) { qIdx--; renderQ(); } });
  $("#quizStart").addEventListener("click", startQuiz);
  $("#quizClose").addEventListener("click", () => { quizBox.hidden = true; quizIntro.hidden = false; });
  const showResult = () => {
    const scores = { youth: 0, work: 0, family: 0, student: 0 };
    qAns.forEach((a, i) => {
      const sc = QUIZ[i].score[a];
      if (sc) Object.entries(sc).forEach(([k, v]) => { scores[k] += v; });
    });
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const r = RESULT[top];
    quizBox.hidden = true; quizResult.hidden = false;
    quizResult.innerHTML = `
      <span class="qr-badge">我们觉得你可能会喜欢</span>
      <h3>${r.name}</h3>
      <span class="qr-time"><svg class="ic ic--xs"><use href="assets/icons.svg#i-clock"/></svg> ${r.time}</span>
      <p>${r.desc}</p>
      <button class="btn btn--primary" data-go="prayer">${r.cta} →</button>
      <button class="btn btn--ghost" data-go="groups">再看看其他小组</button>`;
    qBar.style.width = "100%";
    quizResult.classList.add("in");
    scrollTo("quiz");
  };
  quizResult.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) scrollTo(b.dataset.go);
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
      html += `<div class="sixty__orb pulse"><svg class="ic"><use href="assets/icons.svg#i-leaf"/></svg></div>`;
    } else if (s.cls === "quiet") {
      html += `<div class="sixty__orb"><svg class="ic"><use href="assets/icons.svg#i-moon"/></svg></div>`;
    } else if (s.cls === "think") {
      html += `<div class="sixty__orb"><svg class="ic"><use href="assets/icons.svg#i-sparkle"/></svg></div>`;
    } else if (s.cls === "input") {
      html += `<input class="sixty__input" maxlength="80" placeholder="${s.placeholder || ""}" autocomplete="off">`;
    } else if (s.cls === "end") {
      html += `<div class="sixty__end">${s.title}</div>
        <div class="sixty__verse">${s.verse}</div>
        <div class="sixty__actions">
          <button class="btn btn--primary" data-go="again">再来一次</button>
          <button class="btn btn--ghost" data-go="verse">今日经文 →</button>
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
    closeModal(hourModal);
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
    else { stopSixty(); scrollTo("explore"); }
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
          <button class="btn btn--primary" data-go="prayer">和我聊聊</button>
          <button class="btn btn--ghost" data-go="groups">看看小组</button>
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

  /* ---------- 儿童世界 ---------- */
  $("#kidsBtn").addEventListener("click", () => {
    topicBody.innerHTML = `
      <span class="topic__tag">生活 · 儿童</span>
      <h3>欢迎来到儿童世界 👋</h3>
      <div class="topic__verse">教养孩童，使他走当行的道，就是到老他也不偏离。—— 箴言 22:6</div>
      <p>在立川，我们有给孩子的故事时间、圣经动画、亲子灵修和家庭活动。孩子们在这里被爱、被听见，也在歌声和故事里认识那位爱他们的上帝。</p>
      <div class="topic__ask"><b>💛 给爸爸妈妈</b>欢迎带孩子一起来！第一次来也没关系，我们慢慢来。</div>
      <div class="topic__actions">
        <button class="btn btn--primary" data-go="prayer">带孩子来聊聊</button>
        <button class="btn btn--ghost" data-go="family">看看家庭小组</button>
      </div>`;
    openModal(topicModal);
  });

  /* ================================================================
     08｜健康挑战
  ================================================================ */
  const chalKey = "tcc_challenge_v1";
  let chalDone = store.get(chalKey, []);
  const chalNum = $("#chalNum"), chalBar = $("#chalBar");
  const paintChal = () => {
    $$("#chalDays .day").forEach((d) => d.classList.toggle("done", chalDone.includes(d.dataset.day)));
    chalNum.textContent = `${chalDone.length} / 7`;
    chalBar.style.width = `${(chalDone.length / 7) * 100}%`;
    store.set(chalKey, chalDone);
  };
  $$("#chalDays .day").forEach((d) => {
    d.addEventListener("click", () => {
      const k = d.dataset.day;
      chalDone = chalDone.includes(k) ? chalDone.filter((x) => x !== k) : [...chalDone, k];
      paintChal();
    });
  });
  $("#chalReset").addEventListener("click", () => { chalDone = []; paintChal(); });
  paintChal();

  /* ================================================================
     12｜祷告墙
  ================================================================ */
  const prayKey = "tcc_prayers_v1";
  const seeds = [
    { name: "匿名", text: "最近工作压力很大，晚上总是睡不着。", count: 3, date: "3 小时前" },
    { name: "一位妈妈", text: "为孩子的高中考试祷告，希望他能平安顺利。", count: 5, date: "昨天" },
    { name: "小林", text: "刚来东京三个月，有点孤单，求主给我勇气去认识新朋友。", count: 2, date: "2 天前" }
  ];
  let prayers = store.get(prayKey, seeds);
  const prayerList = $("#prayerList");
  const paintPrayers = () => {
    prayerList.innerHTML = prayers.map((p, i) => `
      <div class="prayer-item">
        <div class="prayer-item__top">
          <span class="prayer-item__name">${p.name || "匿名"}</span>
          <span class="prayer-item__date">${p.date || "刚刚"}</span>
        </div>
        <p class="prayer-item__text">${esc(p.text)}</p>
        <div class="prayer-item__foot">
          <span class="prayer-item__praying">❤️ ${p.count} 人愿意为你祷告</span>
          <button class="prayer-item__btn" data-i="${i}">我也愿意祷告</button>
        </div>
      </div>`).join("");
    store.set(prayKey, prayers);
  };
  prayerList.addEventListener("click", (e) => {
    const b = e.target.closest(".prayer-item__btn");
    if (!b) return;
    prayers[+b.dataset.i].count += 1;
    paintPrayers();
    b.textContent = "❤️ 已记在心上";
    b.style.pointerEvents = "none";
  });
  $("#prayerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const text = f.text.value.trim();
    if (!text) return;
    prayers.unshift({ name: f.name.value.trim() || "匿名", text, count: 1, date: "刚刚" });
    f.reset();
    paintPrayers();
    const note = $("#prayerNote");
    note.hidden = false;
    setTimeout(() => { note.hidden = true; }, 4200);
  });
  paintPrayers();
})();
