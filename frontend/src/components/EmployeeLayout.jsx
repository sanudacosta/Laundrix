import React, { useState } from 'react';
import { Layout, Menu, Avatar } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  RetweetOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/employee/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/employee/dashboard">Dashboard</Link>,
    },
    {
      key: '/employee/assigned-orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/employee/assigned-orders">Assigned Orders</Link>,
    },
    {
      key: '/employee/manage-returns',
      icon: <RetweetOutlined />,
      label: <Link to="/employee/manage-returns">Manage Returns</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sider 
        collapsible 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="80"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: collapsed ? '20px 16px' : '24px', 
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: collapsed ? '40px' : '48px',
            height: collapsed ? '40px' : '48px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}>
            <ThunderboltOutlined style={{ fontSize: collapsed ? '20px' : '24px', color: 'white' }} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ 
                color: 'white', 
                fontSize: '18px', 
                fontWeight: '700',
                letterSpacing: '0.5px',
                lineHeight: '1.2'
              }}>
                Laundrix
              </div>
              <div style={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Employee Panel
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: '16px 8px'
          }}
          className="modern-menu"
        />

        {/* User Section */}
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar 
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  flexShrink: 0
                }} 
                size={40}
              >
                {user?.full_name?.charAt(0) || 'E'}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.full_name || 'Employee'}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '11px'
                }}>
                  Team Member
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .modern-menu .ant-menu-item {
            margin: 4px 0 !important;
            border-radius: 8px !important;
            height: 44px !important;
            line-height: 44px !important;
            transition: all 0.3s !important;
          }
          .modern-menu .ant-menu-item:hover {
            background: rgba(255,255,255,0.08) !important;
          }
          .modern-menu .ant-menu-item-selected {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
          }
          .modern-menu .ant-menu-item-selected::after {
            display: none !important;
          }
        `}</style>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          background: '#ffffff', 
          padding: '0 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span 
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '20px', 
                cursor: 'pointer',
                color: '#1a1a2e',
                transition: 'color 0.3s'
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              Welcome, <strong style={{ color: '#1a1a2e', fontWeight: '600' }}>{user?.full_name}</strong>
            </span>
            <button 
              onClick={logout} 
              style={{ 
                padding: '8px 24px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
              }}
            >
              Logout
            </button>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          padding: 0,
          background: '#f7f8fc',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeLayout;
