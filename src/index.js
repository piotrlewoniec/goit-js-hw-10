'use strict';
import './css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries.js';
import { fetchCountriesFullName } from './fetchCountriesFullName.js';

const countrySearch = {
  DEBOUNCE_DELAY: 300,
  countriesToSearch: [],
  serverData: null,
  serverError: null,
  inputEventValue: null,
  workData: [],
  searchField: document.querySelector('#search-box'),
  countryListOutput: document.querySelector('.country-list'),
  countryInfoOutput: document.querySelector('.country-info'),
  outputsFieldsClear: function () {
    if (this.countryListOutput.hasChildNodes()) {
      this.countryListOutput.replaceChildren();
    }
    if (this.countryInfoOutput.hasChildNodes()) {
      this.countryInfoOutput.replaceChildren();
    }
  },
  dataPreparation: function () {
    this.workData.splice(0);
    let localDataDisplay = [];
    for (let country of this.serverData) {
      const localDataDisplayObj = {};
      for (key in country) {
        if (key === 'name') {
          localDataDisplayObj.name = country[key];
        }
        if (key === 'capital') {
          localDataDisplayObj.capital = country[key];
        }
        if (key === 'population') {
          localDataDisplayObj.population = country[key];
        }
        if (key === 'languages') {
          const langAll = country[key]
            .map(langAllList => langAllList.name)
            .join(', ');
          localDataDisplayObj.languages = langAll;
        }
        if (key === 'flags') {
          localDataDisplayObj.flags = country[key].svg;
        }
      }
      localDataDisplay.push(localDataDisplayObj);
    }
    for (country of localDataDisplay) {
      const localDataDisplaySortedObj = {};
      localDataDisplaySortedObj.flags = country.flags;
      localDataDisplaySortedObj.name = country.name;
      localDataDisplaySortedObj.capital = country.capital;
      localDataDisplaySortedObj.population = country.population;
      localDataDisplaySortedObj.languages = country.languages;
      this.workData.push(localDataDisplaySortedObj);
    }
  },
  searchByCountryFullName: function () {
    const countriesToSearchTable = this.countriesToSearch.filter(
      country => country !== ''
    );
    const localcountriesToSearchString = countriesToSearchTable.join(' ');
    Notiflix.Notify.info(
      `Searching country by full name: ${localcountriesToSearchString}`
    );
    fetchCountriesFullName(localcountriesToSearchString)
      .then(data => {
        // Data handling
        this.serverData = data;
        console.log('incoming data from server: ', this.serverData);
      })
      .catch(error => {
        // Error handling
        this.serverError = error;
        if (this.serverError.message === '404') {
          Notiflix.Notify.failure(
            `${this.serverError} Oops, there is no country with that name`
          );
          this.outputsFieldsClear();
        } else {
          Notiflix.Notify.failure(`${this.serverError}`);
          this.outputsFieldsClear();
        }
      })
      .finally(() => {
        if (!this.serverError) {
          this.outputsFieldsClear();
          Notiflix.Notify.info(`Searched countries: ${this.serverData.length}`);
          this.dataPreparation();
          let localDataDisplay = [
            `<p>Country info output. Searched countries: ${this.serverData.length}</p>`,
          ];
          //   localDataDisplay.push(
          //     `<p><svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
          //         <use href="${this.workData[0].flags}"></use>
          //         </svg>${this.workData[0].name}</p>`
          //   );
          localDataDisplay.push(
            `<p>
              <img
              src="${this.workData[0].flags}"
              width="30"
              alt="${this.workData[0].name} flag"></img><span class="country-name"><b>${this.workData[0].name}</b><span></p>`
          );
          localDataDisplay.push(
            `<p><b>Capital:</b>  ${this.workData[0].capital}</p>`
          );
          localDataDisplay.push(
            `<p><b>Population:</b>  ${this.workData[0].population}</p>`
          );
          localDataDisplay.push(
            `<p><b>Languages:</b> ${this.workData[0].languages}</p>`
          );
          let localDataDisplayString = localDataDisplay.map(p => p).join(''); //building one string from array
          this.countryInfoOutput.insertAdjacentHTML(
            'beforeend',
            localDataDisplayString
          ); //adding elements to div box
        }
        this.serverError = null;
      });
  },
  searchByCountryName: function () {
    fetchCountries(this.countriesToSearch)
      .then(data => {
        // Data handling
        this.serverData = data;
        console.log('incoming data from server: ', this.serverData);
      })
      .catch(error => {
        // Error handling
        this.serverError = error;
        if (this.serverError.message === '404') {
          Notiflix.Notify.failure(
            `${this.serverError} Oops, there is no country with that name`
          );
          this.outputsFieldsClear();
        } else {
          Notiflix.Notify.failure(`${this.serverError}`);
          this.outputsFieldsClear();
        }
      })
      .finally(() => {
        if (!this.serverError) {
          this.outputsFieldsClear();
          if (this.serverData.length > 10) {
            Notiflix.Notify.info(
              `Searched countries: ${this.serverData.length}`
            );
            Notiflix.Notify.info(
              'Too many matches found. Please enter a more specific name.'
            );
          } else if (
            this.serverData.length <= 10 &&
            this.serverData.length >= 2
          ) {
            Notiflix.Notify.info(
              `Searched countries: ${this.serverData.length}`
            );
            this.dataPreparation();
            let localDataDisplay = [
              `<p>Country list output. Searched countries: ${this.serverData.length}</p>`,
            ];
            //   for (let country of this.workData) {
            //     localDataDisplay.push(
            //       `<li>
            //         <svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
            //         <use href="${country.flags}"></use>
            //         </svg>${country.name}</li>`
            //     );
            //   }
            for (let country of this.workData) {
              localDataDisplay.push(
                `<li>
            <img
            src=" ${country.flags}"
            width="30"
            alt="${country.name} flag"></img>${country.name}</li>`
              );
            }
            let localDataDisplayString = localDataDisplay
              .map(li => li)
              .join(''); //building one string from array
            this.countryListOutput.insertAdjacentHTML(
              'beforeend',
              localDataDisplayString
            ); //adding elements to ul box
          } else {
            Notiflix.Notify.info(
              `Searched countries: ${this.serverData.length}`
            );
            this.dataPreparation();
            let localDataDisplay = [
              `<p>Country info output. Searched countries: ${this.serverData.length}</p>`,
            ];
            //   localDataDisplay.push(
            //     `<p><svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
            //         <use href="${this.workData[0].flags}"></use>
            //         </svg>${this.workData[0].name}</p>`
            //   );
            localDataDisplay.push(
              `<p>
          <img
          src="${this.workData[0].flags}"
          width="30"
          alt="${this.workData[0].name} flag"></img><span class="country-name"><b>${this.workData[0].name}</b><span></p>`
            );
            localDataDisplay.push(
              `<p><b>Capital:</b>  ${this.workData[0].capital}</p>`
            );
            localDataDisplay.push(
              `<p><b>Population:</b>  ${this.workData[0].population}</p>`
            );
            localDataDisplay.push(
              `<p><b>Languages:</b> ${this.workData[0].languages}</p>`
            );
            let localDataDisplayString = localDataDisplay.map(p => p).join(''); //building one string from array
            this.countryInfoOutput.insertAdjacentHTML(
              'beforeend',
              localDataDisplayString
            ); //adding elements to div box
          }
        }
        this.serverError = null;
      });
  },
  searchingInputEvent: function (event) {
    //console.log('event in searchingInputEvent', event);
    //console.log('incoming data: ', event.currentTarget.value);
    console.log('incoming data: ', event);
    // this.countriesToSearch = event.currentTarget.value.trim().split(' ');
    this.countriesToSearch = event.trim().split(' ');
    console.log('array of words to search: ', this.countriesToSearch);
    console.log('countries to search: ', this.countriesToSearch.length);
    if (this.countriesToSearch[0] !== '') {
      if (this.countriesToSearch.length > 1) {
        this.searchByCountryFullName();
      } else {
        this.searchByCountryName();
      }
    } else {
      this.outputsFieldsClear();
    }
  },
  init: function () {
    const debounceed = debounce(event => {
      this.searchingInputEvent(event);
    }, this.DEBOUNCE_DELAY);
    this.searchField.addEventListener(
      'input',
      function (event) {
        this.inputEventValue = event.currentTarget.value;
        debounceed(this.inputEventValue);
      }.bind(this)
    );
  },
};
countrySearch.init();

