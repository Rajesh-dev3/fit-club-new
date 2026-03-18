import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetAllCouponQuery } from '../../../services/coupons';
import { useGetEmployeeByCustomerQuery } from '../../../services/employee';
import { useGetAddOnPackagesQuery } from '../../../services/package';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../form/ImagePicker';
import './styles.scss';

const { Option } = Select;

const typeOptions = [
  { label: "Personal Training", value: "Personal Training" },
  { label: "Pilates", value: "Pilates" },
  { label: "Therapy", value: "Therapy" },
  { label: "EMS", value: "EMS" },
  { label: "Paid Locker", value: "Paid Locker" },
  { label: "MMA", value: "MMA" },
];

const BuyAddOnService = () => {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gstClaim, setGstClaim] = useState(false);
  const gstPercentage = 5; // Fixed GST 5%
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentModes, setPaymentModes] = useState([{ id: 1, mode: '', amount: '' }]);
  const [paymentMode, setPaymentMode] = useState('');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [planPrice, setPlanPrice] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // API hooks
  const { data: couponsData, isLoading: couponsLoading } = useGetAllCouponQuery({});
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeeByCustomerQuery(userData?._id, {
    skip: !userData?._id
  });
  const { data: addOnPackagesData, isLoading: packagesLoading } = useGetAddOnPackagesQuery({
    type: 'addon',
  });
  const [addInvoice, { isLoading: isAddingInvoice }] = useAddInvoiceMutation();

  // Extract data arrays from API responses
  const coupons = couponsData?.data || [];
  const addOnPackages = addOnPackagesData?.data || [];

  // Calculate totals with discount and GST
  const calculateTotals = (basePrice, coupon, isGstClaim, gstPercent) => {
    let discountAmt = 0;
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discountAmt = (basePrice * coupon.value) / 100;
      } else {
        discountAmt = coupon.value;
      }
    }
    
    const priceAfterDiscount = Math.max(0, basePrice - discountAmt);
    const gstAmount = isGstClaim ? (priceAfterDiscount * gstPercent) / 100 : 0;
    const totalAmount = priceAfterDiscount + gstAmount;
    
    setDiscountAmount(discountAmt);
    form.setFieldsValue({
      afterDiscount: priceAfterDiscount,
      totalOrderValue: totalAmount,
    });
  };

  // Handle plan price change
  const handlePlanPriceChange = (value) => {
    setPlanPrice(value || 0);
    calculateTotals(value || 0, selectedCoupon, gstClaim, gstPercentage);
  };

  // Handle add-on plan selection
  const handlePlanSelect = (planId) => {
    const plan = addOnPackages.find(p => p._id === planId);
    if (plan) {
      setSelectedPlan(plan);
      form.setFieldsValue({
        planPrice: plan.pricing,
      });
      setPlanPrice(plan.pricing);
      calculateTotals(plan.pricing, selectedCoupon, gstClaim, gstPercentage);
    }
  };

  // Handle payment mode change
  const handlePaymentModeChange = (mode, paymentId) => {
    setPaymentMode(mode);
    
    setPaymentModes(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, mode } 
          : payment
      )
    );
    
    if (mode === 'cash') {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};
        if (loggedInUser.name) {
          form.setFieldsValue({
            [`cashEmployee_${paymentId}`]: loggedInUser.name
          });
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }
  };

  // Calculate total paid amount and remaining amount
  const calculatePaymentAmounts = () => {
    const formValues = form.getFieldsValue();
    let total = 0;
    
    paymentModes.forEach(payment => {
      const amount = formValues[`paymentAmount_${payment.id}`] || 0;
      total += Number(amount);
    });
    
    setTotalPaidAmount(total);
    
    const finalAmount = planPrice - discountAmount + (gstClaim ? ((planPrice - discountAmount) * gstPercentage) / 100 : 0);
    setRemainingAmount(Math.max(0, finalAmount - total));
  };

  // Handle payment amount change
  const handlePaymentAmountChange = (amount, paymentId) => {
    setPaymentModes(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, amount } 
          : payment
      )
    );
    
    setTimeout(() => {
      calculatePaymentAmounts();
    }, 100);
  };

  // Add new payment mode
  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id)) + 1;
    setPaymentModes(prev => [...prev, { id: newId, mode: '', amount: '' }]);
  };

  // Remove payment mode
  const removePaymentMode = (paymentId) => {
    if (paymentModes.length > 1) {
      setPaymentModes(prev => prev.filter(payment => payment.id !== paymentId));
      setTimeout(() => {
        calculatePaymentAmounts();
      }, 100);
    }
  };

  // Recalculate amounts when planPrice, discount, or GST changes
  useEffect(() => {
    calculatePaymentAmounts();
  }, [planPrice, discountAmount, gstClaim, paymentModes.length]);

  // Pre-populate service type from URL parameter
  useEffect(() => {
    const serviceType = searchParams.get('type');
    if (serviceType) {
      const serviceLabel = typeOptions.find(opt => opt.value === serviceType)?.label;
      if (serviceLabel) {
        form.setFieldsValue({
          addOnServiceType: serviceLabel,
        });
      }
    }
  }, [searchParams, form]);

  // Handle coupon selection
  const handleCouponChange = (couponId) => {
    const coupon = coupons.find(c => c._id === couponId);
    setSelectedCoupon(coupon);
    if (planPrice) {
      calculateTotals(planPrice, coupon, gstClaim, gstPercentage);
    }
  };

  // Handle GST claim change
  const handleGstClaimChange = (value) => {
    const isGstClaim = value === 'yes';
    setGstClaim(isGstClaim);
    if (planPrice) {
      calculateTotals(planPrice, selectedCoupon, isGstClaim, gstPercentage);
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const startDate = values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

      // Calculate amounts
      const discountAmt = discountAmount;
      const afterDiscountAmount = planPrice - discountAmt;
      const gstAmount = gstClaim ? (afterDiscountAmount * gstPercentage) / 100 : 0;
      const totalAmount = afterDiscountAmount + gstAmount;

      // Get addonType from URL or selected plan
      const urlAddonType = searchParams.get('type');
      let finalAddonType = selectedPlan?.addonType;
      
      // If URL has type parameter, convert it to snake_case format
      if (urlAddonType) {
        finalAddonType = urlAddonType.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      }

      // Create payment terms array from multiple payment modes
      const paymentTerms = [];
      
      paymentModes.forEach(payment => {
        const mode = values[`paymentMode_${payment.id}`];
        const amount = values[`paymentAmount_${payment.id}`];
        
        if (!mode || !amount) return;

        if (mode === 'cash') {
          paymentTerms.push({
            modeOfPayment: 'cash',
            amount: amount,
            receivedBy: values[`cashEmployee_${payment.id}`] || '',
            receipt: []
          });
        } else if (mode === 'upi') {
          paymentTerms.push({
            modeOfPayment: 'upi',
            amount: amount,
            receipt: values[`upiScreenshot_${payment.id}`] ? [values[`upiScreenshot_${payment.id}`]] : [],
            referenceId: values[`upiReferenceId_${payment.id}`] || ''
          });
        } else if (mode === 'card') {
          paymentTerms.push({
            modeOfPayment: 'card',
            amount: amount,
            receipt: values[`cardScreenshot_${payment.id}`] ? [values[`cardScreenshot_${payment.id}`]] : []
          });
        } else if (mode === 'cheque') {
          paymentTerms.push({
            modeOfPayment: 'cheque',
            amount: amount,
            chequeNumber: values[`chequeNumber_${payment.id}`] || '',
            bankName: values[`bankName_${payment.id}`] || '',
            receipt: []
          });
        } else if (mode === 'bank_transfer') {
          paymentTerms.push({
            modeOfPayment: 'netbanking',
            amount: amount,
            bankHolderName: values[`holderName_${payment.id}`] || '',
            accountNumber: values[`accountNumber_${payment.id}`] || '',
            ifscCode: values[`ifscCode_${payment.id}`] || '',
            receipt: values[`transferScreenshot_${payment.id}`] ? [values[`transferScreenshot_${payment.id}`]] : []
          });
        }
      });

      // Create the payload for add invoice API
      const payload = {
        userId: userData._id,
        planId: selectedPlan?._id,
        type: 'addon',
        addonType: finalAddonType,
        pricing: planPrice,
        couponId: selectedCoupon?._id || null,
        discountAmount: discountAmt,
        afterDiscount: afterDiscountAmount,
        gstClaim: gstClaim,
        gstPercentage: gstPercentage,
        gstAmount: gstAmount,
        gstNumber: values.gstNumber || null,
        registeredCompanyName: values.registeredCompanyName || null,
        totalInvoiceAmount: totalAmount,
        billingAddress: values.billingAddress || userData?.member?.address,
        paymentDate: startDate,
        paymentTerm: paymentTerms,
        employeeId: values.salesPerson
      };

      // console.log('Add-On Service Invoice Payload:', payload);
      
      await addInvoice(payload).unwrap();
      // message.success('Add-On Service invoice created successfully!');
      
      form.resetFields();
      setSelectedCoupon(null);
      setSelectedPlan(null);
      setPaymentModes([{ id: 1, mode: '', amount: '' }]);
      setGstClaim(false);
      setDiscountAmount(0);
      setPlanPrice(0);
      setTotalPaidAmount(0);
      setRemainingAmount(0);
      
      navigate(-1);
      
    } catch (error) {
      // message.error(error?.data?.message || 'Failed to create add-on service invoice');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-addon-service-container">
      <div className="form-header">
        <h2>Purchase Add-On Service</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="custom-form"
      >
        <div className="row row-three-columns">
          <Form.Item
            name="invoiceDate"
            label="Invoice Date"
            initialValue={dayjs()}
          >
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              disabled
              placeholder="Invoice date"
              format="DD-MM-YYYY"
              value={dayjs()}
            />
          </Form.Item>

          <Form.Item
            name="paymentDate"
            label="Payment Date"
            rules={[{ required: true, message: 'Please select payment date' }]}
          >
            <DatePicker
              style={{ width: '100%', height: '46px' }}
              placeholder="Select payment date"
              format="DD-MM-YYYY"
            />
          </Form.Item>

          <Form.Item
            name="mobileNo"
            label="Mobile No."
            initialValue={userData?.phoneNumber}
          >
            <Input
              style={{ width: '100%', height: '46px' }}
              placeholder="Mobile number"
              disabled
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="salesPerson"
            label="Sales Person"
            rules={[{ required: true, message: 'Please select a sales person' }]}
          >
            <Select
              placeholder="Choose sales person"
              loading={employeesLoading}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employeesData?.data?.length > 0 ? (
                employeesData?.data?.map(employee => (
                  <Option key={employee._id} value={employee._id}>
                    {employee?.name || 'Unknown'} - {employee.employeeId || 'No ID'}
                  </Option>
                ))
              ) : (
                <Option disabled value="">No sales persons available</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="addOnPlan"
            label="Add-On Plan"
            rules={[{ required: true, message: 'Please select an add-on plan' }]}
          >
            <Select
              placeholder="Choose add-on plan"
              loading={packagesLoading}
              showSearch
              onChange={handlePlanSelect}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {addOnPackages.length > 0 ? (
                addOnPackages.map(plan => (
                  <Option key={plan._id} value={plan._id}>
                    {plan.name} - {plan.addonType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ₹{plan.pricing}
                  </Option>
                ))
              ) : (
                <Option disabled value="">No add-on plans available</Option>
              )}
            </Select>
          </Form.Item>
        </div>

        {/* <div className="row">
          <Form.Item
                ))
              ) : (
                <Option disabled value="">No sales persons available</Option>
              )}
            </Select>
          </Form.Item>
        </div>

        {/* <div className="row">
          <Form.Item
            name="customerName"
            label="Customer Name"
            initialValue={userData?.name}
          >
            <Input
              style={{ width: '100%', height: '46px' }}
              placeholder="Customer name"
              disabled
            />
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            initialValue={userData?.member?.age}
          >
            <Input
              style={{ width: '100%', height: '46px' }}
              placeholder="Age"
              disabled
            />
          </Form.Item>
        </div> */}

        {/* <div className="row">
          <Form.Item
            name="gender"
            label="Gender"
            initialValue={userData?.member?.gender}
          >
            <Select
              placeholder="Gender"
              disabled
              style={{ height: '46px' }}
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="stateName"
            label="State Name"
            initialValue={userData?.member?.state}
          >
            <Select
              placeholder="State"
              disabled
              style={{ height: '46px' }}
            >
              <Option value={userData?.member?.state}>{userData?.member?.state}</Option>
            </Select>
          </Form.Item>
        </div> */}

        <div className="row">
          <Form.Item
            name="billingAddress"
            label="Billing Address"
            initialValue={userData?.member?.address}
          >
            <Input.TextArea
              style={{ width: '100%' }}
              placeholder="Billing address"
              rows={4}
              disabled
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="paymentType"
            label="Payment Type"
            rules={[{ required: true, message: 'Please select payment type' }]}
          >
            <Select placeholder="Select payment type">
              <Option value="fullPayment">Full Payment</Option>
              {/* <Option value="partial">Partial Payment</Option> */}
            </Select>
          </Form.Item>

          {/* <Form.Item
            name="gstPercentage"
            label="GST Percentage"
            initialValue="5"
          >
            <Select placeholder="Select GST percentage" disabled>
              <Option value="5">5%</Option>
            </Select>
          </Form.Item> */}

          <Form.Item
            name="planPrice"
            label="Plan Price"
            rules={[{ required: true, message: 'Please enter plan price' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              placeholder="Enter plan price"
              onChange={handlePlanPriceChange}
              min={0}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="gstClaim"
            label="GST Claim"
            rules={[{ required: true, message: 'Please select GST claim option' }]}
          >
            <Select 
              placeholder="Select GST claim"
              onChange={handleGstClaimChange}
            >
              <Option value="yes">Yes</Option>
              <Option value="no">No</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="totalOrderValue"
            label="Total Order Value"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              disabled
              placeholder="Total amount"
            />
          </Form.Item>
        </div>

        {gstClaim && (
          <div className="row">
            <Form.Item
              name="gstNumber"
              label="GST Number"
              rules={[
                { required: true, message: 'Please enter GST number' },
                { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter valid GST number' }
              ]}
            >
              <Input placeholder="Enter GST number" style={{ height: '46px' }} />
            </Form.Item>

            <Form.Item
              name="registeredCompanyName"
              label="Registered Company Name"
              rules={[
                { required: true, message: 'Please enter registered company name' },
                { min: 2, message: 'Company name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Enter registered company name" style={{ height: '46px' }} />
            </Form.Item>
          </div>
        )}

        <div className="row">
          <Form.Item
            name="couponSelect"
            label="Coupon Select"
          >
            <Select
              placeholder="Choose coupon (optional)"
              loading={couponsLoading}
              onChange={handleCouponChange}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const searchText = `${option.value} ${option.children}`.toLowerCase();
                return searchText.includes(input.toLowerCase());
              }}
            >
              {coupons.map(coupon => (
                <Option key={coupon._id} value={coupon._id}>
                  {coupon.code} - {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="afterDiscount"
            label="After Discount"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              disabled
              placeholder="Price after coupon discount"
            />
          </Form.Item>
        </div>

        {/* Multiple Payment Modes Section */}
        <div className="payment-modes-section">
          <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
          {paymentModes.map((payment, index) => (
            <div key={payment.id} className="payment-group">
              <div className="row payment-row">
                <Form.Item
                  name={`paymentMode_${payment.id}`}
                  label={index === 0 ? "Mode of Payment" : "Additional Payment Mode"}
                  rules={[{ required: true, message: 'Please select payment mode' }]}
                >
                  <Select 
                    placeholder="Select payment mode"
                    onChange={(value) => handlePaymentModeChange(value, payment.id)}
                  >
                    <Option value="cash">Cash</Option>
                    <Option value="card">Card</Option>
                    <Option value="upi">UPI</Option>
                    <Option value="bank_transfer">Bank Transfer</Option>
                    <Option value="cheque">Cheque</Option>
                    <Option value="credit_note">Credit Note</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label={index === 0 ? "Amount" : "Amount"}
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    {
                      validator: (_, value) => {
                        if (planPrice && value) {
                          const finalAmount = planPrice - discountAmount + (gstClaim ? ((planPrice - discountAmount) * gstPercentage) / 100 : 0);
                          if (totalPaidAmount > finalAmount) {
                            return Promise.reject(new Error(`Total payment (₹${totalPaidAmount}) exceeds package amount (₹${finalAmount.toFixed(2)})`));
                          }
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    placeholder="Enter amount"
                    min={0}
                    onChange={(value) => handlePaymentAmountChange(value, payment.id)}
                  />
                </Form.Item>

                <div className="payment-actions">
                  {index === paymentModes.length - 1 && (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={addPaymentMode}
                      style={{ marginRight: '8px' }}
                    >
                      Add
                    </Button>
                  )}
                  {paymentModes.length > 1 && (
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removePaymentMode(payment.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Conditional fields for each payment mode */}
              {payment.mode === 'cash' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`cashEmployee_${payment.id}`}
                    label="Employee (Cash Handler)"
                    rules={[{ required: true, message: 'Please enter employee name for cash payment' }]}
                    initialValue={() => {
                      try {
                        const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};
                        return loggedInUser.name || '';
                      } catch (error) {
                        return '';
                      }
                    }}
                  >
                    <Input
                      placeholder="Employee handling cash payment"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'upi' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`upiScreenshot_${payment.id}`}
                    label="UPI Payment Screenshot"
                    rules={[{ required: true, message: 'Please upload UPI payment screenshot' }]}
                  >
                    <ImagePicker
                      form={form}
                      name={`upiScreenshot_${payment.id}`}
                    />
                  </Form.Item>

                  <Form.Item
                    name={`upiReferenceId_${payment.id}`}
                    label="UPI Reference ID"
                    rules={[{ required: false, message: 'Please enter UPI reference ID' }]}
                  >
                    <Input
                      placeholder="Enter UPI transaction reference ID (optional)"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'cheque' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`chequeNumber_${payment.id}`}
                    label="Cheque Number"
                    rules={[{ required: true, message: 'Please enter cheque number' }]}
                  >
                    <Input
                      placeholder="Enter cheque number"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name={`bankName_${payment.id}`}
                    label="Bank Name"
                    rules={[{ required: true, message: 'Please enter bank name' }]}
                  >
                    <Input
                      placeholder="Enter bank name"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'card' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`cardScreenshot_${payment.id}`}
                    label="Card Payment Screenshot"
                    rules={[{ required: true, message: 'Please upload card payment screenshot' }]}
                  >
                    <ImagePicker
                      form={form}
                      name={`cardScreenshot_${payment.id}`}
                    />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'bank_transfer' && (
                <>
                  <div className="row payment-details">
                    <Form.Item
                      name={`holderName_${payment.id}`}
                      label="Holder Name"
                      rules={[{ required: true, message: 'Please enter holder name' }]}
                    >
                      <Input
                        placeholder="Enter account holder name"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name={`accountNumber_${payment.id}`}
                      label="Account Number"
                      rules={[{ required: true, message: 'Please enter account number' }]}
                    >
                      <Input
                        placeholder="Enter account number"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>

                  <div className="row payment-details">
                    <Form.Item
                      name={`ifscCode_${payment.id}`}
                      label="IFSC Code"
                      rules={[{ required: true, message: 'Please enter IFSC code' }]}
                    >
                      <Input
                        placeholder="Enter IFSC code"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name={`transferScreenshot_${payment.id}`}
                      label="Transfer Screenshot"
                      rules={[{ required: true, message: 'Please upload transfer screenshot' }]}
                    >
                      <ImagePicker
                        form={form}
                        name={`transferScreenshot_${payment.id}`}
                      />
                    </Form.Item>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Remaining Balance Display */}
          {planPrice > 0 && (
            <div className="remaining-balance">
              <span className={`balance-text ${remainingAmount > 0 ? 'remaining' : 'complete'}`}>
                <strong>Remaining Balance: ₹{remainingAmount.toFixed(2)}</strong>
              </span>
            </div>
          )}
        </div>

        {planPrice > 0 && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row">
              <span><strong>Plan Price:</strong></span>
              <span>₹{planPrice}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row">
                <span><strong>Coupon:</strong> {selectedCoupon.code}</span>
                <span><strong>Discount:</strong> -₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span><strong>Price After Discount:</strong></span>
              <span>₹{(planPrice - discountAmount).toFixed(2)}</span>
            </div>
            <>
              <div className="summary-row">
                <span><strong>SGST (2.5%):</strong></span>
                <span>₹{(((planPrice - discountAmount) * 2.5) / 100).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span><strong>CGST (2.5%):</strong></span>
                <span>₹{(((planPrice - discountAmount) * 2.5) / 100).toFixed(2)}</span>
              </div>
            </>
            <div className="summary-row">
              <span><strong>Final Total:</strong></span>
              <span>₹{(
                (planPrice - discountAmount) + 
                (gstClaim ? ((planPrice - discountAmount) * gstPercentage) / 100 : 0)
              ).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span><strong>Total Paid:</strong></span>
              <span>₹{totalPaidAmount.toFixed(2)}</span>
            </div>
            <div className={`summary-row ${remainingAmount > 0 ? 'remaining-amount' : 'complete-amount'}`}>
              <span><strong>Remaining Balance:</strong></span>
              <span>₹{remainingAmount.toFixed(2)}</span>
            </div>
          </Card>
        )}

        <div className="footer-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || isAddingInvoice}
            className="save-btn"
            disabled={!planPrice || planPrice === 0 || !selectedPlan}
          >
            Purchase Add-On Service
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BuyAddOnService;
