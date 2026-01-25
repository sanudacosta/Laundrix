import React, { useState, useEffect } from 'react';
import { 
  Card,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  message,
  Divider
} from 'antd';
import { 
  SettingOutlined,
  EditOutlined,
  SaveOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { adminAPI, orderAPI } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage = () => {
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCleaningModalVisible, setIsCleaningModalVisible] = useState(false);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [cleaningForm] = Form.useForm();
  const [serviceForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch cleaning types
      const cleaningRes = await orderAPI.getCleaningTypes();
      setCleaningTypes(cleaningRes?.data?.data || []);
      
      // Fetch service times
      const serviceRes = await orderAPI.getServiceTimes();
      setServiceTimes(serviceRes?.data?.data || []);
      
      // Fetch system settings
      const settingsRes = await adminAPI.getSettings();
      const settings = settingsRes?.data?.data || {};
      setSystemSettings(settings);
      settingsForm.setFieldsValue(settings);
      
    } catch (error) {
      message.error('Failed to fetch settings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCleaning = (record) => {
    setEditingItem(record);
    cleaningForm.setFieldsValue(record);
    setIsCleaningModalVisible(true);
  };

  const handleEditService = (record) => {
    setEditingItem(record);
    serviceForm.setFieldsValue(record);
    setIsServiceModalVisible(true);
  };

  const submitCleaningType = async (values) => {
    try {
      await adminAPI.updateCleaningType(editingItem.id, values);
      message.success('Cleaning type updated successfully');
      setIsCleaningModalVisible(false);
      cleaningForm.resetFields();
      fetchAllSettings();
    } catch (error) {
      message.error('Failed to update cleaning type');
    }
  };

  const submitServiceTime = async (values) => {
    try {
      await adminAPI.updateServiceTime(editingItem.id, values);
      message.success('Service time updated successfully');
      setIsServiceModalVisible(false);
      serviceForm.resetFields();
      fetchAllSettings();
    } catch (error) {
      message.error('Failed to update service time');
    }
  };

  const submitSystemSettings = async (values) => {
    try {
      await adminAPI.updateSettings(values);
      message.success('System settings updated successfully');
      fetchAllSettings();
    } catch (error) {
      message.error('Failed to update system settings');
    }
  };

  const cleaningColumns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Base Price',
      dataIndex: 'base_price',
      key: 'base_price',
      width: 150,
      render: (price) => <span style={{ fontWeight: 'bold' }}>LKR {parseFloat(price).toFixed(2)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Switch checked={isActive} disabled />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => handleEditCleaning(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  const serviceColumns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Duration',
      dataIndex: 'duration_hours',
      key: 'duration_hours',
      width: 120,
      render: (hours) => `${hours} hours`
    },
    {
      title: 'Price Multiplier',
      dataIndex: 'price_multiplier',
      key: 'price_multiplier',
      width: 150,
      render: (multiplier) => <span style={{ fontWeight: 'bold' }}>{multiplier}x</span>
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Switch checked={isActive} disabled />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => handleEditService(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Cleaning Types',
      children: (
        <Table
          columns={cleaningColumns}
          dataSource={cleaningTypes}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      )
    },
    {
      key: '2',
      label: 'Service Times',
      children: (
        <Table
          columns={serviceColumns}
          dataSource={serviceTimes}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      )
    },
    {
      key: '3',
      label: 'System Settings',
      children: (
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={submitSystemSettings}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Business Name"
            name="business_name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input size="large" placeholder="Laundrix" />
          </Form.Item>

          <Form.Item
            label="Tax Rate (%)"
            name="tax_rate"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              min={0}
              max={100}
              size="large"
              style={{ width: '100%' }}
              placeholder="8"
            />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select size="large">
              <Option value="LKR">LKR - Sri Lankan Rupee</Option>
              <Option value="USD">USD - US Dollar</Option>
              <Option value="EUR">EUR - Euro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Late Fee Per Day (LKR)"
            name="late_fee_per_day"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              min={0}
              prefix="LKR"
              size="large"
              style={{ width: '100%' }}
              placeholder="500"
            />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              icon={<SaveOutlined />}
            >
              Save System Settings
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              <SettingOutlined style={{ marginRight: 12, color: '#667eea' }} />
              System Settings
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '15px' }}>
              Manage cleaning types, service times, pricing, and system configuration
            </p>
          </div>

          <Tabs items={tabItems} defaultActiveKey="1" />
        </Card>

        {/* Edit Cleaning Type Modal */}
        <Modal
          title="Edit Cleaning Type"
          open={isCleaningModalVisible}
          onCancel={() => {
            setIsCleaningModalVisible(false);
            cleaningForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={cleaningForm}
            layout="vertical"
            onFinish={submitCleaningType}
          >
            <Form.Item
              label="Service Name"
              name="name"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Base Price (LKR)"
              name="base_price"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={0}
                prefix="LKR"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Active"
              name="is_active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsCleaningModalVisible(false);
                  cleaningForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Update
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Service Time Modal */}
        <Modal
          title="Edit Service Time"
          open={isServiceModalVisible}
          onCancel={() => {
            setIsServiceModalVisible(false);
            serviceForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={serviceForm}
            layout="vertical"
            onFinish={submitServiceTime}
          >
            <Form.Item
              label="Service Name"
              name="name"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Duration (hours)"
              name="duration_hours"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={1}
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Price Multiplier"
              name="price_multiplier"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                min={0.1}
                max={10}
                step={0.1}
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Active"
              name="is_active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsServiceModalVisible(false);
                  serviceForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Update
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
