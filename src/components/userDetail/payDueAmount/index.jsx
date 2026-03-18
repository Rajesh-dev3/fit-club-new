import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, InputNumber, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAddInvoiceMutation } from '../../../services/invoice';
import { useUserDetailDataQuery } from '../../../services/user';
import ImagePicker from '../../../components/form/ImagePicker';
import './styles.scss';

const { Option } = Select;

const PayDueAmount = () => {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gstClaim, setGstClaim] = useState(false);
  const gstPercentage = 5; // Fixed GST 5%
  const [paymentModes, setPaymentModes] = useState([{ id: 1, mode: '', amount: '' }]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  // Invoice mutation
  const [addInvoice, { isLoading: addingInvoice }] = useAddInvoiceMutation();
  const { refetch: refetchUserData } = useUserDetailDataQuery(id);

  // Get due amount from userData
  const dueAmount = userData?.totalDueAmount || 0;

  // Set initial form values
  useEffect(() => {
    if (userData) {
      const previousPaidAmount = userData.currentMembership?.invoice?.paidAmount || 0;
      
      form.setFieldsValue({
        invoiceDate: dayjs(),
        paymentDate: dayjs(),
        customerName: userData.name,
        mobileNo: userData.phoneNumber,
        planName: userData.currentMembership?.planName || 'N/A',
        planPrice: userData.currentMembership?.pricing || 0,
        totalBillAmount: userData.currentMembership?.pricing || 0,
        previousPaidAmount: previousPaidAmount,
        dueAmount: dueAmount,
        gstPercentage: gstPercentage,
      });
    }
  }, [userData, form, dueAmount]);

  // Handle GST claim change
  const handleGstClaimChange = (value) => {
    const isGstClaim = value === 'yes';
    setGstClaim(isGstClaim);
  };

  // Handle payment mode change
  const handlePaymentModeChange = (mode, paymentId) => {
    setPaymentModes(prev =>
      prev.map(payment =>
        payment.id === paymentId
          ? { ...payment, mode }
          : payment
      )
    );

    // If cash is selected, set employee from localStorage
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

  // Calculate total paid amount
  const calculatePaymentAmounts = () => {
    const formValues = form.getFieldsValue();
    let total = 0;

    paymentModes.forEach(payment => {
      const amount = formValues[`paymentAmount_${payment.id}`] || 0;
      total += Number(amount);
    });

    setTotalPaidAmount(total);
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

  // Recalculate amounts when payment modes change
  useEffect(() => {
    calculatePaymentAmounts();
  }, [paymentModes.length]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate total paid amount
      if (totalPaidAmount <= 0) {
        message.error('Please enter payment amount');
        setLoading(false);
        return;
      }

      if (totalPaidAmount > dueAmount) {
        message.error('Payment amount cannot exceed due amount');
        setLoading(false);
        return;
      }

      // Determine payment type
      const paymentType = totalPaidAmount >= dueAmount ? 'fullPayment' : 'partial';

      // Prepare payment terms array (matching buyPlan structure)
      const paymentTerms = [];

      paymentModes.forEach(payment => {
        const mode = form.getFieldValue(`paymentMode_${payment.id}`);
        const amount = form.getFieldValue(`paymentAmount_${payment.id}`) || 0;

        if (!mode || amount === 0) return;

        if (mode === 'cash') {
          const cashEmployee = form.getFieldValue(`cashEmployee_${payment.id}`);
          if (cashEmployee) {
            paymentTerms.push({
              modeOfPayment: 'cash',
              amount: Number(amount),
              receivedBy: cashEmployee,
              receipt: []
            });
          }
        } else if (mode === 'upi') {
          const upiScreenshot = form.getFieldValue(`upiScreenshot_${payment.id}`);
          const upiReferenceId = form.getFieldValue(`upiReferenceId_${payment.id}`);
          if (upiScreenshot) {
            paymentTerms.push({
              modeOfPayment: 'upi',
              amount: Number(amount),
              receipt: [upiScreenshot],
              referenceId: upiReferenceId || ''
            });
          }
        } else if (mode === 'card') {
          const cardScreenshot = form.getFieldValue(`cardScreenshot_${payment.id}`);
          if (cardScreenshot) {
            paymentTerms.push({
              modeOfPayment: 'card',
              amount: Number(amount),
              receipt: [cardScreenshot]
            });
          }
        } else if (mode === 'cheque') {
          const chequeNumber = form.getFieldValue(`chequeNumber_${payment.id}`);
          const bankName = form.getFieldValue(`chequeBankName_${payment.id}`);
          if (chequeNumber && bankName) {
            paymentTerms.push({
              modeOfPayment: 'cheque',
              amount: Number(amount),
              chequeNumber: chequeNumber,
              bankName: bankName,
              receipt: []
            });
          }
        } else if (mode === 'bank_transfer') {
          const holderName = form.getFieldValue(`bankAccountHolder_${payment.id}`);
          const accountNumber = form.getFieldValue(`bankAccountNumber_${payment.id}`);
          const ifscCode = form.getFieldValue(`bankIfscCode_${payment.id}`);
          const transferScreenshot = form.getFieldValue(`bankScreenshot_${payment.id}`);
          if (holderName && accountNumber && ifscCode) {
            paymentTerms.push({
              modeOfPayment: 'netbanking',
              amount: Number(amount),
              bankHolderName: holderName,
              accountNumber: accountNumber,
              ifscCode: ifscCode,
              receipt: transferScreenshot ? [transferScreenshot] : []
            });
          }
        } else if (mode === 'credit_note') {
          const creditNoteReceipt = form.getFieldValue(`creditNoteReceipt_${payment.id}`);
          if (creditNoteReceipt) {
            paymentTerms.push({
              modeOfPayment: 'creditnote',
              amount: Number(amount),
              receipt: [creditNoteReceipt]
            });
          }
        }
      });

      if (paymentTerms.length === 0) {
        message.error('Please add at least one payment mode with amount');
        setLoading(false);
        return;
      }

      // Calculate amounts
      const planPrice = userData.currentMembership?.pricing || 0;
      const baseAmount = totalPaidAmount / 1.05;
      const gstOnPaidAmount = totalPaidAmount - baseAmount;

      // Create the payload (matching buyPlan structure)
      const payload = {
        userId: userData._id,
        planId: userData.currentMembership?.planId,
        startDate: userData.currentMembership?.startDate,
        expiryDate: userData.currentMembership?.expiryDate,
        planPrice: planPrice,
        couponId: null,
        discountAmount: 0,
        afterDiscount: planPrice,
        gstClaim: gstClaim,
        gstPercentage: gstClaim ? gstPercentage : 0,
        gstAmount: gstOnPaidAmount,
        gstNumber: values.gstNumber || null,
        registeredCompanyName: values.registeredCompanyName || null,
        totalInvoiceAmount: totalPaidAmount,
        dueAmount: dueAmount - totalPaidAmount,
        paymentType: paymentType === 'fullPayment' ? 'fullPayment' : 'partial',
        paymentDate: values.paymentDate ? dayjs(values.paymentDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        paymentTerm: paymentTerms,
        invoiceType: 'balance_clear',
        coachId: userData.currentMembership?.assignedTrainer || null,
        lockerNumber: null,
        salesPersonId: userData.salesPerson?._id || null,
        details: []
      };

      const response = await addInvoice(payload).unwrap();

      if (response.success) {
        // message.success('Payment submitted successfully!');
        await refetchUserData(); // Refetch user data
        navigate(`/user-detail/${id}/buy-membership`);
      } else {
        // message.error(response.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    //   message.error(error?.data?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pay-due-amount-container">
      <div className="form-header">
        <h2>Pay Due Amount</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="custom-form"
      >
        <div className="row">
          <Form.Item
            label="Invoice Date"
            name="invoiceDate"
            rules={[{ required: true, message: 'Please select invoice date' }]}
            >
            <DatePicker 
            disabled
              format="DD-MM-YYYY" 
              style={{ width: '100%', height: '46px' }} 
            />
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="paymentDate"
            rules={[{ required: true, message: 'Please select payment date' }]}
          >
            <DatePicker 
              format="DD-MM-YYYY" 
              style={{ width: '100%', height: '46px' }} 
            />
          </Form.Item>

          <Form.Item
            label="Mobile No"
            name="mobileNo"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Customer Name"
            name="customerName"
          >
            <Input disabled />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            label="Plan Name"
            name="planName"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Plan Price"
            name="planPrice"
          >
            <InputNumber 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Total Bill Amount"
            name="totalBillAmount"
          >
            <InputNumber 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Previous Paid Amount"
            name="previousPaidAmount"
          >
            <InputNumber 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Due Amount"
            name="dueAmount"
          >
            <InputNumber 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="GST Claim"
            name="gstClaim"
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

        {/* Mode Of Payment Section */}
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
                    placeholder="Select Payment Mode"
                    onChange={(value) => handlePaymentModeChange(value, payment.id)}
                  >
                    <Option value="cash">Cash</Option>
                    <Option value="upi">UPI</Option>
                    <Option value="card">Card</Option>
                    <Option value="cheque">Cheque</Option>
                    <Option value="bank_transfer">Bank Transfer</Option>
                    <Option value="credit_note">Credit Note</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name={`paymentAmount_${payment.id}`}
                  label={index === 0 ? "Amount" : "Amount"}
                  rules={[
                    { required: true, message: 'Amount is required' },
                    {
                      validator: (_, value) => {
                        if (value && value > dueAmount) {
                          return Promise.reject('Amount cannot exceed due amount');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <InputNumber
                    placeholder="Enter amount"
                    min={0}
                    max={dueAmount}
                    style={{ width: '100%' }}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
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

              {/* Dynamic fields based on payment mode */}
              {payment.mode === 'cash' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`cashEmployee_${payment.id}`}
                    label="Employee (Cash Handler)"
                    rules={[{ required: true, message: 'Please enter employee name for cash payment' }]}
                  >
                    <Input placeholder="Employee handling cash payment" />
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
                  >
                    <Input placeholder="Enter UPI transaction reference ID (optional)" />
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

              {payment.mode === 'cheque' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`chequeNumber_${payment.id}`}
                    label="Cheque Number"
                    rules={[{ required: true, message: 'Please enter cheque number' }]}
                  >
                    <Input placeholder="Enter cheque number" />
                  </Form.Item>

                  <Form.Item
                    name={`chequeBankName_${payment.id}`}
                    label="Bank Name"
                    rules={[{ required: true, message: 'Please enter bank name' }]}
                  >
                    <Input placeholder="Enter bank name" />
                  </Form.Item>
                </div>
              )}

              {payment.mode === 'bank_transfer' && (
                <>
                  <div className="row payment-details">
                    <Form.Item
                      name={`bankAccountHolder_${payment.id}`}
                      label="Holder Name"
                      rules={[{ required: true, message: 'Please enter holder name' }]}
                    >
                      <Input placeholder="Enter account holder name" />
                    </Form.Item>

                    <Form.Item
                      name={`bankAccountNumber_${payment.id}`}
                      label="Account Number"
                      rules={[{ required: true, message: 'Please enter account number' }]}
                    >
                      <Input placeholder="Enter account number" />
                    </Form.Item>
                  </div>

                  <div className="row payment-details">
                    <Form.Item
                      name={`bankIfscCode_${payment.id}`}
                      label="IFSC Code"
                      rules={[{ required: true, message: 'Please enter IFSC code' }]}
                    >
                      <Input placeholder="Enter IFSC code" />
                    </Form.Item>

                    <Form.Item
                      name={`bankScreenshot_${payment.id}`}
                      label="Transfer Screenshot"
                      rules={[{ required: true, message: 'Please upload transfer screenshot' }]}
                    >
                      <ImagePicker
                        form={form}
                        name={`bankScreenshot_${payment.id}`}
                      />
                    </Form.Item>
                  </div>
                </>
              )}

              {payment.mode === 'credit_note' && (
                <div className="row payment-details">
                  <Form.Item
                    name={`creditNoteReceipt_${payment.id}`}
                    label="Credit Note Receipt"
                    rules={[{ required: true, message: 'Please upload credit note receipt' }]}
                  >
                    <ImagePicker
                      form={form}
                      name={`creditNoteReceipt_${payment.id}`}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <Card className="package-summary" size="small" title="Payment Summary">
          <div className="summary-row">
            <span><strong>Total Due Amount:</strong></span>
            <span>₹{dueAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span><strong>Total Paying Amount:</strong></span>
            <span>₹{totalPaidAmount.toLocaleString()}</span>
          </div>
          <div className={`summary-row ${(dueAmount - totalPaidAmount) > 0 ? 'remaining-amount' : 'complete-amount'}`}>
            <span><strong>Remaining Due:</strong></span>
            <span>₹{Math.max(0, dueAmount - totalPaidAmount).toLocaleString()}</span>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="footer-buttons">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || addingInvoice}
            className="save-btn"
          >
            Submit Payment
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PayDueAmount;
