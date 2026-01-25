import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Tag, 
  Space, 
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Tabs,
  Image,
  Popconfirm
} from 'antd';
import { 
  ShoppingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { rentalAPI, adminAPI } from '../../services/apiService';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const InventoryManagement = () => {
  const [suits, setSuits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSuit, setEditingSuit] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuits();
    fetchCategories();
  }, []);

  const fetchSuits = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getAllSuits();
      setSuits(response?.data?.data || []);
    } catch (error) {
      message.error('Failed to fetch suits');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await rentalAPI.getCategories();
      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingSuit(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSuit(record);
    form.setFieldsValue({
      product_code: record.product_code,
      name: record.name,
      brand: record.brand,
      category_id: record.category_id,
      color: record.color,
      description: record.description,
      rental_price_per_day: record.rental_price_per_day,
      deposit_amount: record.deposit_amount,
      purchase_price: record.purchase_price,
      image_url: record.image_url,
      is_active: record.is_active
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteSuit(id);
      message.success('Suit deleted successfully');
      fetchSuits();
    } catch (error) {
      message.error('Failed to delete suit');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSuit) {
        await adminAPI.updateSuit(editingSuit.id, values);
        message.success('Suit updated successfully');
      } else {
        await adminAPI.createSuit(values);
        message.success('Suit created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchSuits();
    } catch (error) {
      message.error(editingSuit ? 'Failed to update suit' : 'Failed to create suit');
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url) => (
        <Image
          width={50}
          height={50}
          src={url}
          alt="Suit"
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="https://via.placeholder.com/50"
        />
      )
    },
    {
      title: 'Code',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Suit Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.brand}</div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
      filters: categories.map(cat => ({ text: cat.name, value: cat.name })),
      onFilter: (value, record) => record.category_name === value,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 120,
    },
    {
      title: 'Daily Rate',
      dataIndex: 'rental_price_per_day',
      key: 'rental_price_per_day',
      width: 120,
      render: (price) => <span style={{ fontWeight: 'bold' }}>LKR {parseFloat(price).toFixed(2)}</span>
    },
    {
      title: 'Deposit',
      dataIndex: 'deposit_amount',
      key: 'deposit_amount',
      width: 120,
      render: (price) => `LKR ${parseFloat(price).toFixed(2)}`
    },
    {
      title: 'Available',
      dataIndex: 'available_count',
      key: 'available_count',
      width: 100,
      render: (count) => (
        <Tag color={count > 0 ? 'success' : 'error'}>
          {count} units
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Suit"
            description="Are you sure? This will also delete all inventory items."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>
                <ShoppingOutlined style={{ marginRight: 12, color: '#52c41a' }} />
                Inventory Management
              </h1>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                Manage suit products and inventory
              </p>
            </div>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add New Suit
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={suits}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} suits`
            }}
          />
        </Card>

        {/* Create/Edit Suit Modal */}
        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {editingSuit ? 'Edit Suit' : 'Add New Suit'}
            </span>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              is_active: true
            }}
          >
            <Form.Item
              label="Product Code"
              name="product_code"
              rules={[{ required: true, message: 'Please enter product code' }]}
            >
              <Input placeholder="HB-NV" size="large" />
            </Form.Item>

            <Form.Item
              label="Suit Name"
              name="name"
              rules={[{ required: true, message: 'Please enter suit name' }]}
            >
              <Input placeholder="Hugo Boss Navy Suit" size="large" />
            </Form.Item>

            <Form.Item
              label="Brand"
              name="brand"
              rules={[{ required: true, message: 'Please enter brand' }]}
            >
              <Input placeholder="Hugo Boss" size="large" />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category_id"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select size="large" placeholder="Select category">
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Color"
              name="color"
              rules={[{ required: true, message: 'Please enter color' }]}
            >
              <Input placeholder="Navy Blue" size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Elegant navy blue suit..." />
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
              <Form.Item
                label="Rental Price (per day)"
                name="rental_price_per_day"
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  prefix="LKR"
                  placeholder="2800"
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Deposit Amount"
                name="deposit_amount"
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  prefix="LKR"
                  placeholder="3000"
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Purchase Price"
                name="purchase_price"
                rules={[{ required: true, message: 'Required' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  prefix="LKR"
                  placeholder="75000"
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Space>

            <Form.Item
              label="Image URL"
              name="image_url"
              rules={[{ required: true, message: 'Please enter image URL' }]}
            >
              <Input 
                prefix={<PictureOutlined />}
                placeholder="https://images.unsplash.com/..." 
                size="large" 
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="is_active"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select size="large">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  {editingSuit ? 'Update Suit' : 'Create Suit'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default InventoryManagement;
