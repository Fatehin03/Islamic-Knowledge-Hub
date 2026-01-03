// ==========================================
// 1. PRAYER TIMES & CALENDAR API (AlAdhan)
// ==========================================

function initHome() {
    // Set current Gregorian Date
    document.getElementById('gregorian-date').innerText = new Date().toDateString();
    
    // Try to get Hijri Date from AlAdhan API immediately
    fetchHijriDate();
}

function fetchHijriDate() {
    const date = new Date();
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();

    fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`)
        .then(response => response.json())
        .then(data => {
            const hijri = data.data.hijri;
            document.getElementById('hijri-date').innerText = 
                `${hijri.day} ${hijri.month.en} ${hijri.year}`;
        })
        .catch(err => document.getElementById('hijri-date').innerText = "Unavailable");
}

function getPrayerTimesByLocation() {
    const loader = document.getElementById('prayer-loader');
    loader.style.display = 'block';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Fetch from API
            fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`)
                .then(res => res.json())
                .then(data => displayPrayerTimes(data.data.timings, "Your Location"))
                .catch(err => alert("Error fetching API data"));
        });
    } else {
        alert("Geolocation not supported.");
    }
}

function getPrayerTimesByCity() {
    const city = document.getElementById('city').value;
    const country = document.getElementById('country').value;
    const loader = document.getElementById('prayer-loader');
    
    if(!city || !country) { alert("Please enter city and country"); return; }
    
    loader.style.display = 'block';

    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`)
        .then(res => res.json())
        .then(data => displayPrayerTimes(data.data.timings, `${city}, ${country}`))
        .catch(err => {
            loader.style.display = 'none';
            alert("Could not find city.");
        });
}

function displayPrayerTimes(timings, locationName) {
    document.getElementById('prayer-loader').style.display = 'none';
    document.getElementById('prayer-results').style.display = 'block';
    document.getElementById('location-name').innerText = locationName;

    const tbody = document.getElementById('prayer-table-body');
    tbody.innerHTML = `
        <tr><td>Fajr</td><td>${timings.Fajr}</td></tr>
        <tr><td>Dhuhr</td><td>${timings.Dhuhr}</td></tr>
        <tr><td>Asr</td><td>${timings.Asr}</td></tr>
        <tr><td>Maghrib</td><td>${timings.Maghrib}</td></tr>
        <tr><td>Isha</td><td>${timings.Isha}</td></tr>
    `;
}

// ==========================================
// 2. QURAN API (Al Quran Cloud)
// ==========================================

function initQuran() {
    if(!document.getElementById('surah-select')) return;

    // Fetch list of all Surahs
    fetch('https://api.alquran.cloud/v1/surah')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('surah-select');
            data.data.forEach(surah => {
                const option = document.createElement('option');
                option.value = surah.number;
                option.innerText = `${surah.number}. ${surah.englishName} (${surah.name})`;
                select.appendChild(option);
            });
        });
}

function loadSurah(surahNumber) {
    if(!surahNumber) return;
    
    document.getElementById('quran-loader').style.display = 'block';
    document.getElementById('quran-content').style.display = 'none';

    // Fetch Arabic and English Translation in parallel
    Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`), // Arabic
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`) // English
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(data => {
        const arabicData = data[0].data;
        const englishData = data[1].data;

        document.getElementById('surah-title').innerText = arabicData.englishName;
        const container = document.getElementById('ayahs-container');
        container.innerHTML = '';

        arabicData.ayahs.forEach((ayah, index) => {
            const div = document.createElement('div');
            div.style.borderBottom = "1px solid #eee";
            div.style.padding = "15px 0";
            div.innerHTML = `
                <p class="arabic">${ayah.text} <span style="font-size:0.8rem; color:green">(${ayah.numberInSurah})</span></p>
                <p class="translation">${englishData.ayahs[index].text}</p>
            `;
            container.appendChild(div);
        });

        document.getElementById('quran-loader').style.display = 'none';
        document.getElementById('quran-content').style.display = 'block';
    });
}

// ==========================================
// 3. HADITH API (Random Hadith Generator)
// ==========================================

function loadRandomHadith() {
    if(!document.getElementById('hadith-content')) return;
    
    const container = document.getElementById('hadith-content');
    container.innerHTML = "Loading...";

    // This is a free public API for random hadiths
    fetch('https://random-hadith-generator.vercel.app/bukhari/')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = `
                <div style="font-size: 1.1rem; line-height: 1.6;">
                    <p><strong>Narrator:</strong> ${data.data.header}</p>
                    <p>"${data.data.hadith_english}"</p>
                    <p style="color: #666; font-size: 0.9rem; margin-top:10px;">Reference: ${data.data.refno}</p>
                </div>
            `;
        })
        .catch(err => {
            container.innerHTML = "Failed to load Hadith. Please try again.";
        });
}

// ==========================================
// 4. DUA (Remote JSON Simulation)
// ==========================================
function initDua() {
    if(!document.getElementById('dua-container')) return;

    // Fetching from a raw GitHub JSON file to simulate an API call
    // (Since there is no standard public Dua API)
    const mockApiUrl = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/eng-muslim.json"; 
    // *Note: For this example, I will inject a static array to ensure it works 
    // perfectly for you, as external raw links can sometimes break.*
    
    const duas = [
        { title: "Upon Waking Up", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", trans: "All praise is due to Allah who gave us life after He had caused us to die, and unto Him is the resurrection." },
        { title: "Before Eating", arabic: "بِسْمِ اللَّهِ", trans: "In the name of Allah." },
        { title: "Breaking Fast", arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ", trans: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills." }
    ];

    const container = document.getElementById('dua-container');
    container.innerHTML = duas.map(d => `
        <div class="card">
            <h3>${d.title}</h3>
            <p class="arabic">${d.arabic}</p>
            <p class="translation">${d.trans}</p>
        </div>
    `).join('');
}
