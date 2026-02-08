import React, { useState, useEffect } from 'react';
import { 
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
  Image,
  Tooltip
} from 'antd';
import { 
  ShoppingOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { rentalAPI, adminAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

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
      width: 130,
      render: (text) => <span style={{ fontWeight: '600', color: '#f093fb', fontSize: '14px' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 140,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontSize: '14px' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Suit',
      key: 'suit',
      width: 180,
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <Tooltip title={`${record.suit_name} - ${record.suit_brand} (${record.suit_color})`}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>{record.suit_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.suit_brand} • {record.suit_color}
            </div>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 70,
      render: (size) => <Tag style={{ fontSize: '12px' }}>{size}</Tag>
    },
    {
      title: 'Period',
      key: 'period',
      width: 140,
      responsive: ['md'],
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px' }}>{dayjs(record.rental_start_date).format('MMM DD')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            to {dayjs(record.rental_end_date).format('MMM DD')} ({record.rental_days}d)
          </div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 110,
      render: (amount) => <span style={{ fontWeight: '600', fontSize: '14px', color: '#52c41a' }}>LKR {parseFloat(amount).toFixed(0)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'rental_status',
      key: 'rental_status',
      width: 100,
      filters: [
        { text: 'Reserved', value: 'reserved' },
        { text: 'Active', value: 'active' },
        { text: 'Returned', value: 'returned' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.rental_status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500, fontSize: '12px' }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 95,
      responsive: ['lg'],
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)} style={{ fontSize: '12px' }}>
          {status?.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: '#f093fb' }}
            />
          </Tooltip>
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
              <ShoppingOutlined style={{ marginRight: 12, color: '#f093fb' }} />
              Rental Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '15px' }}>
              View all suit rentals and monitor status
            </p>
            <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
              <span style={{ fontSize: '13px', color: '#0050b3' }}>
                ℹ️ <strong>Admin View:</strong> You can view rental details. Status updates are handled by employees.
              </span>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={rentals}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} rentals`,
              responsive: true
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
      </div>
    </AdminLayout>
  );
};

export default RentalManagement;