//--------------------------------------------------------------------------------------------

// Zadanie - wyszukiwanie krajów
// Utwórz frontend aplikacji wyszukiwania danych o kraju według częściowej lub pełnej nazwy.

// https://restcountries.com/
// https://restcountries.com/#api-endpoints-v3-name

// https://restcountries.com/#filter-response

// https://www.npmjs.com/package/lodash.debounce

// https://github.com/notiflix/Notiflix#readme

// Żądanie HTTP
// Użyj publicznego API Rest Countries v2, a dokładniej nazwa źródła, który przekazuje tablicę obiektów krajów odpowiadających kryteriom wyszukiwania. Popraw wizualnie elementy interfejsu.

// Napisz funkcję fetchCountries(name) która tworzy żądanie HTTP na nazwa źródła i przekazuje obietnicę z tablicą krajów - wynikiem żądania. Przenieś ją do oddzielnego pliku fetchCountries.js i utwórz eksport nazwany.

// Filtrowanie pól
// W odpowiedzi, z backendu przekazywane są obiekty, których większość właściwości nie przyda Ci się. Aby zredukować zakres przekazywanych danych, dodaj ciąg parametrów żądania - w taki sposób backend realizuje filtrację pól. Zapoznaj się z dokumentacją składni filtrów.

// Potrzebujesz tylko następujących właściwości:

