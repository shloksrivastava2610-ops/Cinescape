function showLoader() {
    document.getElementById("loader").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

function displayCards(items, containerId) {
    const container = document.getElementById(containerId);

    if (items.length === 0) {
        container.innerHTML = "<p>No data found.</p>";
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
                <p>⭐ ${item.vote_average.toFixed(1)}</p>
                <p>📅 ${item.release_date || item.first_air_date || "N/A"}</p>
            </div>
        </div>
    `).join("");
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