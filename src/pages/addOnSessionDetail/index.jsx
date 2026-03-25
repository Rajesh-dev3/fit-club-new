import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CommonTable from '../../components/commonTable';
import './styles.scss';

const AddOnSessionDetail = () => {
  const { id } = useParams(); // membership id
  
  // Demo data for sessions
  const [sessionData] = useState({
    data: [
      {
        _id: '1',
        branchId: { name: 'Fitclub Mumbai' },
        packageName: 'Personal Training',
        sessions: '10/12',
        startDate: '2024-01-15',
        status: 'active'
      },
      {
        _id: '2',
        branchId: { name: 'Fitclub Delhi' },
        packageName: 'Pilates Session',
        sessions: '5/8',
        startDate: '2024-02-01',
        status: 'completed'
      },
      {
        _id: '3',
        branchId: { name: 'Fitclub Bangalore' },
        packageName: 'EMS Training',
        sessions: '3/5',
        startDate: '2024-03-10',
        status: 'active'
      }
    ]
  });

  const columns = [
    {
      title: 'S.no',
      dataIndex: 'sno',
      key: 'sno',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Branch',
      dataIndex: ['branchId', 'name'],
      key: 'branch',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Trainer Name',
      dataIndex: 'trainerName',
      key: 'trainerName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
      render: (text) => text || 'N/A'
    },
    // {
    //   title: 'Start Date',
    //   dataIndex: 'startDate',
    //   key: 'startDate',
    //   render: (date) => {
    //     if (!date) return 'N/A';
    //     return new Date(date).toLocaleDateString('en-GB');
    //   }
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span 
          style={{
            textTransform: 'capitalize',
            color: status === 'active' ? '#52c41a' : status === 'completed' ? '#1890ff' : '#999',
            fontWeight: '500'
          }}
        >
          {status || 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="add-on-session-detail-container">
      <div className="header">
        <h2>Add-On Session Details</h2>
      </div>
      
      <CommonTable
        columns={columns}
        data={sessionData?.data || []}
        loading={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default AddOnSessionDetail;
