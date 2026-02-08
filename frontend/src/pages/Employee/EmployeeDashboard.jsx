import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Spin, Progress } from 'antd';
import { 
  ShoppingOutlined, 
  RetweetOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { orderAPI, rentalAPI } from '../../services/apiService';
import EmployeeLayout from '../../components/EmployeeLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isToday } from 'date-fns';
import CountUp from 'react-countup';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    assignedOrders: 0,
    pendingReturns: 0,
    completedToday: 0,
    inProgress: 0,
    completionRate: 0,
    avgProcessingTime: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const ordersResponse = await orderAPI.getAssignedOrders();
      const orders = ordersResponse?.data?.data || [];
      
      const rentalsResponse = await rentalAPI.getAllRentals({ status: 'active,reserved' });
      const rentals = rentalsResponse?.data?.data || [];

      const today = new Date();
      const completedToday = orders.filter(o => 
        o.status === 'completed' && 
        o.updated_at && 
        isToday(new Date(o.updated_at))
      ).length;

      const inProgress = orders.filter(o => o.status === 'in-progress').length;
      const assignedOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
      
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const completionRate = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(0) : 0;

      // Calculate real avg processing time for employee
      let avgProcessingHours = 0;
      const empCompletedOrders = orders.filter(o => o.status === 'completed');
      if (empCompletedOrders.length > 0) {
        const totalHours = empCompletedOrders.reduce((sum, order) => {
          if (order.created_at && order.updated_at) {
            const created = new Date(order.created_at);
            const completed = new Date(order.updated_at);
            const hours = (completed - created) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0);
        avgProcessingHours = Math.round(totalHours / empCompletedOrders.length);
      }

      setStats({
        assignedOrders,
        pendingReturns: rentals.length,
        completedToday,
        inProgress,
        completionRate,
        avgProcessingTime: avgProcessingHours || 0
      });

      // Prepare weekly completion data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayCompleted = orders.filter(o => 
          o.status === 'completed' && 
          o.updated_at && 
          o.updated_at.startsWith(dateStr)
        ).length;
        const dayInProgress = orders.filter(o => 
          o.status === 'in-progress' && 
          o.created_at && 
          o.created_at.startsWith(dateStr)
        ).length;

        return {
          date: format(date, 'EEE'),
          completed: dayCompleted,
          started: dayInProgress
        };
      });
      setWeeklyData(last7Days);

      // Status distribution
      const statusCount = {
        pending: orders.filter(o => o.status === 'pending').length,
        'in-progress': orders.filter(o => o.status === 'in-progress').length,
        ready: orders.filter(o => o.status === 'ready').length
      };
      const statusChartData = Object.entries(statusCount)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ 
          name: name.replace('-', ' ').toUpperCase(), 
          value 
        }));
      setStatusData(statusChartData);

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
      key: 'cleaning_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          'in-progress': 'blue',
          ready: 'cyan',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status]} style={{ fontWeight: '500' }}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Deadline',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date) => date ? format(new Date(date), 'MMM dd, yyyy') : '-'
    },
  ];

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
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
            <CountUp end={value} duration={2} />
          </div>
          {subtitle && (
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              {trend > 0 ? (
                <ArrowUpOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#ef4444', fontSize: '14px' }} />
              )}
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                color: trend > 0 ? '#10b981' : '#ef4444'
              }}>
                {Math.abs(trend)}% vs yesterday
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
    <EmployeeLayout>
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
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              marginBottom: '4px', 
              color: '#0f172a'
            }}>
              Employee Dashboard
            </h1>
            <p style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              margin: 0
            }}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • Track your tasks and performance
            </p>
          </div>
          
          {/* Stats Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Assigned Orders"
                value={stats.assignedOrders}
                icon={<ShoppingOutlined />}
                color="#667eea"
                subtitle="Active tasks"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={<ClockCircleOutlined />}
                color="#f59e0b"
                subtitle="Currently working"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Pending Returns"
                value={stats.pendingReturns}
                icon={<RetweetOutlined />}
                color="#8b5cf6"
                subtitle="Awaiting processing"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Completed Today"
                value={stats.completedToday}
                icon={<CheckCircleOutlined />}
                color="#10b981"
                trend={12}
              />
            </Col>
          </Row>

          {/* Performance Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Weekly Performance</span>}
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weeklyData}>
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
                    <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
                    <Bar dataKey="started" fill="#667eea" radius={[8, 8, 0, 0]} name="Started" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Task Distribution</span>}
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                styles={{ body: { padding: '24px' } }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                    >
                      {statusData.map((entry, index) => (
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

          {/* Performance Metrics */}
          <Card
            style={{
              marginBottom: '32px',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            styles={{ body: { padding: '28px' } }}
          >
            <Row gutter={[32, 24]} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <TrophyOutlined style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.95 }} />
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completion Rate</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Progress 
                      type="circle" 
                      percent={stats.completionRate} 
                      width={80}
                      strokeColor="#10b981"
                      trailColor="rgba(255,255,255,0.2)"
                      format={percent => <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{percent}%</span>}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <ClockCircleOutlined style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.95 }} />
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Processing</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.avgProcessingTime}h</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <FireOutlined style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.95 }} />
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Goal</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.completedToday}/10</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Recent Orders Table */}
          <Card 
            style={{
              marginBottom: '32px',
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
                Recent Assigned Orders
              </h3>
              <Link to="/employee/assigned-orders" style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
                View All →
              </Link>
            </div>
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No orders assigned yet' }}
              size="middle"
            />
          </Card>

          {/* Quick Actions */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Link to="/employee/assigned-orders">
                <Card
                  hoverable
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                  styles={{ body: { padding: '32px', textAlign: 'center' } }}
                >
                  <ShoppingOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.95 }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '8px 0', color: 'white' }}>Manage Orders</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Update order status and view details</p>
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
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white'
                  }}
                  styles={{ body: { padding: '32px', textAlign: 'center' } }}
                >
                  <RetweetOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.95 }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '8px 0', color: 'white' }}>Process Returns</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Assess condition and process refunds</p>
                </Card>
              </Link>
            </Col>
          </Row>
        </div>
      )}
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
