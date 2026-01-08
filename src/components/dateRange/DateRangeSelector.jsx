import { useState, useRef, useEffect } from "react";
import { DateRangePicker } from 'react-date-range';
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import "./styles.scss";
import "react-date-range/dist/styles.css";
import { useMediaQuery } from "react-responsive";

const DateRangeSelector = ({ onChange }) => {
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [show, setShow] = useState(false);
  const pickerRef = useRef(null);
  
  // Media queries for responsive behavior
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  const handleSelect = (ranges) => {
    setRange(ranges.selection);
    if (onChange) onChange(ranges.selection);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isMobile ? '2-digit' : 'numeric'
    });
  };

  const getDisplayText = () => {
    if (!range.startDate || !range.endDate) return 'Select Date Range';
    
    const startDate = formatDate(range.startDate);
    const endDate = formatDate(range.endDate);
    
    if (isMobile) {
      // Shorter format for mobile
      if (range.startDate.getTime() === range.endDate.getTime()) {
        return startDate;
      }
      return `${startDate} - ${endDate}`;
    }
    
    if (isTablet) {
      // Medium format for tablet
      return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
    }
    
    // Full format for desktop
    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
  };

  return (
    <div className="date-range-selector" ref={pickerRef}>
      <button 
        type="button" 
        className="date-range-trigger"
        onClick={() => setShow((s) => !s)}
      >
        <CalendarOutlined className="date-range-icon" />
        <span className="date-range-text">{getDisplayText()}</span>
        <DownOutlined className="date-range-arrow" />
      </button>
      {show && (
        <>
          <div 
            className="date-range-overlay"
            onClick={() => setShow(false)}
          />
          <div className="date-range-picker-container">
            <DateRangePicker
              ranges={[range]}
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              className="date-range-picker"
              rangeColors={['var(--accent)', 'var(--accent)']}
              color="var(--accent)"
              showMonthAndYearPickers={!isMobile}
              showDateDisplay={!isMobile}
              months={isMobile ? 1 : isTablet ? 1 : 2}
              direction={isMobile ? "vertical" : "horizontal"}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeSelector;