const BASE_URL = `https://movie-list.alphacamp.io`;
const INDEX_URL = `${BASE_URL}/api/v1/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;


const dataPanel = document.querySelector("#data-panel");
const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies")) || []

renderMovieList(favoriteList)

function renderMovieList(data) {
  let dataHTML = '';
  data.forEach(item => {
    dataHTML += ` <div class="col-sm-3">
        <div class="mb-2">
          <div class="card" >
            <img src="${POSTER_URL}${item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">
                more
              </button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = dataHTML;
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieDetail(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
})

function removeFromFavorite(id) {
  if(!favoriteList || !favoriteList.length){
    return;
  }
  //by using splice method ,acquire the index of target first
  const movieIndex = favoriteList.findIndex((movie) => movie.id === id)
  if (movieIndex === -1){
    return;
  }

  favoriteList.splice(movieIndex, 1);
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList));

  renderMovieList(favoriteList);
}

function showMovieDetail(id) {
  let modalTitle = document.querySelector("#movie-modal-title");
  let modalDate = document.querySelector("#movie-modal-date");
  let modalDescription = document.querySelector("#movie-modal-description");
  let modalImage = document.querySelector("#movie-modal-image");

  axios
    .get(`${INDEX_URL}` + id)
    .then((response) => {
      let results = response.data.results;
      modalTitle.textContent = results.title;
      modalDate.textContent = "Release Date:" + results.release_date;
      modalDescription.textContent = results.description;
      modalImage.innerHTML = `<img src="${POSTER_URL}${results.image}" alt="Movie Poster" class="img-fluid"</img>`;

    })
    .catch((err) => console.log(err))
}
