import React from 'react';
import { Dropdown, Button, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import './styles.scss';

const ColumnVisibility = ({ columns, visibleColumns, onColumnToggle }) => {
  const menuItems = columns?.map(col => ({
    key: col.key,
    label: (
      <Checkbox
        checked={visibleColumns[col.key]}
        onChange={() => onColumnToggle(col.key)}
      >
        {col.title}
      </Checkbox>
    ),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button 
        icon={<SettingOutlined />}
        className="columns-btn"
      >
        Columns
      </Button>
    </Dropdown>
  );
};

export default ColumnVisibility;
