import React from 'react';
import './HierarchicalChart.scss';

const HierarchicalChart = ({ 
  title, 
  amount, 
  period = '', 
  data = [],
  type = 'sales' // 'sales' or 'trainers'
}) => {
  const chartData = Array.isArray(data) ? data : [];
  
  // Get the maximum revenue for scaling bars
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(item => item.revenue)) : 0;

  const formatRevenue = (revenue) => {
    if (revenue === 0) return '0';
    if (revenue >= 10000000) return `${(revenue / 10000000).toFixed(1)}Cr`;
    if (revenue >= 100000) return `${(revenue / 100000).toFixed(1)}L`;
    if (revenue >= 1000) return `${(revenue / 1000).toFixed(1)}K`;
    return revenue.toString();
  };

  const chartHeightPx = 180;
  const minBarHeightPx = 24;
  const getBarHeightPx = (revenue) => {
    if (maxRevenue === 0) return minBarHeightPx;
    const scaledHeight = (revenue / maxRevenue) * (chartHeightPx - minBarHeightPx);
    return Math.max(minBarHeightPx, Math.round(scaledHeight));
  };

  return (
    <div className="hierarchical-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>{title}</h3>
          <span className="chart-amount">₹{amount}</span>
        </div>
        {period && (
          <div className="chart-period">
            <span>{period}</span>
          </div>
        )}
      </div>

      <div className="chart-content">
        <div className="chart-bars">
          {chartData?.map((item, index) => {
            const barHeight = getBarHeightPx(item.revenue);
            const isMainBar = index === 0;
            
            return (
              <div key={item.id} className="bar-container">
                <div className="revenue-label">
                  {formatRevenue(item.revenue)}
                </div>
                <div 
                  className={`chart-bar ${isMainBar ? 'main-bar' : 'sub-bar'} ${item.revenue === 0 ? 'zero-revenue' : ''}`}
                  style={{
                    height: `${barHeight}px`,
                  }}
                >
                  <div className="user-avatar">
                    <img 
                      src={item.image || `https://ui-avatars.com/api/?name=${item.name}&background=random`} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${item.name}&background=random`;
                      }}
                    />
                  </div>
                </div>
                <div className="user-name">{item.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HierarchicalChart;