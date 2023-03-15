export function fetchCountriesFullName(name) {
  return fetch(
    `https://restcountries.com/v2/name/${name}?fullText=true?fields=languages,capital,population,name,flags`
  ).then(response => {
    // Response handling
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}
