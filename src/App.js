import React, { useState, createContext, useEffect } from 'react';
import './App.css';
import CurrencyConverter from './CurrencyConverter';
import CurrencyChart from './CurrencyChart';

// Створення контекстів для теми та мови
export const ThemeContext = createContext('light');
export const LanguageContext = createContext('ua');

function App() {
  const [theme, setTheme] = useState('light'); // 'light' або 'dark'
  const [language, setLanguage] = useState('ua'); // Поточна мова
  const [baseCurrency, setBaseCurrency] = useState('USD'); // Основна валюта
  const [targetCurrency, setTargetCurrency] = useState('EUR'); // Валюта конвертації
  const apiKey = 'ce3dbd40db2a799bf0217e52d6500dae'; // Ваш API ключ

  // Функція для зміни теми
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Функція для зміни мови
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Додавання класу теми до <body>
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
              {/* Додаткові мови */}
            </select>
          </header>

          {/* Основні компоненти */}
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

