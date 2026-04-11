function showLoader() {
    const loader = document.getElementById("loader");
    loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    loader.style.display = "none";
}

function displayCards(items, containerId) {
    const container = document.getElementById(containerId);

    if (items.length === 0) {
        container.innerHTML = "<p>No data found.</p>";
        return;
    }

    container.innerHTML += items.map(item => `
        <div class="card">
            <img 
                src="${IMG_URL}${item.poster_path}" 
                alt="${item.title || item.name}"
                onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'"
            />
            <div class="card-info">
                <h3>${item.title || item.name}</h3>
                <p class="rating">⭐ ${item.vote_average.toFixed(1)}</p>
                <p class="date">📅 ${item.release_date || item.first_air_date || "N/A"}</p>
            </div>
        </div>
    `).join("");
}

function switchTab(type) {
    const moviesSection = document.getElementById("movies-section");
    const seriesSection = document.getElementById("series-section");
    const buttons = document.querySelectorAll(".nav-btn");

    if (type === "movies") {
        moviesSection.style.display = "block";
        seriesSection.style.display = "none";
        buttons[0].classList.add("active");
        buttons[1].classList.remove("active");
    } else {
        moviesSection.style.display = "none";
        seriesSection.style.display = "block";
        buttons[0].classList.remove("active");
        buttons[1].classList.add("active");
    }
}

async function init() {
    showLoader();
    const movies = await fetchTrending("movie");
    const series = await fetchTrending("tv");
    displayCards(movies, "movies-container");
    displayCards(series, "series-container");
    hideLoader();
}

init();