let heritageData = [];

var map = L.map("map", {
  center: [0, 0],
  zoom: 1,
  minZoom: 1.15,
  maxZoom: 18,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);

var initialBounds = map.getBounds();
map.setMaxBounds(initialBounds);
map.on("zoomend", function () {
  if (map.getZoom() > 3) {
    map.setMaxBounds(null);
  } else {
    map.setMaxBounds(initialBounds);
  }
});

let geojson;

function style() {
  return {
    fillColor: "#eed1e5",
    weight: 1,
    opacity: 1,
    color: "#d290be",
    dashArray: "1",
    fillOpacity: 0.7,
  };
}

function highlighter(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#111",
    dashArray: "",
    fillOpacity: 0.7,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlighter,
    mouseout: resetHighlight,
    click: showCountryInfo,
  });
}

async function holidays(cca2Code) {
  const year = new Date().getFullYear();
  const url = `https://api.api-ninjas.com/v1/holidays?country=${cca2Code}&year=${year}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": "U+fA94jVSBxMiTRKCFBlqw==4txkGu09JyXB0CLQ" },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status}`);
    }
    const holidaysData = await response.json();
    return holidaysData.map((holiday) => ({
      name: holiday.name,
      date: holiday.date,
      day: holiday.day,
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
}

async function airQuality(countryName) {
  const url = `https://api.api-ninjas.com/v1/airquality?city=${countryName}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": "U+fA94jVSBxMiTRKCFBlqw==4txkGu09JyXB0CLQ",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AQI: ${response.status}`);
    }

    const aqiData = await response.json();
    const coAqi = aqiData.CO ? aqiData.CO.aqi : "N/A";
    const no2Aqi = aqiData.NO2 ? aqiData.NO2.aqi : "N/A";
    const o3Aqi = aqiData.O3 ? aqiData.O3.aqi : "N/A";
    const so2Aqi = aqiData.SO2 ? aqiData.SO2.aqi : "N/A";
    const pm25Aqi = aqiData["PM2.5"] ? aqiData["PM2.5"].aqi : "N/A";
    const pm10Aqi = aqiData.PM10 ? aqiData.PM10.aqi : "N/A";
    const overallAqi = aqiData.overall_aqi ? aqiData.overall_aqi : "N/A";

    return {
      coAqi,
      no2Aqi,
      o3Aqi,
      so2Aqi,
      pm25Aqi,
      pm10Aqi,
      overallAqi,
    };
  } catch (error) {
    console.error("Error fetching AQI:", error);
    return "Error fetching AQI";
  }
}

window.onload = function () {
  fetch("./whc-sites-2024.xlsx")
    .then((response) => response.arrayBuffer())
    .then((data) => {
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      heritageData = XLSX.utils.sheet_to_json(sheet);
      console.log("Heritage Sites:", heritageData);
    })
    .catch((error) => {
      console.error("Error loading the Excel file:", error);
    });
};

