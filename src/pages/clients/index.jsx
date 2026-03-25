import React, { useState } from 'react';
import { Button, Tabs, Input, Select, Checkbox, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined, FilterOutlined, SettingOutlined, FullscreenOutlined, CloseOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import FilterDrawer from '../../components/filterDrawer';
import CommonTable from '../../components/commonTable';
import AddClientModal from '../../components/addClientModal';
import './styles.scss';

const { TabPane } = Tabs;

const Clients = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <span>{text}</span>
          <span style={{ color: '#999', fontSize: '16px' }}>›</span>
        </div>
      ),
    },
    {
      title: 'ASSIGNED TO',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <div style={{
            width: 24,
            height: 24,
            background: '#666',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px'
          }}>
            ↗
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'NOTES',
      dataIndex: 'notes',
      key: 'notes',
      width: 350,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text) => <span style={{ color: text === '-' ? '#999' : '#333', whiteSpace: 'nowrap' }}>{text}</span>,
    },
    {
      title: 'PHONE NUMBER',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'DATE ADDED',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'LAST ACTIVITY',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 130,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'FOLLOW UP',
      dataIndex: 'followUp',
      key: 'followUp',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'GROUPS',
      dataIndex: 'groups',
      key: 'groups',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'LEAD STAGE',
      dataIndex: 'leadStage',
      key: 'leadStage',
      width: 140,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'LEAD SOURCE',
      dataIndex: 'leadSource',
      key: 'leadSource',
      width: 140,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'OPPORTUNITY SIZE',
      dataIndex: 'opportunitySize',
      key: 'opportunitySize',
      width: 160,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Sumeet Dhall',
      assignedTo: 'Dhun',
      notes: '-',
      phoneNumber: '+919899429264',
      email: 'sumeet@example.com',
      dateAdded: '2024-01-15',
      lastActivity: '2024-03-20',
      followUp: '2024-03-28',
      groups: 'Premium',
      leadStage: 'New Lead',
      leadSource: 'Website',
      opportunitySize: '$5,000',
    },
    {
      key: '2',
      name: 'shivani',
      assignedTo: 'Sanjay Singh',
      notes: '-',
      phoneNumber: '+919557336224',
      email: 'shivani@example.com',
      dateAdded: '2024-02-10',
      lastActivity: '2024-03-19',
      followUp: '2024-03-27',
      groups: 'Standard',
      leadStage: 'Contacted',
      leadSource: 'Referral',
      opportunitySize: '$3,000',
    },
    {
      key: '3',
      name: 'chiranjeev',
      assignedTo: 'Sanjay Singh',
      notes: '-',
      phoneNumber: '+918860454510',
      email: 'chiranjeev@example.com',
      dateAdded: '2024-02-20',
      lastActivity: '2024-03-18',
      followUp: '2024-03-26',
      groups: 'VIP',
      leadStage: 'Qualified',
      leadSource: 'Cold Call',
      opportunitySize: '$7,500',
    },
    {
      key: '4',
      name: 'Amit',
      assignedTo: 'Sanjay Singh',
      notes: '-',
      phoneNumber: '+919811108791',
      email: 'amit@example.com',
      dateAdded: '2024-03-01',
      lastActivity: '2024-03-17',
      followUp: '2024-03-25',
      groups: 'Premium',
      leadStage: 'Proposal Sent',
      leadSource: 'Social Media',
      opportunitySize: '$4,200',
    },
    {
      key: '5',
      name: 'Tanush',
      assignedTo: 'Ayushi',
      notes: '-',
      phoneNumber: '+919930024055',
      email: 'tanush@example.com',
      dateAdded: '2024-03-05',
      lastActivity: '2024-03-16',
      followUp: '2024-03-24',
      groups: 'Standard',
      leadStage: 'Follow Up',
      leadSource: 'Event',
      opportunitySize: '$2,800',
    },
    {
      key: '6',
      name: 'Radhika + 1',
      assignedTo: 'Lalit Kumar',
      notes: 'WI...tour given looking for couple...told the plan......',
      phoneNumber: '+919711156767',
      email: 'radhika@example.com',
      dateAdded: '2024-03-08',
      lastActivity: '2024-03-15',
      followUp: '2024-03-23',
      groups: 'Couples',
      leadStage: 'Qualified',
      leadSource: 'Walk-in',
      opportunitySize: '$6,000',
    },
    {
      key: '7',
      name: 'Anmol + Brother',
      assignedTo: 'Sumaiyya Rashid',
      notes: '-',
      phoneNumber: '+919876543210',
      email: 'anmol@example.com',
      dateAdded: '2024-03-12',
      lastActivity: '2024-03-14',
      followUp: '2024-03-22',
      groups: 'Family',
      leadStage: 'New Lead',
      leadSource: 'Referral',
      opportunitySize: '$4,500',
    },
  ];

  const tabs = [
    { key: 'all', label: 'All Clients', count: data.length },
    { key: 'uncontacted', label: 'Uncontacted', count: 0 },
    { key: 'followUps', label: 'Follow Ups', count: 0 },
    { key: 'recentlyViewed', label: 'Recently Viewed Content', count: 0 },
  ];

  return (
    <div className="clients-page">
      <div className="clients-header">
        <h1>Clients</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large" 
          className="add-client-btn"
          onClick={() => setAddClientModalOpen(true)}
        >
          ADD NEW CLIENT
        </Button>
      </div>

      <div className="clients-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {tabs.map(tab => (
            <TabPane tab={tab.label} key={tab.key} />
          ))}
        </Tabs>
      </div>

      <div className="clients-filters">
        <div className="search-section">
          <Input
            placeholder="Search Clients"
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            size="large"
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <Select
            defaultValue="all"
            size="large"
            className="team-select"
            suffixIcon={<TeamOutlined />}
          >
            <Select.Option value="all">All Team Members</Select.Option>
          </Select>
          <Button
            size="large"
            className="filter-btn"
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filter
          </Button>
          <Button icon={<SettingOutlined />} size="large" className="icon-btn" />
          <Button 
            icon={<FullscreenOutlined />} 
            size="large" 
            className="icon-btn"
            onClick={() => setFullscreenMode(true)}
          />
        </div>
      </div>

      <div className="clients-table">
        <CommonTable
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: () => ({
              className: 'custom-checkbox',
            }),
          }}
          // rowClassName={() => 'client-row'}
        />
      </div>

      {selectedRowKeys.length > 0 && (
        <div className="selection-toolbar">
          <div className="selection-info">
            <span className="selection-count">{selectedRowKeys.length} Selected</span>
            <CloseOutlined 
              className="close-icon" 
              onClick={() => setSelectedRowKeys([])}
            />
          </div>
          <div className="selection-actions">
            <Button icon={<EditOutlined />} className="action-btn">
              Reassign
            </Button>
            <Button icon={<UnorderedListOutlined />} className="action-btn">
              Custom Fields
            </Button>
            <Button icon={<DeleteOutlined />} className="action-btn delete-btn">
              Delete
            </Button>
          </div>
        </div>
      )}

      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
      <AddClientModal open={addClientModalOpen} onClose={() => setAddClientModalOpen(false)} />

      <Modal
        open={fullscreenMode}
        onCancel={() => setFullscreenMode(false)}
        footer={null}
        width="95vw"
        style={{ top: 20 }}
        closeIcon={<CloseOutlined style={{ fontSize: '24px' }} />}
        className="fullscreen-table-modal"
      >
        <div className="fullscreen-table-content">
          {/* <h2 className="fullscreen-title">Clients Table</h2> */}
          <CommonTable
            columns={columns}
            dataSource={data}
            scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: () => ({
                className: 'custom-checkbox',
              }),
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Clients;
