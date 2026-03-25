import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import { CloseOutlined, DownOutlined, CalendarOutlined } from '@ant-design/icons';
import Calendar from '../calendar';
import TeamMemberSelect from '../teamMemberSelect';
import './styles.scss';

const FilterDrawer = ({ open, onClose }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [teamMemberModalOpen, setTeamMemberModalOpen] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    0: null, // Date Created
    2: null, // Date Assigned
  });
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filterItems = [
    { label: 'Date Created', value: 'any', type: 'date', component: 'calendar' },
    { label: 'Assigned To', value: 'any', type: 'team', component: 'teamMember' },
    { label: 'Date Assigned', value: 'any', type: 'date', component: 'calendar' },
    { label: 'Follow Up', value: 'any', type: 'select', component: null },
    { label: 'Last Activity', value: 'any', type: 'select', component: null },
    { label: 'Contacted Status', value: 'any', type: 'select', component: null },
    { label: 'Source', value: 'any', type: 'select', component: null },
    { label: 'Groups', value: 'any', type: 'select', component: null },
    { label: 'Lead Stage', value: 'any', type: 'select', component: null },
    { label: 'testing', value: 'any', type: 'select', component: null },
  ];

  const formatDateRange = (dateRange) => {
    if (!dateRange) return null;
    const { start, end } = dateRange;
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleFilterClick = (item, index) => {
    if (item.type === 'date') {
      setTeamMemberModalOpen(false); // Close team member modal
      setActiveFilter(activeFilter === index ? null : index);
    } else if (item.type === 'team') {
      setActiveFilter(null); // Close calendar
      setTeamMemberModalOpen(true);
    }
  };

  const handleDateChange = (dateRange, filterIndex) => {
    setDateFilters(prev => ({
      ...prev,
      [filterIndex]: dateRange
    }));
    setActiveFilter(null);
  };

  const handleClearDate = (filterIndex) => {
    setDateFilters(prev => ({
      ...prev,
      [filterIndex]: null
    }));
  };

  const handleMemberSelect = (members) => {
    setSelectedMembers(members);
  };

  // Close all child components when drawer closes
  useEffect(() => {
    if (!open) {
      setActiveFilter(null);
      setTeamMemberModalOpen(false);
    }
  }, [open]);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--sider-text)' }}>Filters</h2>
          <CloseOutlined 
            style={{ fontSize: '20px', cursor: 'pointer', color: '#999' }} 
            onClick={onClose}
          />
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      closable={false}
      className='drawer-sider'
      styles={{
        body: { background: 'var(--card-bg)' },
        header: { background: 'var(--card-bg)'},
        content: { background: 'var(--card-bg)' }
      }}
    >
      <div className="filter-content">
        {filterItems.map((item, index) => {
          const selectedDateRange = dateFilters[index];
          const displayValue = item.type === 'date' && selectedDateRange 
            ? formatDateRange(selectedDateRange)
            : item.value.charAt(0).toUpperCase() + item.value.slice(1);

          return (
            <div 
              className="filter-item" 
              key={index}
              style={{ cursor: (item.type === 'date' || item.type === 'team') ? 'pointer' : 'default' }}
            >
              <label className="filter-label">
                {item.label}
                {item.type === 'date' && selectedDateRange && (
                  <span className="clear-date" onClick={() => handleClearDate(index)}>
                    Clear
                  </span>
                )}
              </label>
              
              <div onClick={() => handleFilterClick(item, index)}>
                <span className={`filter-value ${selectedDateRange ? 'has-date' : ''}`}>
                  <span style={{ color: selectedDateRange ? '#3498db' : 'inherit' }}>
                  {item.type === 'date' && selectedDateRange && (
                    <CalendarOutlined style={{ marginRight: '8px', color: '#3498db' }} />
                  )}
                    {displayValue}
                  </span>
                  <div className="icon">
                    <DownOutlined style={{fontSize:"12px"}}/>
                  </div>
                </span>
              </div>
              
              {activeFilter === index && item.type === 'date' && (
                <div className="calendar-popup" onClick={(e) => e.stopPropagation()}>
                  <Calendar 
                    selectedDate={selectedDateRange} 
                    onDateChange={(dateRange) => handleDateChange(dateRange, index)} 
                  />
                </div>
              )}

              {teamMemberModalOpen && item.type === 'team' && (
                <div className="team-member-popup" onClick={(e) => e.stopPropagation()}>
                  <TeamMemberSelect 
                    open={teamMemberModalOpen}
                    onClose={() => setTeamMemberModalOpen(false)}
                    onSelect={handleMemberSelect}
                    selectedMembers={selectedMembers}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};

export default FilterDrawer;