function displayExcelData(data) {
  const excelDataDiv = document.getElementById("excelData");
  excelDataDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

async function countryInformation(countryName) {
  const response = await fetch(
    "https://restcountries.com/v3.1/name/" + countryName
  );
  const info = await response.json();

  if (info && info.length > 0) {
    const capital = info[0].capital ? info[0].capital[0] : "Unknown";
    const currency = info[0].currencies
      ? Object.values(info[0].currencies)
          .map((currency) => currency.name)
          .join(", ")
      : "Unknown";
    const currency_abbr = info[0].currencies
      ? Object.keys(info[0].currencies).join(", ")
      : "Unknown";
    const currency_symbol = info[0].currencies
      ? Object.values(info[0].currencies)
          .map((currency) => currency.symbol)
          .join(", ")
      : "Unknown";
    const languages = info[0].languages
      ? Object.values(info[0].languages).join(", ")
      : "Unknown";
    const population = info[0].population
      ? info[0].population.toLocaleString()
      : "Unknown";
    const area = info[0].area ? info[0].area.toLocaleString() : "Unknown";
    const timezones = info[0].timezones
      ? info[0].timezones.join(", ")
      : "Unknown";
    const cca2code = info[0].cca2 ? info[0].cca2.toLocaleString() : "Unknown";
    const continents = info[0].continents ? info[0].continents[0] : "Unknown";

    return {
      capital,
      currency,
      languages,
      population,
      area,
      timezones,
      cca2code,
      continents,
      currency_symbol,
      currency_abbr,
    };
  }
  return {};
}

async function getFlag(countryName) {
  const response = await fetch(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
  );
  const info = await response.json();

  if (info && info.length > 0) {
    return info[0].flags.svg || "Flag Not Found";
  }
  return "Flag Not Found";
}

async function coa(countryName) {
  const response = await fetch(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
  );
  const info = await response.json();

  if (info && info.length > 0) {
    return info[0].coatOfArms.svg || "Coat of Arms Not Found";
  }
  return "Flag Not Found";
}

async function showCountryInfo(e) {
  var layer = e.target;
  var countryName = layer.feature.properties.ADMIN;

  const countryDetails = await countryInformation(countryName);
  const countryFlag = await getFlag(countryName);
  const coatOfArms = await coa(countryName);
  const holidayList = await holidays(countryDetails.cca2code);
  //const aqiData = await airQuality(countryName);

  var detailsContainer = document.getElementById("country-details");
  detailsContainer.innerHTML = `
        <div>
            <img src="${countryFlag}" style="width: 300px">
            <h2>${countryName} (${countryDetails.cca2code})</h2>
            <p><strong>Capital:</strong> ${countryDetails.capital} </p>
            <p><strong>Currency:</strong> ${countryDetails.currency} (${countryDetails.currency_abbr}, ${countryDetails.currency_symbol})</p>
            <p><strong>Languages:</strong> ${countryDetails.languages}</p>
            <p><strong>Population:</strong> ${countryDetails.population}</p>  
            <p><strong>Area:</strong> ${countryDetails.area} km<sup>2</sup></p>  
            <p><strong>Timezones:</strong> ${countryDetails.timezones}</p>
        </div>
    `;
  detailsContainer.style.display = "block";

  var coatOfArmsContainer = document.getElementById("coat-of-arms");
  coatOfArmsContainer.innerHTML = `
        <div>
            <img src="${coatOfArms}" style="width: 250px">
        </div>
    `;

  var holidaysContainer = document.getElementById("holidays");
  holidaysContainer.innerHTML = `
        <div>
            ${
              holidayList.length > 0
                ? holidayList
                    .map(
                      (holiday) =>
                        `<h3>${holiday.name}</h3>
                     <p>${holiday.date}</p> 
                     <p>${holiday.day}</p>
                     <br><hr style="width: 100%">`
                    )
                    .join("")
                : "<p>No holidays found</p>"
            }
        </div>

    `;

  const sitesForCountry = heritageData.filter(
    (site) => site["states_name_en"] === countryName
  );
  var heritageSitesDiv = document.getElementById("heritage-sites");

  heritageSitesDiv.innerHTML = "";
  if (sitesForCountry.length > 0) {
    sitesForCountry.forEach((site) => {
      heritageSitesDiv.innerHTML += `
                <div>
                    <h3>${site["name_en"]}</h3>
                    <p><strong>Category:</strong> ${site["category"]}</p>
                    <p><strong>Description:</strong> ${site["short_description_en"]}</p>
                    <hr>
                </div>
            `;
    });
  } else {
    heritageSitesDiv.innerHTML +=
      "<p>No heritage sites found for this country.</p>";
  }
}

if (!geojson) {
  fetch(
    "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
  )
    .then((response) => response.json())
    .then((data) => {
      geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature,
      }).addTo(map);
    });
}

window.addEventListener("resize", function () {
  map.invalidateSize();
});
