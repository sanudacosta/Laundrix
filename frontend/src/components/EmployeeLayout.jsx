import React, { useState } from 'react';
import { Layout, Menu, Avatar } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  RetweetOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ThunderboltOutlined,
  ShopOutlined
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
      key: '/employee/pos',
      icon: <ShopOutlined />,
      label: <Link to="/employee/pos">Point of Sale</Link>,
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
          overflow: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#0f172a',
          boxShadow: '1px 0 0 rgba(255,255,255,0.06)'
        }}
      >
        {/* Flex column wrapper fills the full sider height */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo Section */}
          <div style={{ 
            padding: collapsed ? '20px 16px' : '24px', 
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexShrink: 0
          }}>
            <div style={{
              width: collapsed ? '40px' : '48px',
              height: collapsed ? '40px' : '48px',
              background: '#059669',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
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

          {/* Scrollable Menu */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="emp-menu-scroll">
            <Menu 
              theme="dark" 
              mode="inline" 
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ 
                background: 'transparent',
                border: 'none',
                padding: '12px 8px'
              }}
              className="modern-menu"
            />
          </div>

          {/* User Section — always visible at bottom */}
          <div style={{
            padding: collapsed ? '16px 12px' : '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar 
                style={{ background: '#059669', flexShrink: 0 }} 
                size={36}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || 'E'}
              </Avatar>
              {!collapsed && (
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
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                    Team Member
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

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
            background: rgba(5, 150, 105, 0.15) !important;
            border-left: 3px solid #059669 !important;
            color: #34d399 !important;
          }
          .modern-menu .ant-menu-item-selected .ant-menu-title-content a {
            color: #6ee7b7 !important;
          }
          .modern-menu .ant-menu-item-selected .anticon {
            color: #34d399 !important;
          }
          .modern-menu .ant-menu-item-selected::after {
            display: none !important;
          }
          .emp-menu-scroll::-webkit-scrollbar { width: 3px; }
          .emp-menu-scroll::-webkit-scrollbar-track { background: transparent; }
          .emp-menu-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
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
                background: '#059669',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#047857'; }}
              onMouseLeave={(e) => { e.target.style.background = '#059669'; }}
            >
              Logout
            </button>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          padding: 0,
          background: '#f1f5f9',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeLayout;
