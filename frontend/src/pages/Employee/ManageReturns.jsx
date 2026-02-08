import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Select, InputNumber, Input, Button, Tag, message, Card, Space, Descriptions, Tooltip } from 'antd';
import { RetweetOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { rentalAPI, paymentAPI } from '../../services/apiService';
import EmployeeLayout from '../../components/EmployeeLayout';

const { TextArea } = Input;

const ManageReturns = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  const fetchActiveRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getAllRentals();
      const allRentals = response?.data?.data || [];
      console.log('All rentals:', allRentals);
      // Filter for rentals that can be returned (reserved, active, overdue - not returned/cancelled)
      const activeRentals = allRentals.filter(r => 
        r.rental_status === 'active' || r.rental_status === 'overdue' || r.rental_status === 'reserved'
      );
      setRentals(activeRentals);
      setFilteredRentals(activeRentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      message.error('Failed to load active rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = (rental) => {
    setSelectedRental(rental);
    form.setFieldsValue({
      return_condition: 'good',
      damage_fee: 0,
      late_fee: 0,
      notes: ''
    });
    setReturnModalVisible(true);
  };

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setDetailsModalVisible(true);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredRentals(rentals);
    } else if (status === 'overdue') {
      setFilteredRentals(rentals.filter(r => r.rental_status === 'overdue'));
    } else {
      setFilteredRentals(rentals.filter(r => r.rental_status === status));
    }
  };

  const calculateRefund = (values) => {
    const depositAmount = parseFloat(selectedRental?.deposit_amount || 0);
    const damageFee = parseFloat(values.damage_fee || 0);
    const lateFee = parseFloat(values.late_fee || 0);
    return Math.max(0, depositAmount - damageFee - lateFee);
  };

  const handleSubmitReturn = async (values) => {
    try {
      setLoading(true);
      
      // Calculate refund amount
      const refundAmount = calculateRefund(values);
      
      // Update rental status and condition
      await rentalAPI.updateRentalStatus(selectedRental.id, {
        rental_status: 'returned',
        return_condition: values.return_condition,
        actual_return_date: new Date().toISOString().split('T')[0],
        damage_fee: values.damage_fee,
        late_fee: values.late_fee,
        deposit_refunded: refundAmount,
        notes: values.notes
      });

      // Create refund payment record if there's a refund
      if (refundAmount > 0) {
        await paymentAPI.createPayment({
          rental_id: selectedRental.id,
          amount: refundAmount,
          payment_method: 'refund',
          payment_status: 'completed',
          transaction_reference: `REFUND-${selectedRental.rental_number}`,
          notes: `Deposit refund after return - Condition: ${values.return_condition}`
        });
      }

      message.success('Return processed successfully!');
      setReturnModalVisible(false);
      fetchActiveRentals();
    } catch (error) {
      console.error('Error processing return:', error);
      message.error(error.response?.data?.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Rental #',
      dataIndex: 'rental_number',
      key: 'rental_number',
      render: (text) => <span className="font-mono font-semibold">{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Suit',
      key: 'suit',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.suit_brand}</div>
          <div className="text-xs text-gray-500">{record.suit_color} | Size: {record.size}</div>
        </div>
      )
    },
    {
      title: 'Rental Period',
      key: 'period',
      render: (_, record) => (
        <div className="text-sm">
          <div><strong>Start:</strong> {new Date(record.rental_start_date).toLocaleDateString()}</div>
          <div><strong>End:</strong> {new Date(record.rental_end_date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{record.rental_days} days</div>
        </div>
      )
    },
    {
      title: 'Deposit',
      dataIndex: 'deposit_amount',
      key: 'deposit_amount',
      render: (amount) => `LKR ${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'rental_status',
      key: 'rental_status',
      render: (status) => {
        const colors = {
          active: 'green',
          overdue: 'red',
          reserved: 'blue',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            onClick={() => handleProcessReturn(record)}
          >
            Process Return
          </Button>
        </Space>
      )
    }
  ];

  return (
    <EmployeeLayout>
      <div style={{ padding: '24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1a1a2e', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            <RetweetOutlined style={{ marginRight: 12, color: '#722ed1' }} />
            Manage Suit Returns
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            Process returns, assess condition, and manage refunds
          </p>
        </Card>

        <Card
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Space size="small">
              <FilterOutlined style={{ color: '#666' }} />
              <span style={{ fontWeight: 500, color: '#666' }}>Filter:</span>
              <Button 
                type={filterStatus === 'all' ? 'primary' : 'default'}
                size="small"
                onClick={() => handleFilterChange('all')}
              >
                All ({rentals.length})
              </Button>
              <Button 
                type={filterStatus === 'active' ? 'primary' : 'default'}
                size="small"
                onClick={() => handleFilterChange('active')}
              >
                Active ({rentals.filter(r => r.rental_status === 'active').length})
              </Button>
              <Button 
                type={filterStatus === 'overdue' ? 'primary' : 'default'}
                size="small"
                danger={filterStatus === 'overdue'}
                onClick={() => handleFilterChange('overdue')}
              >
                Overdue ({rentals.filter(r => r.rental_status === 'overdue').length})
              </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={filteredRentals}
            loading={loading}
            rowKey="id"
            scroll={{ x: 900 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Rental Details Modal */}
        <Modal
          title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Rental Details</span>}
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="process" 
              type="primary"
              onClick={() => {
                setDetailsModalVisible(false);
                handleProcessReturn(selectedRental);
              }}
            >
              Process Return
            </Button>
          ]}
          width={700}
        >
          {selectedRental && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Rental Number" span={2}>
                <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
                  {selectedRental.rental_number}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedRental.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedRental.customer_phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Suit Brand">
                {selectedRental.suit_brand}
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {selectedRental.suit_color}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                <Tag>{selectedRental.size}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Suit Code">
                {selectedRental.suit_code || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {new Date(selectedRental.rental_start_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                <span style={{ 
                  color: selectedRental.rental_status === 'overdue' ? '#ff4d4f' : 'inherit',
                  fontWeight: selectedRental.rental_status === 'overdue' ? 'bold' : 'normal'
                }}>
                  {new Date(selectedRental.rental_end_date).toLocaleDateString()}
                  {selectedRental.rental_status === 'overdue' && ' (OVERDUE)'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Rental Days" span={2}>
                <Tag color="blue">{selectedRental.rental_days} days</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Rental Amount">
                LKR {parseFloat(selectedRental.rental_amount || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Deposit Amount">
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                  LKR {parseFloat(selectedRental.deposit_amount || 0).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={selectedRental.rental_status === 'overdue' ? 'red' : 'green'} style={{ fontSize: '14px' }}>
                  {selectedRental.rental_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {selectedRental.delivery_address && (
                <Descriptions.Item label="Delivery Address" span={2}>
                  {selectedRental.delivery_address}
                </Descriptions.Item>
              )}
              {selectedRental.occasion && (
                <Descriptions.Item label="Occasion" span={2}>
                  {selectedRental.occasion}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Return Processing Modal */}
        <Modal
            title={
              <div>
                <h3 className="text-xl font-bold">Process Return</h3>
                {selectedRental && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRental.rental_number} - {selectedRental.customer_name}
                  </p>
                )}
              </div>
            }
            open={returnModalVisible}
            onCancel={() => setReturnModalVisible(false)}
            footer={null}
            width={600}
          >
            {selectedRental && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitReturn}
              >
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Suit:</strong> {selectedRental.suit_brand} ({selectedRental.color})
                    </div>
                    <div>
                      <strong>Size:</strong> {selectedRental.size}
                    </div>
                    <div>
                      <strong>Deposit:</strong> LKR {parseFloat(selectedRental.deposit_amount).toFixed(2)}
                    </div>
                    <div>
                      <strong>Rental Days:</strong> {selectedRental.rental_days}
                    </div>
                  </div>
                </div>

                <Form.Item
                  label="Return Condition"
                  name="return_condition"
                  rules={[{ required: true, message: 'Please assess the suit condition' }]}
                >
                  <Select size="large">
                    <Select.Option value="excellent">Excellent - Like new</Select.Option>
                    <Select.Option value="good">Good - Normal wear</Select.Option>
                    <Select.Option value="fair">Fair - Visible wear</Select.Option>
                    <Select.Option value="damaged">Damaged - Needs repair</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Damage Fee (if any)"
                  name="damage_fee"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    max={parseFloat(selectedRental.deposit_amount)}
                    style={{ width: '100%' }}
                    prefix="LKR"
                    step={100}
                  />
                </Form.Item>

                <Form.Item
                  label="Late Fee (if overdue)"
                  name="late_fee"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    style={{ width: '100%' }}
                    prefix="LKR"
                    step={100}
                  />
                </Form.Item>

                <Form.Item
                  label="Notes"
                  name="notes"
                >
                  <TextArea
                    rows={3}
                    placeholder="Any additional notes about the condition or return..."
                  />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {() => {
                    const values = form.getFieldsValue();
                    const refund = calculateRefund(values);
                    return (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Deposit Refund Amount:</span>
                          <span className="text-2xl font-bold text-green-600">
                            LKR {refund.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Deposit: LKR {parseFloat(selectedRental.deposit_amount).toFixed(2)} - 
                          Damage Fee: LKR {(values.damage_fee || 0).toFixed(2)} - 
                          Late Fee: LKR {(values.late_fee || 0).toFixed(2)}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>

                <Form.Item>
                  <div className="flex space-x-3">
                    <Button type="primary" htmlType="submit" loading={loading} size="large" className="flex-1">
                      Process Return & Refund
                    </Button>
                    <Button onClick={() => setReturnModalVisible(false)} size="large">
                      Cancel
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            )}
          </Modal>
      </div>
    </EmployeeLayout>
  );
};

export default ManageReturns;

