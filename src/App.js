import { useEffect, useRef, useState } from "react";
import Star from "./star";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(function () {
    const getWatchedRecently = localStorage.getItem("watched");
    return getWatchedRecently ? JSON.parse(getWatchedRecently) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [movieId, setMovieId] = useState(null);
  function handlemid(id) {
    setMovieId((movieId) => (id === movieId ? null : id));
  }
  function closemid() {
    setMovieId(null);
  }
  function addWatchedMovie(newWatchedMovie) {
    setWatched((moviearray) => [...moviearray, newWatchedMovie]);
  }
  function handledelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );
  useEffect(() => {
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const controller = new AbortController();
        const res = await fetch(
          `http://www.omdbapi.com/?i=tt3896198&apikey=21cd14bf&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Something Went Wrong");
        }

        const data = await res.json();

        if (data.Response === "False") {
          throw new Error("Movie not Found");
        }

        setMovies(data.Search);
        setError("");
        return function () {
          controller.abort();
        };
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setIsLoading(false);
      setError("");
      return;
    }
    closemid();
    fetchMovies();
  }, [query]);
  return (
    <>
      <Nav>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Nav>
      <main className="main">
        <Box>
          {/*isLoading ? <Loader /> : <MovieList movies={movies} />*/}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handlemid={handlemid} />
          )}
          {error && <Errormsg message={error} />}
        </Box>
        <Box>
          {movieId ? (
            <Moviedetail
              mid={movieId}
              closemid={closemid}
              addWatchedMovie={addWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchList watched={watched} handledelete={handledelete} />
            </>
          )}
        </Box>
        {/* or
           <Box element={<MovieList movies={movies} />}>
        <Box element={
        <>
          <Summary watched={watched} />
          <WatchList watched={watched} />
        </>
        }>
          */}
      </main>
    </>
  );
}
function Errormsg({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function Nav({ children }) {
  return <nav className="nav-bar">{children}</nav>; //component composition using children prop
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  {
    /*
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [setQuery]
  );*/
  }

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handlemid }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem movie={movie} handlemid={handlemid} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function MovieItem({ movie, handlemid }) {
  return (
    <li onClick={() => handlemid(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function Moviedetail({ mid, closemid, addWatchedMovie, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const watchedMovie = watched.find((movie) => movie.imdbID === mid);
  const isWatched = watchedMovie ? watchedMovie.userRating : 0;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  useEffect(
    function () {
      async function getdet() {
        setIsLoading(true);

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=21cd14bf&i=${mid}`
        );
        const data = await res.json();
        setMovie(data);
        console.log(data);
        setIsLoading(false);
      }
      getdet();
    },
    [mid]
  );
  useKey("Escape", closemid);
  function handlewatchedmovie() {
    const newWatchedMovie = {
      imdbID: mid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    addWatchedMovie(newWatchedMovie);
    closemid();
  }
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie|${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={closemid}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            {isWatched === 0 ? (
              <>
                <div className="rating">
                  <Star max={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handlewatchedmovie}>
                      + Add to list
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p>You rated this movie {isWatched}⭐</p>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function WatchList({ watched, handledelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchItem movie={movie} handledelete={handledelete} />
      ))}
    </ul>
  );
}
function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchItem({ movie, handledelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handledelete(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
