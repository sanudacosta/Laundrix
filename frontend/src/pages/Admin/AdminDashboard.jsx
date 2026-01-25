import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Spin } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, rentalAPI } from '../../services/apiService';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ color: 'white', padding: '16px', fontSize: '20px', fontWeight: 'bold' }}>
          Laundrix Admin
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/admin/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ShoppingOutlined />}>
            <Link to="/admin/orders">Orders</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<ShoppingOutlined />}>
            <Link to="/admin/rentals">Rentals</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<ShoppingOutlined />}>
            <Link to="/admin/inventory">Inventory</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<DollarOutlined />}>
            <Link to="/admin/payments">Payments</Link>
          </Menu.Item>
          <Menu.Item key="7" icon={<FileTextOutlined />}>
            <Link to="/admin/reports">Reports</Link>
          </Menu.Item>
          <Menu.Item key="8" icon={<SettingOutlined />}>
            <Link to="/admin/settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Admin Dashboard</h2>
          <div>
            <span style={{ marginRight: 16, color: '#666' }}>Welcome, <strong>{user?.full_name}</strong></span>
            <button 
              onClick={logout} 
              style={{ 
                padding: '8px 20px', 
                background: '#ff4d4f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" tip="Loading dashboard data..." />
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1a1a1a' }}>
                Dashboard Overview
              </h1>
              
              {/* Statistics Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card hoverable>
                    <Statistic
                      title="Total Orders"
                      value={stats.totalOrders}
                      prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card hoverable>
                    <Statistic
                      title="Total Rentals"
                      value={stats.totalRentals}
                      prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card hoverable>
                    <Statistic
                      title="Total Revenue"
                      value={stats.totalRevenue}
                      prefix="LKR"
                      valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                      suffix={<ArrowUpOutlined style={{ fontSize: '14px' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card hoverable>
                    <Statistic
                      title="Total Customers"
                      value={stats.totalCustomers}
                      prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                      valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Quick Actions */}
              <Card 
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Quick Actions</span>}
                style={{ marginBottom: '24px' }}
              >
                <Row gutter={[16, 16]}>
                  <Col>
                    <Link to="/admin/orders">
                      <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                        View All Orders
                      </Button>
                    </Link>
                  </Col>
                  <Col>
                    <Link to="/admin/rentals">
                      <Button type="primary" size="large" icon={<ShoppingCartOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                        View All Rentals
                      </Button>
                    </Link>
                  </Col>
                  <Col>
                    <Link to="/admin/users">
                      <Button size="large" icon={<UserOutlined />}>
                        Manage Users
                      </Button>
                    </Link>
                  </Col>
                  <Col>
                    <Link to="/admin/reports">
                      <Button size="large" icon={<FileTextOutlined />}>
                        Generate Reports
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card>

              {/* Recent Orders */}
              <Card 
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Laundry Orders</span>}
                extra={<Link to="/admin/orders">View All</Link>}
                style={{ marginBottom: '24px' }}
              >
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
                title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Suit Rentals</span>}
                extra={<Link to="/admin/rentals">View All</Link>}
              >
                <Table 
                  columns={rentalColumns} 
                  dataSource={recentRentals} 
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'No rentals yet' }}
                />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
