const fmt = d => {
    const x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0,10);
}
const esc = s => s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const today = fmt(new Date());
const docContent = document.querySelector('#c');
const docDate = document.querySelector('#d');
const docForm = document.querySelector('#f');
const deleteButton = document.querySelector('#delete');
const docList = document.querySelector('#recent-entries ul')
let docListItems = [];

async function save() {
    // Always overwrite the date parameter
    await fetch(`/api/entries/${docDate.value}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: docContent.value })
    });

    await load();

    // Return focus to editor after save
    docContent.focus();
}

async function load() {
    // Read today's/selected date first
    let text = '';
    const readRes = await fetch(`/api/entries/${docDate.value}`);
    if (readRes.ok) {
        const entry = await readRes.json();
        text = entry?.content ?? '';
    } else if (readRes.status === 404) {
        // Not found: create blank via PUT (create-or-replace)
        const putRes = await fetch(`/api/entries/${docDate.value}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ content: '' })
        });
        if (putRes.ok) {
            const entry = await putRes.json();
            text = entry?.content ?? '';
        }
    }

    docContent.value = text;

    // Refresh recent list
    const r = await fetch('/api/entries');
    const entries = await r.json();
    docList.innerHTML = '';
    for (let i = 0, n = Math.min(entries.length, 5); i < n; i++) {
        const e = entries[i];
        const li = document.createElement('li');
        const excerpt = e.content.length > 50 ? e.content.slice(0, 50) + '…' : e.content;
        li.innerHTML = `<a href='#${e.date}'>${e.date}</a> — ${esc(excerpt)}`;
        docList.appendChild(li);
    }

    // Rebind click handlers
    docListItems = document.querySelectorAll('#recent-entries ul li a');
    docListItems.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const dateStr = e.currentTarget.textContent.trim();
            docDate.value = dateStr;
            load();
        });
    });

    // Return focus to editor after load
    docContent.focus();
}

async function deleteEntry() {
    if(!confirm(`Delete entry for ${docDate.value}?`)) return;

    const res = await fetch(`/api/entries/${docDate.value}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
        docDate.value = today;
        await load();
    } else {
        console.error('Failed to delete entry', res.status);
    }
}

// Event listeners
docForm.addEventListener('submit', e => {
    e.preventDefault();
    save();
});

docDate.addEventListener('change', load);

deleteButton.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    deleteEntry();
});

document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
    }
});

// Initial setup
docDate.value = today;
load();