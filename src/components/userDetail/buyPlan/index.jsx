import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetPlansQuery } from '../../../services/package';
import { useGetBranchesQuery } from '../../../services/branches';
import { useGetAllCouponQuery } from '../../../services/coupons';
import { useGetEmployeeByCustomerQuery, useGetEmployeeQuery } from '../../../services/employee';
import { useAddInvoiceMutation } from '../../../services/invoice';
import DateRangeSelector from '../../dateRange/DateRangeSelector';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

const { Option } = Select;

const BuyPlan = () => {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gstClaim, setGstClaim] = useState(false);
  const gstPercentage = 5; // Fixed GST 5%
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentModes, setPaymentModes] = useState([{ id: 1, mode: '', amount: '' }]);
  const [paymentMode, setPaymentMode] = useState(''); // Keep for backward compatibility
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // API hooks
  const { data: packagesData, isLoading: plansLoading } = useGetPlansQuery();
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery();
  const { data: couponsData, isLoading: couponsLoading } = useGetAllCouponQuery({});
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeeByCustomerQuery(userData?._id, {
    skip: !userData?._id // Skip the query if userData._id is not available
  });
  
  // Invoice mutation
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();
 

  // Extract data arrays from API responses
  const packages = packagesData?.data || [];
  const branches = branchesData?.data || [];
  const coupons = couponsData?.data || [];

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
 

  // Handle package selection
  const handlePackageChange = (packageId) => {
    const pkg = packages.find(p => p._id === packageId);
    setSelectedPackage(pkg);
    if (pkg) {
      calculateTotals(pkg.pricing, selectedCoupon, gstClaim, gstPercentage);
      form.setFieldsValue({
        planPrice: pkg.pricing,
      });
    }
  };

  // Handle payment mode change (updated for multiple payments)
  const handlePaymentModeChange = (mode, paymentId) => {
    setPaymentMode(mode);
    
    // Update specific payment mode in the array
    setPaymentModes(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, mode } 
          : payment
      )
    );
    
    // If cash is selected, set employee from localStorage for this specific payment
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
    
    if (selectedPackage) {
      const finalAmount = selectedPackage.pricing - discountAmount + (gstClaim ? ((selectedPackage.pricing - discountAmount) * gstPercentage) / 100 : 0);
      setRemainingAmount(Math.max(0, finalAmount - total));
    }
  };

  // Handle payment amount change
  const handlePaymentAmountChange = (amount, paymentId) => {
    // Update the amount in state
    setPaymentModes(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, amount } 
          : payment
      )
    );
    
    // Recalculate totals after a small delay to ensure form value is updated
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
      // Recalculate after removing payment mode
      setTimeout(() => {
        calculatePaymentAmounts();
      }, 100);
    }
  };

  // Recalculate amounts when package, discount, or GST changes
  useEffect(() => {
    calculatePaymentAmounts();
  }, [selectedPackage, discountAmount, gstClaim, paymentModes.length]);

  // Handle start date change and calculate end date
  const handleStartDateChange = (date) => {
    if (date && selectedPackage) {
      const startDate = dayjs(date);
      const packageDuration = selectedPackage.duration || 365; // Default 1 year if no duration
      const endDate = startDate.add(packageDuration, 'days');
      
      form.setFieldsValue({
        endDate: endDate
      });
    }
  };

  // Handle coupon selection
  const handleCouponChange = (couponId) => {
    const coupon = coupons.find(c => c._id === couponId);
    setSelectedCoupon(coupon);
    if (selectedPackage) {
      calculateTotals(selectedPackage.pricing, coupon, gstClaim, gstPercentage);
    }
  };

  // Handle GST claim change
  const handleGstClaimChange = (value) => {
    const isGstClaim = value === 'yes';
    setGstClaim(isGstClaim);
    if (selectedPackage) {
      calculateTotals(selectedPackage.pricing, selectedCoupon, isGstClaim, gstPercentage);
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Calculate dates
      const startDate = values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const expiryDate = selectedPackage?.duration 
        ? dayjs(startDate).add(selectedPackage.duration, 'days').format('YYYY-MM-DD')
        : dayjs(startDate).add(365, 'days').format('YYYY-MM-DD'); // Default 1 year

      // Calculate amounts
      const planPrice = selectedPackage?.pricing || 0;
      const discountAmt = discountAmount;
      const afterDiscountAmount = planPrice - discountAmt;
      const gstAmount = gstClaim ? (afterDiscountAmount * gstPercentage) / 100 : 0;
      const totalAmount = afterDiscountAmount + gstAmount;

      // Create payment terms array based on selected payment mode
      const paymentTerms = [];
      
      if (paymentMode === 'cash' && values.cashEmployee) {
        paymentTerms.push({
          modeOfPayment: 'cash',
          amount: totalAmount,
          receivedBy: values.cashEmployee,
          receipt: [],
          paymentDate: startDate
        });
      } else if (paymentMode === 'upi' && values.upiScreenshot) {
        paymentTerms.push({
          modeOfPayment: 'upi',
          amount: totalAmount,
          receipt: [values.upiScreenshot],
          referenceId: values.upiReferenceId || '',
          paymentDate: startDate
        });
      } else if (paymentMode === 'card' && values.cardScreenshot) {
        paymentTerms.push({
          modeOfPayment: 'card',
          amount: totalAmount,
          receipt: [values.cardScreenshot],
          paymentDate: startDate
        });
      } else if (paymentMode === 'cheque' && values.chequeNumber && values.bankName) {
        paymentTerms.push({
          modeOfPayment: 'cheque',
          amount: totalAmount,
          chequeNumber: values.chequeNumber,
          bankName: values.bankName,
          receipt: [],
          paymentDate: startDate
        });
      } else if (paymentMode === 'bank_transfer' && values.holderName && values.bankName && values.receiptName) {
        paymentTerms.push({
          modeOfPayment: 'netbanking',
          amount: totalAmount,
          bankHolderName: values.holderName,
          bankName: values.bankName,
          receiptNumber: values.receiptName,
          paymentDate: startDate
        });
      } else if (paymentMode === 'credit_note' && values.creditNoteAmount && values.creditNoteUpload) {
        paymentTerms.push({
          modeOfPayment: 'creditnote',
          amount: values.creditNoteAmount,
          receipt: [values.creditNoteUpload],
          paymentDate: startDate
        });
      }

      // Create the payload
      const payload = {
        userId: userData._id,
        planId: selectedPackage?._id,
        startDate: startDate,
        expiryDate: expiryDate,
        planPrice: planPrice,
        couponId: selectedCoupon?._id || null,
        discountAmount: discountAmt,
        afterDiscount: afterDiscountAmount,
        gstClaim: gstClaim,
        gstPercentage: gstPercentage,
        gstAmount: gstAmount,
        gstNumber: values.gstNumber || null,
        registeredCompanyName: values.registeredCompanyName || null,
        totalInvoiceAmount: totalAmount,
        paymentType: values.paymentType || 'full',
        paymentTerm: paymentTerms,
        coachId: null, // Can be added if coach selection is implemented
        lockerNumber: values.lockerNumber || null,
        employeeId: values.salesPerson,
        details: selectedPackage?.items ? selectedPackage.items.map(item => ({
          itemName: item.name,
          quantity: item.quantity || 1,
          planId: selectedPackage._id
        })) : []
      };

      
      // Call the invoice API
      const result = await addInvoice(payload).unwrap();
      
      message.success('Invoice created successfully!');
      
      form.resetFields();
      setSelectedPackage(null);
      setSelectedCoupon(null);
      setPaymentMode('');
      setGstClaim(false);
      setDiscountAmount(0);
      
      // Navigate to membership tab
      // navigate(`/users/${userData._id}`, { 
      //   state: { activeTab: 'membership' } 
      // });
      
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="buy-plan-container">
      <div className="form-header">
        <h2>Purchase Membership Plan</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="custom-form"
      >
        <div className="row">
          <Form.Item
            name="invoiceDate"
            label="Invoice Date"
            initialValue={dayjs()}
          >
            <DatePicker
              style={{ width: '100%',height: '46px' }}
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
              style={{ width: '100%',height: '46px' }}
              placeholder="Select payment date"
              format="DD-MM-YYYY"
            />
          </Form.Item>

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
                    {employee?.name || employee?.name || 'Unknown'} - {employee.employeeId || 'No ID'}
                  </Option>
                ))
              ) : (
                <Option disabled value="">No sales persons available</Option>
              )}
            </Select>
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="planSelect"
            label="Plan Select"
            rules={[{ required: true, message: 'Please select a plan' }]}
          >
            <Select
              placeholder="Choose plan"
              loading={plansLoading}
              onChange={handlePackageChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {packages?.map(pkg => (
                <Option key={pkg._id} value={pkg._id}>
                  {pkg.name} - ₹{pkg.pricing}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentType"
            label="Payment Type"
            rules={[{ required: true, message: 'Please select payment type' }]}
          >
            <Select placeholder="Select payment type">
              <Option value="fullPayment">Full Payment</Option>
              <Option value="partial">Partial Payment</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="planPrice"
            label="Plan Price"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              disabled
              placeholder="Auto-filled from plan"
            />
          </Form.Item>

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
        </div>

        {selectedPackage && (
          <div className="row">
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
          </div>
        )}

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
              <Input placeholder="Enter GST number" />
            </Form.Item>

            <Form.Item
              name="registeredCompanyName"
              label="Registered Company Name"
              rules={[
                { required: true, message: 'Please enter registered company name' },
                { min: 2, message: 'Company name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Enter registered company name" />
            </Form.Item>
          </div>
        )}

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
                        if (selectedPackage && value) {
                          const finalAmount = selectedPackage.pricing - discountAmount + (gstClaim ? ((selectedPackage.pricing - discountAmount) * gstPercentage) / 100 : 0);
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
          {selectedPackage && (
            <div className="remaining-balance">
              <span className={`balance-text ${remainingAmount > 0 ? 'remaining' : 'complete'}`}>
                <strong>Remaining Balance: ₹{remainingAmount.toFixed(2)}</strong>
              </span>
            </div>
          )}
        </div>



        {selectedPackage && (
          <Card className="package-summary" size="small" title="Order Summary">
            <div className="summary-row">
              <span><strong>Package:</strong> {selectedPackage.name}</span>
              <span><strong>Plan Price:</strong> ₹{selectedPackage.pricing}</span>
            </div>
            {selectedCoupon && (
              <div className="summary-row">
                <span><strong>Coupon:</strong> {selectedCoupon.code}</span>
                <span><strong>Discount:</strong> -₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span><strong>Price After Discount:</strong></span>
              <span>₹{selectedCoupon ? (selectedPackage.pricing - discountAmount).toFixed(2) : selectedPackage.pricing}</span>
            </div>
            {/* {gstClaim && ( */}
              <>
                <div className="summary-row">
                  <span><strong>SGST (2.5%):</strong></span>
                  <span>₹{(((selectedPackage.pricing - discountAmount) * 2.5) / 100).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span><strong>CGST (2.5%):</strong></span>
                  <span>₹{(((selectedPackage.pricing - discountAmount) * 2.5) / 100).toFixed(2)}</span>
                </div>
              </>
            {/* )} */}
            <div className="summary-row">
              <span><strong>Final Total:</strong></span>
              <span>₹{(
                (selectedPackage.pricing - discountAmount) + 
                (gstClaim ? ((selectedPackage.pricing - discountAmount) * gstPercentage) / 100 : 0)
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
            {selectedPackage.description && (
              <div className="summary-row full-width">
                <span><strong>Description:</strong> {selectedPackage.description}</span>
              </div>
            )}
          </Card>
        )}

        {/* Start Date and End Date Section */}
        {selectedPackage && (
          <div className="date-selection-section">
            <div className="row">
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker
                  style={{ width: '100%', height: '46px' }}
                  placeholder="Select start date"
                  format="DD-MM-YYYY"
                  onChange={handleStartDateChange}
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                label="End Date"
              >
                <DatePicker
                  style={{ width: '100%', height: '46px' }}
                  placeholder="Auto-calculated end date"
                  format="DD-MM-YYYY"
                  disabled
                />
              </Form.Item>
            </div>
          </div>
        )}

        <div className="footer-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || addingInvoice}
            className="save-btn"
            disabled={!selectedPackage}
          >
            Purchase Plan
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BuyPlan;