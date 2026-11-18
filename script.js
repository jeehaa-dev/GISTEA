// Fitur data keranjang dan menu yang sedang dibuka
"use strict";

let keranjang = JSON.parse(localStorage.getItem("keranjang")) || []; 
let menuDibuka = null; 
 
// Fitur ambil elemen berdasarkan id 
function ambil(id) { 
  return document.getElementById(id); 
} 
 
// Fitur ambil kartu menu berdasarkan id 
function cariKartu(id) { 
  return document.querySelector('.kartu[data-id="' + id + '"]'); 
} 
 
// Fitur format harga rupiah 
function rupiah(angka) { 
  return "Rp" + String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
} 
 
// Fitur cek status login 
function sudahMasuk() { 
  return localStorage.getItem("masuk") === "ya"; 
} 
 
/* ===== MENU HEADER ===== */ 
// Fitur pencarian menu 
ambil("input-cari").addEventListener("input", function () { 
  location.hash = "#/"; 
 tampilkanKatalog(); 
}); 
 
// Fitur tombol cari 
ambil("form-cari").addEventListener("submit", function (e) { 
  e.preventDefault(); 
}); 
 
// Fitur keluar (logout) 
ambil("tombol-keluar").addEventListener("click", function () { 
  localStorage.removeItem("masuk"); 
  aturHalaman(); 
}); 
 
/* ===== MENU KATALOG ===== */ 
// Fitur filter kategori dan pencarian menu 
function tampilkanKatalog() { 
  const kategori = document.querySelector('input[name="kategori"]:checked').value; 
  const kata = ambil("input-cari").value.trim().toLowerCase(); 
 
  document.querySelectorAll("#grid-produk .kartu").forEach(function (k) { 
    k.hidden = !( 
      (kategori === "semua" || k.dataset.kategori === kategori) && 
      k.textContent.toLowerCase().includes(kata) 
    ); 
  }); 
} 
 
// Fitur filter kategori 
ambil("halaman-katalog").addEventListener("change", tampilkanKatalog);
/* ===== MENU LOGIN ===== */ 
// Fitur akun login 
const USERNAME = "naufal"; 
const PASSWORD = "1111"; 
 
// Fitur masuk (login), setelah berhasil kembali ke katalog 
ambil("form-login").addEventListener("submit", function (e) { 
  e.preventDefault(); 
  const benar = 
    ambil("isian-username").value.trim().toLowerCase() === USERNAME && 
    ambil("isian-password").value === PASSWORD; 
  ambil("login-salah").hidden = benar; 
  if (benar) { 
    localStorage.setItem("masuk", "ya"); 
    this.reset(); 
    location.hash = "#/"; 
  } 
}); 
 
/* ===== MENU DETAIL MENU ===== */ 
// Fitur tampilan detail menu 
function tampilkanDetail(id) { 
  menuDibuka = cariKartu(id); 
  ambil("detail-tidak-ada").hidden = Boolean(menuDibuka); 
  ambil("isi-detail").hidden = !menuDibuka; 
  if (!menuDibuka) { 
    return; 
  } 
 ambil("detail-gambar").src = menuDibuka.querySelector(".foto").src; 
  ambil("detail-nama").textContent = menuDibuka.dataset.nama; 
  ambil("detail-deskripsi").textContent = menuDibuka.dataset.deskripsi; 
  ambil("isian-jumlah").value = 1; 
  hitungKasir(); 
} 
 
// Fitur kasir (harga x jumlah) 
function hitungKasir() { 
  const kolom = ambil("isian-jumlah"); 
  kolom.value = Math.max(1, Math.floor(Number(kolom.value)) || 1); 
  ambil("tombol-kurang").disabled = kolom.value <= 1; 
  ambil("kasir-nama").textContent = menuDibuka.dataset.nama; 
  ambil("kasir-harga").textContent = rupiah(menuDibuka.dataset.harga); 
  document.querySelectorAll(".total-teks").forEach(function (el) { 
    el.textContent = rupiah(menuDibuka.dataset.harga * kolom.value); 
  }); 
} 
 
// Fitur tombol kurangi, tambah, dan isian jumlah 
ambil("tombol-kurang").addEventListener("click", function () { 
  ambil("isian-jumlah").stepDown(); 
  hitungKasir(); 
}); 
ambil("tombol-tambah").addEventListener("click", function () { 
  ambil("isian-jumlah").stepUp(); 
  hitungKasir(); 
}); 
ambil("isian-jumlah").addEventListener("change", hitungKasir); 
 
