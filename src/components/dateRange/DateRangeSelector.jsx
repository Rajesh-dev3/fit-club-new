import {  useState} from "react";
import { DateRangePicker } from 'react-date-range';

const DateRangeSelector = ({ onChange }) => {
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [show, setShow] = useState
  (false);

  const handleSelect = (ranges) => {
    setRange(ranges.selection);
    if (onChange) onChange(ranges.selection);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setShow((s) => !s)} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid var(--muted)', background: 'var(--card-bg)', color: 'var(--sider-text)', cursor: 'pointer' }}>
        Select Date Range
      </button>
      {show && (
        <div style={{ position: 'absolute', zIndex: 10, top: '110%', left: 0 }}>
          <DateRangePicker
            ranges={[range]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
