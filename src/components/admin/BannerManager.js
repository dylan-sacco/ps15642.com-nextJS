'use client';

import { useState } from 'react';

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

function fmtRecurring(mmdd) {
  if (!mmdd) return null;
  const [m, d] = mmdd.split('-');
  return `${MONTH_NAMES[Number(m) - 1]} ${Number(d)}`;
}

const EMPTY = {
  type: 'announcement',
  content: '',
  bgColor: '#16a34a',
  textColor: '#ffffff',
  pages: '*',
  priority: 1,
  active: true,
  sticky: false,
  dismissible: true,
  screenTime: 5,
  recurring: false,
  startDate: '',
  endDate: '',
  startMonth: '01', startDay: '01',
  endMonth: '12',   endDay: '31',
  link: '',
  linkText: '',
};

function pagesArrayToString(pages) {
  if (!pages) return '*';
  return Array.isArray(pages) ? pages.join(', ') : pages;
}

function pagesStringToArray(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-lime-600' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function StatusBadge({ banner }) {
  const now = new Date();
  if (!banner.active) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">Inactive</span>;
  if (banner.startDate && new Date(banner.startDate) > now)
    return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Scheduled</span>;
  if (banner.endDate && new Date(banner.endDate) < now)
    return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">Expired</span>;
  return <span className="text-xs px-2 py-0.5 rounded bg-lime-100 text-lime-700">Active</span>;
}

export default function BannerManager({ initialBanners, initialSettings, canManage }) {
  const [banners, setBanners] = useState(initialBanners);
  const [settings, setSettings] = useState({
    scrollBanner:       initialSettings?.scrollBanner       ?? false,
    scrollAnimation:    initialSettings?.scrollAnimation    ?? true,
    scrollSpeed:        initialSettings?.scrollSpeed        ?? 80,
    scrollInterval:     initialSettings?.scrollInterval     ?? 5,
    scrollBannerSticky: initialSettings?.scrollBannerSticky ?? false,
  });

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);

  async function patchSettings(updates) {
    const next = { ...settings, ...updates };
    setSettings(next);
    await fetch('/api/admin/banners/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function startEdit(b) {
    const rec = b.recurring ?? false;
    setForm({
      type:        b.type,
      content:     b.content ?? '',
      bgColor:     b.bgColor ?? '#16a34a',
      textColor:   b.textColor ?? '#ffffff',
      pages:       pagesArrayToString(b.pages),
      priority:    b.priority ?? 1,
      active:      b.active ?? true,
      sticky:      b.sticky ?? false,
      dismissible: b.dismissible ?? true,
      screenTime:  b.screenTime ?? 5,
      recurring:   rec,
      startDate:   rec ? '' : (b.startDate ? b.startDate.slice(0, 10) : ''),
      endDate:     rec ? '' : (b.endDate   ? b.endDate.slice(0, 10)   : ''),
      startMonth:  rec && b.startDate ? b.startDate.slice(0, 2) : '01',
      startDay:    rec && b.startDate ? b.startDate.slice(3, 5) : '01',
      endMonth:    rec && b.endDate   ? b.endDate.slice(0, 2)   : '12',
      endDay:      rec && b.endDate   ? b.endDate.slice(3, 5)   : '31',
      link:        b.link     ?? '',
      linkText:    b.linkText  ?? '',
    });
    setEditingId(b.id);
    setShowForm(true);
    setStatus(null);
  }

  function cancelForm() { setForm(EMPTY); setEditingId(null); setShowForm(false); setStatus(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    const payload = {
      ...form,
      pages:      pagesStringToArray(form.pages),
      priority:   Number(form.priority),
      screenTime: form.screenTime ? Number(form.screenTime) : null,
      recurring:  form.recurring,
      startDate:  form.recurring
        ? (form.startMonth ? `${form.startMonth}-${form.startDay}` : null)
        : (form.startDate || null),
      endDate:    form.recurring
        ? (form.endMonth ? `${form.endMonth}-${form.endDay}` : null)
        : (form.endDate || null),
      link:       form.link      || null,
      linkText:   form.linkText  || null,
    };

    const res = editingId
      ? await fetch(`/api/admin/banners/${editingId}`, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/banners',               { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    const data = await res.json();
    if (!res.ok) { setStatus(data.error || 'Error saving'); return; }

    if (editingId) {
      setBanners(prev => prev.map(b => b.id === editingId ? { ...b, ...payload } : b));
    } else {
      setBanners(prev => [data.banner, ...prev]);
    }
    cancelForm();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this banner?')) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Error deleting'); return; }
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  const isContactForm = form.type === 'contact';

  return (
    <div className="space-y-6">

      {/* ── Display Settings panel ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 max-w-lg">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Settings</p>

        {/* Scroll Banner */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Scroll Banner</p>
            <p className="text-xs text-gray-400">Announcement banners display as a scrolling ticker</p>
          </div>
          {canManage
            ? <Toggle checked={settings.scrollBanner} onChange={v => patchSettings({ scrollBanner: v })} />
            : <span className="text-xs text-gray-400">{settings.scrollBanner ? 'On' : 'Off'}</span>}
        </div>

        {/* Scroll sub-options */}
        {settings.scrollBanner && (
          <div className="pl-4 border-l-2 border-lime-200 space-y-3">

            {/* Animation toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Animation</p>
                <p className="text-xs text-gray-400">
                  {settings.scrollAnimation ? 'Banners scroll horizontally (marquee)' : 'Banners flip one at a time'}
                </p>
              </div>
              {canManage
                ? <Toggle checked={settings.scrollAnimation} onChange={v => patchSettings({ scrollAnimation: v })} />
                : <span className="text-xs text-gray-400">{settings.scrollAnimation ? 'On' : 'Off'}</span>}
            </div>

            {/* Speed — marquee only */}
            {settings.scrollAnimation && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 w-20 flex-shrink-0">Speed</label>
                <input
                  type="number" min={10} max={500}
                  value={settings.scrollSpeed}
                  onChange={e => setSettings(s => ({ ...s, scrollSpeed: Number(e.target.value) }))}
                  onBlur={e => patchSettings({ scrollSpeed: Number(e.target.value) })}
                  disabled={!canManage}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-400">px / second</span>
              </div>
            )}

            {/* Interval — flip mode only */}
            {!settings.scrollAnimation && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 w-20 flex-shrink-0">Interval</label>
                <input
                  type="number" min={1} max={60}
                  value={settings.scrollInterval}
                  onChange={e => setSettings(s => ({ ...s, scrollInterval: Number(e.target.value) }))}
                  onBlur={e => patchSettings({ scrollInterval: Number(e.target.value) })}
                  disabled={!canManage}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-400">seconds (global fallback)</span>
              </div>
            )}

            {/* Sticky ticker */}
            <div className="flex items-center justify-between pt-1 border-t border-lime-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Sticky ticker</p>
                <p className="text-xs text-gray-400">Keep the ticker bar pinned when scrolling</p>
              </div>
              {canManage
                ? <Toggle checked={settings.scrollBannerSticky} onChange={v => patchSettings({ scrollBannerSticky: v })} />
                : <span className="text-xs text-gray-400">{settings.scrollBannerSticky ? 'On' : 'Off'}</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── Add button ─────────────────────────────────────────────────── */}
      {canManage && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded text-sm transition-colors">
          + Add Banner
        </button>
      )}

      {/* ── Banner form ────────────────────────────────────────────────── */}
      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Banner' : 'New Banner'}</h2>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setField('type', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
                <option value="announcement">Announcement</option>
                <option value="contact">Contact Bar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority <span className="font-normal text-gray-400">(higher = shown first)</span></label>
              <input type="number" value={form.priority} onChange={e => setField('priority', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
            </div>
          </div>

          {/* Content */}
          {!isContactForm ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Content *</label>
              <input required value={form.content} onChange={e => setField('content', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                placeholder="Grass Cutting 10% off until March 13th!" />
            </div>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2 border border-gray-200">
              The contact bar renders the business phone, email, and social links automatically. Customize its colors below.
            </p>
          )}

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            {[['Background Color', 'bgColor'], ['Text Color', 'textColor']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form[key]} onChange={e => setField(key, e.target.value)}
                    className="h-8 w-10 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <input value={form[key]} onChange={e => setField(key, e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono" />
                </div>
              </div>
            ))}
          </div>

          {/* Link */}
          {!isContactForm && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link URL <span className="font-normal text-gray-400">(optional)</span></label>
                <input value={form.link} onChange={e => setField('link', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="/blog/post-slug" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link Text</label>
                <input value={form.linkText} onChange={e => setField('linkText', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Learn More" />
              </div>
            </div>
          )}

          {/* Pages */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Pages <span className="font-normal text-gray-400">(comma-separated — <code>*</code> for all, <code>/blog/*</code> for prefix)</span>
            </label>
            <input value={form.pages} onChange={e => setField('pages', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono"
              placeholder="*, /services, /blog/*" />
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.recurring} onChange={e => setField('recurring', e.target.checked)}
              className="rounded border-gray-300 text-lime-600" />
            Recurring yearly <span className="text-gray-400 text-xs">(repeats every year, no year on dates)</span>
          </label>

          {/* Dates */}
          {form.recurring ? (
            <div className="grid grid-cols-2 gap-4">
              {[['Start', 'startMonth', 'startDay'], ['End', 'endMonth', 'endDay']].map(([label, mKey, dKey]) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label} <span className="font-normal text-gray-400">(month / day)</span></label>
                  <div className="flex gap-1">
                    <select value={form[mKey]} onChange={e => setField(mKey, e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm">
                      {MONTHS.map((m, i) => <option key={m} value={m}>{MONTH_NAMES[i]}</option>)}
                    </select>
                    <select value={form[dKey]} onChange={e => setField(dKey, e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm">
                      {DAYS.map(d => <option key={d} value={d}>{Number(d)}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              </div>
            </div>
          )}

          {/* Toggles row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setField('active', e.target.checked)}
                className="rounded border-gray-300 text-lime-600" />
              Active
            </label>

            {/* Sticky */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.sticky} onChange={e => setField('sticky', e.target.checked)}
                className="rounded border-gray-300 text-lime-600" />
              <span>
                Sticky
                {settings.scrollBanner
                  ? <span className="text-gray-400 text-xs ml-1">(pins above the ticker, excluded from scroll)</span>
                  : null}
              </span>
            </label>

            {!isContactForm && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.dismissible} onChange={e => setField('dismissible', e.target.checked)}
                  className="rounded border-gray-300 text-lime-600" />
                Dismissible
              </label>
            )}
          </div>

          {/* Screen time — only relevant in scroll+flip mode */}
          {settings.scrollBanner && !settings.scrollAnimation && !isContactForm && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 flex-shrink-0">Screen Time</label>
              <input type="number" min={1} max={120} value={form.screenTime}
                onChange={e => setField('screenTime', e.target.value)}
                className="w-24 border border-gray-300 rounded px-3 py-1.5 text-sm" />
              <span className="text-xs text-gray-400">seconds on screen (overrides global interval)</span>
            </div>
          )}

          {/* Preview */}
          {!isContactForm && form.content && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Preview</p>
              <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm rounded"
                style={{ backgroundColor: form.bgColor, color: form.textColor }}>
                <span>{form.content}</span>
                {form.link && <span className="underline font-semibold">{form.linkText || 'Learn More'}</span>}
              </div>
            </div>
          )}

          {status && <p className="text-red-500 text-sm">{status}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm transition-colors">
              {editingId ? 'Save Changes' : 'Add Banner'}
            </button>
            <button type="button" onClick={cancelForm} className="text-gray-500 hover:text-gray-700 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* ── Banner list ────────────────────────────────────────────────── */}
      {banners.length === 0 ? (
        <p className="text-gray-500 text-sm">No banners yet.</p>
      ) : (
        <div className="space-y-2">
          {banners.map(b => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-4">
              <div className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200" style={{ backgroundColor: b.bgColor }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {b.type === 'contact' ? 'Contact Bar' : (b.content || '(no content)')}
                  </span>
                  <StatusBadge banner={b} />
                  {b.permanent && <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">Permanent</span>}
                  {b.sticky && <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">Sticky</span>}
                  {b.recurring && <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-600">Yearly</span>}
                  {b.type === 'announcement' && b.dismissible && <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">Dismissible</span>}
                  {b.screenTime && !settings.scrollAnimation && settings.scrollBanner && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-50 text-orange-600">{b.screenTime}s</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pages: {Array.isArray(b.pages) ? b.pages.join(', ') : b.pages}
                  {(b.startDate || b.endDate) && b.recurring && (
                    <> &middot; {fmtRecurring(b.startDate) ?? '∞'} → {fmtRecurring(b.endDate) ?? '∞'} (every year)</>
                  )}
                  {(b.startDate || b.endDate) && !b.recurring && (
                    <> &middot; {b.startDate ? b.startDate.slice(0, 10) : '∞'} → {b.endDate ? b.endDate.slice(0, 10) : '∞'}</>
                  )}
                </p>
              </div>

              {canManage && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(b)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  {!b.permanent && (
                    <button onClick={() => handleDelete(b.id)}
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
