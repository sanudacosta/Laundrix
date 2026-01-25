import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Descriptions,
  Tooltip
} from 'antd';
import { 
  DollarOutlined,
  EyeOutlined,
  UndoOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { paymentAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [refundForm] = Form.useForm();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAllPayments();
      setPayments(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch payments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedPayment(record);
    setIsDetailVisible(true);
  };

  const handleRefund = (record) => {
    setSelectedPayment(record);
    refundForm.setFieldsValue({
      refund_amount: record.amount,
      refund_type: 'full'
    });
    setIsRefundModalVisible(true);
  };

  const submitRefund = async (values) => {
    try {
      await paymentAPI.createRefund(selectedPayment.id, values);
      message.success('Refund processed successfully');
      setIsRefundModalVisible(false);
      refundForm.resetFields();
      fetchPayments();
    } catch (error) {
      message.error('Failed to process refund');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'completed': 'green',
      'failed': 'red',
      'refunded': 'purple',
      'partially-refunded': 'blue'
    };
    return colors[status] || 'default';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'cash': 'green',
      'card': 'blue',
      'bank_transfer': 'purple',
      'online': 'cyan'
    };
    return colors[method] || 'default';
  };

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
      width: 95,
      render: (text) => <span style={{ fontWeight: '600', color: '#fa709a', fontSize: '14px' }}>#{text}</span>
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 150,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <Tag color="blue" style={{ fontSize: '12px' }}>{text}</Tag>
        </Tooltip>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 130,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontSize: '14px' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Type',
      dataIndex: 'payment_type',
      key: 'payment_type',
      width: 90,
      filters: [
        { text: 'Order', value: 'order' },
        { text: 'Rental', value: 'rental' },
      ],
      onFilter: (value, record) => record.payment_type === value,
      render: (type) => (
        <Tag color={type === 'order' ? 'blue' : 'green'} style={{ fontSize: '12px' }}>
          {type?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 100,
      responsive: ['md'],
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'Card', value: 'card' },
        { text: 'Bank Transfer', value: 'bank_transfer' },
        { text: 'Online', value: 'online' },
      ],
      onFilter: (value, record) => record.payment_method === value,
      render: (method) => (
        <Tag color={getPaymentMethodColor(method)} style={{ fontSize: '12px' }}>
          {method?.toUpperCase().replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      render: (amount) => <span style={{ fontWeight: '600', fontSize: '14px', color: '#52c41a' }}>LKR {parseFloat(amount).toFixed(0)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 105,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value, record) => record.payment_status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500, fontSize: '12px' }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      responsive: ['lg'],
      render: (date) => <span style={{ fontSize: '13px' }}>{dayjs(date).format('MMM DD, YYYY')}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: '#fa709a' }}
            />
          </Tooltip>
          {(record.payment_status === 'completed' || record.payment_status === 'paid') && (
            <Tooltip title="Process Refund">
              <Button 
                type="text"
                icon={<UndoOutlined />}
                onClick={() => handleRefund(record)}
                style={{ color: '#ff4d4f' }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              <DollarOutlined style={{ marginRight: 12, color: '#fa709a' }} />
              Payment Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '15px' }}>
              View all payments and process refunds
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={payments}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} payments`,
              responsive: true
            }}
          />
        </Card>

        {/* Payment Details Modal */}
        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Payment Details
            </span>
          }
          open={isDetailVisible}
          onCancel={() => setIsDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedPayment && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Payment ID" span={2}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  #{selectedPayment.id}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID" span={2}>
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {selectedPayment.transaction_id}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedPayment.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedPayment.customer_email}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Type">
                <Tag color={selectedPayment.payment_type === 'order' ? 'blue' : 'green'}>
                  {selectedPayment.payment_type?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color={getPaymentMethodColor(selectedPayment.payment_method)}>
                  {selectedPayment.payment_method?.toUpperCase().replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Amount" span={2}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                  LKR {parseFloat(selectedPayment.amount).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status" span={2}>
                <Tag color={getStatusColor(selectedPayment.payment_status)} style={{ fontSize: '14px' }}>
                  {selectedPayment.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Date" span={2}>
                {dayjs(selectedPayment.created_at).format('MMMM DD, YYYY - HH:mm')}
              </Descriptions.Item>
              {selectedPayment.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedPayment.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Refund Modal */}
        <Modal
          title="Process Refund"
          open={isRefundModalVisible}
          onCancel={() => {
            setIsRefundModalVisible(false);
            refundForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={refundForm}
            layout="vertical"
            onFinish={submitRefund}
          >
            <Form.Item
              label="Refund Type"
              name="refund_type"
              rules={[{ required: true, message: 'Please select refund type' }]}
            >
              <Select size="large" placeholder="Select refund type">
                <Option value="full">Full Refund</Option>
                <Option value="partial">Partial Refund</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Refund Amount"
              name="refund_amount"
              rules={[
                { required: true, message: 'Please enter refund amount' },
                { type: 'number', min: 0, message: 'Amount must be positive' }
              ]}
            >
              <InputNumber
                min={0}
                max={selectedPayment?.amount}
                prefix="LKR"
                placeholder="Enter amount"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Refund Reason"
              name="refund_reason"
              rules={[{ required: true, message: 'Please provide reason' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Explain the reason for refund" 
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsRefundModalVisible(false);
                  refundForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" danger htmlType="submit" size="large">
                  Process Refund
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
