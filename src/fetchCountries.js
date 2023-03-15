export function fetchCountries(name) {
  return fetch(
    `https://restcountries.com/v2/name/${name}?fields=languages,capital,population,name,flags`
  ).then(response => {
    // Response handling
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}
