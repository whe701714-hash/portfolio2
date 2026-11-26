import {folders,projects,experiments,asset} from './content.js';

const select = selector => document.querySelector(selector);
const selectAll = selector => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const work = select('#work-content');
const categories = select('.categories');
const folderBar = select('.folders');
const viewer = select('#viewer');
const note = select('.desk-note');
const desk = select('.desk');
const pinboard = select('.pinboard');
const introTiming = {duration: 620, nav: 0, identity: 120, ticket: 210, record: 310, folder: 400, pixel: 500, terminal: 610, signature: 760, total: 1700};
let folder = folders[0].id;
let category = projects[0].category;
let returnFocus;
let viewerItems = [];
let viewerIndex = 0;
let nextObjectZ = 20;

function makeButton(text, handler) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.addEventListener('click', handler);
  return element;
}

function animateIntro() {
  const isRoot = !location.hash || location.hash === '#top';
  const shouldAnimate = isRoot && !sessionStorage.getItem('design-notes-intro') && !reducedMotion;
  if (!shouldAnimate) {
    document.documentElement.classList.remove('intro-pending');
    document.body.classList.add('intro-ready');
    return;
  }
  Object.entries(introTiming).forEach(([name, value]) => document.documentElement.style.setProperty('--intro-' + name, `${value}ms`));
  document.body.classList.add('is-intro');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.remove('intro-pending');
    document.body.classList.add('intro-ready');
  }));
  setTimeout(() => {
    document.body.classList.remove('is-intro');
    sessionStorage.setItem('design-notes-intro', '1');
  }, introTiming.total);
}

function revealSections() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, {threshold: .15});
  selectAll('.about, .work, .play').forEach(section => observer.observe(section));
}

function markNavigation() {
  const links = selectAll('.bar nav a');
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => link.toggleAttribute('aria-current', link.hash === '#' + visible.target.id));
  }, {rootMargin: '-22% 0px -62%', threshold: [0, .1, .4]});
  selectAll('main section[id]').forEach(section => observer.observe(section));
  window.addEventListener('hashchange', () => links.forEach(link => link.toggleAttribute('aria-current', link.hash === location.hash)));
}

function scrollToSection(id) {
  const target = select(id);
  if (!target) return;
  target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  history.pushState(null, '', id);
}

function alignInitialAnchor() {
  if (!['#about', '#work', '#playground'].includes(location.hash)) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelector(location.hash)?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  }));
}

function attachDrag(element, boundsElement, onTap) {
  let start = null;
  let offset = {x: 0, y: 0};
  let moved = false;
  const threshold = 7;
  const setOffset = () => {
    element.style.setProperty('--drag-x', `${offset.x}px`);
    element.style.setProperty('--drag-y', `${offset.y}px`);
  };
  const clampOffset = (x, y) => {
    const bounds = boundsElement.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const margin = 12;
    return {
      x: Math.min(Math.max(x, margin - (rect.left - bounds.left) + offset.x), bounds.width - margin - (rect.right - bounds.left) + offset.x),
      y: Math.min(Math.max(y, margin - (rect.top - bounds.top) + offset.y), bounds.height - margin - (rect.bottom - bounds.top) + offset.y)
    };
  };
  element.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest('input, button:not(.print):not(.folder):not(.record):not(.ticket):not(.pixel)')) return;
    start = {x: event.clientX, y: event.clientY, offset: {...offset}};
    moved = false;
    element.style.zIndex = String(++nextObjectZ);
    element.setPointerCapture?.(event.pointerId);
    element.classList.add('is-pressed');
  });
  element.addEventListener('pointermove', event => {
    if (!start) return;
    const rawX = start.offset.x + event.clientX - start.x;
    const rawY = start.offset.y + event.clientY - start.y;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > threshold) {
      moved = true;
      element.classList.add('is-dragging');
      offset = clampOffset(rawX, rawY);
      setOffset();
    }
  });
  const finish = event => {
    if (!start) return;
    element.releasePointerCapture?.(event.pointerId);
    element.classList.remove('is-pressed', 'is-dragging');
    const wasMoved = moved;
    start = null;
    if (!wasMoved) onTap?.(event);
  };
  element.addEventListener('pointerup', finish);
  element.addEventListener('pointercancel', finish);
  element.addEventListener('click', event => {
    if (event.detail === 0) onTap?.(event);
  });
  if (element.classList.contains('identity')) element.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onTap?.(event);
  });
  return () => {
    offset = {x: 0, y: 0};
    element.style.removeProperty('--drag-x');
    element.style.removeProperty('--drag-y');
    element.style.removeProperty('z-index');
  };
}

