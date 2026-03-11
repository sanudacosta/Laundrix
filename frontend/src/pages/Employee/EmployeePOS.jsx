import React, { useState, useEffect } from 'react';
import { Card, Steps, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Radio, Modal, message, Divider, Space, Tag, Typography, Descriptions, Alert, Tabs, Badge } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  CreditCardOutlined, 
  CheckCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  PrinterOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import EmployeeLayout from '../../components/EmployeeLayout';
import { orderAPI, paymentAPI, adminAPI, authAPI, rentalAPI } from '../../services/apiService';
import dayjs from 'dayjs';

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const EmployeePOS = () => {
  const [activeTab, setActiveTab] = useState('laundry');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  
  // Customer state
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  
  // Laundry Order state
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  const [selectedCleaningType, setSelectedCleaningType] = useState(null);
  const [selectedServiceTime, setSelectedServiceTime] = useState(null);
  const [itemCounts, setItemCounts] = useState({});
  const [orderCalculation, setOrderCalculation] = useState({ subtotal: 0, tax: 0, total: 0 });
  
  // Rental state
  const [suitProducts, setSuitProducts] = useState([]);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [rentalDays, setRentalDays] = useState(1);
  const [rentalCalculation, setRentalCalculation] = useState({ rental: 0, deposit: 0, total: 0 });
  
  // Payment & Receipt state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [createdRental, setCreatedRental] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptData, setReceiptData] = useState(null);

  // Quick select items for laundry
  const itemCategories = [
    { id: 'shirts', label: 'Shirts', icon: '👔' },
    { id: 'pants', label: 'Pants', icon: '👖' },
    { id: 'dresses', label: 'Dresses', icon: '👗' },
    { id: 'suits', label: 'Suits/Blazers', icon: '🧥' },
    { id: 'bedding', label: 'Bedding', icon: '🛏️' },
    { id: 'towels', label: 'Towels', icon: '🧺' },
    { id: 'curtains', label: 'Curtains', icon: '🪟' },
    { id: 'jackets', label: 'Jackets', icon: '🧥' }
  ];

  useEffect(() => {
    fetchCustomers();
    if (activeTab === 'laundry') {
      fetchCleaningTypes();
      fetchServiceTimes();
    } else {
      fetchSuitProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'laundry') {
      calculateLaundryTotal();
    } else if (activeTab === 'rental' && selectedSuit) {
      calculateRentalTotal();
    }
  }, [selectedCleaningType, selectedServiceTime, itemCounts, selectedSuit, rentalDays]);

  const fetchCustomers = async () => {
    try {
      const response = await adminAPI.getAllUsers({ role: 'customer' });
      setCustomers(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCleaningTypes = async () => {
    try {
      const response = await orderAPI.getCleaningTypes();
      setCleaningTypes(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to load cleaning types');
    }
  };

  const fetchServiceTimes = async () => {
    try {
      const response = await orderAPI.getServiceTimes();
      setServiceTimes(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to load service times');
    }
  };

  const fetchSuitProducts = async () => {
    try {
      const response = await rentalAPI.getAllSuits();
      setSuitProducts(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to load suit products');
    }
  };

  const calculateLaundryTotal = () => {
    if (!selectedCleaningType || !selectedServiceTime) {
      setOrderCalculation({ subtotal: 0, tax: 0, total: 0 });
      return;
    }

    const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      setOrderCalculation({ subtotal: 0, tax: 0, total: 0 });
      return;
    }

    const basePrice = parseFloat(selectedCleaningType.base_price);
    const multiplier = parseFloat(selectedServiceTime.price_multiplier);
    const subtotal = basePrice * totalItems * multiplier;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    setOrderCalculation({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const calculateRentalTotal = () => {
    if (!selectedSuit || rentalDays <= 0) {
      setRentalCalculation({ rental: 0, deposit: 0, total: 0 });
      return;
    }

    const rentalAmount = parseFloat(selectedSuit.rental_price_per_day) * rentalDays;
    const depositAmount = parseFloat(selectedSuit.deposit_amount);
    const total = rentalAmount + depositAmount;

    setRentalCalculation({
      rental: rentalAmount.toFixed(2),
      deposit: depositAmount.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleItemToggle = (itemId) => {
    setItemCounts(prev => {
      const newCounts = { ...prev };
      if (newCounts[itemId]) {
        newCounts[itemId]++;
      } else {
        newCounts[itemId] = 1;
      }
      return newCounts;
    });
  };

  const handleItemCountChange = (itemId, value) => {
    if (value <= 0) {
      setItemCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[itemId];
        return newCounts;
      });
    } else {
      setItemCounts(prev => ({ ...prev, [itemId]: value }));
    }
  };

  const handleCustomerSelect = (value) => {
    const customer = customers.find(c => c.id === parseInt(value));
    setSelectedCustomer(customer);
  };

  const handleQuickRegister = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.register({
        ...values,
        role: 'customer',
        password: 'Customer123!'
      });
      
      message.success('Customer registered! Default password: Customer123!');
      await fetchCustomers();
      
      const newCustomer = response?.data?.data;
      if (newCustomer) {
        setSelectedCustomer({ 
          id: newCustomer.userId, 
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          address: values.address
        });
      }
      
      setShowQuickRegister(false);
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to register customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLaundryOrder = async (values) => {
    if (!selectedCustomer) {
      message.error('Please select a customer first');
      return;
    }

    const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      message.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      
      // Build item description from selected items
      const itemDescription = Object.entries(itemCounts)
        .map(([itemId, count]) => {
          const item = itemCategories.find(i => i.id === itemId);
          return `${count} ${item?.label || itemId}`;
        })
        .join(', ');

      const orderData = {
        customer_id: selectedCustomer.id,
        cleaning_type_id: values.cleaning_type_id,
        service_time_id: values.service_time_id,
        item_description: itemDescription + (values.additional_items ? `, ${values.additional_items}` : ''),
        quantity: totalItems,
        weight_kg: values.weight_kg,
        special_instructions: values.special_instructions,
        order_type: 'walk-in',
        pickup_date: values.pickup_date ? values.pickup_date.toISOString() : new Date().toISOString()
      };

      const response = await orderAPI.createOrder(orderData);
      setCreatedOrder(response?.data?.data);
      message.success('Order created successfully!');
      setCurrentStep(2);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRental = async (values) => {
    if (!selectedCustomer) {
      message.error('Please select a customer first');
      return;
    }

    if (!selectedSuit || !values.size || !values.rental_start_date || !values.rental_end_date) {
      message.error('Please fill all rental details');
      return;
    }

    try {
      setLoading(true);

      const rentalData = {
        customer_id: selectedCustomer.id,
        product_id: selectedSuit.id,
        size: values.size,
        rental_start_date: values.rental_start_date.format('YYYY-MM-DD'),
        rental_end_date: values.rental_end_date.format('YYYY-MM-DD'),
        occasion: values.occasion,
        delivery_address: values.delivery_address || selectedCustomer.address,
        special_instructions: values.special_instructions
      };

      const response = await rentalAPI.createRental(rentalData);
      setCreatedRental(response?.data?.data);
      message.success('Rental created successfully!');
      setCurrentStep(2);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create rental');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (values) => {
    if (!createdOrder && !createdRental) return;

    try {
      setLoading(true);
      
      const paymentData = {
        customer_id: selectedCustomer.id,
        order_id: createdOrder?.orderId || null,
        rental_id: createdRental?.rentalId || null,
        amount: createdOrder?.totalAmount || parseFloat(rentalCalculation.total),
        payment_method: values.payment_method,
        payment_status: 'completed',
        transaction_reference: `POS-${Date.now()}`,
        payment_date: new Date().toISOString(),
        notes: values.notes || 'Walk-in POS payment'
      };

      const response = await paymentAPI.createPayment(paymentData);
      
      setReceiptData({
        order: createdOrder,
        rental: createdRental,
        customer: selectedCustomer,
        payment: response?.data?.data,
        cleaningType: selectedCleaningType,
        serviceTime: selectedServiceTime,
        suit: selectedSuit,
        calculation: activeTab === 'laundry' ? orderCalculation : rentalCalculation,
        type: activeTab
      });

      message.success('Payment processed successfully!');
      setCurrentStep(3);
    } catch (error) {
      message.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewOrder = () => {
    setCurrentStep(0);
    setSelectedCustomer(null);
    setCreatedOrder(null);
    setCreatedRental(null);
    setReceiptData(null);
    setItemCounts({});
    setSelectedSuit(null);
    setRentalDays(1);
    form.resetFields();
    paymentForm.resetFields();
    setPaymentMethod('cash');
  };

  return (
    <EmployeeLayout>
      <div style={{ padding: '24px', background: '#f7f8fc', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#059669',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}>
                <ShoppingOutlined style={{ fontSize: '28px', color: 'white' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0 }}>Point of Sale (POS)</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>Process orders and rentals for walk-in customers</Text>
              </div>
            </div>
          </div>

          {/* Service Type Tabs */}
          <Card style={{ marginBottom: '24px', borderRadius: '16px' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => {
                setActiveTab(key);
                setCurrentStep(0);
                handleNewOrder();
              }}
              size="large"
              items={[
                {
                  key: 'laundry',
                  label: (
                    <span style={{ fontSize: '16px', padding: '0 16px' }}>
                      <ShoppingOutlined style={{ marginRight: '8px' }} />
                      Laundry Service
                    </span>
                  )
                },
                {
                  key: 'rental',
                  label: (
                    <span style={{ fontSize: '16px', padding: '0 16px' }}>
                      <ScissorOutlined style={{ marginRight: '8px' }} />
                      Suit Rental
                    </span>
                  )
                }
              ]}
            />
          </Card>

          {/* Progress Steps */}
          <Card style={{ marginBottom: '24px', borderRadius: '16px' }}>
            <Steps current={currentStep}>
              <Step title="Customer" icon={<UserOutlined />} />
              <Step title={activeTab === 'laundry' ? 'Order Details' : 'Rental Details'} icon={<ShoppingOutlined />} />
              <Step title="Payment" icon={<CreditCardOutlined />} />
              <Step title="Complete" icon={<CheckCircleOutlined />} />
            </Steps>
          </Card>

          {/* Step 0: Customer Selection */}
          {currentStep === 0 && (
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Card title={<span><UserOutlined /> Select Customer</span>} style={{ borderRadius: '16px', marginBottom: '16px' }}>
                  <Form.Item label="Search Customer" style={{ marginBottom: '16px' }}>
                    <Select
                      showSearch
                      size="large"
                      placeholder="Search by name, phone, or email"
                      value={selectedCustomer?.id?.toString()}
                      onChange={handleCustomerSelect}
                      filterOption={(input, option) => {
                        const customer = customers.find(c => c.id.toString() === option.value);
                        if (!customer) return false;
                        const searchLower = input.toLowerCase();
                        return customer.full_name?.toLowerCase().includes(searchLower) ||
                               customer.phone?.includes(input) ||
                               customer.email?.toLowerCase().includes(searchLower);
                      }}
                      suffixIcon={<SearchOutlined />}
                      optionLabelProp="label"
                    >
                      {customers.map(c => (
                        <Option key={c.id} value={c.id.toString()} label={c.full_name}>
                          <div>
                            <div><strong>{c.full_name}</strong></div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{c.phone} • {c.email}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Divider>OR</Divider>

                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    size="large" 
                    block
                    onClick={() => setShowQuickRegister(true)}
                    style={{ marginBottom: '16px' }}
                  >
                    Register New Customer
                  </Button>

                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    disabled={!selectedCustomer}
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: '#059669',
                      border: 'none',
                      height: '48px',
                      fontSize: '16px'
                    }}
                  >
                    Continue to {activeTab === 'laundry' ? 'Order' : 'Rental'} Details →
                  </Button>
                </Card>

                {/* Quick Tips Card */}
                {!selectedCustomer && (
                  <Card 
                    title={<span>💡 Quick Tips</span>} 
                    style={{ borderRadius: '16px', background: '#f0fdf4', borderColor: '#10b981' }}
                  >
                    <Space direction="vertical" size="small">
                      <Text><strong>Laundry Service:</strong> Best for regular clothing, bedding, and curtains</Text>
                      <Text><strong>Suit Rental:</strong> Perfect for special occasions and events</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        💳 Payment methods: Cash, Card, Bank Transfer<br/>
                        📱 New customers get password: Customer123!<br/>
                        🎯 Quick-select items to speed up order entry
                      </Text>
                    </Space>
                  </Card>
                )}
              </Col>

              <Col xs={24} lg={8}>
                {selectedCustomer ? (
                  <Card 
                    title="Selected Customer" 
                    style={{ 
                      borderRadius: '16px',
                      background: '#f0fdf4',
                      borderColor: '#059669'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        fontSize: '36px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {selectedCustomer.full_name?.charAt(0) || 'C'}
                      </div>
                    </div>
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Name"><strong>{selectedCustomer.full_name}</strong></Descriptions.Item>
                      <Descriptions.Item label="Phone">{selectedCustomer.phone}</Descriptions.Item>
                      <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
                      <Descriptions.Item label="Address">{selectedCustomer.address}</Descriptions.Item>
                    </Descriptions>
                    <Alert
                      message="Customer Ready"
                      description="Click continue to proceed with the transaction"
                      type="success"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  </Card>
                ) : (
                  <>
                    <Card 
                      title={<span>📊 Today's Stats</span>} 
                      style={{ borderRadius: '16px', marginBottom: '16px' }}
                    >
                      <Row gutter={8}>
                        <Col span={12}>
                          <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Customers</Text>
                            <Text strong style={{ fontSize: '24px', color: '#10b981' }}>{customers.length}</Text>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'center', padding: '12px', background: '#eff6ff', borderRadius: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Active</Text>
                            <Text strong style={{ fontSize: '24px', color: '#3b82f6' }}>{customers.filter(c => c.is_active).length}</Text>
                          </div>
                        </Col>
                      </Row>
                    </Card>

                    <Card 
                      title={<span>🎯 {activeTab === 'laundry' ? 'Popular Services' : 'Popular Suits'}</span>}
                      style={{ borderRadius: '16px' }}
                    >
                      {activeTab === 'laundry' ? (
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Wash & Iron</Text>
                            <Tag color="green">Most Popular</Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Dry Cleaning</Text>
                            <Tag color="blue">Premium</Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Wash & Fold</Text>
                            <Tag color="orange">Quick</Tag>
                          </div>
                        </Space>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Wedding Suits</Text>
                            <Tag color="gold">Premium</Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Business Suits</Text>
                            <Tag color="blue">Professional</Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <Text>Sizes 40R-42R</Text>
                            <Tag color="green">Available</Tag>
                          </div>
                        </Space>
                      )}
                    </Card>
                  </>
                )}
              </Col>
            </Row>
          )}

          {/* Step 1: Order/Rental Details */}
          {currentStep === 1 && (
            <>
              {activeTab === 'laundry' ? (
                <LaundryOrderForm
                  form={form}
                  cleaningTypes={cleaningTypes}
                  serviceTimes={serviceTimes}
                  itemCategories={itemCategories}
                  itemCounts={itemCounts}
                  selectedCustomer={selectedCustomer}
                  orderCalculation={orderCalculation}
                  loading={loading}
                  onItemToggle={handleItemToggle}
                  onItemCountChange={handleItemCountChange}
                  onCleaningTypeChange={(value) => {
                    const type = cleaningTypes.find(t => t.id === value);
                    setSelectedCleaningType(type);
                  }}
                  onServiceTimeChange={(value) => {
                    const service = serviceTimes.find(s => s.id === value);
                    setSelectedServiceTime(service);
                  }}
                  onSubmit={handleCreateLaundryOrder}
                  onBack={() => setCurrentStep(0)}
                />
              ) : (
                <RentalForm
                  form={form}
                  suitProducts={suitProducts}
                  selectedSuit={selectedSuit}
                  selectedCustomer={selectedCustomer}
                  rentalCalculation={rentalCalculation}
                  rentalDays={rentalDays}
                  loading={loading}
                  onSuitSelect={(value) => {
                    const suit = suitProducts.find(s => s.id === value);
                    setSelectedSuit(suit);
                  }}
                  onRentalDaysChange={setRentalDays}
                  onSubmit={handleCreateRental}
                  onBack={() => setCurrentStep(0)}
                />
              )}
            </>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (createdOrder || createdRental) && (
            <PaymentForm
              paymentForm={paymentForm}
              customer={selectedCustomer}
              order={createdOrder}
              rental={createdRental}
              cleaningType={selectedCleaningType}
              serviceTime={selectedServiceTime}
              suit={selectedSuit}
              calculation={activeTab === 'laundry' ? orderCalculation : rentalCalculation}
              type={activeTab}
              loading={loading}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onSubmit={handlePayment}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {/* Step 3: Receipt */}
          {currentStep === 3 && receiptData && (
            <Receipt
              data={receiptData}
              paymentMethod={paymentMethod}
              onPrint={handlePrintReceipt}
              onNewOrder={handleNewOrder}
            />
          )}

          {/* Quick Register Modal */}
          <Modal
            title="Quick Customer Registration"
            open={showQuickRegister}
            onCancel={() => setShowQuickRegister(false)}
            footer={null}
            width={600}
          >
            <Form layout="vertical" onFinish={handleQuickRegister}>
              <Form.Item label="Full Name" name="full_name" rules={[{ required: true }]}>
                <Input size="large" placeholder="Enter full name" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                    <Input size="large" placeholder="+94771234567" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input size="large" placeholder="email@example.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <TextArea rows={2} placeholder="Enter customer address" />
              </Form.Item>

              <Alert
                message="Default password will be: Customer123!"
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setShowQuickRegister(false)}>Cancel</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ background: '#059669', border: 'none' }}
                  >
                    Register
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 8mm; size: A4; }
          body * { visibility: hidden !important; }
          #receipt, #receipt * { visibility: visible !important; }
          #receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </EmployeeLayout>
  );
};

// Laundry Order Form Component
const LaundryOrderForm = ({ form, cleaningTypes, serviceTimes, itemCategories, itemCounts, selectedCustomer, orderCalculation, loading, onItemToggle, onItemCountChange, onCleaningTypeChange, onServiceTimeChange, onSubmit, onBack }) => {
  const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Order Details" style={{ marginBottom: '16px', borderRadius: '16px' }}>
            {/* Service Selection */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Cleaning Type" name="cleaning_type_id" rules={[{ required: true }]}>
                  <Select size="large" placeholder="Select cleaning type" onChange={onCleaningTypeChange}>
                    {cleaningTypes.map(type => (
                      <Option key={type.id} value={type.id}>
                        <strong>{type.name}</strong> - LKR {parseFloat(type.base_price).toFixed(2)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Service Time" name="service_time_id" rules={[{ required: true }]}>
                  <Select size="large" placeholder="Select service time" onChange={onServiceTimeChange}>
                    {serviceTimes.map(service => (
                      <Option key={service.id} value={service.id}>
                        <strong>{service.name}</strong> (x{service.price_multiplier})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Quick Select Items */}
            <Form.Item label={<span><strong>Quick Select Items</strong> (Click to add, adjust quantity below)</span>}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {itemCategories.map(item => (
                  <Tag
                    key={item.id}
                    onClick={() => onItemToggle(item.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      border: itemCounts[item.id] ? '2px solid #10b981' : '1px dashed #d9d9d9',
                      background: itemCounts[item.id] ? '#f0fdf4' : 'white',
                      color: itemCounts[item.id] ? '#059669' : '#666'
                    }}
                  >
                    {item.icon} {item.label} {itemCounts[item.id] && <Badge count={itemCounts[item.id]} style={{ marginLeft: '8px', background: '#10b981' }} />}
                  </Tag>
                ))}
              </div>
            </Form.Item>

            {/* Selected Items with Quantities */}
            {Object.keys(itemCounts).length > 0 && (
              <Card size="small" title="Selected Items" style={{ marginTop: '16px', background: '#f9fafb' }}>
                <Row gutter={[16, 16]}>
                  {Object.entries(itemCounts).map(([itemId, count]) => {
                    const item = itemCategories.find(i => i.id === itemId);
                    return (
                      <Col xs={12} sm={8} md={6} key={itemId}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text strong>{item?.icon} {item?.label}:</Text>
                          <InputNumber
                            min={0}
                            value={count}
                            onChange={(value) => onItemCountChange(itemId, value)}
                            size="small"
                            style={{ width: '60px' }}
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            )}

            {/* Additional Items */}
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col xs={24} md={12}>
                <Form.Item label="Additional Items (Optional)" name="additional_items">
                  <TextArea rows={2} placeholder="e.g., 2 Blankets, 1 Carpet..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Weight (kg)" name="weight_kg">
                  <InputNumber min={0} step={0.5} size="large" style={{ width: '100%' }} placeholder="Optional" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Pickup Date & Time" name="pickup_date">
                  <DatePicker showTime size="large" style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Special Instructions" name="special_instructions">
                  <TextArea rows={2} placeholder="Any special handling notes..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Order Summary" 
            style={{ 
              borderRadius: '16px',
              position: 'sticky',
              top: '24px'
            }}
          >
            <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Customer"><strong>{selectedCustomer?.full_name}</strong></Descriptions.Item>
              <Descriptions.Item label="Total Items"><Badge count={totalItems} style={{ background: '#10b981' }} /></Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
              <Row justify="space-between" style={{ marginBottom: '8px' }}>
                <Text>Subtotal:</Text>
                <Text strong>LKR {orderCalculation.subtotal}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: '12px' }}>
                <Text>Tax (8%):</Text>
                <Text strong>LKR {orderCalculation.tax}</Text>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Row justify="space-between">
                <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                <Text strong style={{ fontSize: '24px', color: '#059669' }}>LKR {orderCalculation.total}</Text>
              </Row>
            </div>

            <Divider />

            <Space style={{ width: '100%' }} direction="vertical" size="small">
              <Button size="large" block onClick={onBack}>← Back</Button>
              <Button 
                type="primary" 
                size="large" 
                block
                htmlType="submit"
                loading={loading}
                disabled={totalItems === 0}
                style={{ background: '#059669', border: 'none' }}
              >
                Create Order & Continue →
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

// Rental Form Component
const RentalForm = ({ form, suitProducts, selectedSuit, selectedCustomer, rentalCalculation, rentalDays, loading, onSuitSelect, onRentalDaysChange, onSubmit, onBack }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Rental Details" style={{ marginBottom: '16px', borderRadius: '16px' }}>
            <Form.Item label="Select Suit" name="product_id" rules={[{ required: true }]}>
              <Select size="large" placeholder="Choose a suit" onChange={onSuitSelect} optionLabelProp="label">
                {suitProducts.map(suit => (
                  <Option key={suit.id} value={suit.id} label={`${suit.name} — ${suit.brand}`}>
                    <div style={{ lineHeight: '1.4' }}>
                      <div><strong>{suit.name}</strong> <span style={{ color: '#888', fontWeight: 400 }}>— {suit.brand}</span></div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        LKR {parseFloat(suit.rental_price_per_day).toFixed(2)}/day &nbsp;|&nbsp; Deposit: LKR {parseFloat(suit.deposit_amount).toFixed(2)}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Size" name="size" rules={[{ required: true }]}>
                  <Select size="large" placeholder="Select size">
                    <Option value="36R">36R</Option>
                    <Option value="38R">38R</Option>
                    <Option value="40R">40R</Option>
                    <Option value="42R">42R</Option>
                    <Option value="44R">44R</Option>
                    <Option value="46R">46R</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Start Date" name="rental_start_date" rules={[{ required: true }]}>
                  <DatePicker 
                    size="large" 
                    style={{ width: '100%' }} 
                    onChange={(start) => {
                      if (start && form.getFieldValue('rental_end_date')) {
                        const end = form.getFieldValue('rental_end_date');
                        const days = end.diff(start, 'days');
                        onRentalDaysChange(days > 0 ? days : 1);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="End Date" name="rental_end_date" rules={[{ required: true }]}>
                  <DatePicker 
                    size="large" 
                    style={{ width: '100%' }}
                    onChange={(end) => {
                      if (end && form.getFieldValue('rental_start_date')) {
                        const start = form.getFieldValue('rental_start_date');
                        const days = end.diff(start, 'days');
                        onRentalDaysChange(days > 0 ? days : 1);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Occasion" name="occasion">
                  <Input size="large" placeholder="e.g., Wedding, Business Meeting" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Delivery Address" name="delivery_address">
                  <Input size="large" placeholder={selectedCustomer?.address || "Enter delivery address"} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Special Instructions" name="special_instructions">
              <TextArea rows={2} placeholder="Any special requirements..." />
            </Form.Item>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Rental Summary" 
            style={{ borderRadius: '16px', position: 'sticky', top: '24px' }}
          >
            <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Customer"><strong>{selectedCustomer?.full_name}</strong></Descriptions.Item>
              {selectedSuit && <Descriptions.Item label="Suit"><strong>{selectedSuit.name}</strong></Descriptions.Item>}
              <Descriptions.Item label="Rental Days"><Badge count={rentalDays} style={{ background: '#10b981' }} /></Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px' }}>
              <Row justify="space-between" style={{ marginBottom: '8px' }}>
                <Text>Rental ({rentalDays} days):</Text>
                <Text strong>LKR {rentalCalculation.rental}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: '12px' }}>
                <Text>Deposit:</Text>
                <Text strong>LKR {rentalCalculation.deposit}</Text>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Row justify="space-between">
                <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                <Text strong style={{ fontSize: '24px', color: '#059669' }}>LKR {rentalCalculation.total}</Text>
              </Row>
            </div>

            <Divider />

            <Space style={{ width: '100%' }} direction="vertical" size="small">
              <Button size="large" block onClick={onBack}>← Back</Button>
              <Button 
                type="primary" 
                size="large" 
                block
                htmlType="submit"
                loading={loading}
                disabled={!selectedSuit}
                style={{ background: '#059669', border: 'none' }}
              >
                Create Rental & Continue →
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

// Payment Form Component
const PaymentForm = ({ paymentForm, customer, order, rental, cleaningType, serviceTime, suit, calculation, type, loading, paymentMethod, onPaymentMethodChange, onSubmit, onBack }) => {
  const amount = order?.totalAmount || parseFloat(calculation.total);

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card title={<span><CreditCardOutlined /> Process Payment</span>} style={{ borderRadius: '16px' }}>
          <Alert
            message={`${type === 'laundry' ? 'Order' : 'Rental'} Created Successfully`}
            description={`${type === 'laundry' ? 'Order' : 'Rental'} Number: ${order?.orderNumber || rental?.rentalNumber || 'N/A'}`}
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Form form={paymentForm} layout="vertical" onFinish={onSubmit}>
            <Form.Item label="Payment Method" name="payment_method" rules={[{ required: true }]} initialValue="cash">
              <Radio.Group size="large" buttonStyle="solid" onChange={(e) => onPaymentMethodChange(e.target.value)}>
                <Radio.Button value="cash">💵 Cash</Radio.Button>
                <Radio.Button value="card">💳 Card</Radio.Button>
                <Radio.Button value="bank-transfer">🏦 Bank Transfer</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Payment Notes (Optional)" name="notes">
              <TextArea rows={2} placeholder="Additional payment notes..." />
            </Form.Item>

            <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: '24px' }}>
              <Button size="large" onClick={onBack}>← Back</Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{ background: '#059669', border: 'none' }}
              >
                Complete Payment (LKR {amount.toFixed(2)})
              </Button>
            </Space>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={type === 'laundry' ? 'Order Summary' : 'Rental Summary'} style={{ borderRadius: '16px' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Customer">{customer.full_name}</Descriptions.Item>
            <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
            {type === 'laundry' ? (
              <>
                <Descriptions.Item label="Service">{cleaningType?.name}</Descriptions.Item>
                <Descriptions.Item label="Time">{serviceTime?.name}</Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="Suit">{suit?.name}</Descriptions.Item>
                <Descriptions.Item label="Brand">{suit?.brand}</Descriptions.Item>
              </>
            )}
          </Descriptions>

          <Divider />

          <div style={{ background: '#059669', padding: '20px', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Amount Due</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0' }}>LKR {amount.toFixed(2)}</div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

// Receipt Component
const Receipt = ({ data, paymentMethod, onPrint, onNewOrder }) => {
  const tdLabel = { padding: '6px 10px', fontWeight: 600, color: '#555', whiteSpace: 'nowrap', width: '120px', border: '1px solid #e5e7eb', background: '#f9fafb', verticalAlign: 'top' };
  const tdValue = { padding: '6px 10px', color: '#111', wordBreak: 'break-word', border: '1px solid #e5e7eb', verticalAlign: 'top' };
  return (
    <Card title={<span><CheckCircleOutlined style={{ color: '#10b981' }} /> Transaction Complete</span>} style={{ borderRadius: '16px' }}>
      <div id="receipt" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '2px dashed #d9d9d9', marginBottom: '24px', maxWidth: '680px', margin: '0 auto 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', letterSpacing: '2px' }}>LAUNDRIX</div>
          <div style={{ fontSize: '13px', color: '#888' }}>Professional Laundry &amp; Rental Services</div>
          <hr style={{ margin: '12px 0', borderColor: '#e5e7eb' }} />
          <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>
            {data.type === 'laundry' ? 'ORDER' : 'RENTAL'} RECEIPT
          </div>
        </div>

        {/* Info table — single full-width table, no nested columns */}
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '13px' }}>
          <colgroup>
            <col style={{ width: '120px' }} />
            <col />
            <col style={{ width: '100px' }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td style={tdLabel}>{data.type === 'laundry' ? 'Order No.' : 'Rental No.'}</td>
              <td style={{ ...tdValue, fontWeight: 700 }}>{data.order?.orderNumber || data.rental?.rentalNumber || 'N/A'}</td>
              <td style={tdLabel}>Customer</td>
              <td style={tdValue}>{data.customer.full_name}</td>
            </tr>
            <tr>
              <td style={tdLabel}>Date</td>
              <td style={tdValue}>{new Date().toLocaleString()}</td>
              <td style={tdLabel}>Phone</td>
              <td style={tdValue}>{data.customer.phone}</td>
            </tr>
            <tr>
              <td style={tdLabel}>Payment</td>
              <td style={tdValue}>{paymentMethod.toUpperCase()}</td>
              <td style={tdLabel}>Email</td>
              <td style={tdValue}>{data.customer.email}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals table */}
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            {data.type === 'laundry' ? (
              <>
                <tr>
                  <td style={{ padding: '6px 10px', color: '#555', border: '1px solid #e5e7eb' }}>Subtotal</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #e5e7eb' }}>LKR {data.calculation.subtotal}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', color: '#555', border: '1px solid #e5e7eb' }}>Tax (8%)</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #e5e7eb' }}>LKR {data.calculation.tax}</td>
                </tr>
              </>
            ) : (
              <>
                <tr>
                  <td style={{ padding: '6px 10px', color: '#555', border: '1px solid #e5e7eb' }}>Rental Amount</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #e5e7eb' }}>LKR {data.calculation.rental}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', color: '#555', border: '1px solid #e5e7eb' }}>Security Deposit</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #e5e7eb' }}>LKR {data.calculation.deposit}</td>
                </tr>
              </>
            )}
            <tr style={{ background: '#f0fdf4' }}>
              <td style={{ padding: '10px', fontWeight: 700, fontSize: '15px', border: '1px solid #e5e7eb' }}>Total Paid</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontSize: '18px', color: '#10b981', border: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>LKR {data.calculation.total}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '16px', color: '#888', fontSize: '12px' }}>
          <div>Thank you for choosing Laundrix!</div>
          <div>Please keep this receipt for tracking</div>
        </div>
      </div>

      <Space style={{ width: '100%', justifyContent: 'center' }} size="large">
        <Button size="large" icon={<PrinterOutlined />} onClick={onPrint}>Print Receipt</Button>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />}
          onClick={onNewOrder}
          style={{ background: '#059669', border: 'none' }}
        >
          New Transaction
        </Button>
      </Space>
    </Card>
  );
};

export default EmployeePOS;
