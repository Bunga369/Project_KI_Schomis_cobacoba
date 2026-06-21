

const urlParams = new URLSearchParams(window.location.search);
let kelasIdAktif = urlParams.get('kelas_id');

const tabelNilai = document.getElementById('tabelNilai');
const emptyState = document.getElementById('emptyState');
const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const modalNilai = document.getElementById('modalNilai');
const formNilai = document.getElementById('formNilai');
const pesanModal = document.getElementById('pesanModal');

let daftarKelas = [];


async function muatDaftarKelasUntukDropdown() {
    try {
        const response = await fetch('/api/kelas');
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        daftarKelas = await response.json();

        if (daftarKelas.length === 0) {
            dropdownToggle.textContent = 'Belum ada kelas';
            tabelNilai.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        
        if (!kelasIdAktif) {
            kelasIdAktif = daftarKelas[0].id;
        }

        renderDropdownMenu();
        perbaruiLabelKelasAktif();
        muatNilai();
    } catch (err) {
        console.error(err);
    }
}

function renderDropdownMenu() {
    dropdownMenu.innerHTML = daftarKelas.map((k) => `
        <a href="#" onclick="gantiKelas(${k.id}); return false;">${k.nama_kelas}</a>
    `).join('');
}

function perbaruiLabelKelasAktif() {
    const kelas = daftarKelas.find((k) => k.id == kelasIdAktif);
    dropdownToggle.innerHTML = `${kelas ? kelas.nama_kelas : '-'} &#9662;`;
}

function gantiKelas(id) {
    kelasIdAktif = id;
    perbaruiLabelKelasAktif();
    dropdownMenu.classList.remove('show');
    muatNilai();
}


dropdownToggle.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});


document.addEventListener('click', (e) => {
    if (!e.target.closest('.kelas-dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});


async function muatNilai() {
    try {
        const response = await fetch(`/api/nilai/kelas/${kelasIdAktif}`);
        const data = await response.json();

        if (data.length === 0) {
            tabelNilai.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tabelNilai.innerHTML = data.map((s) => `
            <tr>
                <td>${s.nis}</td>
                <td>${s.nama}</td>
                <td>${s.matematika}</td>
                <td>${s.b_inggris}</td>
                <td>${s.b_indonesia}</td>
                <td><strong>${s.rata_rata}</strong></td>
                <td>
                    <button class="btn-icon" title="Edit Nilai" onclick='bukaModalEdit(${JSON.stringify(s)})'>&#9998;</button>
                </td>
            </tr>
        `).join('');

        
        document.getElementById('linkKenaikanKelas').href = `/kenaikan-kelas.html?kelas_id=${kelasIdAktif}`;
    } catch (err) {
        console.error(err);
        tabelNilai.innerHTML = '<tr><td colspan="7">Gagal memuat data nilai.</td></tr>';
    }
}


function bukaModalEdit(siswa) {
    document.getElementById('siswaIdNilai').value = siswa.siswa_id;
    document.getElementById('nisTampil').value = siswa.nis;
    document.getElementById('namaTampil').value = siswa.nama;
    document.getElementById('nilaiMatematika').value = siswa.matematika;
    document.getElementById('nilaiInggris').value = siswa.b_inggris;
    document.getElementById('nilaiIndonesia').value = siswa.b_indonesia;
    pesanModal.textContent = '';
    modalNilai.classList.add('show');
}

document.getElementById('btnBatalModal').addEventListener('click', () => {
    modalNilai.classList.remove('show');
});


formNilai.addEventListener('submit', async (e) => {
    e.preventDefault();

    const siswaId = document.getElementById('siswaIdNilai').value;
    const matematika = document.getElementById('nilaiMatematika').value;
    const b_inggris = document.getElementById('nilaiInggris').value;
    const b_indonesia = document.getElementById('nilaiIndonesia').value;

    if (matematika === '' || b_inggris === '' || b_indonesia === '') {
        pesanModal.textContent = 'Semua nilai mata pelajaran wajib diisi.';
        return;
    }

    try {
        const response = await fetch(`/api/nilai/${siswaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matematika, b_inggris, b_indonesia }),
        });

        const data = await response.json();

        if (response.ok) {
            modalNilai.classList.remove('show');
            muatNilai();
        } else {
            pesanModal.textContent = data.message || 'Gagal menyimpan nilai.';
        }
    } catch (err) {
        console.error(err);
        pesanModal.textContent = 'Tidak bisa terhubung ke server.';
    }
});

muatDaftarKelasUntukDropdown();