function closeNote() {
  note.hidden = true;
  selectAll('[data-object]').forEach(element => element.setAttribute('aria-expanded', 'false'));
}

function toggleNote(element, text) {
  const expanded = element.getAttribute('aria-expanded') === 'true';
  closeNote();
  if (expanded) return;
  element.setAttribute('aria-expanded', 'true');
  note.textContent = text;
  note.hidden = false;
}

function initHeroInteractions() {
  const identity = select('.identity');
  const ticket = select('.ticket');
  const record = select('.record');
  const folderElement = select('.folder');
  const pixel = select('.pixel');
  const terminal = select('.terminal');
  const resetters = [
    attachDrag(identity, desk, () => {
      const flipped = identity.classList.toggle('is-flipped');
      identity.setAttribute('aria-pressed', String(flipped));
    }),
    attachDrag(ticket, desk, () => toggleNote(ticket, '设计手记 · 通过研究、原型与界面细节，把复杂问题变成清晰体验。')),
    attachDrag(record, desk, () => {
      const playing = record.toggleAttribute('data-playing');
      closeNote();
      record.setAttribute('aria-expanded', String(playing));
      note.textContent = playing ? '歌单演示正在旋转。可在代码中配置实际音乐链接。' : '歌单演示已暂停。';
      note.hidden = false;
    }),
    attachDrag(folderElement, desk, () => {
      folderElement.classList.add('is-opening');
      setTimeout(() => {
        folderElement.classList.remove('is-opening');
        folder = 'projects';
        renderWork();
        scrollToSection('#work');
      }, reducedMotion ? 0 : 260);
    }),
    attachDrag(pixel, desk, () => {
      const alternate = pixel.classList.toggle('pixel-alt');
      pixel.setAttribute('aria-pressed', String(alternate));
    }),
    attachDrag(terminal, desk)
  ];
  select('.about-link').addEventListener('click', event => {
    event.stopPropagation();
    scrollToSection('#about');
  });
  select('.reset-layout').addEventListener('click', () => resetters.forEach(reset => reset()));
  select('.memo').addEventListener('click', () => {
    const memo = select('.memo');
    const flipped = memo.classList.toggle('is-flipped');
    memo.setAttribute('aria-pressed', String(flipped));
  });
}

function typeTerminal(text, delay = 16) {
  const output = select('.terminal-output');
  output.textContent = '';
  if (reducedMotion) {
    output.textContent = text;
    return;
  }
  [...text].forEach((character, index) => setTimeout(() => { output.textContent += character; }, index * delay));
}

function initTerminal() {
  const terminal = select('.terminal');
  const output = select('.terminal-output');
  const form = select('.terminal-form');
  const input = form.querySelector('input');
  const prompt = select('.terminal-prompt');
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    const outputIntro = () => typeTerminal('whoami\n交互设计师 / Interaction Designer\n\ninterests\nUI/UX · 数字体验 · 原型');
    if (document.body.classList.contains('is-intro')) setTimeout(outputIntro, introTiming.terminal + 600);
    else outputIntro();
  };
  new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && start()), {threshold: .5}).observe(terminal);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const command = input.value.trim().toLowerCase();
    const responses = {
      help: 'help · whoami · about · work · playground · clear',
      whoami: 'Interaction Designer\nUI/UX · 用户研究 · 交互原型',
      about: '正在前往 About…',
      work: '正在前往 Work…',
      playground: '正在前往 Playground…'
    };
    if (command === 'clear') output.textContent = '';
    else output.textContent += `${output.textContent ? '\n\n' : ''}> ${command || 'help'}\n${responses[command] || '未找到命令。输入 help 查看可用命令。'}`;
    if (['about', 'work', 'playground'].includes(command)) setTimeout(() => scrollToSection('#' + command), 180);
    input.value = '';
  });
  input.addEventListener('input', () => { prompt.textContent = input.value || '_'; });
}

const folderButtons = folders.map(item => {
  const element = makeButton(item.title, () => {
    if (folder === item.id) return;
    folder = item.id;
    renderWork();
  });
  folderBar.append(element);
  return [item.id, element];
});

const categoryButtons = [...new Set(projects.map(project => project.category))].map(name => {
  const element = makeButton(name, () => {
    if (category === name) return;
    category = name;
    renderWork();
  });
  categories.append(element);
  return [name, element];
});

function projectMarkup(project, index) {
  return `<article class="project panel" style="--item-delay:${index * 70}ms"><button class="project-image" aria-label="查看 ${project.name}"><img src="${asset(project.cover)}" alt="${project.name} 示例图片"></button><div><small>概念项目 · 示例 · ${project.year}</small><h3>${project.name}</h3><p>${project.summary}</p><p class="project-tools">${project.tools.join(' / ')}</p><button class="detail">查看详情</button></div></article>`;
}

