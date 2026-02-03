import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Select, message } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { orderAPI } from '../../services/apiService';
import EmployeeLayout from '../../components/EmployeeLayout';
import dayjs from 'dayjs';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

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
    setStatusModalVisible(true);
  };

  const submitStatusUpdate = async () => {
    try {
      setLoading(true);
      await orderAPI.updateOrderStatus(selectedOrder.id, { status: newStatus });
      message.success('Order status updated successfully');
      setStatusModalVisible(false);
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
      dataIndex: 'cleaning_type_name',
      key: 'cleaning_type_name',
    },
    {
      title: 'Service Time',
      dataIndex: 'service_time_name',
      key: 'service_time_name',
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
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleUpdateStatus(record)}
          disabled={record.status === 'completed' || record.status === 'cancelled'}
        >
          Update Status
        </Button>
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
            pagination={{ pageSize: 15 }}
          />
        </Card>

        {/* Status Update Modal */}
        <Modal
          title="Update Order Status"
          open={statusModalVisible}
          onOk={submitStatusUpdate}
          onCancel={() => setStatusModalVisible(false)}
          confirmLoading={loading}
        >
          {selectedOrder && (
            <div>
              <p className="mb-4">
                <strong>Order:</strong> {selectedOrder.order_number} - {selectedOrder.customer_name}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">New Status</label>
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
            </div>
          )}
        </Modal>
      </div>
    </EmployeeLayout>
  );
};

export default AssignedOrders;