// Fitur masukkan menu ke keranjang (tambah = true untuk menambah jumlah lama) 
function masukKeranjang(tambah) { 
  const id = Number(menuDibuka.dataset.id); 
 const jumlah = Number(ambil("isian-jumlah").value); 
  const item = keranjang.find(function (i) { 
    return i.id === id; 
  }); 
  if (item) { 
    item.jumlah = tambah ? item.jumlah + jumlah : jumlah; 
  } else { 
    keranjang.push({ 
      id: id, 
      jumlah: jumlah, 
      harga: Number(menuDibuka.dataset.harga), 
    }); 
  } 
  simpanKeranjang(); 
} 
 
// Fitur tombol tambah ke keranjang 
ambil("tombol-keranjang").addEventListener("click", function () { 
  masukKeranjang(true); 
}); 
 
// Fitur tombol pesan sekarang 
ambil("tombol-pesan").addEventListener("click", function () { 
  masukKeranjang(false); 
  location.hash = "#/checkout"; 
});
/* ===== MENU KERANJANG ===== */ 
// Fitur hitung jumlah barang dan total harga 
function jumlahBarang() { 
  return keranjang.reduce(function (t, i) { 
    return t + i.jumlah; 
  }, 0); 
} 
 
function totalHarga() { 
  return keranjang.reduce(function (t, i) { 
    return t + i.harga * i.jumlah; 
  }, 0); 
} 
 
// Fitur simpan keranjang dan lencana jumlah di header 
function simpanKeranjang() { 
  localStorage.setItem("keranjang", JSON.stringify(keranjang)); 
  ambil("lencana-keranjang").textContent = jumlahBarang(); 
} 
 
// Fitur daftar barang dari template baris 
function isiBaris(wadah, daftar) { 
  wadah.replaceChildren(); 
  daftar.forEach(function (item) { 
    const menu = cariKartu(item.id); 
    const baris = ambil("templat-baris").content.cloneNode(true); 
    baris.querySelector(".baris-keranjang").dataset.id = item.id; 
    baris.querySelector(".foto").src = menu.querySelector(".foto").src; 
    baris.querySelector(".baris-info a").textContent = menu.dataset.nama; 
    baris.querySelector(".baris-info a").href = "#/detail/" + item.id; 
    baris.querySelector(".baris-info p").textContent = rupiah(item.harga); 
    baris.querySelector(".jumlah").textContent = item.jumlah; 
    baris.querySelector('[data-aksi="kurang"]').disabled = item.jumlah <= 1; 
    baris.querySelector(".baris-subtotal").textContent = rupiah( 
      item.harga * item.jumlah, 
    ); 
    wadah.append(baris); 
  }); 
} 
 
// Fitur tampilan keranjang 
function tampilkanKeranjang() { 
  isiBaris(ambil("daftar-keranjang"), keranjang); 
  ambil("keranjang-jumlah").textContent = jumlahBarang(); 
  ambil("keranjang-subtotal").textContent = rupiah(totalHarga()); 
} 
 
// Fitur kurangi, tambah, dan hapus barang 
ambil("daftar-keranjang").addEventListener("click", function (e) { 
  const aksi = e.target.dataset.aksi; 
  if (!aksi) { 
    return; 
  } 
  const id = Number(e.target.closest("[data-id]").dataset.id); 
  const item = keranjang.find(function (i) { 
    return i.id === id; 
  }); 
  if (aksi === "kurang") { 
    item.jumlah -= 1; 
  } 
  if (aksi === "tambah") { 
    item.jumlah += 1; 
  }
   if (aksi === "hapus") { 
    keranjang = keranjang.filter(function (i) { 
      return i !== item; 
    }); 
  } 
  simpanKeranjang(); 
  tampilkanKeranjang(); 
}); 
 
/* ===== MENU CHECKOUT ===== */ 
// Fitur ringkasan pesanan 
function tampilkanCheckout() { 
  isiBaris(ambil("ringkasan-checkout"), keranjang); 
  ambil("checkout-total").textContent = rupiah(totalHarga()); 
} 
 
