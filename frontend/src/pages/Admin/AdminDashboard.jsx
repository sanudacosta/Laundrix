import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Select, Spin } from 'antd';
import { 
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderAPI, rentalAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import CountUp from 'react-countup';

const { Option } = Select;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRentals: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    ordersTrend: 0,
    rentalsTrend: 0,
    revenueTrend: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRentals, setRecentRentals] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const ordersRes = await orderAPI.getAllOrders();
      const orders = ordersRes?.data?.data || [];
      
      const rentalsRes = await rentalAPI.getAllRentals();
      const rentals = rentalsRes?.data?.data || [];
      
      const totalOrders = orders.length;
      const totalRentals = rentals.length;
      const totalRevenue = [
        ...orders.map(o => parseFloat(o.total_amount || 0)),
        ...rentals.map(r => parseFloat(r.total_amount || 0))
      ].reduce((sum, val) => sum + val, 0);
      
      const customerIds = new Set([
        ...orders.map(o => o.customer_id),
        ...rentals.map(r => r.customer_id)
      ]);

      const daysAgo = timeFilter === 'today' ? 1 : timeFilter === 'week' ? 7 : 30;
      const cutoffDate = subDays(new Date(), daysAgo);
      const recentOrders = orders.filter(o => o.created_at && new Date(o.created_at) >= cutoffDate);
      const recentRentals = rentals.filter(r => r.created_at && new Date(r.created_at) >= cutoffDate);
      
      const ordersTrend = totalOrders > 0 ? ((recentOrders.length / totalOrders) * 100) : 0;
      const rentalsTrend = totalRentals > 0 ? ((recentRentals.length / totalRentals) * 100) : 0;
      const recentRevenue = [
        ...recentOrders.map(o => parseFloat(o.total_amount || 0)),
        ...recentRentals.map(r => parseFloat(r.total_amount || 0))
      ].reduce((sum, val) => sum + val, 0);
      const revenueTrend = totalRevenue > 0 ? ((recentRevenue / totalRevenue) * 100) : 0;

      // Calculate real metrics
      const completedOrders = orders.filter(o => o.status === 'completed');
      let avgProcessingHours = 0;
      if (completedOrders.length > 0) {
        const totalHours = completedOrders.reduce((sum, order) => {
          if (order.created_at && order.updated_at) {
            const created = new Date(order.created_at);
            const completed = new Date(order.updated_at);
            const hours = (completed - created) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0);
        avgProcessingHours = Math.round(totalHours / completedOrders.length);
      }

      // Calculate on-time delivery rate
      let onTimeRate = 0;
      const deliveredOrders = orders.filter(o => o.status === 'completed' && o.delivery_date && o.updated_at);
      if (deliveredOrders.length > 0) {
        const onTimeCount = deliveredOrders.filter(o => {
          const deliveryDate = new Date(o.delivery_date);
          const completedDate = new Date(o.updated_at);
          return completedDate <= deliveryDate;
        }).length;
        onTimeRate = Math.round((onTimeCount / deliveredOrders.length) * 100);
      }

      setStats({
        totalOrders,
        totalRentals,
        totalRevenue: totalRevenue.toFixed(2),
        totalCustomers: customerIds.size,
        ordersTrend: ordersTrend.toFixed(1),
        rentalsTrend: rentalsTrend.toFixed(1),
        revenueTrend: revenueTrend.toFixed(1),
        avgProcessingHours,
        onTimeRate
      });
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(dateStr));
        const dayRentals = rentals.filter(r => r.created_at && r.created_at.startsWith(dateStr));
        const dayRevenue = [
          ...dayOrders.map(o => parseFloat(o.total_amount || 0)),
          ...dayRentals.map(r => parseFloat(r.total_amount || 0))
        ].reduce((sum, val) => sum + val, 0);

        return {
          date: format(date, 'MMM dd'),
          orders: dayOrders.length,
          rentals: dayRentals.length,
          revenue: dayRevenue
        };
      });
      setChartData(last7Days);

      const statusCount = {
        pending: orders.filter(o => o.status === 'pending').length,
        'in-progress': orders.filter(o => o.status === 'in-progress').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length
      };
      const statusData = Object.entries(statusCount)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name: name.replace('-', ' ').toUpperCase(), value }));
      setStatusDistribution(statusData);
      
      setRecentOrders(orders.slice(0, 5));
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
      render: (text) => <span style={{ fontWeight: '600', color: '#667eea', fontSize: '13px' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
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
      render: (amount) => <span style={{ fontWeight: '600' }}>LKR {parseFloat(amount).toLocaleString()}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)} style={{ fontWeight: '500' }}>{status.toUpperCase()}</Tag>
    }
  ];

  const rentalColumns = [
    {
      title: 'Rental #',
      dataIndex: 'rental_number',
      key: 'rental_number',
      render: (text) => <span style={{ fontWeight: '600', color: '#10b981', fontSize: '13px' }}>{text}</span>
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
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
      render: (amount) => <span style={{ fontWeight: '600' }}>LKR {parseFloat(amount).toLocaleString()}</span>
    },
    {
      title: 'Status',
      dataIndex: 'rental_status',
      key: 'rental_status',
      render: (status) => <Tag color={getStatusColor(status)} style={{ fontWeight: '500' }}>{status.toUpperCase()}</Tag>
    }
  ];

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  const StatCard = ({ title, value, icon, trend, color, prefix = '' }) => (
    <Card
      hoverable
      style={{
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        background: 'white',
        transition: 'all 0.3s ease'
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#64748b', 
            marginBottom: '12px',
            fontWeight: '500',
            textTransform: 'uppercase'
          }}>
            {title}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px', lineHeight: '1' }}>
            {prefix}
            <CountUp end={parseFloat(value)} duration={2} separator="," decimals={0} />
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {parseFloat(trend) >= 0 ? (
                <ArrowUpOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#ef4444', fontSize: '14px' }} />
              )}
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: parseFloat(trend) >= 0 ? '#10b981' : '#ef4444'
              }}>
                {Math.abs(trend)}% vs prev
              </span>
            </div>
          )}
        </div>
        <div style={{ 
          background: `${color}15`, 
          padding: '14px', 
          borderRadius: '12px'
        }}>
          {React.cloneElement(icon, { style: { fontSize: '28px', color } })}
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '500px',
          gap: '16px'
        }}>
          <Spin size="large" />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading dashboard...</p>
        </div>
      ) : (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                marginBottom: '4px', 
                color: '#0f172a'
              }}>
                Dashboard Overview
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '14px', 
                margin: 0
              }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Select
              value={timeFilter}
              onChange={setTimeFilter}
              style={{ width: 160 }}
              size="large"
            >
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
            </Select>
          </div>
          
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingCartOutlined />}
                trend={stats.ordersTrend}
                color="#667eea"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Rentals"
                value={stats.totalRentals}
                icon={<ShoppingOutlined />}
                trend={stats.rentalsTrend}
                color="#10b981"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Revenue"
                value={parseFloat(stats.totalRevenue).toFixed(0)}
                icon={<DollarOutlined />}
                trend={stats.revenueTrend}
                color="#f59e0b"
                prefix="LKR "
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={<TeamOutlined />}
                color="#8b5cf6"
              />
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} lg={16}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Revenue & Orders Trend</span>}
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Revenue (LKR)"
                    />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Order Status</span>}
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card 
            style={{
              marginBottom: '32px',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#0f172a' }}>
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
                      height: '56px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: '#667eea',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    Manage Orders
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
                      height: '56px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: '#10b981',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Manage Rentals
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
                      height: '56px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: '2px solid #e2e8f0',
                      color: '#0f172a',
                      background: 'white'
                    }}
                  >
                    User Management
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/admin/reports">
                  <Button 
                    size="large" 
                    block
                    style={{
                      height: '56px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: '2px solid #e2e8f0',
                      color: '#0f172a',
                      background: 'white'
                    }}
                  >
                    Analytics & Reports
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>

          <Card
            style={{
              marginBottom: '32px',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            styles={{ body: { padding: '24px' } }}
          >
            <Row gutter={[24, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{stats.avgProcessingHours || 0}h</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Avg Processing Time</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{stats.onTimeRate || 0}%</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>On-Time Delivery</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{stats.totalCustomers}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Active Customers</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <ShoppingOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{stats.totalOrders + stats.totalRentals}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Transactions</div>
                </div>
              </Col>
            </Row>
          </Card>

          <Row gutter={[24, 24]}>
            <Col xs={24} xl={12}>
              <Card 
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>
                    Recent Laundry Orders
                  </h3>
                  <Link to="/admin/orders" style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
                    View All →
                  </Link>
                </div>
                <Table 
                  columns={orderColumns} 
                  dataSource={recentOrders} 
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'No orders yet' }}
                  size="middle"
                />
              </Card>
            </Col>

            <Col xs={24} xl={12}>
              <Card 
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#0f172a' }}>
                    Recent Suit Rentals
                  </h3>
                  <Link to="/admin/rentals" style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
                    View All →
                  </Link>
                </div>
                <Table 
                  columns={rentalColumns} 
                  dataSource={recentRentals} 
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'No rentals yet' }}
                  size="middle"
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
