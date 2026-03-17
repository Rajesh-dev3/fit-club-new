import { Image, Tag, Button, Dropdown, Select, Modal, Form, InputNumber, DatePicker, Input } from "antd";
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, KeyOutlined } from "@ant-design/icons";
import { UserDetailAttendanceRoute, ViewFormRoute, EditUserRoute } from "../../routes/routepath";
import { useState } from 'react';
import React from 'react';
import { useAssignGymKitMutation } from "../../services/user";

function statusColor(status) {
  switch (status) {
    case 'active': return 'green';
    case 'pending': return 'orange';
    case 'inactive': return 'red';
    case 'freezed': return 'blue';
    case 'block': return 'volcano';
    default: return 'default';
  }
}

function statusTagClass(status) {
  switch (status) {
    case 'pending': return 'ant-tag-orange';
    case 'freezed': return 'ant-tag-blue';
    case 'block': return 'ant-tag-volcano';
    default: return '';
  }
}

// Gym Kit Delivery Modal Component - Shows all available products with quantities
const GymKitDeliveryModal = ({ visible, onClose, onSubmit, products, userId, isLoading }) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Reset quantities when modal opens
  React.useEffect(() => {
    if (visible) {
      setQuantities({});
      setMessage(null);
      form.resetFields();
    }
  }, [visible, form]);

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleSubmit = async () => {
    // Filter products that have quantity entered
    const productsToDeliver = Object.entries(quantities)
      .filter(([_, quantity]) => quantity && quantity > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity
      }));

    if (productsToDeliver.length === 0) {
      Modal.warning({
        title: 'No Products Selected',
        content: 'Please enter quantity for at least one product.'
      });
      return;
    }

    // Validate quantities don't exceed remaining
    const validationErrors = [];
    productsToDeliver.forEach(({ productId, quantity }) => {
      const product = products.find(p => p.value === productId);
      if (product && quantity > product.remaining) {
        validationErrors.push(`${product.label}: Quantity (${quantity}) exceeds remaining (${product.remaining})`);
      }
    });

    if (validationErrors.length > 0) {
      Modal.error({
        title: 'Validation Error',
        content: (
          <div>
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )
      });
      return;
    }

    await onSubmit({ userId, products: productsToDeliver, setMessage });
  };

  const handleCancel = () => {
    form.resetFields();
    setQuantities({});
    setMessage(null);
    onClose();
  };

  const hasValidQuantities = Object.values(quantities).some(qty => qty && qty > 0);

  return (
    <Modal
      title="Gym Kit Delivery"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Deliver All"
      cancelText="Cancel"
      width={800}
      okButtonProps={{ disabled: !hasValidQuantities || isLoading, loading: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={!isLoading}
    >
      <div style={{ marginTop: 20 }}>
        {/* Message Display */}
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: '8px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: message.type === 'success' ? '#166534' : '#991b1b'
          }}>
            <strong>{message.type === 'success' ? '✓ Success' : '✗ Error'}:</strong> {message.text}
          </div>
        )}
        
        <h4 style={{ marginBottom: 16, color: 'var(--sider-text)', fontSize: 16 }}>
          Enter Delivery Quantities
        </h4>
        
        {/* Products List */}
        <div style={{
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {products?.map((product) => (
            <div
              key={product.value}
              style={{
                padding: '16px',
                border: '1px solid var(--border-color, #e5e5e5)',
                borderRadius: '10px',
                marginBottom: '12px',
                background: 'var(--card-bg)',
                opacity: product.remaining === 0 ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Product Image */}
                {product.image && (
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={product.image}
                      alt={product.label}
                      width={60}
                      height={60}
                      style={{ borderRadius: '8px', objectFit: 'cover' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    />
                  </div>
                )}

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 15, color: 'var(--sider-text)' }}>
                      {product.label}
                    </strong>
                    {product.warehouseName && (
                      <Tag style={{ marginLeft: 8 }} color="blue">
                        {product.warehouseName}
                      </Tag>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: 13, color: 'var(--muted, #6b7280)' }}>
                    <span>Total: <strong>{product.total}</strong></span>
                    <span>Delivered: <strong>{product.delivered}</strong></span>
                    <span style={{ 
                      color: product.remaining > 0 ? 'var(--accent)' : '#ef4444',
                      fontWeight: 600
                    }}>
                      Remaining: <strong>{product.remaining}</strong>
                    </span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div style={{ flexShrink: 0, width: '150px' }}>
                  {product.remaining > 0 ? (
                    <InputNumber
                      min={0}
                      max={product.remaining}
                      placeholder="Quantity"
                      value={quantities[product.value]}
                      onChange={(value) => handleQuantityChange(product.value, value)}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Tag color="red">OUT OF STOCK</Tag>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products?.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--muted, #6b7280)'
          }}>
            No gym kit products available
          </div>
        )}
      </div>
    </Modal>
  );
};

// Gym Kit Select Component
const GymKitSelect = ({ record }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assignGymKit, { isLoading }] = useAssignGymKitMutation();

  // Debug logging
  console.log('Gym Kit Record:', {
    hasGymKitAvailable: record?.planGymKit?.gymKitAvailable,
    hasProducts: record?.planGymKit?.products,
    productsLength: record?.planGymKit?.products?.length,
    fullPlanGymKit: record?.planGymKit
  });

  // Check if gym kit is available
  const hasGymKit = record?.planGymKit?.gymKitAvailable === true && 
                    Array.isArray(record?.planGymKit?.products) && 
                    record.planGymKit.products.length > 0;

  console.log('Has Gym Kit:', hasGymKit);

  // Transform API data to gym kit items format
  const gymKitItems = hasGymKit 
    ? record.planGymKit.products.map(product => {
        const productId = product.productId?._id || product._id;

        return {
          label: product.productId?.productName || 'Unknown Product',
          value: productId,
          total: product.quantity || 0,
          delivered: product.deliveredQuantity || 0,
          remaining: product.remainingQuantity || 0,
          fullyDelivered: product.fullyDelivered || false,
          image: product.productId?.productImage,
          warehouseName: product.productId?.warehouseName
        };
      })
    : [];

  // Check if all products are fully delivered
  const allProductsDelivered = hasGymKit && 
    record.planGymKit.products.every(product => product.fullyDelivered === true);

  const handleAvailableClick = () => {
    if (hasGymKit) {
      setModalVisible(true);
    }
  };

  const handleDelivery = async (deliveryData) => {
    console.log('Delivery data:', deliveryData);
    const { setMessage } = deliveryData;
    
    try {
      const result = await assignGymKit({
        userId: deliveryData.userId,
        products: deliveryData.products
      }).unwrap();

      setMessage({
        type: 'success',
        text: 'Gym kit delivered successfully!'
      });
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        setModalVisible(false);
      }, 2000);
    } catch (error) {
      console.error('Delivery error:', error);
      setMessage({
        type: 'error',
        text: error?.data?.message || error?.message || 'Failed to deliver gym kit'
      });
    }
  };

  // If no gym kit available, show N/A
  if (!hasGymKit) {
    return <span style={{ color: 'var(--muted, #6b7280)' }}>N/A</span>;
  }

  // If all products are fully delivered, show "Fully Delivered"
  if (allProductsDelivered) {
    return (
      <Tag color="green" style={{ fontWeight: 600 }}>
        Fully Delivered
      </Tag>
    );
  }

  return (
    <>
      <Select
        placeholder="Select Action"
        style={{ width: '100%' }}
        onSelect={handleAvailableClick}
        value={undefined}
        options={[
          { label: 'Available', value: 'available' }
        ]}
      />
      <GymKitDeliveryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleDelivery}
        products={gymKitItems}
        userId={record._id}
        isLoading={isLoading}
      />
    </>
  );
};

