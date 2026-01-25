import React, { useState, useEffect } from 'react';
import { 
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Space,
  Table,
  Tag,
  message
} from 'antd';
import { 
  FileTextOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { reportAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueReport();
    fetchInventoryReport();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await reportAPI.getDashboardStats();
      setDashboardStats(response?.data?.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      const params = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD')
      };
      const response = await reportAPI.getRevenueReport(params);
      setRevenueData(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch revenue report');
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const response = await reportAPI.getInventoryReport();
      setInventoryData(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch inventory report');
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      fetchRevenueReport();
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Process revenue data for charts
  const revenueChartData = revenueData?.details?.reduce((acc, item) => {
    const existing = acc.find(x => x.period === item.period);
    if (existing) {
      if (item.payment_type === 'laundry') existing.orders = item.total_amount;
      if (item.payment_type === 'rental') existing.rentals = item.total_amount;
    } else {
      acc.push({
        month: item.period,
        orders: item.payment_type === 'laundry' ? item.total_amount : 0,
        rentals: item.payment_type === 'rental' ? item.total_amount : 0,
      });
    }
    return acc;
  }, []) || [];

  // Process inventory data for category distribution
  const categoryData = inventoryData?.categories?.map(cat => ({
    name: cat.category,
    value: cat.available_units || 0,
    count: cat.total_units || 0
  })) || [];

  // Process top performing suits
  const topSuits = inventoryData?.fastMoving?.map((suit, index) => ({
    rank: index + 1,
    name: `${suit.brand} ${suit.name} (${suit.color})`,
    rentals: suit.total_rentals || 0,
    revenue: suit.total_rentals * 3000 || 0 // Estimate
  })) || [];

  const topSuitsColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (rank) => (
        <Tag color={rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? '#cd7f32' : 'blue'}>
          #{rank}
        </Tag>
      )
    },
    {
      title: 'Suit Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Total Rentals',
      dataIndex: 'rentals',
      key: 'rentals',
      width: 120,
      render: (count) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{count}</span>
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 150,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>LKR {amount.toLocaleString()}</span>
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
            <FileTextOutlined style={{ marginRight: 12, color: '#667eea' }} />
            Reports & Analytics
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '15px' }}>
            Revenue reports, inventory analytics, and performance metrics
          </p>
        </div>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Statistic
                title="Total Revenue"
                value={dashboardStats?.revenue?.total || 0}
                prefix="LKR"
                valueStyle={{ color: '#52c41a', fontWeight: '700', fontSize: '28px' }}
                suffix={<RiseOutlined />}
              />
              <div style={{ fontSize: '13px', color: '#52c41a', marginTop: 8, fontWeight: '500' }}>
                Monthly: LKR {dashboardStats?.revenue?.monthly?.toLocaleString() || 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Statistic
                title="Total Orders"
                value={dashboardStats?.counts?.orders || 0}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#667eea', fontWeight: '700', fontSize: '28px' }}
              />
              <div style={{ fontSize: '13px', color: '#667eea', marginTop: 8, fontWeight: '500' }}>
                Active: {dashboardStats?.counts?.activeOrders || 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Statistic
                title="Total Rentals"
                value={dashboardStats?.counts?.rentals || 0}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#f093fb', fontWeight: '700', fontSize: '28px' }}
              />
              <div style={{ fontSize: '13px', color: '#f093fb', marginTop: 8, fontWeight: '500' }}>
                Active: {dashboardStats?.counts?.activeRentals || 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Statistic
                title="Total Customers"
                value={dashboardStats?.counts?.customers || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#fa709a', fontWeight: '700', fontSize: '28px' }}
              />
              <div style={{ fontSize: '13px', color: '#fa709a', marginTop: 8, fontWeight: '500' }}>
                Employees: {dashboardStats?.counts?.employees || 0}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Revenue Chart */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Revenue Trends</span>}
          style={{ 
            marginBottom: 24,
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          styles={{ body: { padding: '24px' } }}
          extra={
            <Space>
              <Select defaultValue="6months" style={{ width: 150 }}>
                <Option value="7days">Last 7 Days</Option>
                <Option value="30days">Last 30 Days</Option>
                <Option value="6months">Last 6 Months</Option>
                <Option value="1year">Last Year</Option>
              </Select>
            </Space>
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `LKR ${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#1890ff" name="Laundry Orders" />
              <Bar dataKey="rentals" fill="#52c41a" name="Suit Rentals" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Category Distribution */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Rental by Category</span>}
              style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} rentals`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Top Performing Suits */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Top Performing Suits</span>}
              style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Table
                columns={topSuitsColumns}
                dataSource={topSuits}
                rowKey="rank"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
