const API_KEY = '16ef32b76dc3749d3bf466d0b0a48cb3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_IMAGE = 'default-image.jpg';  
const MAX_RESULTS = 16;  

const genreMap = {
   28 :"Action" ,
    12:"Adventure",
    16:"Animation",
    35:"Comedie",
    80:"Crime",
    99:"Documentaire",
    18:"Drama",
    10751:"Famille",

    14:"Fantasy",
    
    36:"Histoire",
   
    27:"horreur",
    
    9648:"Mystére",
    
    10749:"Romance",

   
    878:"Science Fiction",
   
    53:"Thriller",
  
    10752:"war",
   
    37:"Western",
  }

const searchInput = document.querySelector("#searchInput");
const btnSearch = document.getElementById('btn-search');
const searchWrapper = document.querySelector(".search-results .swiper-wrapper");
const latestWrapper = document.querySelector(".latest-releases .swiper-wrapper");
const genreWrappers = document.querySelectorAll(".swipper-movies-by-genre .swiper-wrapper");  
const myModal = document.querySelector("#myModal");
const loginBarBtn = document.querySelector("#loginnavbar");
const closeButton = document.querySelector(".close-btn");


const myMovieModal = document.querySelector("#myModalmovie");
const closeMovieButton = document.querySelector(".close-btnmovie");
const movieTitle = document.querySelector("#title-movie");
const movieYear = document.querySelector("#movieYear");
const movieReviews = document.querySelector("#reviews");
const movieGenre = document.querySelector("#genre");
const movieDescription = document.querySelector("#description");
const movieCast = document.querySelector("#cast-content");
const movieImage = document.querySelector(".img-popup");



const addHoverEffect = (div, movie) => {
    div.addEventListener('mouseenter', () => {
        showMovieInfo(div, movie);
    });

    div.addEventListener('mouseleave', () => {
        removeMovieInfo(div);
    });
};


loginBarBtn.addEventListener('click', () => {
    myModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    myModal.style.display = 'none';
});

closeMovieButton.addEventListener('click', () => {
    myMovieModal.style.display = 'none';
});


const fetchPopularMovies = async () => {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR`);
        const data = await response.json();
        
        const filteredMovies = data.results.filter(movie => movie.poster_path).slice(0, MAX_RESULTS);
        return filteredMovies;
    } catch (error) {
        console.error('Erreur lors de la récupération des films populaires:', error);
    }
};


const searchMovies = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${query}`);
        const data = await response.json();
        
        const filteredMovies = data.results.filter(movie => movie.poster_path).slice(0, MAX_RESULTS);
        return filteredMovies;
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
    }
};


const displayMovies = (movies, wrapper) => {
    wrapper.innerHTML = "";  

    const imagePromises = movies.map(movie => {
        return new Promise((resolve, reject) => {
            const newDiv = document.createElement('div');
            newDiv.className = 'swiper-slide';
            newDiv.dataset.infoVisible = "false"; 

            const newImg = document.createElement('img');
            newImg.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
            newImg.alt = movie.title;
            newImg.onload = () => {
                newDiv.classList.add('image-loaded');
                resolve(newImg);
            };
            newImg.onerror = () => {
                newImg.src = DEFAULT_IMAGE; 
                resolve(newImg);
            };

            
            newDiv.addEventListener('click', () => {
                showMovieModal(movie);
            });

            
            addHoverEffect(newDiv, movie);

            newDiv.appendChild(newImg);
            wrapper.appendChild(newDiv);
        });
    });

    Promise.all(imagePromises).then(() => {
        new Swiper(wrapper.closest('.swiper'), {
            slidesPerView: 4,
            spaceBetween: 3,
            navigation: {
                nextEl: wrapper.closest('.swiper').querySelector('.swiper-button-next'),
                prevEl: wrapper.closest('.swiper').querySelector('.swiper-button-prev'),
            },
            loop: true,
        });
    });
};


const showMovieModal = async (movie) => {
    
    const movieDetails = await fetchMovieDetails(movie.id);
    
    movieTitle.textContent = movie.title;
    movieYear.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    movieReviews.textContent = `★${Math.round(movie.vote_average)}`;
    movieGenre.textContent = movieDetails.genres.map(genre => genre.name).join(', ');
    movieDescription.textContent = movie.overview;
    movieImage.src = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : DEFAULT_IMAGE;

    
    movieCast.innerHTML = movieDetails.cast.slice(0, 4).map(actor => `<p>${actor.name} as ${actor.character}</p>`).join('');

    
    myMovieModal.style.display = 'block';
};

