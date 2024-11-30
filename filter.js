document.addEventListener("DOMContentLoaded", () => {
  let countriesData = [];

  async function fetchCountryData() {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      countriesData = data.map((country) => ({
        name: country.name.common,
        population: country.population,
        area: country.area,
      }));
      sortAndDisplayPA();
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
  }

  function sortAndDisplayPA() {
    const sortCriteria = document.getElementById("sortCriteria").value;

    if (sortCriteria === "population") {
      countriesData.sort((a, b) => b.population - a.population);
      displayCountries("Population");
    } else if (sortCriteria === "area") {
      countriesData.sort((a, b) => b.area - a.area);
      displayCountries("Area (km<sup>2</sup>)");
    } else if (sortCriteria === "alphabets") {
      countriesData.sort((a, b) => a.name.localeCompare(b.name));
      displayCountries("Alphabetical Order");
    }
  }

  function displayCountries(criteria) {
    const displayDiv = document.getElementById("countriesDisplay");
    displayDiv.innerHTML = `<h2>Countries sorted by ${criteria}</h2>`;

    const list = countriesData
      .map((country) => {
        if (criteria === "Alphabetical Order") {
          return `${country.name}<br>`;
        } else {
          return `<strong>${country.name}</strong>: ${
            criteria === "Population"
              ? country.population.toLocaleString()
              : country.area.toLocaleString()
          }<br>`;
        }
      })
      .join("");

    displayDiv.innerHTML += `<p>${list}</p>`;
  }

  document
    .getElementById("sortCriteria")
    .addEventListener("change", sortAndDisplayPA);
  fetchCountryData();
});