// name.official - pełna nazwa kraju
// capital - stolica
// population - liczba ludności
// flags.svg - link do ilustracji przedstawiającej flagę
// languages - tablica języków

// Pole wyszukiwania
// Nazwę kraju, którą chce wyszukać użytkownik, wprowadza się w pole tekstowe input#search-box. Żądania HTTP realizuje się przy komplecie nazw krajów, czyli po zdarzeniu input. Jednak nie należy spełniać żądania po każdym kliknięciu przycisku, ponieważ otrzymamy jednocześnie wiele żądań, które zostaną spełnione w nieprzewidywalnym porządku.

// Koniecznym jest zastosowanie funkcji Debounce na event handler i wykonanie żądania HTTP 300ms po tym, jak użytkownik przestał wprowadzać tekst. Użyj pakietu lodash.debounce.

// Jeśli użytkownik całkowicie usuwa pole wyszukiwania, to żądanie HTTP nie zostaje zrealizowane, a znacznik listy krajów lub informacji o kraju znika.

// Dokonaj sanityzacji wprowadzonego ciągu metodą trim(), to rozwiąże problem, gdy w polu wprowadzania są tylko spacje lub widnieją one na początku i na końcu wiersza.

// Interfejs
// Jeśli w odpowiedzi backend przekazał więcej niż 10 krajów, w interfejsie pojawia się powiadomienie o tym, że nazwa powinna być bardziej specyficzna. Do powiadomień używaj biblioteki notiflix i wprowadź taki wiersz "Too many matches found. Please enter a more specific name.".

// Jeśli backend przekazał od 2-óch do 10-ciu krajów, pod polem tekstowym pojawia się lista znalezionych krajów. Każdy element listy składa się z flagi i nazwy kraju.

// Jeśli wynik żądania to tablica z jednym krajem, w interfejsie pojawia się znacznik karty z danymi o kraju: flaga, nazwa, stolica, liczba ludności i języki.

// UWAGA
// Wystarczy, jeśli aplikacja będzie działała dla większości krajów. Niektóre kraje, takie jak Sudan, mogą powodować problemy, ponieważ nazwa kraju jest częścią nazwy innego kraju, South Sudan. Nie należy się skupiać na tych wyjątkach.

// Przetwarzanie błędu
// Jeśli użytkownik wprowadził nazwę kraju, który nie istnieje, backend przekaże nie pustą tablicę, a błąd z kodem stanu 404 - nie znaleziono. Jeśli tego nie opracujesz, to użytkownik nigdy nie dowie się o tym, że żądanie nie przyniosło wyników. Dodaj powiadomienie "Oops, there is no country with that name" w razie błędu, używając biblioteki notiflix.

// UWAGA
// Nie zapominaj o tym, że fetch nie postrzega 404 jako błędu, dlatego konieczne jest widoczne odrzucenie obietnicy, aby można było wyłapać i przetworzyć błąd.

//backup