const showMovieInfo = (div, movie) => {
    
    if (div.dataset.infoVisible === "true") return;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info';
    infoDiv.innerHTML = `
        <p><strong>Titre:</strong> ${movie.title}</p>
        <p><strong>Note:</strong> ★${Math.round(movie.vote_average)} <span style="color: red;"></span></p>
        <p><strong>Genres:</strong> ${movie.genre_ids.map(id => genreMap[id]).join(', ')}</p>
    `;
    div.style.position = 'relative';
    infoDiv.style.position = 'absolute';
    infoDiv.style.top = '0';
    infoDiv.style.left = '0';
    infoDiv.style.width = '100%';
    infoDiv.style.height = '100%';
    infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    infoDiv.style.color = 'white';
    infoDiv.style.display = 'flex';
    infoDiv.style.flexDirection = 'column';
    infoDiv.style.justifyContent = 'center';
    infoDiv.style.alignItems = 'center';
    infoDiv.style.transition = 'opacity 0.3s ease';
    infoDiv.style.opacity = '0.9';

    div.dataset.infoVisible = "true"; 
    div.appendChild(infoDiv);
};


const removeMovieInfo = (div) => {
    const infoDiv = div.querySelector('.movie-info');
    if (infoDiv) {
        div.removeChild(infoDiv);
        div.dataset.infoVisible = "false"; 
    }
};


const fetchMovieDetails = async (movieId) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR&append_to_response=credits`);
        const data = await response.json();
        return {
            genres: data.genres,
            cast: data.credits.cast
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du film:', error);
    }
};


btnSearch.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (query) {
        const movies = await searchMovies(query);
        displayMovies(movies, searchWrapper);
    }
});


const fetchLatestReleases = async () => {
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=fr-FR&sort_by=release_date.desc`);
        const data = await response.json();
        
        const filteredMovies = data.results.filter(movie => movie.poster_path).slice(0, MAX_RESULTS);
        return filteredMovies;
    } catch (error) {
        console.error('Erreur lors de la récupération des dernières sorties:', error);
    }
};






const fetchMoviesByGenre = async (genreId) => {
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=fr-FR&with_genres=${genreId}`);
        const data = await response.json();
        
        const filteredMovies = data.results.filter(movie => movie.poster_path).slice(0, MAX_RESULTS);
        return filteredMovies;
    } catch (error) {
        console.error('Erreur lors de la récupération des films par genre:', error);
    }
};


const loadLatestReleases = async () => {
    const latestMovies = await fetchLatestReleases();
    displayMovies(latestMovies, latestWrapper);
};


const loadRandomPopularMovies = async () => {
    const popularMovies = await fetchPopularMovies();
    displayMovies(popularMovies, searchWrapper);
};

const getGenreId = (genreName) => {
    const genres = {
        "Action": 28,
        "Adventure": 12,
        "Animation": 16,
        "Comedy": 35,
        "Crime": 80,
        "Documentary": 99,
        "Drama": 18,
        "Family": 10751,
        "Fantasy": 14,
        "History": 36,
        "Horror": 27,
        "Music": 10402,
        "Mystery": 9648,
        "Romance": 10749,
        "Science Fiction": 878,
        "TV Movie": 10770,
        "Thriller": 53,
        "War": 10752,
        "Western": 37
      }
    return genres[genreName] || null;
};

const loadMoviesByGenre = async (genreId, wrapper) => {
    const genreMovies = await fetchMoviesByGenre(genreId);
    displayMovies(genreMovies, wrapper);
};


document.addEventListener("DOMContentLoaded", async () => {
    loadRandomPopularMovies();  
    loadLatestReleases();  

    
    loadMoviesByGenre(35, genreWrappers[0]);  
    loadMoviesByGenre(18, genreWrappers[1]);  

    
    document.querySelectorAll("#nav-menu-tab li a").forEach((tab) => {
        tab.addEventListener("click", async (event) => {
            event.preventDefault();
            
            const genreName = event.target.innerText.trim();
            const genreId = getGenreId(genreName);
            if (genreId !== null) {
                const genreWrapper = genreWrappers[0];  
                const movies = await fetchMoviesByGenre(genreId);
                displayMovies(movies, genreWrapper);
            }
        });
    });
});




loginBarBtn.addEventListener('click', () => {
    myModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    myModal.style.display = 'none';
});


















