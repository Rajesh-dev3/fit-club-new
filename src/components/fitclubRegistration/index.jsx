import React from "react";
import { Form, Input, DatePicker, Checkbox, Row, Col, Divider } from "antd";
import {logo} from "../../assets";
import "./styles.scss";
const Line = ({ width }) => <span className="line" style={{width:width}}/>;
const FitclubRegistration = () => {
 return (
    <div className="fitclub-registration-form">
        <div className="header">
        <div>
          <h1 className="logo">
            <img src={logo} alt="FitClub Logo" />
          </h1>
        </div>
<div className="header-content">
          <p>
            Address - B-711, Sushant Lok Phase I, Sector 43, Gurugram, Haryana 122002<br />
            Mobile No. 887101 7101 | 887103 7103 <br />
            Email - info@fitclub.co.in<br />
             Website - www.fitclub.in
          </p>

        <div className="header-right">
          <div className="box">Sr. No.</div>
          <div className="photo-box">Photo</div>
        </div>
</div>
      </div>
<div className="form-field">
    <div className="name-label">
        <div className="label">

Member's Name
        </div>
        <div className="value">
Jituli Punjabi

        </div>
    </div>
    <div className="name-label">
        <div className="label">

Member's Address
        </div>
        <div className="value">
Sector 42 Gurugram

        </div>
    </div>
    <div className="age-gender-row">
        <div className="age">
            <div className="label">Age</div>
            <div className="value">29</div>
        </div>
        <div className="birth">
            <div className="label">Date of Birth</div>
            <div className="value">15-08-1995</div>
        </div>
        <div className="gender">
            <div className="label">Gender</div>
            <div className="value">Female</div>
        </div>
    </div>
     <div className="name-label">
        <div className="label">

Medical History
        </div>
        <div className="value">
No

        </div>
    </div>
    <div className="marital-status-row">

        <div className="marital-status">
            <div className="label">Marital Status</div>
            <div className="value">married</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label">Marriage Anniversary</div>
            <div className="value">
2018-03-08</div>
        </div>
    </div>
    <div className="marital-status-row">

        <div className="marital-status">
            <div className="label">Mobile No.</div>
            <div className="value">7769079239</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label alter-no">Alternate No.

</div>
            <div className="value alter-no-value">
9769333704</div>
        </div>
    </div>
      <div className="name-label">
        <div className="label compnay-name-label">

Place of Work/Company Name
        </div>
        <div className="value">
Sector 42 Gurugram

        </div>
    </div>
    <div className="name-label">
        <div className="label">
Designation
        </div>
        <div className="value">
Jituli Punjabi

        </div>
    </div>
    <div className="name-label">
        <div className="label">
Email ID
        </div>
        <div className="value">
Jituli Punjabi

        </div>
    </div>
      <div className="name-label">
        <div className="label compnay-name-label">

In Case of Emergency Call: Name
        </div>
        <div className="value">
Sector 42 Gurugram

        </div>
    </div>
     <div className="name-label">
        <div className="label">

Mobile No.
        </div>
        <div className="value">
            9769333704

        </div>
    </div>
      <div className="name-label">
        <div className="label compnay-name-label">

How did you hear about Fitclub
        </div>
        <div className="value">
Sector 42 Gurugram

        </div>
    </div>
      <div className="marital-status-row">

        <div className="marital-status">
            <div className="label package-label">Membership Package</div>
            <div className="value">
13 Months</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label package-amount-label">Amount</div>
            <div className="value package-amount-value">
₹ 55000
</div>
        </div>
    </div>
      <div className="marital-status-row">

        <div className="marital-status">
            <div className="label">Start Date</div>
            <div className="value">15/7/2025</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label alter-no">Expiry Date

</div>
            <div className="value alter-no-value">
14/8/2026</div>
        </div>
    </div>
   
</div>
<div className="footer">
    <h3>Waiver</h3>
    <p>I Accept responsibility for my use of any and all apparatus, appliances, facility, Privilege or service whatsoever, owned and operated at this club at my own rise, and shall hold this club, its shareholders, directors, officers employers representatives and agent harmless from any and all loss, claim, Injury, damage, or liability sustained or incurred by me resulting therefrom.</p>
  <div className="marital-status-row" style={{marginTop:"14px"}}>

        <div className="marital-status">
            <div className="label authorize-label">Authorized By</div>
            <div className="value authorize-value">
</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label member-s-label">Member Signature</div>
            <div className="value member-s-value">

</div>
        </div>
    </div>
  <div className="marital-status-row" style={{marginTop:"14px"}}>

        <div className="marital-status">
            <div className="label fitness-label">Fitness Consultant</div>
            <div className="value fitness-value">
</div>
        </div>
        <div className="marriage-anniversary">
            <div className="label fitness-s-label">Date of Contact</div>
            <div className="value fitness-s-value">

</div>
        </div>
    </div>
</div>
    
    </div>
  );
};

export default FitclubRegistration;