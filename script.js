const BASE_URL = `https://movie-list.alphacamp.io`;
const INDEX_URL = `${BASE_URL}/api/v1/movies/`;
const POSTER_URL = `${BASE_URL}/posters/`;
const MOVIES_PER_PAGE = 12;
//whole movies list
const movies = [];
//filter-out movies after searched
let filterMovies = [];
//To represent the list style
let switchSymbol = 1;
//To aquire the page for list-style changing
let presentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");

//keep function simple as possible, lowering the coupling 
//display movie list in main body
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = dataHTML;
  switchSymbol = 1;
  // if(dataPanel.matches("row")){
  //   return;
  // }else{
  //   dataPanel.classList.add("row");
  // }
  dataPanel.matches(".row") ? true : dataPanel.classList.add("row");
}

//display 12 movies per page
function getMoviesByPage(page) {
  //if there is a list being filtered, then display filter list, otherwise the whole list
  const data = filterMovies.length ? filterMovies : movies;
  //using slice method to cut the movies array off, acquire the index(start & end)
  startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  //always remember the return value
}

axios
  .get(`${INDEX_URL}`)
  .then((response) => {
    movies.push(...response.data.results);
    //display movies by pages
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err))

//create the paginator list
function renderPaginator(amount) {
  //determine the total pages needed
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}

//click event on pagenator
//aquire the present page to run the list switch function
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') {
    return
  }
  //re-render page
  presentPage = event.target.dataset.page;
  //avoid the list style being changed after event
  //if the list style is bars ? switchSymbol = 0 : siwtchSymbol = 1
  if (switchSymbol === 0) {
    renderMovieListByBars(getMoviesByPage(1));
  } else if (switchSymbol === 1) {
    renderMovieList(getMoviesByPage(1));
  }
})

//event listener to activate modal and add favorite
//using event-delegation, bind the event on the parent element then using if to specift which part being clicked
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieDetail(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addFavorite(Number(event.target.dataset.id));
  }
})

function addFavorite(id) {
  //everytime call the function, get the data from localstorage if data equals tp null then falsy to the empty string
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('This movie was already added！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

//display movie information in modal
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

//search bar event
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");


searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //prevent default action from web
  event.preventDefault();
  let keyword = searchInput.value.trim().toLowerCase();
  //make sure the input is not empty
  if (!keyword.length) {
    alert("please enter a valid string");
  }
  //filter out the movies to match the user input
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filterMovies.length === 0) {
    alert("Can't find the movie: " + keyword);
  }
  //redecorate the list and paginator
  //if the list style is bars ? switchSymbol = 0 : siwtchSymbol = 1
  renderPaginator(filterMovies.length);
  if (switchSymbol === 0) {
    renderMovieListByBars(getMoviesByPage(presentPage));
  } else if (switchSymbol === 1) {
    renderMovieList(getMoviesByPage(presentPage));
  }
  // renderMovieList(getMoviesByPage(1));
})

//event to switch list style
searchForm.addEventListener("click", function onListStyleClicked(event) {
  if (event.target.matches(".fa-bars")) {
    //present page has been set to default 1, evrytime clicked event that changing the content happend, it wiil reset back to 1;
    renderMovieListByBars(getMoviesByPage(presentPage));
  } else if (event.target.matches(".fa-th")) {
    renderMovieList(getMoviesByPage(presentPage));
  }
})
function renderMovieListByBars(data) {
  let presentMoviesByPage = getMoviesByPage(presentPage);
  let rawHTML = "";
  switchSymbol = 0;
  presentMoviesByPage.forEach((item) => {
    rawHTML += `  
      <tr>
        <td>${item.title}</td>
        <td>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">
                more
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
          +
          </button>
        </td>
      </tr>`
  })

  dataPanel.classList.remove("row");
  dataPanel.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Wish</th>
        </tr>
      </thead>
      <tbody>
        ${rawHTML}
      </tbody>
    </table>`
}


