// ============================================================
// admin-chat.js — Chat Wali Kelas ↔ Orang Tua (#/chat).
// (Tahap 1: dipecah dari admin-mods*.js / admin.js; logika TIDAK diubah.)
// ============================================================

let chatNis = null;

async function renderChat() {
  const [chat, siswa, kelas, guru] = await Promise.all([fetchJSON("chat.json"), fetchJSON("siswa.json"), fetchJSON("kelas.json"), fetchJSON("guru.json")]);
  const threads = [...new Set(chat.map(c => c.nis))];
  if (!chatNis || !siswa.some(s => s.nis === chatNis)) chatNis = threads[0] || (siswa[0] && siswa[0].nis) || null;
  const s = siswa.find(x => x.nis === chatNis);
  const k = s && kelas.find(x => x.nama === s.kelas);
  const wali = k && guru.find(g => g.id === k.wali_kelas);
  const msgs = chat.filter(c => c.nis === chatNis).sort((a, b) => (a.waktu || "").localeCompare(b.waktu || ""));
  app.innerHTML = pageHead(MOD.chat) + '<div class="grid lg:grid-cols-3 gap-4">' +
    card('<label class="block mb-3">' + lbl("Buka percakapan dengan ortu siswa") + '<select id="cPick" ' + inp + ">" + siswa.map(x => '<option value="' + esc(x.nis) + '" ' + (x.nis === chatNis ? "selected" : "") + ">" + esc(x.nama + " (" + x.kelas + ")") + "</option>").join("") + "</select></label>" +
      '<div class="space-y-1">' + threads.map(n => { const x = siswa.find(y => y.nis === n); const last = chat.filter(c => c.nis === n).slice(-1)[0]; return '<button type="button" data-nis="' + esc(n) + '" class="w-full text-left px-3 py-2 rounded-lg text-sm ' + (n === chatNis ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50") + '"><b>' + esc(x ? x.nama : n) + '</b><div class="text-xs text-slate-500 truncate">' + esc(last ? last.pesan : "") + "</div></button>"; }).join("") || '<p class="text-sm text-slate-400">Belum ada percakapan.</p></div>') +
    '<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">' +
    '<div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><i data-lucide="message-circle" class="w-5 h-5 text-emerald-600"></i><div class="flex-1"><b class="text-sm">' + esc(s ? "Ortu " + s.nama : "-") + '</b><div class="text-xs text-slate-500">Wali kelas: ' + esc(wali ? wali.nama : "-") + '</div></div>' +
    (s && s.no_hp_ortu ? '<a target="_blank" href="https://wa.me/' + esc(s.no_hp_ortu.replace(/^0/, "62")) + '" class="text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg" title="Buka WhatsApp ortu"><i data-lucide="send" class="w-4 h-4"></i></a>' : "") + "</div>" +
    '<div class="flex-1 p-4 space-y-2 overflow-y-auto max-h-[45vh] bg-slate-50">' + (msgs.map(mm =>
      '<div class="flex ' + (mm.dari === "sekolah" ? "justify-end" : "justify-start") + '"><div class="max-w-[80%] px-3 py-2 rounded-2xl text-sm ' + (mm.dari === "sekolah" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-200 rounded-bl-sm") + '">' + esc(mm.pesan) + '<div class="text-[10px] mt-1 ' + (mm.dari === "sekolah" ? "text-emerald-100" : "text-slate-400") + '">' + (mm.dari === "sekolah" ? "Sekolah/Wali" : "Orang Tua") + " • " + fmtWaktu(mm.waktu) + "</div></div></div>"
    ).join("") || '<p class="text-center text-sm text-slate-400 py-8">Belum ada pesan. Mulai percakapan di bawah.</p>') + "</div>" +
    '<form id="cForm" class="p-3 border-t border-slate-100 flex gap-2"><input name="pesan" required placeholder="Tulis pesan sebagai wali kelas/sekolah…" class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"><button ' + btnP + '><i data-lucide="send" class="w-4 h-4"></i>Kirim</button></form></div></div>';
  refreshIcons();
  document.getElementById("cPick").onchange = e => { chatNis = e.target.value; renderChat(); };
  app.querySelectorAll("[data-nis]").forEach(b => b.onclick = () => { chatNis = b.dataset.nis; renderChat(); });
  document.getElementById("cForm").onsubmit = async e => {
    e.preventDefault();
    const pesan = e.target.pesan.value.trim(); if (!pesan || !chatNis) return;
    const arr = await fetchJSON("chat.json");
    arr.push({ id: uid(), nis: chatNis, dari: "sekolah", pesan, waktu: new Date().toISOString() });
    if (await saveData("chat.json", arr, "Komunikasi", "KIRIM CHAT", "ke ortu NIS " + chatNis)) renderChat();
  };
}

MOD.chat = { title: "Chat Wali Kelas ↔ Orang Tua", desc: "Pesan sekolah tersimpan di chat.json (dibaca portal ortu). Balasan ortu masuk via WA.", render: "renderChat" };
