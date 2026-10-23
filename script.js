
const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "SUNO • Chill Vibes",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SUNO • Night Music",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SUNO • Good Mood",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

const audio = new Audio();
let currentSong = 0;

const titleElement = document.querySelector(".now-playing h4");
const artistElement = document.querySelector(".now-playing p");
const playButton = document.querySelector(".play-btn");
const controls = document.querySelectorAll(".player-controls button");

function loadSong(index) {
    currentSong = (index + songs.length) % songs.length;
    audio.src = songs[currentSong].src;

    titleElement.textContent = songs[currentSong].title;
    artistElement.textContent = songs[currentSong].artist;
}

async function playSong() {
    try {
        if (!audio.src) {
            loadSong(currentSong);
        }

        await audio.play();
        playButton.textContent = "❚❚";
    } catch (error) {
        console.error("Song could not play:", error);
        alert("Song play nahi hua. Internet connection check kar, phir dobara try kar.");
    }
}

function pauseSong() {
    audio.pause();
    playButton.textContent = "▶";
}

playButton.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

controls[0].addEventListener("click", () => {
    loadSong(currentSong - 1);
    playSong();
});

controls[2].addEventListener("click", () => {
    loadSong(currentSong + 1);
    playSong();
});

audio.addEventListener("ended", () => {
    loadSong(currentSong + 1);
    playSong();
});

audio.addEventListener("error", () => {
    playButton.textContent = "▶";
});

loadSong(currentSong);


const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

// Search the sample songs already defined in your songs array
function searchSongs() {
    const query = searchInput.value.trim().toLowerCase();

    searchResults.innerHTML = "";

    if (!query) {
        searchResults.innerHTML =
            '<p class="search-message">Type a song name to search.</p>';
        return;
    }

    const matches = songs
        .map((song, index) => ({ ...song, index }))
        .filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );

    if (matches.length === 0) {
        searchResults.innerHTML =
            '<p class="search-message">No matching songs found. Try "SoundHelix".</p>';
        return;
    }

    matches.forEach(song => {
        const card = document.createElement("div");
        card.className = "search-result-card";

        const title = document.createElement("h3");
        title.textContent = "🎵 " + song.title;

        const artist = document.createElement("p");
        artist.textContent = song.artist;

        const hint = document.createElement("p");
        hint.textContent = "▶ Click to play";
        hint.style.marginTop = "10px";

        card.append(title, artist, hint);

        card.addEventListener("click", () => {
            loadSong(song.index);
            playSong();
        });

        searchResults.appendChild(card);
    });
}

searchButton.addEventListener("click", () => {
    searchJamendoSongs(searchInput.value);
});

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchJamendoSongs(searchInput.value);
    }
});

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchSongs();
    }
})
// SUNO language cards
document.querySelectorAll(".language-card").forEach(card => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
        const language = card.dataset.language;

       const searchInput = document.querySelector("#searchInput");

        if (searchInput) {
            searchInput.value = language;
            searchInput.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            searchInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } else {
            alert(
                language +
                " selected! Ab search bar mein " +
                language +
                " songs search kar."
            );
        }
    });
});
// Jamendo API configuration
const JAMENDO_CLIENT_ID = "b1a28af2";

async function searchJamendoSongs(query) {
    const resultsContainer = document.getElementById("searchResults");

    if (!query.trim()) {
        resultsContainer.innerHTML =
            '<p class="search-message">Type a song or artist name.</p>';
        return;
    }

    resultsContainer.innerHTML =
        '<p class="search-message">Searching music...</p>';

    try {
        const url = new URL("https://api.jamendo.com/v3.0/tracks/");

        url.search = new URLSearchParams({
            client_id: JAMENDO_CLIENT_ID,
            format: "json",
            limit: "15",
            search: query,
            audioformat: "mp31"
        });

        const response = await fetch(url);
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();

        if (data.headers?.status !== "success" ||
            !data.results?.length) {
            resultsContainer.innerHTML =
                '<p class="search-message">No tracks found. Try another search.</p>';
            return;
        }

        resultsContainer.innerHTML = "";

        data.results.forEach(track => {
            if (!track.audio) return;

            const card = document.createElement("div");
            card.className = "search-result-card";

            const title = document.createElement("h3");
            title.textContent = "🎵 " + track.name;

            const artist = document.createElement("p");
            artist.textContent = track.artist_name || "Unknown artist";

            card.append(title, artist);

            card.addEventListener("click", async () => {
                audio.pause();
                audio.src = track.audio;

                titleElement.textContent = track.name;
                artistElement.textContent =
                    track.artist_name || "Jamendo artist";

                try {
                    await audio.play();
                    playButton.textContent = "❚❚";
                } catch (error) {
                    console.error(error);
                    alert("Track play nahi hua. Dobara try kar.");
                }
            });

            resultsContainer.appendChild(card);
        });

        if (!resultsContainer.children.length) {
            resultsContainer.innerHTML =
                '<p class="search-message">No playable tracks found.</p>';
        }
    } catch (error) {
        console.error("Jamendo search error:", error);
        resultsContainer.innerHTML =
            '<p class="search-message">Music load nahi hua. Client ID aur internet check kar.</p>';
    }
}