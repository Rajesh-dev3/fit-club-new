import React from "react";
import { useParams } from "react-router-dom";
import { RightOutlined, PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import PageBreadcrumb from "../../components/breadcrumb";
import FitclubRegistration from "../../components/fitclubRegistration";
import { Home, AllUsersRoute } from "../../routes/routepath";
import "./styles.scss";

const ViewForm = () => {
  const { id } = useParams();

  const breadcrumbItems = [
    { title: 'Dashboard', link: Home },
    { title: 'All Users', link: AllUsersRoute },
    { title: `View Form - ${id}` }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Get only the FitclubRegistration form content
    const formElement = document.querySelector('.fitclub-registration-form');
    const userName = 'Jituli Punjabi';
    
    if (!formElement) {
      console.error('Form element not found');
      alert('Form not found. Please try again.');
      return;
    }

    try {
      // Get all link stylesheets (external CSS files)
      const linkStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => `<link rel="stylesheet" href="${link.href}">`)
        .join('\n');

      // Get all style elements (inline styles)
      const styleElements = Array.from(document.querySelectorAll('style'))
        .map(style => `<style>${style.innerHTML}</style>`)
        .join('\n');

      // Get all CSS custom properties from root
      const rootStyles = getComputedStyle(document.documentElement);
      let cssVariables = '';
      for (let i = 0; i < rootStyles.length; i++) {
        const property = rootStyles[i];
        if (property.startsWith('--')) {
          cssVariables += `${property}: ${rootStyles.getPropertyValue(property)};\n`;
        }
      }

      // Create a new window with complete styling
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups for this site to enable download functionality.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Membership Form - ${userName}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${linkStyles}
            ${styleElements}
            <style>
              :root {
                ${cssVariables}
              }
              
              body {
                margin: 0;
                padding: 20px;
                font-family: inherit;
                background: white;
              }
              
              .fitclub-registration-form {
                max-width: 550px !important;
                margin: auto !important;
                width: auto !important;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 10px; 
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                @page {
                  margin: 0.5in;
                  size: A4;
                }
              }
            </style>
          </head>
          <body>
            ${formElement.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for all resources to load
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
      <div className="view-form-page">
     
<div className="page-header">
  <h1>Jituli Punjabi</h1>
  <div className="header-actions">
    <Button type="text" icon={<PrinterOutlined />} className="action-btn" onClick={handlePrint}>
      Print
    </Button>
    <Button type="text" icon={<DownloadOutlined />} className="action-btn" onClick={handleDownload}>
      Download
    </Button>
  </div>
</div>
<ul className="breadcrumb-list">
   <li style={{color:"gray"}}>
     Dashboard
    </li>
    <li style={{color:"gray"}}>
<RightOutlined style={{fontSize:"8px"}}/> All User
    </li>
    <li>
<RightOutlined style={{fontSize:"8px"}} /> Jituli Punjabi
    </li>
</ul>
      <div className="form-container">
        <FitclubRegistration />
      </div>
    </div>
  );
};

export default ViewForm;