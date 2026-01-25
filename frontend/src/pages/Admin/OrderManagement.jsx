import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  message,
  DatePicker,
  Descriptions,
  Badge,
  Tooltip
} from 'antd';
import { 
  ShoppingOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { orderAPI, adminAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      setOrders(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch orders');
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
    setSelectedOrder(record);
    setIsDetailVisible(true);
  };

  const handleUpdateStatus = (record) => {
    setSelectedOrder(record);
    statusForm.setFieldsValue({ status: record.status });
    setIsStatusModalVisible(true);
  };

  const handleAssignOrder = (record) => {
    setSelectedOrder(record);
    assignForm.setFieldsValue({ 
      employee_id: record.assigned_employee_id 
    });
    setIsAssignModalVisible(true);
  };

  const submitStatusUpdate = async (values) => {
    try {
      await orderAPI.updateOrderStatus(selectedOrder.id, values);
      message.success('Order status updated successfully');
      setIsStatusModalVisible(false);
      statusForm.resetFields();
      fetchOrders();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const submitAssignment = async (values) => {
    try {
      await orderAPI.assignOrder(selectedOrder.id, values);
      message.success('Order assigned successfully');
      setIsAssignModalVisible(true);
      assignForm.resetFields();
      fetchOrders();
    } catch (error) {
      message.error('Failed to assign order');
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'paid': 'green',
      'failed': 'red',
      'refunded': 'purple'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      fixed: 'left',
      width: 130,
      render: (text) => <span style={{ fontWeight: '600', color: '#667eea', fontSize: '14px' }}>{text}</span>
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
      title: 'Items',
      dataIndex: 'item_description',
      key: 'item_description',
      width: 180,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontSize: '13px', color: '#666' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Service',
      dataIndex: 'cleaning_type',
      key: 'cleaning_type',
      width: 120,
      ellipsis: true,
      render: (text) => <span style={{ fontSize: '13px' }}>{text}</span>
    },
    {
      title: 'Pickup',
      dataIndex: 'pickup_date',
      key: 'pickup_date',
      width: 100,
      responsive: ['md'],
      render: (date) => <span style={{ fontSize: '13px' }}>{dayjs(date).format('MMM DD')}</span>
    },
    {
      title: 'Delivery',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      width: 100,
      responsive: ['md'],
      render: (date) => <span style={{ fontSize: '13px' }}>{dayjs(date).format('MMM DD')}</span>
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
      dataIndex: 'status',
      key: 'status',
      width: 110,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Ready', value: 'ready' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500, fontSize: '12px' }}>
          {status.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 95,
      responsive: ['lg'],
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Paid', value: 'paid' },
      ],
      onFilter: (value, record) => record.payment_status === value,
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)} style={{ fontSize: '12px' }}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: '#667eea' }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button 
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleUpdateStatus(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Assign Employee">
            <Button 
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleAssignOrder(record)}
              style={{ color: '#52c41a' }}
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
              <ShoppingOutlined style={{ marginRight: 12, color: '#667eea' }} />
              Order Management
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '15px' }}>
              View and manage all laundry orders
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`,
              responsive: true
            }}
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Order Details
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
                {selectedOrder.customer_phone}
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
              <Descriptions.Item label="Subtotal">
                LKR {parseFloat(selectedOrder.subtotal).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Tax">
                LKR {parseFloat(selectedOrder.tax).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                  LKR {parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={getPaymentStatusColor(selectedOrder.payment_status)}>
                  {selectedOrder.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned Employee" span={2}>
                {selectedOrder.assigned_employee_name || 'Not Assigned'}
              </Descriptions.Item>
              {selectedOrder.special_instructions && (
                <Descriptions.Item label="Special Instructions" span={2}>
                  {selectedOrder.special_instructions}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          title="Update Order Status"
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
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select size="large" placeholder="Select new status">
                <Option value="pending">Pending</Option>
                <Option value="in-progress">In Progress</Option>
                <Option value="ready">Ready</Option>
                <Option value="completed">Completed</Option>
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

        {/* Assign Order Modal */}
        <Modal
          title="Assign Order to Employee"
          open={isAssignModalVisible}
          onCancel={() => {
            setIsAssignModalVisible(false);
            assignForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={assignForm}
            layout="vertical"
            onFinish={submitAssignment}
          >
            <Form.Item
              label="Assign to Employee"
              name="employee_id"
              rules={[{ required: true, message: 'Please select an employee' }]}
            >
              <Select size="large" placeholder="Select employee">
                {employees.map(emp => (
                  <Option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsAssignModalVisible(false);
                  assignForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Assign Order
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
