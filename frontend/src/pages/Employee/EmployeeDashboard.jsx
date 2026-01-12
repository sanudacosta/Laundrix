import React from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingOutlined, RetweetOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ color: 'white', padding: '16px', fontSize: '20px', fontWeight: 'bold' }}>
          Laundrix Employee
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/employee/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingOutlined />}>
            <Link to="/employee/assigned-orders">Assigned Orders</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<RetweetOutlined />}>
            <Link to="/employee/manage-returns">Manage Returns</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Employee Dashboard</h2>
          <div>
            <span style={{ marginRight: 16 }}>Welcome, {user?.full_name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>My Assigned Tasks</h1>
          <p>View and manage your assigned orders and suit returns.</p>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboard;
