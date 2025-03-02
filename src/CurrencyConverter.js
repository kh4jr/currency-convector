import React, { useState, useEffect, createContext } from "react";
import './App.css';
import CurrencyChart from './CurrencyChart';

// Creating contexts for theme and language
export const ThemeContext = createContext('light');
export const LanguageContext = createContext('ua');

const API_KEY = "ce3dbd40db2a799bf0217e52d6500dae";

const CurrencyConverter = () => {
  // State variables
  const [rates, setRates] = useState({});
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [inputCurrency, setInputCurrency] = useState("USD");
  const [outputCurrency, setOutputCurrency] = useState("EUR");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState('ua'); // Current language
  const [baseCurrency, setBaseCurrency] = useState('USD'); // Base currency for conversion
  const [targetCurrency, setTargetCurrency] = useState('EUR'); // Target currency for conversion
  const apiKey = 'ce3dbd40db2a799bf0217e52d6500dae'; // API key for accessing exchange rate data

  // Update the theme attribute on the document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Function to change the language
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

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
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LanguageContext.Provider value={{ language, changeLanguage }}>
        <div className={`app-container ${theme}`}>
          <div className="content-wrapper">
            <div className="top-container">
              <header>
                <div className="head-controls">
                  <button className="theme-toggle-btn" onClick={toggleTheme}>
                    Switch to {theme === "light" ? "Dark" : "Light"} Theme
                  </button>
                  <select className="language-select"
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={language}
                  >
                    <option value="en">Українська</option>
                    <option value="ua">English</option>
                    <option value="pl">Polski</option>
                  </select>
                </div>
              </header>
            </div>
            <div className="middle-container">
              <div className="second-container">
                <h1>Currency Converter</h1>
                <div className="input-container">
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
                <div className="input-container">
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
                <button className="update-rates-btn" onClick={updateRates}>Update Rates</button>
              </div>
            </div>
            <div className="bottom-container">
              <div className="history-section">
                <h2>Conversion History</h2>
                <ul>
                  {loadConversionHistory().map((entry, index) => (
                    <li key={index}>
                      {entry.date}: {entry.inputAmount} {entry.inputCurrency} →{" "}
                      {entry.outputAmount} {entry.outputCurrency}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="table-section">
                <h2>Popular Exchange Rates</h2>
                <table>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["EUR", "GBP", "PLN"].map((currency) => (
                      <tr key={currency}>
                        <td>
                          <select className="currency-select-from">
                            <option value="USD">USD</option>
                            <option value="PLN">PLN</option>
                            <option value="UAH">UAH</option>
                            <option value="JPN">JPN</option>
                          </select>
                        </td>
                        <td>
                          <select className="currency-select-to">
                            <option value={currency}>{currency}</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </td>
                        <td>{rates[`USD${currency}`]?.toFixed(2) || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CurrencyChart
                baseCurrency={baseCurrency}
                targetCurrency={targetCurrency}
                apiKey={apiKey}
              />
            </div>
          </div>
        </div>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
};

export default CurrencyConverter;
