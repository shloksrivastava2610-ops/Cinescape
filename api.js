async function fetchTrending(type) {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`
        );
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}