function renderWork() {
  const current = folders.find(item => item.id === folder);
  select('#path').textContent = '~/studio/' + folder;
  categories.hidden = folder !== 'projects';
  folderButtons.forEach(([id, element]) => element.setAttribute('aria-pressed', String(id === folder)));
  categoryButtons.forEach(([name, element]) => element.setAttribute('aria-pressed', String(name === category)));
  if (categories.hidden) {
    work.innerHTML = `<article class="panel tab-info"><h3>${current.heading}</h3><ul>${current.notes.map(noteText => `<li>${noteText}</li>`).join('')}</ul></article>`;
    return;
  }
  const currentProjects = projects.filter(project => project.category === category);
  work.innerHTML = currentProjects.map(projectMarkup).join('');
  currentProjects.forEach((project, index) => {
    work.children[index].querySelectorAll('button').forEach(element => element.addEventListener('click', () => openProject(project)));
  });
}

function openViewer(content, items = [], index = 0) {
  returnFocus = document.activeElement;
  viewerItems = items;
  viewerIndex = index;
  select('.viewer-navigation').hidden = !items.length;
  select('#viewer-content').innerHTML = content;
  if (!viewer.open) viewer.showModal();
  viewer.scrollTop = 0;
  if (items.length) openExperiment(index);
  select('.close').focus();
}

function openProject(project) {
  openViewer(`<h2 id="viewer-title">${project.name}</h2><p>${project.summary}</p><p class="project-tools">${project.year} · ${project.tools.join(' / ')}</p><img src="${asset(project.cover)}" alt="项目封面"><p>项目过程为占位示例，支持后续替换为完整研究和设计素材。</p>${project.stages.map(stage => `<figure><img loading="lazy" src="${asset(stage.image)}" alt="${stage.name}示例"><figcaption><strong>${stage.name}</strong> · ${stage.summary}</figcaption></figure>`).join('')}`);
}

function openExperiment(index) {
  const item = viewerItems[index];
  if (!item) return;
  viewerIndex = index;
  select('#viewer-content').innerHTML = `<h2 id="viewer-title">${item.title}</h2><img src="${asset(item.image)}" alt="${item.title}示例"><p>创意实验 · 示例素材</p>`;
}

function initViewer() {
  select('.close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => returnFocus?.focus({preventScroll: true}));
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  select('.previous').addEventListener('click', () => openExperiment((viewerIndex - 1 + viewerItems.length) % viewerItems.length));
  select('.next').addEventListener('click', () => openExperiment((viewerIndex + 1) % viewerItems.length));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (viewer.open) viewer.close();
      else closeNote();
    }
    if (!viewer.open || !viewerItems.length) return;
    if (event.key === 'ArrowLeft') openExperiment((viewerIndex - 1 + viewerItems.length) % viewerItems.length);
    if (event.key === 'ArrowRight') openExperiment((viewerIndex + 1) % viewerItems.length);
  });
}

function initPlayground() {
  const layouts = [];
  const experimentItems = experiments.map(([image, title], index) => ({image, title, index}));
  experiments.forEach(([image, title, x, y, width, angle, ratio], index) => {
    const print = document.createElement('button');
    print.type = 'button';
    print.className = 'print';
    Object.entries({x: x + '%', y: y + '%', w: width + '%', angle: angle + 'deg', ratio}).forEach(([name, value]) => print.style.setProperty('--' + name, value));
    print.style.setProperty('--play-delay', String(index * 75));
    print.innerHTML = `<img loading="lazy" src="${asset(image)}" alt=""><span>${title}</span>`;
    pinboard.append(print);
    layouts.push(attachDrag(print, pinboard, () => openViewer('', experimentItems, index)));
  });
  select('.reset-playground').addEventListener('click', () => layouts.forEach(reset => reset()));
}

document.querySelectorAll('[data-art]').forEach(element => element.style.setProperty('--asset', `url("${asset(element.dataset.art)}")`));
document.addEventListener('click', event => { if (!note.hidden && !event.target.closest('[data-object], .desk-note')) closeNote(); });
selectAll('.bar nav a, .brand, .footer a').forEach(link => link.addEventListener('click', event => {
  const target = link.getAttribute('href');
  if (!target?.startsWith('#')) return;
  event.preventDefault();
  scrollToSection(target);
}));

animateIntro();
renderWork();
alignInitialAnchor();
revealSections();
markNavigation();
initHeroInteractions();
initTerminal();
initViewer();
initPlayground();