// const countrySearch = {
//     DEBOUNCE_DELAY: 300,
//     countriesToSearch: [],
//     serverData: null,
//     serverError: null,
//     inputEventValue: null,
//     workData: [],
//     searchField: document.querySelector('#search-box'),
//     countryListOutput: document.querySelector('.country-list'),
//     countryInfoOutput: document.querySelector('.country-info'),
//     outputsFieldsClear: function () {
//       if (this.countryListOutput.hasChildNodes()) {
//         this.countryListOutput.replaceChildren();
//       }
//       if (this.countryInfoOutput.hasChildNodes()) {
//         this.countryInfoOutput.replaceChildren();
//       }
//     },
//     dataPreparation: function () {
//       this.workData.splice(0);
//       let localDataDisplay = [];
//       for (country of this.serverData) {
//         const localDataDisplayObj = {};
//         for (key in country) {
//           if (key === 'name') {
//             localDataDisplayObj.name = country[key];
//           }
//           if (key === 'capital') {
//             localDataDisplayObj.capital = country[key];
//           }
//           if (key === 'population') {
//             localDataDisplayObj.population = country[key];
//           }
//           if (key === 'languages') {
//             const langAll = country[key]
//               .map(langAllList => langAllList.name)
//               .join(', ');
//             localDataDisplayObj.languages = langAll;
//           }
//           if (key === 'flags') {
//             localDataDisplayObj.flags = country[key].svg;
//           }
//         }
//         localDataDisplay.push(localDataDisplayObj);
//       }
//       for (country of localDataDisplay) {
//         const localDataDisplaySortedObj = {};
//         localDataDisplaySortedObj.flags = country.flags;
//         localDataDisplaySortedObj.name = country.name;
//         localDataDisplaySortedObj.capital = country.capital;
//         localDataDisplaySortedObj.population = country.population;
//         localDataDisplaySortedObj.languages = country.languages;
//         this.workData.push(localDataDisplaySortedObj);
//       }
//     },
//     searchingInputEvent: function (event) {
//       //console.log('event in searchingInputEvent', event);
//       //console.log('incoming data: ', event.currentTarget.value);
//       console.log('incoming data: ', event);
//       // this.countriesToSearch = event.currentTarget.value.trim().split(' ');
//       this.countriesToSearch = event.trim().split(' ');
//       console.log('array of words to search: ', this.countriesToSearch);
//       console.log('countries to search: ', this.countriesToSearch.length);
//       if (this.countriesToSearch[0] !== '') {
//         fetchCountries(this.countriesToSearch)
//           .then(data => {
//             // Data handling
//             this.serverData = data;
//             console.log('incoming data from server: ', this.serverData);
//           })
//           .catch(error => {
//             // Error handling
//             this.serverError = error;
//             if (this.serverError.message === '404') {
//               Notiflix.Notify.failure(
//                 `${this.serverError} Oops, there is no country with that name`
//               );
//               this.outputsFieldsClear();
//             } else {
//               Notiflix.Notify.failure(`${this.serverError}`);
//               this.outputsFieldsClear();
//             }
//           })
//           .finally(() => {
//             if (!this.serverError) {
//               this.outputsFieldsClear();
//               if (this.serverData.length > 10) {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 Notiflix.Notify.info(
//                   'Too many matches found. Please enter a more specific name.'
//                 );
//               } else if (
//                 this.serverData.length <= 10 &&
//                 this.serverData.length >= 2
//               ) {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 this.dataPreparation();
//                 let localDataDisplay = [
//                   `<p>Country list output. Searched countries: ${this.serverData.length}</p>`,
//                 ];
//                 //   for (let country of this.workData) {
//                 //     localDataDisplay.push(
//                 //       `<li>
//                 //         <svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
//                 //         <use href="${country.flags}"></use>
//                 //         </svg>${country.name}</li>`
//                 //     );
//                 //   }
//                 for (let country of this.workData) {
//                   localDataDisplay.push(
//                     `<li>
//                     <img
//                     src=" ${country.flags}"
//                     width="30"
//                     alt="${country.name} flag"></img>${country.name}</li>`
//                   );
//                 }
//                 let localDataDisplayString = localDataDisplay
//                   .map(li => li)
//                   .join(''); //building one string from array
//                 this.countryListOutput.insertAdjacentHTML(
//                   'beforeend',
//                   localDataDisplayString
//                 ); //adding elements to ul box
//               } else {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 this.dataPreparation();
//                 let localDataDisplay = [
//                   `<p>Country info output. Searched countries: ${this.serverData.length}</p>`,
//                 ];
//                 //   localDataDisplay.push(
//                 //     `<p><svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
//                 //         <use href="${this.workData[0].flags}"></use>
//                 //         </svg>${this.workData[0].name}</p>`
//                 //   );
//                 localDataDisplay.push(
//                   `<p>
//                   <img
//                   src="${this.workData[0].flags}"
//                   width="30"
//                   alt="${this.workData[0].name} flag"></img><span class="country-name"><b>${this.workData[0].name}</b><span></p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Capital:</b>  ${this.workData[0].capital}</p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Population:</b>  ${this.workData[0].population}</p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Languages:</b> ${this.workData[0].languages}</p>`
//                 );
//                 let localDataDisplayString = localDataDisplay
//                   .map(p => p)
//                   .join(''); //building one string from array
//                 this.countryInfoOutput.insertAdjacentHTML(
//                   'beforeend',
//                   localDataDisplayString
//                 ); //adding elements to div box
//               }
//             }
//             this.serverError = null;
//           });
//       } else {
//         this.outputsFieldsClear();
//       }
//     },
//     init: function () {
//       const debounceed = debounce(event => {
//         this.searchingInputEvent(event);
//       }, this.DEBOUNCE_DELAY);
//       this.searchField.addEventListener(
//         'input',
//         function (event) {
//           this.inputEventValue = event.currentTarget.value;
//           debounceed(this.inputEventValue);
//         }.bind(this)
//       );
//       //bez debounce, dziala
//       // this.searchField.addEventListener(
//       //   'input',
//       //   function (event) {
//       //     this.searchingInputEvent(event);
//       //   }.bind(this)
//       // );

