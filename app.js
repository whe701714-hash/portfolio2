import {folders,projects,experiments,asset} from './content.js';
import {profile} from './profile.js';

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
const introTiming = {avatarDelay: 80, avatarDuration: 600, lettersDelay: 600, letterDuration: 440, letterStagger: 90, subtitleDelay: 1370, subtitleDuration: 330, homeStart: 2200, exitDuration: 380, duration: 430, nav: 600, navDuration: 330, sectionLabel: 0, identity: 0, ticket: 75, record: 135, folder: 195, pixel: 250, terminal: 300, signature: 320, signatureDuration: 320, homeCleanup: 1100, total: 3150};
let introTimers = [];
let homeIntroStarted = false;
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

function setIntroVariables() {
  Object.entries(introTiming).forEach(([name, value]) => {
    const cssName = name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
    document.documentElement.style.setProperty('--intro-' + cssName, `${value}ms`);
  });
}

function renderProfile() {
  const name = profile.name || 'Name pending';
  const role = profile.role || 'Interaction Designer';
  const nameNode = select('.brand-intro__name');
  nameNode.replaceChildren();
  [...name].forEach((character, index) => {
    const letter = document.createElement('span');
    letter.className = character === ' ' ? 'brand-intro__space' : 'brand-intro__letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.textContent = character === ' ' ? '\u00a0' : character;
    if (character !== ' ') letter.style.animationDelay = `${introTiming.lettersDelay + index * introTiming.letterStagger}ms`;
    nameNode.append(letter);
  });
  nameNode.setAttribute('aria-label', name);
  select('.brand-intro__role').textContent = role.toUpperCase();
  select('.identity-personal').textContent = `${name} · ${role}`;
  select('.identity-name').textContent = name;
  select('.identity-role').textContent = `${role} · UI/UX · 数字体验`;
  select('.profile-bio').textContent = profile.bio || '个人介绍暂缺，后续更新。';
  selectAll('[data-profile-avatar]').forEach(image => {
    image.src = profile.avatar;
    image.alt = `${name} 头像占位`;
  });
  document.title = `${name} · Interaction Design Portfolio`;
}

function startHomeIntro() {
  if (homeIntroStarted) return;
  homeIntroStarted = true;
  document.documentElement.classList.remove('brand-intro-pending', 'intro-pending');
  document.body.classList.add('is-intro');
  requestAnimationFrame(() => document.body.classList.add('intro-ready'));
  window.dispatchEvent(new Event('brandintroend'));
  introTimers.push(setTimeout(() => document.body.classList.remove('is-intro'), introTiming.homeCleanup));
}

function finishBrandIntro() {
  if (!document.documentElement.classList.contains('brand-intro-pending')) return;
  introTimers.forEach(clearTimeout);
  introTimers = [];
  sessionStorage.setItem('zi-yue-brand-intro', '1');
  startHomeIntro();
  document.body.classList.add('brand-intro-exiting');
  introTimers.push(setTimeout(() => {
    select('.brand-intro').setAttribute('aria-hidden', 'true');
    document.body.classList.add('brand-intro-hidden');
  }, introTiming.exitDuration));
}

function animateIntro() {
  const isRoot = !location.hash || location.hash === '#top';
  const shouldAnimate = isRoot && !sessionStorage.getItem('zi-yue-brand-intro') && !reducedMotion;
  setIntroVariables();
  select('.brand-intro__skip').addEventListener('click', finishBrandIntro);
  if (!shouldAnimate) {
    document.documentElement.classList.remove('brand-intro-pending', 'intro-pending');
    select('.brand-intro').setAttribute('aria-hidden', 'true');
    document.body.classList.add('intro-ready');
    return;
  }
  select('.brand-intro').setAttribute('aria-hidden', 'false');
  document.body.classList.add('brand-intro-active');
  requestAnimationFrame(() => document.body.classList.add('brand-intro-play'));
  introTimers.push(setTimeout(() => {
    startHomeIntro();
    document.body.classList.add('brand-intro-exiting');
  }, introTiming.homeStart));
  introTimers.push(setTimeout(() => {
    document.documentElement.classList.remove('brand-intro-pending');
    select('.brand-intro').setAttribute('aria-hidden', 'true');
    document.body.classList.add('brand-intro-hidden');
    sessionStorage.setItem('zi-yue-brand-intro', '1');
  }, introTiming.total));
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
    const outputIntro = () => typeTerminal(`whoami\n${profile.role} / ${profile.name}\n\ninterests\nUI/UX · 数字体验 · 原型`, 12);
    if (document.body.classList.contains('brand-intro-active')) window.addEventListener('brandintroend', outputIntro, {once: true});
    else if (document.body.classList.contains('is-intro')) setTimeout(outputIntro, introTiming.terminal + 300);
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
  return `<article class="project panel" style="--item-delay:${index * 70}ms"><button class="project-image" aria-label="查看 ${project.name}"><img src="${asset(project.cover)}" alt="${project.name} 示例图片"></button><div><small>${project.placeholder ? '占位项目 · ' : ''}${project.year}</small><h3>${project.name}</h3><p>${project.summary}</p><p class="project-tools">${project.tools.join(' / ')}</p><button class="detail">查看详情</button></div></article>`;
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
  openViewer(`<h2 id="viewer-title">${project.name}</h2><p>${project.summary}</p><p class="project-tools">${project.year} · ${project.tools.join(' / ')}</p><img src="${asset(project.cover)}" alt="项目封面"><p>${project.placeholder ? '占位项目 · 项目信息与设计过程待替换。' : '项目过程待补充。'}</p>${project.stages.map(stage => `<figure><img loading="lazy" src="${asset(stage.image)}" alt="${stage.name}示例"><figcaption><strong>${stage.name}</strong> · ${stage.summary}</figcaption></figure>`).join('')}${project.link ? `<p><a href="${project.link}" target="_blank" rel="noreferrer">查看项目链接</a></p>` : ''}`);
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

renderProfile();
animateIntro();
renderWork();
alignInitialAnchor();
revealSections();
markNavigation();
initHeroInteractions();
initTerminal();
initViewer();
initPlayground();
