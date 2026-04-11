let allMovies = [];
let allSeries = [];
let currentTab = "movies";
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let currentPage = 1;
let isLoading = false;

function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

function showBottomLoader() {
    document.getElementById("bottom-loader").style.display = "flex";
}

function hideBottomLoader() {
    document.getElementById("bottom-loader").style.display = "none";
}

function saveFavourites() {
    localStorage.setItem("favourites", JSON.stringify(favourites));
}

function toggleFavourite(item) {
    const exists = favourites.find(fav => fav.id === item.id);
    if (exists) {
        favourites = favourites.filter(fav => fav.id !== item.id);
    } else {
        favourites.push(item);
    }
    saveFavourites();
    applyFilters();
}

function isFavourite(id) {
    return favourites.some(fav => fav.id === id);
}

function createCard(item) {
    const isFav = isFavourite(item.id);
    return `
        <div class="card">
            <img 
                src="${IMG_URL}${item.poster_path}" 
                alt="${item.title || item.name}"
                onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'"
            />
            <button 
                class="fav-btn ${isFav ? 'active' : ''}" 
                onclick='toggleFavourite(${JSON.stringify(item)})'
            >
                ${isFav ? '❤️' : '🤍'}
            </button>
            <div class="card-info">
                <h3>${item.title || item.name}</h3>
                <p class="rating">⭐ ${item.vote_average.toFixed(1)}</p>
                <p class="date">📅 ${item.release_date || item.first_air_date || "N/A"}</p>
            </div>
        </div>
    `;
}

function displayCards(items, containerId, append = false) {
    const container = document.getElementById(containerId);

    if (!append) {
        if (items.length === 0) {
            container.innerHTML = "<p style='color:#888; padding:20px'>No results found.</p>";
            return;
        }
        container.innerHTML = items.map(item => createCard(item)).join("");
    } else {
        container.innerHTML += items.map(item => createCard(item)).join("");
    }
}

function switchTab(type) {
    currentTab = type;
    currentPage = 1;

    const moviesSection = document.getElementById("movies-section");
    const seriesSection = document.getElementById("series-section");
    const favouritesSection = document.getElementById("favourites-section");
    const buttons = document.querySelectorAll(".nav-btn");

    moviesSection.style.display = "none";
    seriesSection.style.display = "none";
    favouritesSection.style.display = "none";
    buttons.forEach(btn => btn.classList.remove("active"));

    if (type === "movies") {
        moviesSection.style.display = "block";
        buttons[0].classList.add("active");
    } else if (type === "series") {
        seriesSection.style.display = "block";
        buttons[1].classList.add("active");
    } else if (type === "favourites") {
        favouritesSection.style.display = "block";
        buttons[2].classList.add("active");
        displayCards(favourites, "favourites-container");
        return;
    }

    applyFilters();
}

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

function applySort(data) {
    const sortValue = document.getElementById("sort-filter").value;
    return [...data].sort((a, b) => {
        if (sortValue === "rating-high") return b.vote_average - a.vote_average;
        if (sortValue === "rating-low") return a.vote_average - b.vote_average;
        if (sortValue === "date-new") return new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date);
        if (sortValue === "date-old") return new Date(a.release_date || a.first_air_date) - new Date(b.release_date || b.first_air_date);
        if (sortValue === "alpha-asc") return (a.title || a.name).localeCompare(b.title || b.name);
        if (sortValue === "alpha-desc") return (b.title || b.name).localeCompare(a.title || a.name);
        return 0;
    });
}

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

    filtered = applySort(filtered);
    displayCards(filtered, containerId);
}

async function loadMoreData() {
    if (isLoading || currentTab === "favourites") return;
    isLoading = true;
    currentPage++;
    showBottomLoader();

    const type = currentTab === "movies" ? "movie" : "tv";
    const newItems = await fetchTrendingPage(type, currentPage);

    if (currentTab === "movies") {
        allMovies = [...allMovies, ...newItems];
    } else {
        allSeries = [...allSeries, ...newItems];
    }

    const containerId = currentTab === "movies" ? "movies-container" : "series-container";
    displayCards(newItems, containerId, true);

    hideBottomLoader();
    isLoading = false;
}

window.addEventListener("scroll", debounce(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMoreData();
    }
}, 200));

document.getElementById("search-input").addEventListener(
    "input",
    debounce(applyFilters, 400)
);
document.getElementById("genre-filter").addEventListener("change", applyFilters);
document.getElementById("sort-filter").addEventListener("change", applyFilters);

async function init() {
    showLoader();
    allMovies = await fetchTrending("movie");
    allSeries = await fetchTrending("tv");
    displayCards(allMovies, "movies-container");
    displayCards(allSeries, "series-container");
    hideLoader();
}

init();