//       //z debounce, problemy, ale wyszukiwanie dziala, nie ma opoznienia
//       // Uncaught TypeError: Expected a function
//       // at debounce (index.js:144:11)
//       // at Object.<anonymous> (index.js:185:17)

//       // this.searchField.addEventListener(
//       //   'input',
//       //   function (event) {
//       //     debounce(this.searchingInputEvent(event), this.DEBOUNCE_DELAY);
//       //   }.bind(this)
//       // );

//       //z debounce, problemy, ale wyszukiwanie nie dziala,  jest opoznienie
//       // index.js:61 Uncaught TypeError: Cannot read properties of null (reading 'value')
//       // at Object.searchingInputEvent (index.js:61:56)
//       // at index.js:196:12
//       // at invokeFunc (index.js:160:19)
//       // at trailingEdge (index.js:207:14)
//       // at timerExpired (index.js:195:14)

//       // const debounceed = debounce(event => {
//       //   this.searchingInputEvent(event);
//       // }, this.DEBOUNCE_DELAY);
//       // this.searchField.addEventListener(
//       //   'input',
//       //   function (event) {
//       //     debounceed(event);
//       //   }.bind(this)
//       // );
//     },
//   };
//   countrySearch.init();

//Backup test debounce
//bez debounce, dziala
// this.searchField.addEventListener(
//   'input',
//   function (event) {
//     this.searchingInputEvent(event);
//   }.bind(this)
// );

//z debounce, problemy, ale wyszukiwanie dziala, nie ma opoznienia
// Uncaught TypeError: Expected a function
// at debounce (index.js:144:11)
// at Object.<anonymous> (index.js:185:17)

// this.searchField.addEventListener(
//   'input',
//   function (event) {
//     debounce(this.searchingInputEvent(event), this.DEBOUNCE_DELAY);
//   }.bind(this)
// );

//z debounce, problemy, ale wyszukiwanie nie dziala,  jest opoznienie
// index.js:61 Uncaught TypeError: Cannot read properties of null (reading 'value')
// at Object.searchingInputEvent (index.js:61:56)
// at index.js:196:12
// at invokeFunc (index.js:160:19)
// at trailingEdge (index.js:207:14)
// at timerExpired (index.js:195:14)

// const debounceed = debounce(event => {
//   this.searchingInputEvent(event);
// }, this.DEBOUNCE_DELAY);
// this.searchField.addEventListener(
//   'input',
//   function (event) {
//     debounceed(event);
//   }.bind(this)
// );

// 'use strict';
// import './css/styles.css';
// import Notiflix from 'notiflix';
// import debounce from 'lodash.debounce';
// import { fetchCountries } from './fetchCountries.js';
// import { fetchCountriesFullName } from './fetchCountriesFullName.js';

