import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { DashboardOutlined, ShoppingOutlined, RetweetOutlined, CheckCircleOutlined, ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderAPI, rentalAPI } from '../../services/apiService';
import EmployeeLayout from '../../components/EmployeeLayout';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    assignedOrders: 0,
    pendingReturns: 0,
    completedToday: 0,
    inProgress: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned orders
      const ordersResponse = await orderAPI.getAssignedOrders();
      const orders = ordersResponse?.data?.data || [];
      
      // Fetch active rentals for returns
      const rentalsResponse = await rentalAPI.getAllRentals({ status: 'active' });
      const rentals = rentalsResponse?.data?.data || [];

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const completedToday = orders.filter(o => 
        o.status === 'completed' && 
        o.updated_at && 
        o.updated_at.split('T')[0] === today
      ).length;

      const inProgress = orders.filter(o => o.status === 'in-progress').length;

      setStats({
        assignedOrders: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
        pendingReturns: rentals.length,
        completedToday,
        inProgress
      });

      // Set recent orders (limit 5)
      setRecentOrders(orders.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <span className="font-mono text-xs">{text}</span>
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          'in-progress': 'blue',
          ready: 'green',
          completed: 'default',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Deadline',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
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
            <DashboardOutlined style={{ marginRight: 12, color: '#667eea' }} />
            Employee Dashboard
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            Monitor your assigned tasks and performance
          </p>
        </Card>
        
        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Assigned Orders"
                value={stats.assignedOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Pending Returns"
                value={stats.pendingReturns}
                prefix={<RetweetOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <Statistic
                title="Completed Today"
                value={stats.completedToday}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Orders Table */}
        <Card 
          title="Recent Assigned Orders" 
          extra={<Link to="/employee/assigned-orders" style={{ color: '#1890ff' }}>View All</Link>}
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}
        >
          <Table
            columns={columns}
            dataSource={recentOrders}
            loading={loading}
            rowKey="id"
            pagination={false}
          />
        </Card>

        {/* Quick Actions */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Link to="/employee/assigned-orders">
              <Card
                hoverable
                style={{ 
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <ShoppingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '8px 0' }}>Manage Orders</h3>
                  <p style={{ color: '#666', margin: 0 }}>Update order status and view details</p>
                </div>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={12}>
            <Link to="/employee/manage-returns">
              <Card
                hoverable
                style={{ 
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <RetweetOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '8px 0' }}>Process Returns</h3>
                  <p style={{ color: '#666', margin: 0 }}>Assess condition and process refunds</p>
                </div>
              </Card>
            </Link>
          </Col>
        </Row>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