// This will be replaced by real trainer data via props/context/hook in the future
const dummyTrainers = [
  { label: 'Trainer 1', value: 'trainer1' },
  { label: 'Trainer 2', value: 'trainer2' },
  { label: 'Trainer 3', value: 'trainer3' },
];

const getallColumns = () => [
  { 
    title: 'Name', 
    dataIndex: 'name', 
    key: 'name', 
    width: 150,
    render: (name, record) => (
      <Link to={`/user-detail/${record._id}/${UserDetailAttendanceRoute}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        {name}
      </Link>
    )
  },
  { title: 'Branch', dataIndex: 'branch', key: 'branch', width: 120 },
  { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130 },
  { title: 'Assessment Ratio', dataIndex: 'assessmentRatio', key: 'assessmentRatio', width: 120 },
  {
    title: 'Sales Person',
    dataIndex: 'salesPerson',
    key: 'salesPerson',
    width: 150,
    render: (value) => (
      <Select
        placeholder="Select sales person"
        options={dummyTrainers}
        style={{ width: '100%' }}
        value={value && dummyTrainers.some(t => t.value === value) ? value : undefined}
        allowClear
      />
    ),
  },
  { title: 'Plan Name', dataIndex: 'planName', key: 'planName', width: 120 },
  { title: 'Plan Price', dataIndex: 'planPrice', key: 'planPrice', width: 100 },
  { title: 'Profile', dataIndex: 'profile', key: 'profile', width: 80, render: (url) => <Image src={url || 'https://via.placeholder.com/40'} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> },
  { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 80 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 100, align: 'center', render: (status) => <Tag color={statusColor(status)} className={statusTagClass(status)}>{status.toUpperCase()}</Tag> },
  { title: 'Invoice Status', dataIndex: 'invoiceStatus', key: 'invoiceStatus', width: 120 },
  { title: 'Remaining Days', dataIndex: 'remainingDays', key: 'remainingDays', width: 120 },
  { title: 'View Profile', key: 'viewProfile', width: 80, align: 'center', render: (_, record) => (
    <Link to={`/user-detail/${record._id}/${UserDetailAttendanceRoute}`}>
      <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} />
    </Link>
  ) },
  { title: 'Membership Form', key: 'membershipForm', width: 120, align: 'center', render: (_, record) => (
    <Link to={`${ViewFormRoute}/${record._id}`}>
      <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} />
    </Link>
  ) },
  { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: 'End Date', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: 'Gym Kit', key: 'gymKit', width: 200, render: (_, record) => <GymKitSelect record={record} /> },
  { title: 'Actions', key: 'actions', width: 100, align: 'center', render: (_, record, navigate) => {
    const menuItems = [
      { 
        key: 'edit', 
        label: 'Edit', 
        icon: <EditOutlined />,
        onClick: () => navigate && navigate(`${EditUserRoute}/${record._id}`)
      },
      { key: 'changePassword', label: 'Change Password', icon: <KeyOutlined />, onClick: () => handleChangePassword && handleChangePassword(record) },
      { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete && handleDelete(record) },
    ];
    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
      </Dropdown>
    );
  } },
];

const getUserColumns = (handleEdit, handleDelete, handleChangePassword, navigate) => {
  const allColumns = getallColumns();
  return allColumns.map(col => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_, record) => {
          const menuItems = [
            { 
              key: 'edit', 
              label: 'Edit', 
              icon: <EditOutlined />,
              onClick: () => navigate(`${EditUserRoute}/${record._id}`)
            },
            { key: 'changePassword', label: 'Change Password', icon: <KeyOutlined />, onClick: () => handleChangePassword && handleChangePassword(record) },
            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete && handleDelete(record) },
          ];
          return (
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          );
        }
      };
    }
    return col;
  });
};

export { getUserColumns };
export default getallColumns();
