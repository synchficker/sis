// ============================================================
// admin-audit.js — Audit Log (#/audit).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

async function renderAudit() {
  const log = await fetchJSON("audit.json").catch(() => []);
  const moduls = [...new Set(log.map(l => l.modul))];
  const rows = ls => ls.map(l => '<tr class="border-b border-slate-100"><td class="px-3 py-2 text-xs whitespace-nowrap">' + fmtWaktu(l.waktu) + '</td><td class="px-3 py-2 text-sm font-semibold">' + esc(l.aktor) + '</td><td class="px-3 py-2 text-sm">' + esc(l.modul) + '</td><td class="px-3 py-2 text-xs font-bold text-emerald-700">' + esc(l.aksi) + '</td><td class="px-3 py-2 text-sm">' + esc(l.detail) + "</td></tr>").join("") || emptyRow;
  app.innerHTML = pageHead(MOD.audit) + card('<div class="flex flex-wrap gap-2 mb-3"><select id="aF" class="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Semua Modul</option>' + moduls.map(m => "<option>" + esc(m) + "</option>").join("") + '</select><button type="button" id="aCsv" ' + btnS + '><i data-lucide="download" class="w-4 h-4"></i>Export CSV</button></div>' +
    '<div class="overflow-x-auto max-h-[62vh] overflow-y-auto"><table class="w-full text-left"><thead class="bg-slate-50 sticky top-0"><tr>' + ["Waktu", "Aktor (GitHub)", "Modul", "Aksi", "Detail"].map(h => '<th class="px-3 py-2 text-xs font-bold uppercase text-slate-500">' + h + "</th>").join("") + "</tr></thead><tbody id='aTb'>" + rows(log) + "</tbody></table></div>");
  refreshIcons();
  document.getElementById("aF").onchange = e => { document.getElementById("aTb").innerHTML = rows(log.filter(l => !e.target.value || l.modul === e.target.value)); };
  document.getElementById("aCsv").onclick = () => download("audit-log.csv", toCSV(log, [{ k: "waktu", l: "waktu" }, { k: "aktor", l: "aktor" }, { k: "modul", l: "modul" }, { k: "aksi", l: "aksi" }, { k: "detail", l: "detail" }]), "text/csv");
}

MOD.audit = { title: "Audit Log", desc: "Tercatat OTOMATIS untuk setiap operasi tulis ke GitHub (siapa, kapan, apa).", render: "renderAudit" };
