import React, { useState, createContext, useEffect } from 'react';
import './App.css';
import CurrencyConverter from './CurrencyConverter';
import CurrencyChart from './CurrencyChart';

// Creating contexts for theme and language
export const ThemeContext = createContext('light');
export const LanguageContext = createContext('ua');

function App() {
  const [theme, setTheme] = useState('light'); // Current theme ('light' or 'dark')
  const [language, setLanguage] = useState('ua'); // Current language
  const [baseCurrency, setBaseCurrency] = useState('USD'); // Base currency for conversion
  const [targetCurrency, setTargetCurrency] = useState('EUR'); // Target currency for conversion
  const apiKey = 'ce3dbd40db2a799bf0217e52d6500dae'; // API key for accessing exchange rate data

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Function to change the language
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Add theme class to <body>
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LanguageContext.Provider value={{ language, changeLanguage }}>
        <div className={`app-container ${theme}`}>
          {}
          <header>
            <button onClick={toggleTheme}>
              {theme === 'light' ? 'dark' : 'light'}
            </button>

            {/* Вибір мови */}
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={language}
            >
              <option value="en">Українська</option>
              <option value="ua">English</option>
              <option value="pl">Bober Kurwa</option>
              {}
            </select>
          </header>

          {}
          <main>
            <CurrencyConverter
              baseCurrency={baseCurrency}
              targetCurrency={targetCurrency}
              onBaseCurrencyChange={setBaseCurrency}
              onTargetCurrencyChange={setTargetCurrency}
              apiKey={apiKey}
            />
            <CurrencyChart
              baseCurrency={baseCurrency}
              targetCurrency={targetCurrency}
              apiKey={apiKey}
            />
          </main>
        </div>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;

