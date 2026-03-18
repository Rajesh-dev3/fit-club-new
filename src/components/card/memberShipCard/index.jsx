import React, { useState } from "react";
import { Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./styles.scss";
import { logo, whiteLogo } from "../../../assets";
import { useTheme } from "../../../context/ThemeContext";
import dayjs from "dayjs";

const MembershipCard = ({ membershipData, isLoading }) => {
  const {theme} = useTheme();
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (membershipId) => {
    setExpandedCards(prev => ({
      ...prev,
      [membershipId]: !prev[membershipId]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="membership-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Get all memberships
  const memberships = membershipData?.data || [];
  
  if (memberships.length === 0) {
    return (
      <div className="membership-card">
        <div className="card-body">
          <p style={{ textAlign: 'center', padding: '20px' }}>No membership found</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
  };

  return (
    <div className="membership-cards-container">
      {memberships.map((membership) => {
        const isActive = membership.status === 'active';
        const isExpanded = expandedCards[membership._id];
        const borderColor = isActive ? '1px solid #52c41a' : '1px solid rgb(141 139 139)';
        
        return (
          <div 
            key={membership._id} 
            className={`membership-card ${isExpanded ? 'expanded' : 'collapsed'}`}
            style={{ border: borderColor }}
          >
            {/* Top Ribbon */}
            {isActive && (
              <div className="ribbon">
                <span>★</span>
              </div>
            )}

            {/* Header - Always Visible */}
            <div className="card-header-collapsed">
              <div className="header-left">
                <img
                  src={theme === "light" ? logo : whiteLogo}
                  alt="Fitclub"
                  className="logo"
                />
                <p className="branch-name">Fitclub {membership.branchId?.name || 'N/A'}</p>
              </div>
              <div className="header-right">
                <div>
                  {/* Show upgrade info if any invoice has upgrade data, otherwise show plan name */}
                  {membership.invoices?.some(inv => inv.upgradedFromPlan && inv.upgradedToPlan) ? (
                    <h2 className="plan-title">
                      {membership.invoices.find(inv => inv.upgradedFromPlan && inv.upgradedToPlan)?.upgradedFromPlan.name} 
                      <span style={{ position: 'relative', margin: '0 8px', display: 'inline-block', width: '20px', textAlign: 'center' }}>
                        {/* <span style={{ 
                          position: 'absolute', 
                          top: '-12px', 
                          left: '50%', 
                          transform: 'translateX(-50%)', 
                          fontSize: '10px', 
                          whiteSpace: 'nowrap',
                          color: 'var(--muted, #666)'
                        }}>upgrade</span> */}
                        <span style={{ fontSize: '18px', fontWeight: '300' }}>→</span>
                      </span> 
                      {membership.invoices.find(inv => inv.upgradedFromPlan && inv.upgradedToPlan)?.upgradedToPlan.name}
                    </h2>
                  ) : (
                    <h2 className="plan-title">{membership.planId?.name || 'N/A'}</h2>
                  )}
                  <p className="plan-type">{membership.type || 'membership'}</p>
                </div>
                <button
                  className="view-btn"
                  onClick={() => toggleCard(membership._id)}
                >
                  View <DownOutlined style={{ 
                    fontSize: '12px', 
                    marginLeft: '4px',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </button>
              </div>
            </div>

            {/* Body - Collapsible */}
            {isExpanded && (
              <div className="card-body">
                <div className="info">
                  {/* Invoices Section */}
                  {membership.invoices && membership.invoices.length > 0 && (
                    <div className="invoices-section">
                      {membership.invoices.map((invoice) => (
                        <p key={invoice._id}>
                          <strong>Invoice ({invoice.paymentType?.replace(/_/g, ' ') || 'N/A'}):</strong> <span>{invoice.invoiceNumber}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  
                  <p><strong>Plan Amount:</strong> <span>₹{membership.planId?.pricing || 0}</span></p>
                  <p><strong>Duration:</strong> <span>{membership.planId?.numberOfDays || 0} days</span></p>
                  <p><strong>Freeze Slots:</strong> <span>{membership.freezableSlot || 0}</span></p>
                  <p><strong>Freeze Days:</strong> <span>{membership.freezableDays || 0}</span></p>
                  <p><strong>Start:</strong> <span>{formatDate(membership.startDate)}</span></p>
                  <p><strong>Expiry:</strong> <span>{formatDate(membership.expiryDate)}</span></p>
                  <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: isActive ? '#52c41a' : '#999' }}>{membership.status}</span></p>
                  {membership.upgradeLabel && (
                    <p><strong>Label:</strong> <span style={{ textTransform: 'capitalize' }}>{membership.upgradeLabel.replace(/_/g, ' ')}</span></p>
                  )}
                </div>

                <div className="freeze">
                  <p>Freeze Slots</p>
                  <span className="arrow">⌄</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MembershipCard;
