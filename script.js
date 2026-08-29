const form = document.getElementById('bookingForm');
const statusDiv = document.getElementById('status');
const tanggalInput = document.getElementById('tanggal');
const timeSlotsDiv = document.getElementById('timeSlots');
const jamInput = document.getElementById('jam');
const btnSubmit = document.getElementById('btnSubmit');

const brandSelect = document.getElementById('brand');
const tipeSelect = document.getElementById('tipe');
const modelSelect = document.getElementById('model');
const wrapTipe = document.getElementById('wrapTipe');
const wrapModel = document.getElementById('wrapModel');

const scriptURL = 'https://script.google.com/macros/s/AKfycbzz5rP8PH-4T2EyFfDqwA6HZeJODQK3eDbUnziB2kMo7MeGd1RkyEscMCBti6J4o-Pluw/exec'; 

const availableTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00"];
let bookedData = {};
let isDataReady = false;
// Memblokir tanggal sebelum hari ini di kalender
const today = new Date();
const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
tanggalInput.setAttribute('min', todayString);

fetch(scriptURL + '?v=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        bookedData = data;
        isDataReady = true; 
        
        if (tanggalInput.value) {
            renderTimeSlots();
        }
    });

const motorData = {
    "Honda": {
        "Matic": ["Beat", "Vario", "Scoopy", "PCX", "ADV", "Spacy", "Genio"],
        "Bebek": ["Supra", "Revo", "Blade", "Kharisma", "GTR"],
        "Sport / Klasik": ["CBR", "CB", "Megapro", "Tiger", "Sonic", "Verza"],
        "Trail": ["CRF"]
    },
    "Yamaha": {
        "Matic": ["Mio", "NMAX", "Aerox", "Fazzio", "Lexi", "Grand Filano", "X-Ride", "FreeGo"],
        "Bebek": ["Jupiter", "Vega", "MX King", "Force FI"],
        "Sport / Klasik": ["Vixion", "R15", "R25", "XSR", "Byson", "Scorpio", "MT-15"],
        "Trail": ["WR155"]
    },
    "Suzuki": {
        "Matic": ["Nex", "Address", "Avenis", "Spin", "Skywave", "Skydrive"],
        "Bebek": ["Smash", "Shogun", "Satria F150"],
        "Sport / Klasik": ["GSX", "Thunder", "Bandit", "Inazuma"],
        "Trail": ["TS125"]
    },
    "Kawasaki": {
        "Matic": [],
        "Bebek": ["Athlete", "Edge"],
        "Sport / Klasik": ["Ninja", "W175", "Z250", "ZX-25R", "Versys"],
        "Trail": ["KLX", "D-Tracker"]
    }
};

brandSelect.addEventListener('change', () => {
    const selectedBrand = brandSelect.value;
    tipeSelect.innerHTML = '<option value="" disabled selected>Pilih tipe...</option>';
    modelSelect.innerHTML = '<option value="" disabled selected>Pilih motor...</option>';
    wrapModel.classList.add('d-none');
    
    if (selectedBrand) {
        const types = Object.keys(motorData[selectedBrand]);
        types.forEach(type => {
            if (motorData[selectedBrand][type].length > 0) {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                tipeSelect.appendChild(option);
            }
        });
        wrapTipe.classList.remove('d-none');
    } else {
        wrapTipe.classList.add('d-none');
    }
});

tipeSelect.addEventListener('change', () => {
    const selectedBrand = brandSelect.value;
    const selectedTipe = tipeSelect.value;
    modelSelect.innerHTML = '<option value="" disabled selected>Pilih motor...</option>';
    
    if (selectedBrand && selectedTipe) {
        const models = motorData[selectedBrand][selectedTipe];
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        
        const otherOption = document.createElement('option');
        otherOption.value = "Lainnya";
        otherOption.textContent = "Lainnya";
        modelSelect.appendChild(otherOption);
        
        wrapModel.classList.remove('d-none');
    } else {
        wrapModel.classList.add('d-none');
    }
});

function renderTimeSlots() {
    const selectedDate = tanggalInput.value;
    jamInput.value = '';
    btnSubmit.disabled = true;

    if (!isDataReady) {
        timeSlotsDiv.innerHTML = '<div class="col-12 text-center text-secondary small py-2">Menyiapkan jadwal...</div>';
        return;
    }

    const bookedTimes = bookedData[selectedDate] || [];
    timeSlotsDiv.innerHTML = '';

    // Ambil waktu saat ini untuk mencoret jam yang sudah lewat
    const now = new Date();
    const currentDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = selectedDate === currentDateString;
    const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    availableTimes.forEach(time => {
        const col = document.createElement('div');
        col.className = 'col-4 col-sm-3';
        
        const btn = document.createElement('div');
        btn.className = 'time-btn';
        btn.textContent = time;

        // Cek apakah jam ini sudah kelewat (khusus untuk hari ini)
        let isPastTime = false;
        if (isToday && time < currentTimeString) {
            isPastTime = true;
        }

        // Jam dicoret (booked) jika sudah ada yang pesan ATAU jika jam sudah lewat
        if (bookedTimes.includes(time) || isPastTime) {
            btn.classList.add('booked');
        } else {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => {
                    if (!b.classList.contains('booked')) {
                        b.classList.remove('selected');
                    }
                });
                btn.classList.add('selected');
                jamInput.value = time;
                btnSubmit.disabled = false;
            });
        }
        
        col.appendChild(btn);
        timeSlotsDiv.appendChild(col);
    });
}

tanggalInput.addEventListener('change', renderTimeSlots);

form.addEventListener('submit', e => {
    e.preventDefault();
    statusDiv.textContent = "Mengirim data... Mohon tunggu.";
    statusDiv.className = "text-center mt-3 fw-medium text-dark";
    btnSubmit.disabled = true;
    
    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
            statusDiv.textContent = "Booking berhasil dikirim. Silakan cek status booking kamnu di beranda!";
            statusDiv.className = "text-center mt-3 fw-medium text-success";
            
            const curDate = tanggalInput.value;
            const curJam = jamInput.value;
            const curLayanan = document.getElementById('layanan').value;
            
            if (curLayanan === "Modifikasi / Remap" || curLayanan === "Bongkar Total") {
                if (!bookedData[curDate]) {
                    bookedData[curDate] = [];
                }
                bookedData[curDate].push(curJam);
            }

            form.reset();
            wrapTipe.classList.add('d-none');
            wrapModel.classList.add('d-none');
            timeSlotsDiv.innerHTML = '';
        })
        .catch(error => {
            statusDiv.textContent = "Terjadi kesalahan koneksi, coba lagi.";
            statusDiv.className = "text-center mt-3 fw-medium text-danger";
            btnSubmit.disabled = false;
        });
});