// Fitur buat pesanan (form sudah divalidasi oleh HTML) 
ambil("form-checkout").addEventListener("submit", function (e) { 
  e.preventDefault(); 
  const pesanan = { 
    nama: ambil("isian-nama").value.trim(), 
    barang: keranjang, 
    total: totalHarga(), 
  }; 
  localStorage.setItem("pesananTerakhir", JSON.stringify(pesanan)); 
  keranjang = []; 
  simpanKeranjang(); 
  this.reset(); 
  location.hash = "#/sukses"; 
});
/* ===== MENU SUKSES ===== */ 
// Fitur rincian pesanan yang baru dibuat 
function tampilkanSukses() { 
  const pesanan = JSON.parse(localStorage.getItem("pesananTerakhir")); 
  ambil("isi-sukses").hidden = !pesanan; 
  ambil("sukses-tidak-ada").hidden = Boolean(pesanan); 
  if (!pesanan) { 
    return; 
  } 
  ambil("sukses-pemesan").textContent = 
    "Terima kasih, " + pesanan.nama + ". Pesananmu sedang diproses."; 
  isiBaris(ambil("sukses-daftar"), pesanan.barang); 
  ambil("sukses-total").textContent = rupiah(pesanan.total); 
} 
 
/* ===== FITUR PINDAH HALAMAN (berlaku di semua menu) ===== */ 
// Fitur pindah halaman berdasarkan hash URL, contoh: #/detail/3 
function aturHalaman() { 
  const bagian = location.hash.replace("#/", "").split("/"); 
  let halaman = bagian[0] || "katalog"; 
 
  if ( 
    !["katalog", "login", "detail", "keranjang", "checkout", "sukses"].includes( 
      halaman, 
    ) 
  ) { 
    halaman = "katalog"; 
  }
   if (halaman === "login" && sudahMasuk()) { 
    return location.replace("#/"); 
  } 
  if (halaman === "checkout" && keranjang.length === 0) { 
    return location.replace("#/keranjang"); 
  } 
  // Fitur wajib login: semua menu selain katalog dan login 
  if (halaman !== "katalog" && halaman !== "login" && !sudahMasuk()) { 
    halaman = "login"; 
  } 
 
  document.documentElement.classList.toggle("sudah-masuk", sudahMasuk()); 
  document.body.dataset.halaman = halaman; 
  window.scrollTo(0, 0); 
 
  if (halaman === "katalog") { 
    tampilkanKatalog(); 
  } 
  if (halaman === "login") { 
    ambil("login-salah").hidden = true; 
  } 
  if (halaman === "detail") { 
    tampilkanDetail(bagian[1]); 
  } 
  if (halaman === "keranjang") { 
    tampilkanKeranjang(); 
  } 
  if (halaman === "checkout") { 
    tampilkanCheckout(); 
  } 
  if (halaman === "sukses") { 
    tampilkanSukses(); 
  } 
} 
 
/* ===== FITUR MULAI ===== */ 
window.addEventListener("hashchange", aturHalaman); 
simpanKeranjang(); 
aturHalaman(); 



/* ===== FITUR TAMBAHAN ===== */
// Fitur tampilkan / sembunyikan password
ambil("lihat-password").addEventListener("change", function () {
  ambil("isian-password").type = this.checked ? "text" : "password";
});
ambil("form-login").addEventListener("reset", function () {
  ambil("isian-password").type = "password";
});

// Fitur animasi saat menambah produk ke keranjang
ambil("tombol-keranjang").addEventListener("click", function () {
  const tombol = this;
  const lencana = ambil("lencana-keranjang");
  const teksAsli = tombol.textContent;

  // Tombol berubah sebentar
  tombol.textContent = "✓ Ditambahkan";
  setTimeout(function () {
    tombol.textContent = teksAsli;
  }, 1000);

  // Lencana keranjang membesar sebentar
  const jumlahDitambah = Number(ambil("isian-jumlah").value);
  function denyut() {
    lencana.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }],
      { duration: 350 },
    );
    // Tulisan +jumlah muncul di bawah lencana lalu memudar
    const kotak = lencana.getBoundingClientRect();
    const plus = document.createElement("span");
    plus.className = "tambah-jumlah";
    plus.textContent = "+" + jumlahDitambah;
    plus.style.left = kotak.left + kotak.width / 2 - 14 + "px";
    plus.style.top = kotak.bottom + 4 + "px";
    document.body.append(plus);
    plus.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(18px)", opacity: 0 },
      ],
      { duration: 1000, easing: "ease-out" },
    ).onfinish = function () {
      plus.remove();
    };
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return denyut();
  }

  // Foto menu terbang dari tombol ke ikon keranjang
  const awal = tombol.getBoundingClientRect();
  const tujuan = lencana.getBoundingClientRect();
  const terbang = ambil("detail-gambar").cloneNode();
  terbang.removeAttribute("id");
  terbang.className = "foto-terbang";
  terbang.style.left = awal.left + awal.width / 2 - 40 + "px";
  terbang.style.top = awal.top + awal.height / 2 - 40 + "px";
  terbang.style.width = "80px";
  terbang.style.height = "80px";
  document.body.append(terbang);

  const dx = tujuan.left - parseFloat(terbang.style.left);
  const dy = tujuan.top - parseFloat(terbang.style.top);
  terbang.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx + "px, " + dy + "px) scale(0.2)", opacity: 0.4 },
    ],
    { duration: 700, easing: "ease-in" },
  ).onfinish = function () {
    terbang.remove();
    denyut();
  };
});

