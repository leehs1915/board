// Apps Script 배포 후 여기에 웹 앱 URL을 붙여넣으세요
const GAS_URL = 'https://script.google.com/macros/s/AKfycby7AGqYgeSsAgsgJrkFLFT_Q5peO_6egfkND4TmHASxv1oclMU8oFQ5m3jQZfySu7Yh/exec';

const form = document.getElementById('post-form');
const postList = document.getElementById('post-list');
const emptyMsg = document.getElementById('empty-msg');
const postCount = document.getElementById('post-count');
const themeToggle = document.getElementById('theme-toggle');

// ── 다크 모드 토글 ──────────────────────────────────────────
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ── 로컬 저장소 ─────────────────────────────────────────────
// GAS는 doPost(저장)만 제공하므로, 목록 표시는 localStorage로 관리한다.
let posts = JSON.parse(localStorage.getItem('posts') || '[]');

function savePosts() {
  localStorage.setItem('posts', JSON.stringify(posts));
}

// ── GAS API 통신 ─────────────────────────────────────────────
// Code.gs의 doPost가 기대하는 키: '제목', '이름', '내용'
async function sendToSheet(post) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      '제목': post.title,
      '이름': post.author,
      '내용': post.content,
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
}

// ── 유틸 ────────────────────────────────────────────────────
function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitial(name) {
  return String(name).trim().charAt(0).toUpperCase();
}

const avatarColors = [
  'from-violet-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
];

function getAvatarColor(name) {
  let hash = 0;
  for (const c of String(name)) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// ── 렌더링 ───────────────────────────────────────────────────
function renderPosts(posts) {
  postList.innerHTML = '';
  postCount.textContent = `${posts.length}개의 글`;

  if (posts.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  [...posts].reverse().forEach(post => {
    const li = document.createElement('li');
    li.className = 'post-card bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm px-5 py-4';
    li.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(post.author)} flex items-center justify-center text-white font-bold text-sm shrink-0">
            ${escapeHtml(getInitial(post.author))}
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">${escapeHtml(post.title)}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">${escapeHtml(post.author)} · ${formatDate(post.date)}</p>
          </div>
        </div>
        <button class="delete-btn shrink-0 text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-400 rounded-lg p-1.5 transition-colors" data-id="${post.id}" title="삭제">
          <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
      <p class="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">${escapeHtml(post.content)}</p>
    `;
    postList.appendChild(li);
  });
}

function showError(msg) {
  postCount.textContent = '오류 발생';
  emptyMsg.textContent = `⚠️ ${msg}`;
  emptyMsg.classList.remove('hidden');
}

// ── 이벤트 ───────────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '등록 중...';

  const post = {
    id: Date.now(),
    author: document.getElementById('author').value.trim(),
    title: document.getElementById('title').value.trim(),
    content: document.getElementById('content').value.trim(),
    date: new Date().toISOString(),
  };

  try {
    // 1) GAS 스프레드시트에 저장
    await sendToSheet(post);
    // 2) 로컬 목록에도 추가해 즉시 화면에 반영
    posts.push(post);
    savePosts();
    form.reset();
    renderPosts(posts);
  } catch (err) {
    alert(`글 등록 실패: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      글 등록`;
  }
});

// 삭제는 로컬에서만 처리 (GAS에는 doDelete 없음)
postList.addEventListener('click', e => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  if (!confirm('글을 삭제할까요?')) return;

  const id = Number(btn.dataset.id);
  posts = posts.filter(p => p.id !== id);
  savePosts();
  renderPosts(posts);
});

// ── 초기 로드 (localStorage에서 복원) ───────────────────────
renderPosts(posts);
