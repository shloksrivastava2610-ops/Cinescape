let allMovies = [];
let allSeries = [];
let currentTab = "movies";

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
        container.innerHTML = "<p style='color:#888; padding:20px'>No results found.</p>";
        return;
    }

    container.innerHTML = items.map(item => `
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
    currentTab = type;
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

    applyFilters();
}

// DEBOUNCE FUNCTION
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// FILTER + SEARCH using HOFs
function applyFilters() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const selectedGenre = document.getElementById("genre-filter").value;

    const data = currentTab === "movies" ? allMovies : allSeries;
    const containerId = currentTab === "movies" ? "movies-container" : "series-container";

    let filtered = data
        .filter(item => {
            const title = (item.title || item.name).toLowerCase();
            return title.includes(searchQuery);
        })
        .filter(item => {
            if (!selectedGenre) return true;
            return item.genre_ids.includes(Number(selectedGenre));
        });

    displayCards(filtered, containerId);
}

// EVENT LISTENERS
document.getElementById("search-input").addEventListener(
    "input",
    debounce(applyFilters, 400)
);

document.getElementById("genre-filter").addEventListener("change", applyFilters);

async function init() {
    showLoader();
    allMovies = await fetchTrending("movie");
    allSeries = await fetchTrending("tv");
    displayCards(allMovies, "movies-container");
    displayCards(allSeries, "series-container");
    hideLoader();
}

init();