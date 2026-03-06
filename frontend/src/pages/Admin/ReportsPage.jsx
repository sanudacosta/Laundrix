import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Select, DatePicker, Space, Table, Tag,
  Button, Tabs, message, Progress, Spin
} from 'antd';
import {
  FileTextOutlined, DollarOutlined, ShoppingOutlined, RiseOutlined,
  DownloadOutlined, FileExcelOutlined, BarChartOutlined,
  ReloadOutlined, TeamOutlined, ShopOutlined, CalendarOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { reportAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#667eea', '#f093fb', '#52c41a', '#fa8c16', '#13c2c2', '#eb2f96'];

const downloadCSV = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const StatCard = ({ title, value, prefix, color, sub, icon }) => (
  <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>
          {prefix && <span style={{ fontSize: 14, marginRight: 4 }}>{prefix}</span>}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color }}>
        {icon}
      </div>
    </div>
  </Card>
);

const SCard = ({ title, extra, children, style = {} }) => (
  <Card
    title={<span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{title}</span>}
    extra={extra}
    style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', ...style }}
    styles={{ body: { padding: 20 } }}
  >
    {children}
  </Card>
);

const ReportsPage = () => {
  const [loading, setLoading]             = useState(false);
  const [exporting, setExporting]         = useState({});
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueData, setRevenueData]     = useState({});
  const [orderStats, setOrderStats]       = useState(null);
  const [rentalStats, setRentalStats]     = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [revenueGroupBy, setRevenueGroupBy] = useState('month');
  const [dateRange, setDateRange]           = useState([dayjs().subtract(6, 'month'), dayjs()]);
  const [orderDateRange, setOrderDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [rentalDateRange, setRentalDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(), fetchRevenueReport(),
        fetchOrderStats(), fetchRentalStats(), fetchInventoryReport()
      ]);
    } finally { setLoading(false); }
  };

  const fetchDashboardStats = async () => {
    try { const r = await reportAPI.getDashboardStats(); setDashboardStats(r?.data?.data); } catch {}
  };
  const fetchRevenueReport = async (range = dateRange, groupBy = revenueGroupBy) => {
    try {
      const r = await reportAPI.getRevenueReport({ start_date: range[0].format('YYYY-MM-DD'), end_date: range[1].format('YYYY-MM-DD'), group_by: groupBy });
      setRevenueData(r?.data?.data || {});
    } catch { message.error('Failed to load revenue data'); }
  };
  const fetchOrderStats = async (range = orderDateRange) => {
    try { const r = await reportAPI.getOrderStatistics({ start_date: range[0].format('YYYY-MM-DD'), end_date: range[1].format('YYYY-MM-DD') }); setOrderStats(r?.data?.data); } catch {}
  };
  const fetchRentalStats = async (range = rentalDateRange) => {
    try { const r = await reportAPI.getRentalStatistics({ start_date: range[0].format('YYYY-MM-DD'), end_date: range[1].format('YYYY-MM-DD') }); setRentalStats(r?.data?.data); } catch {}
  };
  const fetchInventoryReport = async () => {
    try { const r = await reportAPI.getInventoryReport(); setInventoryData(r?.data?.data); } catch {}
  };

  const handleExport = async (type, params = {}) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    try {
      let res, filename;
      if (type === 'revenue')   { res = await reportAPI.exportRevenue(params);   filename = `revenue_report_${dayjs().format('YYYY-MM-DD')}.csv`; }
      if (type === 'orders')    { res = await reportAPI.exportOrders(params);     filename = `orders_report_${dayjs().format('YYYY-MM-DD')}.csv`; }
      if (type === 'rentals')   { res = await reportAPI.exportRentals(params);    filename = `rentals_report_${dayjs().format('YYYY-MM-DD')}.csv`; }
      if (type === 'inventory') { res = await reportAPI.exportInventory();        filename = `inventory_report_${dayjs().format('YYYY-MM-DD')}.csv`; }
      downloadCSV(res.data, filename);
      message.success(`${filename} downloaded!`);
    } catch { message.error('Export failed. Please try again.'); }
    finally { setExporting(prev => ({ ...prev, [type]: false })); }
  };

  // ── chart transforms ──
  const revenueChartData = (() => {
    const map = {};
    (revenueData?.details || []).forEach(item => {
      if (!map[item.period]) map[item.period] = { period: item.period, orders: 0, rentals: 0 };
      if (item.payment_type === 'laundry') map[item.period].orders  = Number(item.total_amount);
      if (item.payment_type === 'rental')  map[item.period].rentals = Number(item.total_amount);
    });
    return Object.values(map).sort((a, b) => a.period.localeCompare(b.period));
  })();

  const summary = revenueData?.summary || [];
  const laundryRev = Number(summary.find(s => s.payment_type === 'laundry')?.total || 0);
  const rentalRev  = Number(summary.find(s => s.payment_type === 'rental')?.total  || 0);
  const totalRev   = laundryRev + rentalRev;

  const orderStatusData  = (orderStats?.statusDistribution  || []).map(s => ({ name: s.status,         value: Number(s.count) }));
  const rentalStatusData = (rentalStats?.statusDistribution || []).map(s => ({ name: s.rental_status,  value: Number(s.count) }));
  const categoryData     = (inventoryData?.categories       || []).map(c => ({ name: c.category, available: Number(c.available_units || 0), total: Number(c.total_units || 0) }));

  const ExportBtn = ({ type, label, params }) => (
    <Button
      icon={<FileExcelOutlined />}
      loading={exporting[type]}
      onClick={() => handleExport(type, params)}
      style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
      size="small"
    >
      {label}
    </Button>
  );

  const cleaningTypeColumns = [
    { title: 'Cleaning Type', dataIndex: 'name', key: 'name', render: t => <b>{t}</b> },
    { title: 'Orders', dataIndex: 'count', key: 'count', width: 80, render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Revenue (LKR)', dataIndex: 'revenue', key: 'revenue', width: 140, render: v => <b style={{ color: '#52c41a' }}>LKR {Number(v).toLocaleString()}</b> },
  ];
  const topCustomerColumns = [
    { title: 'Customer', dataIndex: 'full_name', key: 'name', render: t => <b>{t}</b> },
    { title: 'Orders', dataIndex: 'order_count', key: 'orders', width: 80, render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Total Spent', dataIndex: 'total_spent', key: 'spent', width: 140, render: v => <b style={{ color: '#52c41a' }}>LKR {Number(v).toLocaleString()}</b> },
  ];
  const topSuitColumns = [
    { title: '#', key: 'r', width: 45, render: (_, __, i) => <Tag color={i===0?'gold':i===1?'default':i===2?'orange':'blue'}>#{i+1}</Tag> },
    { title: 'Suit', key: 'n', render: (_, r) => <b>{r.brand} {r.name} ({r.color})</b> },
    { title: 'Rentals', dataIndex: 'total_rentals', key: 'tr', width: 90, render: v => <Tag color="purple">{v}</Tag> },
  ];
  const overdueColumns = [
    { title: 'Rental #', dataIndex: 'rental_number', key: 'rn', render: t => <b>{t}</b> },
    { title: 'Customer', dataIndex: 'customer_name', key: 'cn' },
    { title: 'Suit', key: 's', render: (_, r) => `${r.suit_brand} ${r.suit_name}` },
    { title: 'Due Date', dataIndex: 'rental_end_date', key: 'rd', render: d => <Tag color="red">{dayjs(d).format('DD MMM YYYY')}</Tag> },
    { title: 'Overdue', key: 'od', render: (_, r) => <Tag color="volcano">{dayjs().diff(dayjs(r.rental_end_date),'day')} days</Tag> },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px', background: '#f7f8fc', minHeight: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>
              <FileTextOutlined style={{ marginRight: 10, color: '#667eea' }} />
              Reports & Analytics
            </h1>
            <p style={{ margin: '6px 0 0', color: '#888', fontSize: 14 }}>
              Generate and download detailed reports for your business
            </p>
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading} style={{ borderRadius: 8 }}>
            Refresh All
          </Button>
        </div>

        <Spin spinning={loading}>

          {/* Overview Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Revenue" value={Number(dashboardStats?.revenue?.total || 0)} prefix="LKR" color="#52c41a"
                sub={`This month: LKR ${Number(dashboardStats?.revenue?.monthly || 0).toLocaleString()}`} icon={<DollarOutlined />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Orders" value={dashboardStats?.counts?.orders || 0} color="#667eea"
                sub={`Active: ${dashboardStats?.counts?.activeOrders || 0}`} icon={<ShoppingOutlined />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Rentals" value={dashboardStats?.counts?.rentals || 0} color="#f093fb"
                sub={`Active: ${dashboardStats?.counts?.activeRentals || 0}`} icon={<ShopOutlined />} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Customers" value={dashboardStats?.counts?.customers || 0} color="#fa8c16"
                sub={`Employees: ${dashboardStats?.counts?.employees || 0}`} icon={<TeamOutlined />} />
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs
            size="large"
            style={{ background: '#fff', borderRadius: 16, padding: '0 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            items={[

              /* ─── Revenue Tab ─── */
              {
                key: 'revenue',
                label: <span><DollarOutlined /> Revenue</span>,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                      <Space wrap>
                        <RangePicker value={dateRange} style={{ borderRadius: 8 }}
                          onChange={dates => { if (dates) { setDateRange(dates); fetchRevenueReport(dates, revenueGroupBy); } }} />
                        <Select value={revenueGroupBy} style={{ width: 130 }}
                          onChange={val => { setRevenueGroupBy(val); fetchRevenueReport(dateRange, val); }}>
                          <Option value="day">By Day</Option>
                          <Option value="month">By Month</Option>
                          <Option value="year">By Year</Option>
                        </Select>
                      </Space>
                      <ExportBtn type="revenue" label="Download Revenue CSV"
                        params={{ start_date: dateRange[0].format('YYYY-MM-DD'), end_date: dateRange[1].format('YYYY-MM-DD') }} />
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                      {[
                        { label: 'Laundry Revenue', value: laundryRev, color: '#667eea' },
                        { label: 'Rental Revenue',  value: rentalRev,  color: '#f093fb' },
                        { label: 'Total Revenue',   value: totalRev,   color: '#52c41a' },
                      ].map(item => (
                        <Col xs={24} sm={8} key={item.label}>
                          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, color: '#888' }}>{item.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>LKR {item.value.toLocaleString()}</div>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    <SCard title="Revenue Trends">
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <AreaChart data={revenueChartData}>
                            <defs>
                              <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} /><stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gRentals" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} /><stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={v => `LKR ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 8 }} />
                            <Legend />
                            <Area type="monotone" dataKey="orders"  name="Laundry Orders" stroke="#667eea" fill="url(#gOrders)"  strokeWidth={2} />
                            <Area type="monotone" dataKey="rentals" name="Suit Rentals"    stroke="#52c41a" fill="url(#gRentals)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No revenue data for selected range</div>}
                    </SCard>
                  </div>
                )
              },

              /* ─── Orders Tab ─── */
              {
                key: 'orders',
                label: <span><ShoppingOutlined /> Orders</span>,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                      <RangePicker value={orderDateRange} style={{ borderRadius: 8 }}
                        onChange={dates => { if (dates) { setOrderDateRange(dates); fetchOrderStats(dates); } }} />
                      <ExportBtn type="orders" label="Download Orders CSV"
                        params={{ start_date: orderDateRange[0].format('YYYY-MM-DD'), end_date: orderDateRange[1].format('YYYY-MM-DD') }} />
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={10}>
                        <SCard title="Order Status Distribution" style={{ marginBottom: 16 }}>
                          {orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                              <PieChart>
                                <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={85}
                                  label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`} dataKey="value">
                                  {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No data</div>}
                        </SCard>
                      </Col>
                      <Col xs={24} lg={14}>
                        <SCard title="Popular Cleaning Types" style={{ marginBottom: 16 }}>
                          <Table rowKey="name" size="small" pagination={false}
                            dataSource={orderStats?.popularCleaningTypes || []} columns={cleaningTypeColumns} />
                        </SCard>
                      </Col>
                      <Col xs={24} lg={10}>
                        <SCard title="Walk-in vs Online">
                          {(orderStats?.typeDistribution || []).map((t, i) => {
                            const total = (orderStats?.typeDistribution || []).reduce((s, x) => s + Number(x.count), 0);
                            return (
                              <div key={t.order_type} style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{t.order_type}</span>
                                  <span style={{ color: COLORS[i] }}>{t.count} orders</span>
                                </div>
                                <Progress percent={total ? Math.round((t.count / total) * 100) : 0} strokeColor={COLORS[i]} />
                              </div>
                            );
                          })}
                        </SCard>
                      </Col>
                      <Col xs={24} lg={14}>
                        <SCard title="Top Customers by Spend">
                          <Table rowKey="id" size="small" pagination={false}
                            dataSource={(orderStats?.topCustomers || []).slice(0, 7)} columns={topCustomerColumns} />
                        </SCard>
                      </Col>
                    </Row>
                  </div>
                )
              },

              /* ─── Rentals Tab ─── */
              {
                key: 'rentals',
                label: <span><ShopOutlined /> Rentals</span>,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                      <RangePicker value={rentalDateRange} style={{ borderRadius: 8 }}
                        onChange={dates => { if (dates) { setRentalDateRange(dates); fetchRentalStats(dates); } }} />
                      <ExportBtn type="rentals" label="Download Rentals CSV"
                        params={{ start_date: rentalDateRange[0].format('YYYY-MM-DD'), end_date: rentalDateRange[1].format('YYYY-MM-DD') }} />
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={10}>
                        <SCard title="Rental Status Distribution">
                          {rentalStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                              <PieChart>
                                <Pie data={rentalStatusData} cx="50%" cy="50%" outerRadius={85}
                                  label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`} dataKey="value">
                                  {rentalStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No data</div>}
                        </SCard>
                      </Col>
                      <Col xs={24} lg={14}>
                        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                          <Col xs={24} sm={12}>
                            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                              <CalendarOutlined style={{ fontSize: 28, color: '#667eea', marginBottom: 8 }} />
                              <div style={{ fontSize: 13, color: '#888' }}>Avg Rental Duration</div>
                              <div style={{ fontSize: 26, fontWeight: 700, color: '#667eea' }}>
                                {Number(rentalStats?.averageRentalDays || 0).toFixed(1)} days
                              </div>
                            </Card>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                              <ShopOutlined style={{ fontSize: 28, color: '#ff4d4f', marginBottom: 8 }} />
                              <div style={{ fontSize: 13, color: '#888' }}>Overdue Rentals</div>
                              <div style={{ fontSize: 26, fontWeight: 700, color: '#ff4d4f' }}>
                                {rentalStats?.overdueRentals?.length || 0}
                              </div>
                            </Card>
                          </Col>
                        </Row>
                        {(rentalStats?.overdueRentals?.length > 0) && (
                          <SCard title={<span style={{ color: '#ff4d4f' }}>⚠ Overdue Rentals</span>}>
                            <Table rowKey="id" size="small" pagination={false}
                              dataSource={rentalStats?.overdueRentals || []} columns={overdueColumns} />
                          </SCard>
                        )}
                      </Col>
                    </Row>
                  </div>
                )
              },

              /* ─── Inventory Tab ─── */
              {
                key: 'inventory',
                label: <span><BarChartOutlined /> Inventory</span>,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                      <ExportBtn type="inventory" label="Download Inventory CSV" />
                    </div>
                    <Row gutter={[16, 16]}>
                      {[
                        { label: 'Available', value: inventoryData?.availability?.find(a => a.is_available===1)?.count || 0, color: '#52c41a' },
                        { label: 'Rented Out', value: inventoryData?.availability?.find(a => a.is_available===0)?.count || 0, color: '#fa8c16' },
                        { label: 'Excellent Condition', value: inventoryData?.conditions?.find(c => c.condition_status==='excellent')?.count || 0, color: '#13c2c2' },
                        { label: 'Needs Repair', value: inventoryData?.conditions?.find(c => c.condition_status==='needs-repair')?.count || 0, color: '#ff4d4f' },
                      ].map(item => (
                        <Col xs={24} sm={12} lg={6} key={item.label}>
                          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: item.color }}>{item.value}</div>
                          </Card>
                        </Col>
                      ))}
                      <Col xs={24} lg={14}>
                        <SCard title="Inventory by Category">
                          {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" name="Total" fill="#667eea" radius={[4,4,0,0]} />
                                <Bar dataKey="available" name="Available" fill="#52c41a" radius={[4,4,0,0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No data</div>}
                        </SCard>
                      </Col>
                      <Col xs={24} lg={10}>
                        <SCard title="Top Rented Suits">
                          <Table rowKey="id" size="small" pagination={false}
                            dataSource={(inventoryData?.fastMoving || []).slice(0, 8)} columns={topSuitColumns} />
                        </SCard>
                      </Col>
                    </Row>
                  </div>
                )
              },

            ]}
          />
        </Spin>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;

