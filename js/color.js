const countryDomain = ['Iraq', 'Philippines','Syria','Mexico','Pakistan','Colombia','India','Somalia','Russia','Afghanistan',
'Israel and the Occupied Palestinian Territory','Brazil','Algeria','Honduras','Ukraine'];

const countryColors = {
    'Iraq': '#1f77b4',
    'Philippines': '#ff7f0e',
    'Syria': '#2ca02c',
    'Mexico': '#d62728',
    'Pakistan': '#9467bd',
    'Colombia': '#8c564b',
    'India': '#e377c2',
    'Somalia': '#7f7f7f',
    'Russia': '#bcbd22',
    'Afghanistan': '#17becf',
    'Israel and the Occupied Palestinian Territory': '#ff9896',
    'Brazil': '#aec7e8',
    'Algeria': '#ffbb78',
    'Honduras': '#98df8a',
    'Ukraine': '#c5b0d5'
  };

const CountryCategoricalScale = d3.scaleOrdinal()
  .domain(countryDomain)
  .range(countryDomain.map(country => countryColors[country])); 
// add designated color into range  

// Check if the key is in the domain
const keyToCheck = 'someKey';
if (countryDomain.includes(keyToCheck)) { 
  // Key is in the domain
  console.log(`${keyToCheck} is in the domain.`);
} else {
  // Key is not in the domain
  console.log(`${keyToCheck} is not in the domain.`);
}