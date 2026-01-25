import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Tag, 
  Space, 
  Card,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Descriptions,
  Image
} from 'antd';
import { 
  ShoppingOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { rentalAPI, adminAPI } from '../../services/apiService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();

  useEffect(() => {
    fetchRentals();
    fetchEmployees();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getAllRentals();
      setRentals(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch rentals');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await adminAPI.getAllUsers({ role: 'employee' });
      setEmployees(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRental(record);
    setIsDetailVisible(true);
  };

  const handleUpdateStatus = (record) => {
    setSelectedRental(record);
    statusForm.setFieldsValue({ rental_status: record.rental_status });
    setIsStatusModalVisible(true);
  };

  const submitStatusUpdate = async (values) => {
    try {
      await rentalAPI.updateRentalStatus(selectedRental.id, values);
      message.success('Rental status updated successfully');
      setIsStatusModalVisible(false);
      statusForm.resetFields();
      fetchRentals();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'reserved': 'orange',
      'active': 'blue',
      'returned': 'green',
      'overdue': 'red',
      'cancelled': 'gray'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'paid': 'green',
      'partially-refunded': 'blue',
      'fully-refunded': 'purple'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Rental #',
      dataIndex: 'rental_number',
      key: 'rental_number',
      fixed: 'left',
      width: 150,
      render: (text) => <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 150,
    },
    {
      title: 'Suit',
      key: 'suit',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.suit_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.suit_brand} - {record.suit_color}
          </div>
        </div>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      render: (size) => <Tag>{size}</Tag>
    },
    {
      title: 'Period',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.rental_start_date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            to {dayjs(record.rental_end_date).format('MMM DD, YYYY')}
          </div>
          <div style={{ fontSize: '12px', color: '#1890ff' }}>
            ({record.rental_days} days)
          </div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>LKR {parseFloat(amount).toFixed(2)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'rental_status',
      key: 'rental_status',
      width: 120,
      filters: [
        { text: 'Reserved', value: 'reserved' },
        { text: 'Active', value: 'active' },
        { text: 'Returned', value: 'returned' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.rental_status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500 }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 120,
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button 
            type="link"
            onClick={() => handleUpdateStatus(record)}
          >
            Status
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>
              <ShoppingOutlined style={{ marginRight: 12, color: '#52c41a' }} />
              Rental Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              View and manage all suit rentals
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={rentals}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} rentals`
            }}
          />
        </Card>

        {/* Rental Details Modal */}
        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Rental Details
            </span>
          }
          open={isDetailVisible}
          onCancel={() => setIsDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedRental && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Rental Number" span={2}>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                  {selectedRental.rental_number}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedRental.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedRental.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Suit" span={2}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '16px' }}>
                    {selectedRental.suit_name}
                  </div>
                  <div style={{ color: '#666' }}>
                    {selectedRental.suit_brand} - {selectedRental.suit_color}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                <Tag style={{ fontSize: '14px' }}>{selectedRental.size}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Suit Code">
                {selectedRental.suit_code}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(selectedRental.rental_start_date).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(selectedRental.rental_end_date).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Rental Days" span={2}>
                <Tag color="blue" style={{ fontSize: '14px' }}>{selectedRental.rental_days} days</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Rental Amount">
                LKR {parseFloat(selectedRental.rental_amount).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Deposit Amount">
                LKR {parseFloat(selectedRental.deposit_amount).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                  LKR {parseFloat(selectedRental.total_amount).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Rental Status">
                <Tag color={getStatusColor(selectedRental.rental_status)} style={{ fontSize: '14px' }}>
                  {selectedRental.rental_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getPaymentStatusColor(selectedRental.payment_status)} style={{ fontSize: '14px' }}>
                  {selectedRental.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Occasion" span={2}>
                {selectedRental.occasion || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Address" span={2}>
                {selectedRental.delivery_address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned Employee" span={2}>
                {selectedRental.assigned_employee_name || 'Not Assigned'}
              </Descriptions.Item>
              {selectedRental.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedRental.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          title="Update Rental Status"
          open={isStatusModalVisible}
          onCancel={() => {
            setIsStatusModalVisible(false);
            statusForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={submitStatusUpdate}
          >
            <Form.Item
              label="New Status"
              name="rental_status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select size="large" placeholder="Select new status">
                <Option value="reserved">Reserved</Option>
                <Option value="active">Active</Option>
                <Option value="returned">Returned</Option>
                <Option value="overdue">Overdue</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Notes (Optional)"
              name="notes"
            >
              <TextArea rows={3} placeholder="Add any notes about the status change" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsStatusModalVisible(false);
                  statusForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Update Status
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default RentalManagement;
