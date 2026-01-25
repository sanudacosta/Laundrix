import React, { useState, useEffect } from 'react';
import { 
  Layout, 
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
import dayjs from 'dayjs';

const { Content } = Layout;
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

  // Mock data for charts (replace with actual API data)
  const revenueChartData = [
    { month: 'Jan', orders: 45000, rentals: 98000, total: 143000 },
    { month: 'Feb', orders: 52000, rentals: 112000, total: 164000 },
    { month: 'Mar', orders: 48000, rentals: 105000, total: 153000 },
    { month: 'Apr', orders: 61000, rentals: 125000, total: 186000 },
    { month: 'May', orders: 55000, rentals: 118000, total: 173000 },
    { month: 'Jun', orders: 67000, rentals: 142000, total: 209000 },
  ];

  const categoryData = [
    { name: 'Wedding Suits', value: 35, count: 42 },
    { name: 'Business Suits', value: 28, count: 34 },
    { name: 'Formal Wear', value: 22, count: 26 },
    { name: 'Casual', value: 15, count: 18 },
  ];

  const topSuits = [
    { rank: 1, name: 'Armani Tuxedo', rentals: 45, revenue: 135000 },
    { rank: 2, name: 'Hugo Boss Navy', rentals: 38, revenue: 106400 },
    { rank: 3, name: 'Tom Ford White', rentals: 32, revenue: 96000 },
    { rank: 4, name: 'Ralph Lauren Black', rentals: 28, revenue: 81200 },
    { rank: 5, name: 'Burberry Check', rentals: 24, revenue: 62400 },
  ];

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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>
            <FileTextOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Reports & Analytics
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Revenue reports, inventory analytics, and performance metrics
          </p>
        </div>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={352000}
                prefix="LKR"
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                suffix={<RiseOutlined />}
              />
              <div style={{ fontSize: '12px', color: '#52c41a', marginTop: 8 }}>
                +12.5% from last month
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Laundry Orders"
                value={128}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: '12px', color: '#1890ff', marginTop: 8 }}>
                +8.2% from last month
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Suit Rentals"
                value={67}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: '12px', color: '#722ed1', marginTop: 8 }}>
                +15.3% from last month
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Order Value"
                value={2750}
                prefix="LKR"
                valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: '12px', color: '#faad14', marginTop: 8 }}>
                +3.1% from last month
              </div>
            </Card>
          </Col>
        </Row>

        {/* Revenue Chart */}
        <Card 
          title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Revenue Trends</span>}
          style={{ marginBottom: 24 }}
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
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Rental by Category</span>}
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
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Top Performing Suits</span>}
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
      </Content>
    </Layout>
  );
};

export default ReportsPage;
