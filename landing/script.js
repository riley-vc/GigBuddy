// Points at the GigBag production API (Render). This is a standalone static
// page with no build step, so the URL is hardcoded here rather than pulled
// from an env var — update this if the backend ever moves.
const API_BASE = 'https://gigbag-api.onrender.com/api/landing';

function track(path) {
  fetch(`${API_BASE}${path}`, { method: 'POST' }).catch(() => {
    /* analytics failures should never block the UX */
  });
}

// ── Page view ────────────────────────────────────────────────────────────
track('/view');

// ── Modal wiring ─────────────────────────────────────────────────────────
const modal        = document.getElementById('waitlist-modal');
const modalClose    = document.getElementById('modal-close');
const formState      = document.getElementById('modal-form-state');
const successState  = document.getElementById('modal-success-state');
const form           = document.getElementById('waitlist-form');
const submitBtn     = document.getElementById('wl-submit');
const errorEl        = document.getElementById('wl-error');
const doneBtn        = document.getElementById('wl-done');

function openModal() {
  formState.hidden = false;
  successState.hidden = true;
  errorEl.hidden = true;
  form.reset();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('wl-email').focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-cta]').forEach((btn) => {
  btn.addEventListener('click', () => {
    track('/cta-click'); // counted on click regardless of whether the form gets completed
    openModal();
  });
});

modalClose.addEventListener('click', closeModal);
doneBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ── Waitlist form submit ─────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const name = document.getElementById('wl-name').value.trim();
  const email = document.getElementById('wl-email').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Joining...';

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    formState.hidden = true;
    successState.hidden = false;
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong. Please try again.';
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join the Waitlist';
  }
});