// Fitur tanya konfirmasi saat keluar dan saat menghapus barang dari keranjang
// (dipasang di tahap capture agar berjalan sebelum fitur keluar / hapus yang lama)
let lewati = false;
document.addEventListener(
  "click",
  function (e) {
    if (lewati) {
      return;
    }
    const hapus = e.target.closest('#daftar-keranjang [data-aksi="hapus"]');
    let pesan = "";
    if (e.target.closest("#tombol-keluar")) {
      pesan = "Yakin ingin keluar dari akun?";
    } else if (hapus) {
      pesan = "Hapus menu ini dari keranjang?";
    }
    if (!pesan) {
      return;
    }
    const baris = hapus && hapus.closest(".baris-keranjang");
    if ((baris && baris.classList.contains("hapus-anim")) || !confirm(pesan)) {
      e.stopPropagation();
      return;
    }
    if (hapus) {
      // Barang meluncur keluar dulu, baru dihapus
      e.stopPropagation();
      baris.classList.add("hapus-anim");
      setTimeout(function () {
        lewati = true;
        hapus.click();
        lewati = false;
      }, 350);
    }
  },
  true,
);

/* ===== KUMPULAN ANIMASI ===== */
const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getar = [
  { transform: "translateX(0)" },
  { transform: "translateX(-8px)" },
  { transform: "translateX(8px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(0)" },
];

// Daun teh jatuh sebagai hiasan latar
if (!kurangGerak) {
  const wadahDaun = document.createElement("div");
  wadahDaun.className = "daun-wadah";
  wadahDaun.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 12; i++) {
    const daun = document.createElement("span");
    daun.className = "daun";
    daun.textContent = "🍃";
    daun.style.left = Math.random() * 100 + "%";
    daun.style.fontSize = 16 + Math.random() * 18 + "px";
    daun.style.animationDuration = 14 + Math.random() * 14 + "s";
    daun.style.animationDelay = -Math.random() * 20 + "s";
    wadahDaun.append(daun);
  }
  document.body.prepend(wadahDaun);
}

// Bar progres scroll dan tombol kembali ke atas
const progres = document.createElement("div");
progres.id = "progres";
const keAtas = document.createElement("button");
keAtas.id = "ke-atas";
keAtas.type = "button";
keAtas.setAttribute("aria-label", "Kembali ke atas");
keAtas.textContent = "↑";
document.body.append(progres, keAtas);
window.addEventListener(
  "scroll",
  function () {
    const maks = document.documentElement.scrollHeight - window.innerHeight;
    progres.style.transform = "scaleX(" + (maks > 0 ? window.scrollY / maks : 0) + ")";
    keAtas.classList.toggle("tampil", window.scrollY > 300);
  },
  { passive: true },
);
keAtas.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Efek riak saat tombol diklik
document.addEventListener("click", function (e) {
  const tombol = e.target.closest(
    ".tombol, .tombol-keranjang, .tombol-pesan, .tombol-cari, .navigasi a, .navigasi button, .kasir-jumlah button, .pengatur-jumlah button",
  );
  if (!tombol || tombol.disabled || kurangGerak) {
    return;
  }
  const kotak = tombol.getBoundingClientRect();
  const ukuran = Math.max(kotak.width, kotak.height) * 2;
  const riak = document.createElement("span");
  riak.className = "riak";
  riak.style.width = riak.style.height = ukuran + "px";
  riak.style.left = e.clientX - kotak.left - ukuran / 2 + "px";
  riak.style.top = e.clientY - kotak.top - ukuran / 2 + "px";
  tombol.append(riak);
  setTimeout(function () {
    riak.remove();
  }, 650);
});

