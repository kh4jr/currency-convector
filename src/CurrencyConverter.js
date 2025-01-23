import React, { useState, useEffect } from "react";
import './App.css';
import '../src/CurrencyConverter.css'


// API key
const API_KEY = "ce3dbd40db2a799bf0217e52d6500dae";

const CurrencyConverter = () => {
  const [rates, setRates] = useState({});
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [inputCurrency, setInputCurrency] = useState("USD");
  const [outputCurrency, setOutputCurrency] = useState("EUR");

  // Load exchange rates from Local Storage
  const loadRatesFromLocalStorage = () => {
    const data = localStorage.getItem("currencyRates");
    if (!data) return null;

    const parsedData = JSON.parse(data);
    const fourHours = 4 * 60 * 60 * 1000;
    if (new Date().getTime() - parsedData.timestamp > fourHours) {
      localStorage.removeItem("currencyRates");
      return null;
    }

    return parsedData.rates;
  };


  // Save exchange rates to Local Storage
  const saveRatesToLocalStorage = (rates) => {
    const data = {
      rates,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("currencyRates", JSON.stringify(data));
  };

  // Fetch exchange rates from the API
  const fetchCurrencyRates = async () => {
    try {
      const response = await fetch(
        `http://api.currencylayer.com/live?access_key=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch currency rates.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.info || "API error.");
      }
      return data.quotes;
    } catch (error) {
      console.error("Error fetching currency rates:", error.message);
      alert("Could not update currency rates. Using saved rates if available.");
      return loadRatesFromLocalStorage() || {};
    }
  };

  // Update exchange rates
  const updateRates = async () => {
    const newRates = await fetchCurrencyRates();
    setRates(newRates);
    saveRatesToLocalStorage(newRates);
  };


// Component initialization
  useEffect(() => {
    const savedRates = loadRatesFromLocalStorage();
    if (savedRates) {
      setRates(savedRates);
    } else {
      updateRates();
    }

     // Automatically update rates every 4 hours
    const fourHours = 4 * 60 * 60 * 1000;
    const interval = setInterval(updateRates, fourHours);
    return () => clearInterval(interval);
  }, []);

  // Calculate the conversion result
  useEffect(() => {
    if (rates) {
      const rateInputToUSD = rates[`USD${inputCurrency}`] || 1;
      const rateUSDToOutput = rates[`USD${outputCurrency}`] || 1;
      const result = (inputAmount / rateInputToUSD) * rateUSDToOutput;
      setOutputAmount(result.toFixed(2));
    }
  }, [inputAmount, inputCurrency, outputCurrency, rates]);

  // Save conversion history to Local Storage
  const saveConversionHistory = (inputAmount, inputCurrency, outputAmount, outputCurrency) => {
    const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
    const newEntry = {
      inputAmount,
      inputCurrency,
      outputAmount,
      outputCurrency,
      date: new Date().toLocaleString(),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    localStorage.setItem("conversionHistory", JSON.stringify(updatedHistory));
  };

  // Save conversion when result changes
  useEffect(() => {
    if (inputAmount > 0) {
      saveConversionHistory(inputAmount, inputCurrency, outputAmount, outputCurrency);
    }
  }, [outputAmount]);

  // Load conversion history from Local Storage
  const loadConversionHistory = () => {
    return JSON.parse(localStorage.getItem("conversionHistory")) || [];
  };


  // Render the currency selector options
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Currency Converter</h1>
      <div>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
        />
        <select
          value={inputCurrency}
          onChange={(e) => setInputCurrency(e.target.value)}
        >
          {Object.keys(rates)
            .filter((key) => key.startsWith("USD"))
            .map((key) => {
              const currency = key.replace("USD", ""); // Extract currency code from the key
              return (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              );
            })}
        </select>
      </div>
      <div>
        <input type="number" value={outputAmount} readOnly />
        <select
          value={outputCurrency}
          onChange={(e) => setOutputCurrency(e.target.value)}
        >
          {Object.keys(rates)
            .filter((key) => key.startsWith("USD"))
            .map((key) => {
              const currency = key.replace("USD", ""); 
              return (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              );
            })}
        </select>
      </div>
      <button class="update-rates-btn" onClick={updateRates}>Update Rates</button>
      <h3>Conversion History</h3>
      <ul>
        {loadConversionHistory().map((entry, index) => (
          <li key={index}>
            {entry.date}: {entry.inputAmount} {entry.inputCurrency} →{" "}
            {entry.outputAmount} {entry.outputCurrency}
          </li>
        ))}
      </ul>
      <h3>Popular Exchange Rates</h3>
<table style={{ margin: "20px auto", borderCollapse: "collapse" }}>
  <thead>
    <tr>
      <th style={{ border: "1px solid black", padding: "10px" }}>From</th>
      <th style={{ border: "1px solid black", padding: "10px" }}>To</th>
      <th style={{ border: "1px solid black", padding: "10px" }}>Rate</th>
    </tr>
  </thead>
  <tbody>
    {["EUR", "GBP", "JPY"].map((currency) => (
      <tr key={currency}>
        <td style={{ border: "1px solid black", padding: "10px" }}>USD</td>
        <td style={{ border: "1px solid black", padding: "10px" }}>
          {currency}
        </td>
        <td style={{ border: "1px solid black", padding: "10px" }}>
          {rates[`USD${currency}`]?.toFixed(2) || "N/A"}
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
  
};

export default CurrencyConverter;
