import React from 'react';
import { Table } from 'antd';
import './styles.scss';

const CommonTable = ({ columns, dataSource, ...rest }) => {
  return (
    <div className="common-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        {...rest}
      />
    </div>
  );
};

export default CommonTable;