// Placeholder pencarian mengetik otomatis
(function () {
  const kolom = ambil("input-cari");
  if (kurangGerak) {
    kolom.placeholder = "Cari menu...";
    return;
  }
  const kata = ["Cari Thai Tea...", "Cari Green Tea...", "Cari Teh Original...", "Cari Milk Green Tea..."];
  let k = 0, h = 0, hapus = false, jeda = 0;
  setInterval(function () {
    if (kolom.value || document.activeElement === kolom) {
      kolom.placeholder = "";
      return;
    }
    if (jeda > 0) {
      jeda--;
      return;
    }
    const t = kata[k];
    if (!hapus) {
      h++;
      if (h === t.length) { hapus = true; jeda = 12; }
    } else {
      h--;
      if (h === 0) { hapus = false; k = (k + 1) % kata.length; }
    }
    kolom.placeholder = t.slice(0, h);
  }, 110);
})();

// Angka total ikut membesar sebentar saat berubah
const pantauan = new MutationObserver(function (daftar) {
  if (kurangGerak) {
    return;
  }
  daftar.forEach(function (m) {
    const el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
      { duration: 350 },
    );
  });
});
document
  .querySelectorAll(".total-teks, #keranjang-jumlah, #keranjang-subtotal, #checkout-total, #sukses-total")
  .forEach(function (el) {
    pantauan.observe(el, { childList: true, characterData: true, subtree: true });
  });

// Isian jumlah membesar saat tombol + / - ditekan
["tombol-tambah", "tombol-kurang"].forEach(function (id) {
  ambil(id).addEventListener("click", function () {
    if (!kurangGerak) {
      ambil("isian-jumlah").animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }],
        { duration: 250 },
      );
    }
  });
});

// Getar saat isian salah / login salah
document.addEventListener(
  "invalid",
  function (e) {
    if (!kurangGerak) {
      e.target.animate(getar, { duration: 350 });
    }
  },
  true,
);
ambil("form-login").addEventListener("submit", function () {
  if (!ambil("login-salah").hidden && !kurangGerak) {
    document.querySelector(".masuk").animate(getar, { duration: 400 });
  }
});

// Konfeti saat pesanan berhasil
function konfeti() {
  const warna = ["#8fe380", "#2e7d32", "#8cc63f", "#ffd54f", "#ff8a65", "#ffffff"];
  for (let i = 0; i < 50; i++) {
    const c = document.createElement("span");
    c.className = "konfeti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.width = 6 + Math.random() * 6 + "px";
    c.style.height = 10 + Math.random() * 8 + "px";
    c.style.background = warna[i % warna.length];
    document.body.append(c);
    c.animate(
      [
        { transform: "translate(0, 0) rotate(0)" },
        { transform: "translate(" + (Math.random() - 0.5) * 200 + "px, 105vh) rotate(" + Math.random() * 720 + "deg)" },
      ],
      { duration: 2000 + Math.random() * 2000, delay: Math.random() * 500, easing: "cubic-bezier(.3,.6,.5,1)", fill: "backwards" },
    ).onfinish = function () {
      c.remove();
    };
  }
}

// Penanda perpindahan halaman (untuk animasi masuk) dan konfeti
let waktuPindah;
function aturPindah() {
  document.body.classList.add("pindah");
  clearTimeout(waktuPindah);
  waktuPindah = setTimeout(function () {
    document.body.classList.remove("pindah");
  }, 1000);
  if (document.body.dataset.halaman === "sukses" && !ambil("isi-sukses").hidden && !kurangGerak) {
    konfeti();
  }
}
window.addEventListener("hashchange", aturPindah);
aturPindah();

// Footer muncul perlahan saat di-scroll
(function () {
  const target = document.querySelectorAll(".kaki-kolom > section, .kaki-hakcipta");
  target.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = i * 0.12 + "s";
  });
  if (!("IntersectionObserver" in window)) {
    target.forEach(function (el) { el.classList.add("terlihat"); });
    return;
  }
  const amati = new IntersectionObserver(function (daftar) {
    daftar.forEach(function (d) {
      if (d.isIntersecting) {
        d.target.classList.add("terlihat");
        amati.unobserve(d.target);
      }
    });
  }, { threshold: 0.15 });
  target.forEach(function (el) { amati.observe(el); });
})();


// Hero login: hentikan video jika pengguna memilih mengurangi gerakan
if (kurangGerak) {
  const videoHero = document.querySelector(".masuk-video");
  if (videoHero) { videoHero.removeAttribute("autoplay"); videoHero.pause(); }
}
