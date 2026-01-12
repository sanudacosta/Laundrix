import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, ShoppingOutlined, DollarOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const { user, logout } = useAuth();

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
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Admin Dashboard</h2>
          <div>
            <span style={{ marginRight: 16 }}>Welcome, {user?.full_name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard Overview</h1>
          <p>Revenue reports, order statistics, and system analytics will be displayed here.</p>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
