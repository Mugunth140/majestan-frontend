import React from 'react';
import { renderToString } from 'react-dom/server';

const cities = [
  { id: 1, city_name: 'TestCity', state_name: 'TestState' },
  { id: 2, city_name: 'Coimbatore', state_name: 'Tamil Nadu' }
];

const SelectBox = () => (
  <select>
    <option value="">-- Select a City --</option>
    {cities.map((city) => (
      <option key={city.id} value={city.id}>
        {city.city_name} {city.state_name ? `(${city.state_name})` : ''}
      </option>
    ))}
  </select>
);

console.log(renderToString(<SelectBox />));