// const countrySearch = {
//   DEBOUNCE_DELAY: 300,
//   countriesToSearch: [],
//   serverData: null,
//   serverError: null,
//   inputEventValue: null,
//   workData: [],
//   searchField: document.querySelector('#search-box'),
//   countryListOutput: document.querySelector('.country-list'),
//   countryInfoOutput: document.querySelector('.country-info'),
//   outputsFieldsClear: function () {
//     if (this.countryListOutput.hasChildNodes()) {
//       this.countryListOutput.replaceChildren();
//     }
//     if (this.countryInfoOutput.hasChildNodes()) {
//       this.countryInfoOutput.replaceChildren();
//     }
//   },
//   dataPreparation: function () {
//     this.workData.splice(0);
//     let localDataDisplay = [];
//     for (country of this.serverData) {
//       const localDataDisplayObj = {};
//       for (key in country) {
//         if (key === 'name') {
//           localDataDisplayObj.name = country[key];
//         }
//         if (key === 'capital') {
//           localDataDisplayObj.capital = country[key];
//         }
//         if (key === 'population') {
//           localDataDisplayObj.population = country[key];
//         }
//         if (key === 'languages') {
//           const langAll = country[key]
//             .map(langAllList => langAllList.name)
//             .join(', ');
//           localDataDisplayObj.languages = langAll;
//         }
//         if (key === 'flags') {
//           localDataDisplayObj.flags = country[key].svg;
//         }
//       }
//       localDataDisplay.push(localDataDisplayObj);
//     }
//     for (country of localDataDisplay) {
//       const localDataDisplaySortedObj = {};
//       localDataDisplaySortedObj.flags = country.flags;
//       localDataDisplaySortedObj.name = country.name;
//       localDataDisplaySortedObj.capital = country.capital;
//       localDataDisplaySortedObj.population = country.population;
//       localDataDisplaySortedObj.languages = country.languages;
//       this.workData.push(localDataDisplaySortedObj);
//     }
//   },
//   searchingInputEvent: function (event) {
//     //console.log('event in searchingInputEvent', event);
//     //console.log('incoming data: ', event.currentTarget.value);
//     console.log('incoming data: ', event);
//     // this.countriesToSearch = event.currentTarget.value.trim().split(' ');
//     this.countriesToSearch = event.trim().split(' ');
//     console.log('array of words to search: ', this.countriesToSearch);
//     console.log('countries to search: ', this.countriesToSearch.length);
//     if (this.countriesToSearch[0] !== '') {
//       if (this.countriesToSearch.length > 1) {
//         const countriesToSearchTable = this.countriesToSearch.filter(
//           country => country !== ''
//         );
//         const localcountriesToSearchString = countriesToSearchTable.join(' ');
//         Notiflix.Notify.info(
//           `Searching country by full name: ${localcountriesToSearchString}`
//         );
//         fetchCountriesFullName(localcountriesToSearchString)
//           .then(data => {
//             // Data handling
//             this.serverData = data;
//             console.log('incoming data from server: ', this.serverData);
//           })
//           .catch(error => {
//             // Error handling
//             this.serverError = error;
//             if (this.serverError.message === '404') {
//               Notiflix.Notify.failure(
//                 `${this.serverError} Oops, there is no country with that name`
//               );
//               this.outputsFieldsClear();
//             } else {
//               Notiflix.Notify.failure(`${this.serverError}`);
//               this.outputsFieldsClear();
//             }
//           })
//           .finally(() => {
//             if (!this.serverError) {
//               this.outputsFieldsClear();
//               Notiflix.Notify.info(
//                 `Searched countries: ${this.serverData.length}`
//               );
//               this.dataPreparation();
//               let localDataDisplay = [
//                 `<p>Country info output. Searched countries: ${this.serverData.length}</p>`,
//               ];
//               //   localDataDisplay.push(
//               //     `<p><svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
//               //         <use href="${this.workData[0].flags}"></use>
//               //         </svg>${this.workData[0].name}</p>`
//               //   );
//               localDataDisplay.push(
//                 `<p>
//                   <img
//                   src="${this.workData[0].flags}"
//                   width="30"
//                   alt="${this.workData[0].name} flag"></img><span class="country-name"><b>${this.workData[0].name}</b><span></p>`
//               );
//               localDataDisplay.push(
//                 `<p><b>Capital:</b>  ${this.workData[0].capital}</p>`
//               );
//               localDataDisplay.push(
//                 `<p><b>Population:</b>  ${this.workData[0].population}</p>`
//               );
//               localDataDisplay.push(
//                 `<p><b>Languages:</b> ${this.workData[0].languages}</p>`
//               );
//               let localDataDisplayString = localDataDisplay
//                 .map(p => p)
//                 .join(''); //building one string from array
//               this.countryInfoOutput.insertAdjacentHTML(
//                 'beforeend',
//                 localDataDisplayString
//               ); //adding elements to div box
//             }
//             this.serverError = null;
//           });
//       } else {
//         fetchCountries(this.countriesToSearch)
//           .then(data => {
//             // Data handling
//             this.serverData = data;
//             console.log('incoming data from server: ', this.serverData);
//           })
//           .catch(error => {
//             // Error handling
//             this.serverError = error;
//             if (this.serverError.message === '404') {
//               Notiflix.Notify.failure(
//                 `${this.serverError} Oops, there is no country with that name`
//               );
//               this.outputsFieldsClear();
//             } else {
//               Notiflix.Notify.failure(`${this.serverError}`);
//               this.outputsFieldsClear();
//             }
//           })
//           .finally(() => {
//             if (!this.serverError) {
//               this.outputsFieldsClear();
//               if (this.serverData.length > 10) {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 Notiflix.Notify.info(
//                   'Too many matches found. Please enter a more specific name.'
//                 );
//               } else if (
//                 this.serverData.length <= 10 &&
//                 this.serverData.length >= 2
//               ) {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 this.dataPreparation();
//                 let localDataDisplay = [
//                   `<p>Country list output. Searched countries: ${this.serverData.length}</p>`,
//                 ];
//                 //   for (let country of this.workData) {
//                 //     localDataDisplay.push(
//                 //       `<li>
//                 //         <svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
//                 //         <use href="${country.flags}"></use>
//                 //         </svg>${country.name}</li>`
//                 //     );
//                 //   }
//                 for (let country of this.workData) {
//                   localDataDisplay.push(
//                     `<li>
//                   <img
//                   src=" ${country.flags}"
//                   width="30"
//                   alt="${country.name} flag"></img>${country.name}</li>`
//                   );
//                 }
//                 let localDataDisplayString = localDataDisplay
//                   .map(li => li)
//                   .join(''); //building one string from array
//                 this.countryListOutput.insertAdjacentHTML(
//                   'beforeend',
//                   localDataDisplayString
//                 ); //adding elements to ul box
//               } else {
//                 Notiflix.Notify.info(
//                   `Searched countries: ${this.serverData.length}`
//                 );
//                 this.dataPreparation();
//                 let localDataDisplay = [
//                   `<p>Country info output. Searched countries: ${this.serverData.length}</p>`,
//                 ];
//                 //   localDataDisplay.push(
//                 //     `<p><svg width="150" height="75" viewBox="0 0 150 75" xmlns="http://www.w3.org/2000/svg">
//                 //         <use href="${this.workData[0].flags}"></use>
//                 //         </svg>${this.workData[0].name}</p>`
//                 //   );
//                 localDataDisplay.push(
//                   `<p>
//                 <img
//                 src="${this.workData[0].flags}"
//                 width="30"
//                 alt="${this.workData[0].name} flag"></img><span class="country-name"><b>${this.workData[0].name}</b><span></p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Capital:</b>  ${this.workData[0].capital}</p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Population:</b>  ${this.workData[0].population}</p>`
//                 );
//                 localDataDisplay.push(
//                   `<p><b>Languages:</b> ${this.workData[0].languages}</p>`
//                 );
//                 let localDataDisplayString = localDataDisplay
//                   .map(p => p)
//                   .join(''); //building one string from array
//                 this.countryInfoOutput.insertAdjacentHTML(
//                   'beforeend',
//                   localDataDisplayString
//                 ); //adding elements to div box
//               }
//             }
//             this.serverError = null;
//           });
//       }
//     } else {
//       this.outputsFieldsClear();
//     }
//   },
//   init: function () {
//     const debounceed = debounce(event => {
//       this.searchingInputEvent(event);
//     }, this.DEBOUNCE_DELAY);
//     this.searchField.addEventListener(
//       'input',
//       function (event) {
//         this.inputEventValue = event.currentTarget.value;
//         debounceed(this.inputEventValue);
//       }.bind(this)
//     );
//   },
// };
// countrySearch.init();
