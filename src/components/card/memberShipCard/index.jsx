import React from "react";
import "./styles.scss";
import { logo, whiteLogo } from "../../../assets";
import { useTheme } from "../../../context/ThemeContext";

const MembershipCard = () => {
  const {theme} = useTheme();
  return (
    <div className="membership-card">
      {/* Top Ribbon */}
      <div className="ribbon">
        <span>★</span>
      </div>

      {/* Header */}
      <div className="card-header">
        <img
            src={theme === "light" ? logo : whiteLogo}
          alt="Fitclub"
          className="logo"
        />
        <p className="branch-name">Fitclub Sushant Lok</p>
      </div>

      {/* Body */}
      <div className="card-body">
        <h2 className="plan-title">Monthly</h2>

        <div className="info">
          <p><strong>Package Price:</strong> ₹10000</p>
          <p><strong>Days:</strong> 30</p>
          <p><strong>Slot:</strong> 0 Slots Available</p>
          <p><strong>Days:</strong> 0 Day's Available</p>
          <p><strong>Salesperson:</strong> Sudhanshu Upadhyay</p>
          <p><strong>Start Date:</strong> 3/1/2026</p>
          <p><strong>Expiry Date:</strong> 1/2/2026</p>
        </div>

        <div className="freeze">
          <p>Freezee Slots</p>
          <span className="arrow">⌄</span>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
