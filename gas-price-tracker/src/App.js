import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [gasPrices, setGasPrices] = useState([]);

  useEffect(() => {
    async function fetchGasPrices() {
      try {
        const response = await axios.get('http://localhost:5000/gas-prices');
        setGasPrices(response.data);
      } catch (error) {
        console.error('Error fetching gas prices:', error);
      }
    }

    fetchGasPrices();
  }, []);

  return (
    <div>
      <h1>Gas Prices</h1>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>nAVAX Value</th>
            <th>Dollar Value</th>
          </tr>
        </thead>
        <tbody>
          {gasPrices.map((price) => (
            <tr key={price.id}>
              <td>{price.timestamp}</td>
              <td>{price.nAVAXPrice}</td>
              <td>{price.dollarPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
