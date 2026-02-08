import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Select, message, Space, Descriptions, Input, Tooltip } from 'antd';
import { ShoppingOutlined, EyeOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { orderAPI } from '../../services/apiService';
import EmployeeLayout from '../../components/EmployeeLayout';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAssignedOrders();
      setOrders(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNotes('');
    setStatusModalVisible(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleQuickAction = async (order, status) => {
    try {
      setLoading(true);
      await orderAPI.updateOrderStatus(order.id, { status, notes: `Quick action: ${status}` });
      message.success(`Order marked as ${status.replace('-', ' ')}`);
      fetchAssignedOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const submitStatusUpdate = async () => {
    try {
      setLoading(true);
      await orderAPI.updateOrderStatus(selectedOrder.id, { 
        status: newStatus,
        notes: statusNotes 
      });
      message.success('Order status updated successfully');
      setStatusModalVisible(false);
      setStatusNotes('');
      fetchAssignedOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'in-progress': 'blue',
      'ready': 'cyan',
      'completed': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Service',
      dataIndex: 'cleaning_type',
      key: 'cleaning_type',
    },
    {
      title: 'Service Time',
      dataIndex: 'service_time',
      key: 'service_time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Ready', value: 'ready' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <span style={{ fontWeight: 'bold' }}>LKR {parseFloat(amount).toFixed(0)}</span>
    },
    {
      title: 'Pickup Date',
      dataIndex: 'pickup_date',
      key: 'pickup_date',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
      sorter: (a, b) => new Date(a.delivery_date) - new Date(b.delivery_date)
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 280,
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
          {record.status === 'pending' && (
            <Tooltip title="Start Work">
              <Button
                size="small"
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => handleQuickAction(record, 'in-progress')}
                disabled={loading}
              >
                Start
              </Button>
            </Tooltip>
          )}
          {record.status === 'in-progress' && (
            <Tooltip title="Mark Ready">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleQuickAction(record, 'ready')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                disabled={loading}
              >
                Ready
              </Button>
            </Tooltip>
          )}
          <Button
            size="small"
            type="default"
            onClick={() => handleUpdateStatus(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            Update
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
            <ShoppingOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Assigned Orders
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            View and update status of laundry orders assigned to you
          </p>
        </Card>

        <Card
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 15 }}
          />
        </Card>

        {/* Status Update Modal */}
        <Modal
          title="Update Order Status"
          open={statusModalVisible}
          onOk={submitStatusUpdate}
          onCancel={() => {
            setStatusModalVisible(false);
            setStatusNotes('');
          }}
          confirmLoading={loading}
          okText="Update Status"
          width={500}
        >
          {selectedOrder && (
            <div>
              <p style={{ marginBottom: 16 }}>
                <strong>Order:</strong> {selectedOrder.order_number} - {selectedOrder.customer_name}
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>New Status</label>
                <Select
                  value={newStatus}
                  onChange={setNewStatus}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="in-progress">In Progress</Select.Option>
                  <Select.Option value="ready">Ready for Delivery</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                </Select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Notes (Optional)</label>
                <TextArea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this status update..."
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Order Details Modal */}
        <Modal
          title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Order Details</span>}
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </Button>,
            selectedOrder && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
              <Button 
                key="update" 
                type="primary"
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleUpdateStatus(selectedOrder);
                }}
              >
                Update Status
              </Button>
            )
          ]}
          width={700}
        >
          {selectedOrder && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Number" span={2}>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  {selectedOrder.order_number}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.customer_phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cleaning Type">
                {selectedOrder.cleaning_type}
              </Descriptions.Item>
              <Descriptions.Item label="Service Time">
                {selectedOrder.service_time}
              </Descriptions.Item>
              <Descriptions.Item label="Items" span={2}>
                {selectedOrder.item_description}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selectedOrder.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {selectedOrder.weight_kg} kg
              </Descriptions.Item>
              <Descriptions.Item label="Pickup Date">
                {dayjs(selectedOrder.pickup_date).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Date">
                {dayjs(selectedOrder.delivery_date).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                  LKR {parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={getStatusColor(selectedOrder.status)} style={{ fontSize: '14px' }}>
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {selectedOrder.pickup_address && (
                <Descriptions.Item label="Pickup Address" span={2}>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px' }}>
                    {selectedOrder.pickup_address}
                  </div>
                </Descriptions.Item>
              )}
              {selectedOrder.delivery_address && (
                <Descriptions.Item label="Delivery Address" span={2}>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                    {selectedOrder.delivery_address}
                  </div>
                </Descriptions.Item>
              )}
              {selectedOrder.special_instructions && (
                <Descriptions.Item label="Special Instructions" span={2}>
                  {selectedOrder.special_instructions}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </EmployeeLayout>
  );
};

export default AssignedOrders;
