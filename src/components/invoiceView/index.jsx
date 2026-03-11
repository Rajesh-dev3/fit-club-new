import React from "react";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import "./styles.scss";

const InvoiceView = ({ invoiceData, showActions = true }) => {
  // Default data if not provided
  const defaultData = {
    invoiceNumber: "SL/25-26/0845",
    invoiceDate: "24-02-2026",
    modeOfPayment: "Cash",
    amountPaid: 8500,
    company: {
      name: "BELLATOR MEDIA PRIVATE LIMITED",
      address: "B-711, Sushant Lok Phase I, Sector 43,",
      city: "Gurugram, Haryana 122002,haryana",
      phone: "8871037103",
      gstNo: "06AAJCB0612R1ZJ",
      state: "06",
      pos: "Haryana"
    },
    customer: {
      name: "Bakhtiyor Muminov",
      address: "Forties Hospital, Delhi",
      phone: "9687382129"
    },
    items: [
      {
        sno: 1,
        description: "Monthly",
        sacCode: "999723",
        planPrice: 10000,
        startDate: "24-02-2026",
        expiryDate: "25-03-2026"
      }
    ],
    totalOrderValue: 10000,
    discount: 1500,
    subTotal: 8500,
    taxableValue: 8095.24,
    cgst: 202.38,
    sgst: 202.38,
    gst: "5%",
    totalAmount: 8500.00
  };

  // Transform API response to invoice format
  const transformedData = invoiceData ? {
    invoiceNumber: invoiceData.invoiceNumber || "N/A",
    invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB') : "N/A",
    modeOfPayment: invoiceData.paymentDetails?.[0]?.paymentMode || invoiceData.paymentType === "fullPayment" ? "Full Payment" : "Partial Payment",
    amountPaid: invoiceData.totalAmount || 0,
    company: {
      name: invoiceData.branchId?.companyName || "BELLATOR MEDIA PRIVATE LIMITED",
      address: invoiceData.branchId?.companyAddress || invoiceData.branchId?.address || "B-711, Sushant Lok Phase I, Sector 43,",
      city: `${invoiceData.branchId?.stateName || "Haryana"}, ${invoiceData.branchId?.placeOfSupply || "India"}`,
      phone: invoiceData.branchId?.phoneNumber || "8871037103",
      gstNo: invoiceData.branchId?.gstNumber || "06AAJCB0612R1ZJ",
      state: invoiceData.branchId?.stateName || "06",
      pos: invoiceData.branchId?.placeOfSupply || "Haryana"
    },
    customer: {
      name: invoiceData.userId?.name || invoiceData.customerName || "N/A",
      address: invoiceData.branchId?.name ? `${invoiceData.branchId.name}, ${invoiceData.branchId.address || ''}` : "N/A",
      phone: invoiceData.userId?.phoneNumber || invoiceData.customerNumber || "N/A"
    },
    items: [
      {
        sno: 1,
        description: invoiceData.planId?.name || "N/A",
        sacCode: invoiceData.planId?.hsn_sac || invoiceData.userMemberships?.[0]?.hsn_sac || "999723",
        planPrice: invoiceData.planPrice || 0,
        startDate: invoiceData.startDate ? new Date(invoiceData.startDate).toLocaleDateString('en-GB') : "N/A",
        expiryDate: invoiceData.expiryDate ? new Date(invoiceData.expiryDate).toLocaleDateString('en-GB') : "N/A"
      }
    ],
    totalOrderValue: invoiceData.planPrice || 0,
    discount: invoiceData.discountAmount || 0,
    subTotal: invoiceData.afterDiscount || 0,
    taxableValue: invoiceData.gstClaim && invoiceData.gstAmount > 0 
      ? (invoiceData.afterDiscount || 0) 
      : invoiceData.afterDiscount 
        ? (invoiceData.afterDiscount / (1 + (invoiceData.gstPercentage || 0) / 100)).toFixed(2)
        : 0,
    cgst: invoiceData.gstAmount ? (invoiceData.gstAmount / 2).toFixed(2) : 0,
    sgst: invoiceData.gstAmount ? (invoiceData.gstAmount / 2).toFixed(2) : 0,
    gst: `${invoiceData.gstPercentage || 5}%`,
    totalAmount: invoiceData.totalAmount || 0
  } : null;

  const data = transformedData || defaultData;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download logic
    console.log("Download invoice");
  };

  return (
    <div className="invoice-view-wrapper">
      {/* Invoice Content */}
      <div className="invoice-view-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-header-left">
            <div className="company-logo">
              <h1>FitClub</h1>
            </div>
          </div>
          <div className="invoice-header-right">
            <h2 className="invoice-number">{data.invoiceNumber}</h2>
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="invoice-info-section">
          <div className="invoice-from">
            <h3>Invoice From</h3>
            <p className="company-name">{data.company.name}</p>
            <p>{data.company.address}</p>
            <p>{data.company.city}</p>
            <p>Phone: {data.company.phone}</p>
            <p>GST No. - {data.company.gstNo}</p>
            <p><strong>State</strong> -{data.company.state}</p>
            <p>POS - {data.company.pos}</p>
          </div>

          <div className="invoice-to">
            <h3>Invoice To</h3>
            <p className="customer-name">{data.customer.name}</p>
            <p>{data.customer.address}</p>
            <p>Phone: {data.customer.phone}</p>
          </div>
        </div>

        {/* Invoice Date and Payment Info */}
        <div className="invoice-payment-info">
          <div className="payment-row">
            <div className="payment-item">
              <span className="payment-label">Invoice Date</span>
              <span className="payment-label">Mode Of Payment :</span>
              <span className="payment-label">Cash</span>
            </div>
            <div className="payment-item">
              <span className="payment-value">{data.invoiceDate}</span>
              <span className="payment-value"></span>
              <span className="payment-value">₹ {data.amountPaid}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>SAC/HSN Code</th>
              <th>Plan Price</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>{item.sno}</td>
                  <td>{item.description}</td>
                  <td>{item.sacCode}</td>
                  <td>₹ {item.planPrice}</td>
                </tr>
                <tr className="date-row">
                  <td colSpan="4">
                    <div className="date-info">
                      <span>Start date : {item.startDate}</span>
                      <span>Expiry date : {item.expiryDate}</span>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="invoice-totals-section">
          <div className="totals-left"></div>
          <div className="totals-right">
            <div className="total-row">
              <span className="total-label">Total Order Value</span>
              <span className="total-value">₹ {data.totalOrderValue}</span>
            </div>

            <div className="total-row discount-row">
              <span className="total-label">Discount</span>
              <span className="total-value discount">- ₹ {data.discount}</span>
            </div>

            <div className="total-row">
              <span className="total-label">SubTotal</span>
              <span className="total-value">₹{data.subTotal}</span>
            </div>

            <div className="total-row">
              <span className="total-label">Taxable Value</span>
              <span className="total-value">₹{data.taxableValue}</span>
            </div>

            <div className="total-row">
              <span className="total-label">CGST</span>
              <span className="total-value">₹{data.cgst}</span>
            </div>

            <div className="total-row">
              <span className="total-label">SGST</span>
              <span className="total-value">₹{data.sgst}</span>
            </div>

            <div className="total-row">
              <span className="total-label">GST</span>
              <span className="total-value">{data.gst}</span>
            </div>

            <div className="total-row final-total">
              <span className="total-label">Total Amount</span>
              <span className="total-value">₹{data.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="invoice-footer">
          <p className="registered-office">
            <strong>Registered Office:</strong> SECOND FLOOR, THIRD FLOOR AND TERRACE OF THE PLOT NO. B-711, SUSHANT LOK PHASE-1, Gurugram, Haryana, 122002
          </p>
          <p className="jurisdiction">SUBJECT TO HARYANA JURISDICTION</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
