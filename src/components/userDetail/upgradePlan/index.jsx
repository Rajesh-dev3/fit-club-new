import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useGetUpgradablePlansQuery } from '../../../services/package';
import { useUserDetailDataQuery } from '../../../services/user';
import { useAddInvoiceMutation } from '../../../services/invoice';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

const { Option } = Select;
const { TextArea } = Input;

const UpgradePlan = () => {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { refetch: refetchUserData } = useUserDetailDataQuery(id);
  const [form] = Form.useForm();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [gstClaim, setGstClaim] = useState('No');
  const [gstPercentage, setGstPercentage] = useState(null);
  const [paymentType, setPaymentType] = useState('fullPayment');
  const [paymentModes, setPaymentModes] = useState([{ id: 1, mode: '', amount: '' }]);
  const [paymentMode, setPaymentMode] = useState('');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // API hooks - Get upgradable plans for this user
  const { data: packagesData, isLoading: packagesLoading } = useGetUpgradablePlansQuery({
    userId: id
  }, {
    skip: !id
  });
  const packages = packagesData?.plans || [];
  const currentPlan = packagesData?.currentPlan || null;

  // Invoice mutation
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();

  // GST percentages
  const gstOptions = [
    { value: 5, label: '5%' },
    { value: 12, label: '12%' },
    { value: 18, label: '18%' },
    { value: 28, label: '28%' },
  ];

  // Pre-populate form with user data
  useEffect(() => {
    if (userData) {
      const member = userData.member || {};
      
      // Get paid amount from current membership invoice
      const paidAmount = userData.currentMembership?.invoice?.paidAmount || 0;
      
      form.setFieldsValue({
        invoiceDate: dayjs(),
        customerName: userData.name,
        mobileNo: userData.phoneNumber,
        age: member.age,
        gender: member.gender,
        state: member.stateName,
        billingAddress: member.address,
        gstClaim: 'No',
        paymentType: 'fullPayment',
        existingDueAmount: userData.totalDueAmount || 0,
        previousInvoiceAmount: paidAmount,
      });
      
      // Trigger calculation after setting previous invoice amount
      setTimeout(() => calculateAmounts(), 0);
    }
  }, [userData]);

  // Calculate amounts when package or GST changes
  const calculateAmounts = () => {
    const newPlanPrice = form.getFieldValue('newPlanPrice') || 0;
    const previousInvoiceAmount = form.getFieldValue('previousInvoiceAmount') || 0;
    const differenceAmount = newPlanPrice - previousInvoiceAmount;

    let totalPayable = differenceAmount;
    let gstAmount = 0;
    
    if (gstClaim === 'Yes' && gstPercentage) {
      gstAmount = (differenceAmount * gstPercentage) / 100;
      totalPayable = differenceAmount + gstAmount;
    }

    form.setFieldsValue({
      differenceAmount,
      gstAmount,
      totalPayableAmount: totalPayable,
      dueAmount: paymentType === 'fullPayment' ? 0 : totalPayable,
    });
  };

  // Handle package selection
  const handlePackageChange = (packageId) => {
    const pkg = packages.find(p => p._id === packageId);
    setSelectedPackage(pkg);
    if (pkg) {
      form.setFieldsValue({
        newPlanPrice: pkg.pricing,
      });
      calculateAmounts();
    }
  };

  // Handle GST Claim change
  const handleGstClaimChange = (value) => {
    setGstClaim(value);
    if (value === 'No') {
      setGstPercentage(null);
      form.setFieldsValue({ gstPercentage: undefined });
    }
    calculateAmounts();
  };

  // Handle GST percentage change
  const handleGstPercentageChange = (value) => {
    setGstPercentage(value);
    calculateAmounts();
  };

  // Handle payment type change
  const handlePaymentTypeChange = (value) => {
    setPaymentType(value);
    calculateAmounts();
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

  // Add payment mode
  const addPaymentMode = () => {
    const newId = Math.max(...paymentModes.map(p => p.id), 0) + 1;
    setPaymentModes([...paymentModes, { id: newId, mode: '', amount: '' }]);
  };

  // Remove payment mode
  const removePaymentMode = (idToRemove) => {
    if (paymentModes.length > 1) {
      setPaymentModes(paymentModes.filter(payment => payment.id !== idToRemove));
      // Clear form fields for removed payment
      const formValues = form.getFieldsValue();
      const keysToRemove = Object.keys(formValues).filter(key => key.endsWith(`_${idToRemove}`));
      const newValues = { ...formValues };
      keysToRemove.forEach(key => delete newValues[key]);
      form.setFieldsValue(newValues);
    }
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
      const formValues = form.getFieldsValue();
      let total = 0;
      paymentModes.forEach(payment => {
        const amt = formValues[`paymentAmount_${payment.id}`] || 0;
        total += Number(amt);
      });
      setTotalPaidAmount(total);
    }, 100);
  };

  // Handle form field changes
  useEffect(() => {
    calculateAmounts();
  }, [gstClaim, gstPercentage, paymentType]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Calculate dates
      const startDate = values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const expiryDate = selectedPackage?.numberOfDays 
        ? dayjs(startDate).add(selectedPackage.numberOfDays, 'days').format('YYYY-MM-DD')
        : dayjs(startDate).add(365, 'days').format('YYYY-MM-DD');

      // Get new plan price and previous invoice amount
      const newPlanPrice = selectedPackage?.pricing || 0;
      const previousInvoiceAmount = values.previousInvoiceAmount || 0;
      const differenceAmount = newPlanPrice - previousInvoiceAmount;

      // Calculate GST if applicable
      let gstAmount = 0;
      let totalAmount = differenceAmount;
      
      if (gstClaim === 'Yes' && gstPercentage) {
        gstAmount = (differenceAmount * gstPercentage) / 100;
        totalAmount = differenceAmount + gstAmount;
      }

      // Create payment terms array from multiple payment modes
      const paymentTerms = [];
      
      for (const payment of paymentModes) {
        const mode = values[`paymentMode_${payment.id}`];
        const amount = values[`paymentAmount_${payment.id}`];
        
        if (!mode || !amount) continue;

        if (mode === 'cash') {
          paymentTerms.push({
            modeOfPayment: 'cash',
            amount: amount,
            receivedBy: values[`cashEmployee_${payment.id}`],
            receipt: []
          });
        } else if (mode === 'upi') {
          paymentTerms.push({
            modeOfPayment: 'upi',
            amount: amount,
            receipt: [values[`upiScreenshot_${payment.id}`]],
            referenceId: values[`upiReferenceId_${payment.id}`] || ''
          });
        } else if (mode === 'card') {
          paymentTerms.push({
            modeOfPayment: 'card',
            amount: amount,
            receipt: [values[`cardScreenshot_${payment.id}`]]
          });
        } else if (mode === 'cheque') {
          paymentTerms.push({
            modeOfPayment: 'cheque',
            amount: amount,
            chequeNumber: values[`chequeNumber_${payment.id}`],
            bankName: values[`bankName_${payment.id}`],
            receipt: []
          });
        } else if (mode === 'bank_transfer') {
          paymentTerms.push({
            modeOfPayment: 'netbanking',
            amount: amount,
            bankHolderName: values[`holderName_${payment.id}`],
            bankName: values[`bankName_${payment.id}`],
            receiptNumber: values[`receiptName_${payment.id}`] || ''
          });
        } else if (mode === 'credit_note') {
          paymentTerms.push({
            modeOfPayment: 'creditnote',
            amount: amount,
            receipt: [values[`creditNoteUpload_${payment.id}`]]
          });
        }
      }

      // Create the payload with invoiceType: 'upgrade'
      const payload = {
        userId: userData._id,
        planId: selectedPackage?._id,
        startDate: startDate,
        expiryDate: expiryDate,
        planPrice: newPlanPrice,
        couponId: null,
        discountAmount: 0,
        afterDiscount: newPlanPrice,
        gstClaim: gstClaim === 'Yes',
        gstPercentage: gstClaim === 'Yes' ? gstPercentage : 0,
        gstAmount: gstAmount,
        gstNumber: values.gstNumber || null,
        registeredCompanyName: values.registeredCompanyName || null,
        totalInvoiceAmount: totalAmount,
        dueAmount: paymentType === 'fullPayment' ? 0 : values.dueAmount || 0,
        paymentType: paymentType,
        paymentDate: startDate,
        paymentTerm: paymentTerms,
        invoiceType: 'upgrade', // Set invoice type as upgrade
        coachId: null,
        lockerNumber: null,
        salesPersonId: userData?.salesPerson?._id || null,
        details: selectedPackage?.items ? selectedPackage.items.map(item => ({
          itemName: item.name,
          quantity: item.quantity || 1,
          planId: selectedPackage._id
        })) : []
      };

      // Call the invoice API
      const result = await addInvoice(payload).unwrap();
      
      // message.success('Plan upgraded successfully!');
      await refetchUserData(); // Refetch user data
      form.resetFields();
      setSelectedPackage(null);
      
      navigate(`/user-detail/${id}/membership`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      // message.error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upgrade-plan-container">
      <Card className="upgrade-plan-card">
        <h2>Upgrade Membership Plan</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="upgrade-form"
        >
          <div className="form-row">
            <Form.Item
              name="invoiceDate"
              label="Invoice Date"
              rules={[{ required: true, message: 'Invoice date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="paymentDate"
              label="Payment Date"
              rules={[{ required: true, message: 'Payment date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            {/* <Form.Item
              name="mobileNo"
              label="Mobile No."
              rules={[{ required: true, message: 'Mobile number is required' }]}
            >
              <Input placeholder="Mobile Number" disabled />
            </Form.Item> */}
          </div>

          {/* <div className="form-row">
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true, message: 'Customer name is required' }]}
            >
              <Input placeholder="Customer Name" disabled />
            </Form.Item>

            <Form.Item
              name="age"
              label="Age"
            >
              <InputNumber style={{ width: '100%' }} placeholder="Age" disabled />
            </Form.Item>
          </div> */}

          {/* <div className="form-row">
            <Form.Item
              name="gender"
              label="Gender"
            >
              <Select placeholder="Select Gender" disabled>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="state"
              label="State Name"
            >
              <Select placeholder="Select State" disabled>
                <Option value="Delhi">Delhi</Option>
              </Select>
            </Form.Item>
          </div> */}

          {/* <Form.Item
            name="billingAddress"
            label="Billing Address"
          >
            <TextArea rows={3} placeholder="Billing Address" disabled />
          </Form.Item> */}

          <div className="form-row">
            <Form.Item
              name="plan"
              label="Plan"
              rules={[{ required: true, message: 'Please select a plan' }]}
            >
              <Select
                placeholder="Select Package"
                onChange={handlePackageChange}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {packages.map(pkg => (
                  <Option key={pkg._id} value={pkg._id}>
                    {pkg.name} - ₹{pkg.pricing}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="Payment Type"
              rules={[{ required: true, message: 'Payment type is required' }]}
            >
              <Select onChange={handlePaymentTypeChange}>
                <Option value="fullPayment">Full Payment</Option>
                {/* <Option value="partial">Partial Payment</Option> */}
              </Select>
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="existingDueAmount"
              label="Existing Due Amount"
              tooltip="Pending amount from previous invoices"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                disabled
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="newPlanPrice"
              label="New Plan price"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                disabled
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="previousInvoiceAmount"
              label="Previous Invoice Amount"
              // rules={[{ required: true, message: 'Previous invoice amount is required' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="10000"
                prefix="₹"
                onChange={calculateAmounts}
              />
            </Form.Item>

            <Form.Item
              name="differenceAmount"
              label="Difference Amount"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                disabled
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="dueAmount"
              label="Due Amount"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                disabled
                prefix="₹"
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              name="totalPayableAmount"
              label="Total Payable Amount"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                disabled
                prefix="₹"
              />
            </Form.Item>

            <Form.Item
              name="gstClaim"
              label="GST Claim"
              rules={[{ required: true, message: 'GST claim is required' }]}
            >
              <Select onChange={handleGstClaimChange}>
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Form.Item>

            {gstClaim === 'Yes' && (
              <>
                <Form.Item
                  name="gstNumber"
                  label="GST Number"
                  rules={[{ required: true, message: 'GST number is required' }]}
                >
                  <Input placeholder="GST Number" />
                </Form.Item>

                <Form.Item
                  name="registeredCompanyName"
                  label="Registered Company Name"
                  rules={[{ required: true, message: 'Company name is required' }]}
                >
                  <Input placeholder="Registered Company Name" />
                </Form.Item>
              </>
            )}
          </div>

          {gstClaim === 'Yes' && (
            <div className="form-row">
              <Form.Item
                name="gstPercentage"
                label="Gst Percentage"
                rules={[{ required: true, message: 'GST percentage is required' }]}
              >
                <Select
                  placeholder="Select Gst Percentage"
                  onChange={handleGstPercentageChange}
                >
                  {gstOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="totalOrderValue"
                label="Total Order Value"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  disabled
                  prefix="₹"
                />
              </Form.Item>
            </div>
          )}

          {/* Multiple Payment Modes Section */}
          <div className="payment-modes-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--sider-text)' }}>Payment Details</h3>
            {paymentModes.map((payment, index) => (
              <div key={payment.id} className="payment-group">
                <div className="form-row payment-row">
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
                    label="Amount"
                    rules={[{ required: true, message: 'Please enter amount' }]}
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
                  <div className="form-row payment-details">
                    <Form.Item
                      name={`cashEmployee_${payment.id}`}
                      label="Employee (Cash Handler)"
                      rules={[{ required: true, message: 'Please enter employee name' }]}
                    >
                      <Input placeholder="Employee handling cash payment" />
                    </Form.Item>
                  </div>
                )}

                {payment.mode === 'upi' && (
                  <div className="form-row payment-details">
                    <Form.Item
                      name={`upiScreenshot_${payment.id}`}
                      label="UPI Payment Screenshot"
                      rules={[{ required: true, message: 'Please upload screenshot' }]}
                    >
                      <ImagePicker form={form} name={`upiScreenshot_${payment.id}`} />
                    </Form.Item>

                    <Form.Item
                      name={`upiReferenceId_${payment.id}`}
                      label="UPI Reference ID"
                    >
                      <Input placeholder="Enter reference ID (optional)" />
                    </Form.Item>
                  </div>
                )}

                {payment.mode === 'cheque' && (
                  <div className="form-row payment-details">
                    <Form.Item
                      name={`chequeNumber_${payment.id}`}
                      label="Cheque Number"
                      rules={[{ required: true, message: 'Please enter cheque number' }]}
                    >
                      <Input placeholder="Enter cheque number" />
                    </Form.Item>

                    <Form.Item
                      name={`bankName_${payment.id}`}
                      label="Bank Name"
                      rules={[{ required: true, message: 'Please enter bank name' }]}
                    >
                      <Input placeholder="Enter bank name" />
                    </Form.Item>
                  </div>
                )}

                {payment.mode === 'card' && (
                  <div className="form-row payment-details">
                    <Form.Item
                      name={`cardScreenshot_${payment.id}`}
                      label="Card Payment Screenshot"
                      rules={[{ required: true, message: 'Please upload screenshot' }]}
                    >
                      <ImagePicker form={form} name={`cardScreenshot_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}

                {payment.mode === 'bank_transfer' && (
                  <>
                    <div className="form-row payment-details">
                      <Form.Item
                        name={`holderName_${payment.id}`}
                        label="Holder Name"
                        rules={[{ required: true, message: 'Please enter holder name' }]}
                      >
                        <Input placeholder="Enter account holder name" />
                      </Form.Item>

                      <Form.Item
                        name={`bankName_${payment.id}`}
                        label="Bank Name"
                        rules={[{ required: true, message: 'Please enter bank name' }]}
                      >
                        <Input placeholder="Enter bank name" />
                      </Form.Item>
                    </div>

                    <div className="form-row payment-details">
                      <Form.Item
                        name={`transferScreenshot_${payment.id}`}
                        label="Transfer Screenshot"
                        rules={[{ required: true, message: 'Please upload screenshot' }]}
                      >
                        <ImagePicker form={form} name={`transferScreenshot_${payment.id}`} />
                      </Form.Item>
                    </div>
                  </>
                )}

                {payment.mode === 'credit_note' && (
                  <div className="form-row payment-details">
                    <Form.Item
                      name={`creditNoteUpload_${payment.id}`}
                      label="Credit Note Upload"
                      rules={[{ required: true, message: 'Please upload credit note' }]}
                    >
                      <ImagePicker form={form} name={`creditNoteUpload_${payment.id}`} />
                    </Form.Item>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          {selectedPackage && (
            <Card className="package-summary" size="small" title="Order Summary">
              <div className="summary-row">
                <span><strong>Current Plan:</strong> {currentPlan?.name || 'N/A'}</span>
                <span><strong>Previous Amount:</strong> ₹{form.getFieldValue('previousInvoiceAmount') || 0}</span>
              </div>
              <div className="summary-row">
                <span><strong>New Plan:</strong> {selectedPackage.name}</span>
                <span><strong>New Plan Price:</strong> ₹{selectedPackage.pricing}</span>
              </div>
              <div className="summary-row">
                <span><strong>Difference Amount:</strong></span>
                <span>₹{form.getFieldValue('differenceAmount') || 0}</span>
              </div>
              {gstClaim === 'Yes' && gstPercentage && (
                <>
                  <div className="summary-row">
                    <span><strong>GST ({gstPercentage}%):</strong></span>
                    <span>₹{((form.getFieldValue('differenceAmount') || 0) * gstPercentage / 100).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="summary-row">
                <span><strong>Total Payable:</strong></span>
                <span>₹{form.getFieldValue('totalPayableAmount') || 0}</span>
              </div>
              {totalPaidAmount > 0 && (
                <div className="summary-row">
                  <span><strong>Total Paid:</strong></span>
                  <span>₹{totalPaidAmount.toFixed(2)}</span>
                </div>
              )}
              {paymentType === 'partialPayment' && (
                <div className={`summary-row ${(form.getFieldValue('totalPayableAmount') || 0) - totalPaidAmount > 0 ? 'remaining-amount' : 'complete-amount'}`}>
                  <span><strong>Remaining Due:</strong></span>
                  <span>₹{((form.getFieldValue('totalPayableAmount') || 0) - totalPaidAmount).toFixed(2)}</span>
                </div>
              )}
            </Card>
          )}

          <div className="form-actions">
            <Button
              onClick={() => navigate(`/user-detail/${id}/membership`)}
              className="cancel-btn"
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="submit-btn"
              size="large"
            >
              Upgrade Plan
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UpgradePlan;
