import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Spin } from 'antd';
import { 
  ArrowUpOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderAPI, rentalAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRentals: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await orderAPI.getAllOrders();
      const orders = ordersRes?.data?.data || [];
      
      // Fetch rentals
      const rentalsRes = await rentalAPI.getAllRentals();
      const rentals = rentalsRes?.data?.data || [];
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalRentals = rentals.length;
      const totalRevenue = [
        ...orders.map(o => parseFloat(o.total_amount || 0)),
        ...rentals.map(r => parseFloat(r.total_amount || 0))
      ].reduce((sum, val) => sum + val, 0);
      
      // Get unique customers
      const customerIds = new Set([
        ...orders.map(o => o.customer_id),
        ...rentals.map(r => r.customer_id)
      ]);
      
      setStats({
        totalOrders,
        totalRentals,
        totalRevenue: totalRevenue.toFixed(2),
        totalCustomers: customerIds.size
      });
      
      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
      // Get recent rentals (last 5)
      setRecentRentals(rentals.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      'cancelled': 'red',
      'reserved': 'purple',
      'active': 'blue',
      'returned': 'green',
      'overdue': 'red'
    };
    return colors[status] || 'default';
  };

  const orderColumns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name'
    },
    {
      title: 'Service',
      dataIndex: 'cleaning_type',
      key: 'cleaning_type'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `LKR ${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    }
  ];

  const rentalColumns = [
    {
      title: 'Rental #',
      dataIndex: 'rental_number',
      key: 'rental_number',
      render: (text) => <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name'
    },
    {
      title: 'Suit',
      key: 'suit',
      render: (_, record) => `${record.suit_brand || 'N/A'} - ${record.suit_color || 'N/A'}`
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `LKR ${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'rental_status',
      key: 'rental_status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    }
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          gap: '16px'
        }}>
          <Spin size="large" />
          <p style={{ color: '#666', fontSize: '14px' }}>Loading dashboard data...</p>
        </div>
      ) : (
        <div style={{ padding: '24px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '8px', 
            color: '#1a1a2e',
            letterSpacing: '-0.5px'
          }}>
            Dashboard Overview
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '15px', 
            marginBottom: '32px',
            fontWeight: '400'
          }}>
            Welcome back! Here's what's happening with your business today.
          </p>
          
          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Orders</div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.totalOrders}</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '12px', 
                    borderRadius: '12px' 
                  }}>
                    <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Rentals</div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.totalRentals}</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '12px', 
                    borderRadius: '12px' 
                  }}>
                    <ShoppingOutlined style={{ fontSize: '24px' }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
                    <div style={{ fontSize: '28px', fontWeight: '700' }}>
                      LKR {parseFloat(stats.totalRevenue).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '12px', 
                    borderRadius: '12px' 
                  }}>
                    <ArrowUpOutlined style={{ fontSize: '24px' }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Customers</div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.totalCustomers}</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '12px', 
                    borderRadius: '12px' 
                  }}>
                    <TeamOutlined style={{ fontSize: '24px' }} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Card 
            style={{
              marginBottom: '24px',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: '#1a1a2e'
            }}>
              Quick Actions
            </h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Link to="/admin/orders">
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    icon={<ShoppingOutlined />}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    View Orders
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/admin/rentals">
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    icon={<ShoppingCartOutlined />}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      border: 'none'
                    }}
                  >
                    View Rentals
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/admin/users">
                  <Button 
                    size="large" 
                    block
                    icon={<TeamOutlined />}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      border: '2px solid #e3e8ef',
                      color: '#1a1a2e'
                    }}
                  >
                    Manage Users
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/admin/reports">
                  <Button 
                    size="large" 
                    block
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      border: '2px solid #e3e8ef',
                      color: '#1a1a2e'
                    }}
                  >
                    View Reports
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>

          {/* Recent Orders */}
          <Card 
            style={{
              marginBottom: '24px',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                margin: 0,
                color: '#1a1a2e'
              }}>
                Recent Laundry Orders
              </h3>
              <Link to="/admin/orders" style={{ color: '#667eea', fontWeight: '500' }}>
                View All →
              </Link>
            </div>
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders} 
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No orders yet' }}
            />
          </Card>

          {/* Recent Rentals */}
          <Card 
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                margin: 0,
                color: '#1a1a2e'
              }}>
                Recent Suit Rentals
              </h3>
              <Link to="/admin/rentals" style={{ color: '#667eea', fontWeight: '500' }}>
                View All →
              </Link>
            </div>
            <Table 
              columns={rentalColumns} 
              dataSource={recentRentals} 
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No rentals yet' }}
            />
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
