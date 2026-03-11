import React from 'react';
import InvoiceView from '../../components/invoiceView';
import MainLayout from '../../common/mainLayout';
import PageBreadcrumb from '../../components/breadcrumb';
import { HomeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Home, AllInvoiceRoute } from '../../routes/routepath';
import { useParams } from 'react-router-dom';
import { Button, Spin } from 'antd';
import { useGetInvoiceByIdQuery } from '../../services/invoice';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  
  // Fetch invoice data using the id
  const { data: invoiceResponse, isLoading, error } = useGetInvoiceByIdQuery(id);
  const invoiceData = invoiceResponse?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download logic
    console.log("Download invoice");
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px 24px', color: 'var(--red)' }}>
        Error loading invoice: {error?.data?.message || 'Something went wrong'}
      </div>
    );
  }
  
  return (
    <>
      <div style={{ padding: '20px 24px 0' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          marginBottom: '16px',
          color: 'var(--sider-text)'
        }}>
          {invoiceData?.invoiceNumber || 'Invoice'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PageBreadcrumb
            items={[
              { to: Home, icon: <HomeOutlined /> },
              { to: AllInvoiceRoute, label: 'Invoice' },
              { label: invoiceData?.invoiceNumber || 'Invoice Detail' },
            ]}
          />
          <div className="invoice-actions no-print" style={{ display: 'flex', gap: '12px' }}>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              type="default"
            >
              Print
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              type="default"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
      <InvoiceView invoiceData={invoiceData} showActions={false} />
    </>
  );
};

export default InvoiceDetailPage;
