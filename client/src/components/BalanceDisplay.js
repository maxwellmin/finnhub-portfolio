import React, { useState, useEffect } from 'react';
import '../App.css';

const BalanceDisplay = () => {
  const [total, setTotal] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [ChangeInPercentage , setChangeInPercentage] = useState(0);

  useEffect(() => {
    // Fetch portfolio data from the backend and calculate total market value
    async function fetchPortfolioData() {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/portfolio');
        const portfolioData = await response.json();

        let calculatedTotal = 0;
        let changeInValue = 0;
        let totalPurchaseCost = 0;
        let changeInPercentage = 0;

        // Loop through each item in the portfolio to get the latest price
        const updatedData = await Promise.all(portfolioData.map(async (item) => {
          const priceResponse = await fetch(`http://localhost:3000/fin/yahoo1/current/${item.ticker}`);
          const stockPrice = await priceResponse.json();

          console.log('Ticker:', item.ticker); // Debugging
          console.log('Quantity:', item.quantity); // Debugging
          console.log('Stock Price:', stockPrice); // Debugging

          const currentMarketValue = item.quantity * stockPrice;
          const purchaseCost = item.quantity * item.purchase_price;

          calculatedTotal += currentMarketValue;
          totalPurchaseCost +=  purchaseCost;

          // Assuming `item.unrealized_return` is today's change for each asset.
          changeInValue = calculatedTotal - totalPurchaseCost;
          changeInPercentage = changeInValue / totalPurchaseCost;

          return {
            ...item,
            current_price: stockPrice, // Update with the latest price
            net_worth: currentMarketValue.toFixed(2),
          };
        }));

        setTotal(calculatedTotal.toFixed(2)); // Update the total value
        setTotalChange(changeInValue.toFixed(2));
        setChangeInPercentage(changeInPercentage.toFixed(4));

      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      }
    }

    fetchPortfolioData();
  }, []);

  // Determine the CSS class based on the value of todayChange
  const changeClass = totalChange > 0 ? 'positive' : totalChange < 0 ? 'negative' : 'neutral';

  return (
    <div className="BalanceDisplay">
      <h2>Portfolio Market Value: ${total}</h2>
      <p className={changeClass}>
        {{totalChange} >= 0 ? `↑ ${totalChange}` : `↓ ${Math.abs(totalChange)}`} ({(ChangeInPercentage*100).toFixed(2)}%) Today</p>
    </div>
  );
};

export default BalanceDisplay;