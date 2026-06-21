

const urlParams = new URLSearchParams(window.location.search);
const kelasId = urlParams.get('kelas_id');

const tabelKenaikan = document.getElementById('tabelKenaikan');
const emptyState = document.getElementById('emptyState');

if (!kelasId) {
    window.location.href = '/manajemen-kelas.html';
}


async function muatNamaKelas() {
    try {
        const response = await fetch(`/api/kelas/${kelasId}`);
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();
        document.getElementById('namaKelasLabel').textContent = data.nama_kelas;
    } catch (err) {
        console.error(err);
    }
}


async function muatDataKenaikan() {
    try {
        const response = await fetch(`/api/nilai/kelas/${kelasId}/kenaikan`);
        const result = await response.json();

        document.getElementById('kkmLabel').textContent = result.kkm;

        if (result.data.length === 0) {
            tabelKenaikan.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tabelKenaikan.innerHTML = result.data.map((s) => {
            const badgeClass = s.status_kenaikan === 'Lulus' ? 'badge-lulus' : 'badge-tidak-lulus';
            return `
                <tr>
                    <td>${s.nis}</td>
                    <td>${s.nama}</td>
                    <td>${s.nilai_rata_rata}</td>
                    <td><span class="badge ${badgeClass}">${s.status_kenaikan}</span></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        tabelKenaikan.innerHTML = '<tr><td colspan="4">Gagal memuat data kenaikan kelas.</td></tr>';
    }
}

muatNamaKelas();
muatDataKenaikan();
