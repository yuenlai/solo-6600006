import React, { useState } from 'react';
import { SyncTemplate } from '../types';
import { useSyncStore } from '../store/sync';
import {
  Card, Button, List, Tag, Modal, Form, Input, Select, Space,
  Typography, Checkbox, message, Popconfirm, Empty, Tooltip,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const platformOptions = [
  { value: 'windows', label: 'Windows', icon: '💻' },
  { value: 'mac', label: 'macOS', icon: '🍎' },
  { value: 'linux', label: 'Linux', icon: '🐧' },
];

const presetDirectories = [
  '/Users/Documents',
  '/Users/Pictures',
  '/Users/Desktop',
  '/Users/Downloads',
  '/Users/Music',
  '/Users/Videos',
];

interface Props {
  templates: SyncTemplate[];
  onAdd: (template: Omit<SyncTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<SyncTemplate>) => void;
  onDelete: (id: string) => void;
}

const defaultFormValues = {
  name: '',
  description: '',
  platform: 'windows',
  syncDirectories: [] as string[],
  permissions: {
    readFiles: true,
    writeFiles: true,
    deleteFiles: false,
    autoSync: true,
  },
};

export const SyncTemplatePanel: React.FC<Props> = ({
  templates,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SyncTemplate | null>(null);
  const [form] = Form.useForm();
  const [customDirectory, setCustomDirectory] = useState('');
  const [selectedDirs, setSelectedDirs] = useState<string[]>([]);

  const openOnboardingWizard = useSyncStore((s) => s.openOnboardingWizard);
  const applySyncTemplate = useSyncStore((s) => s.applySyncTemplate);

  const resetForm = () => {
    form.setFieldsValue(defaultFormValues);
    setSelectedDirs([]);
    setCustomDirectory('');
    setEditingTemplate(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (template: SyncTemplate) => {
    setEditingTemplate(template);
    setSelectedDirs([...template.syncDirectories]);
    form.setFieldsValue({
      name: template.name,
      description: template.description || '',
      platform: template.platform,
      permissions: template.permissions,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleToggleDir = (dir: string, checked: boolean) => {
    setSelectedDirs((prev) =>
      checked ? [...prev, dir] : prev.filter((d) => d !== dir)
    );
  };

  const handleAddCustomDir = () => {
    if (customDirectory && !selectedDirs.includes(customDirectory)) {
      setSelectedDirs((prev) => [...prev, customDirectory]);
      setCustomDirectory('');
    }
  };

  const handleRemoveDir = (dir: string) => {
    setSelectedDirs((prev) => prev.filter((d) => d !== dir));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields(['name', 'platform']);
      if (selectedDirs.length === 0) {
        message.warning('请至少选择一个同步目录');
        return;
      }

      const templateData = {
        name: values.name,
        description: values.description || undefined,
        platform: values.platform,
        syncDirectories: [...selectedDirs],
        permissions: values.permissions || defaultFormValues.permissions,
      };

      if (editingTemplate) {
        onUpdate(editingTemplate.id, templateData);
        message.success('模板已更新');
      } else {
        onAdd(templateData);
        message.success('模板已创建');
      }

      handleCloseModal();
    } catch {
      message.warning('请填写模板名称');
    }
  };

  const handleApplyTemplate = (template: SyncTemplate) => {
    applySyncTemplate(template.id);
    openOnboardingWizard();
    message.success(`已应用模板「${template.name}」，请继续完成设备接入`);
  };

  const renderPermissionTags = (permissions: SyncTemplate['permissions']) => {
    const tags: { label: string; color: string }[] = [];
    if (permissions.readFiles) tags.push({ label: '读取', color: 'green' });
    if (permissions.writeFiles) tags.push({ label: '写入', color: 'blue' });
    if (permissions.deleteFiles) tags.push({ label: '删除', color: 'orange' });
    if (permissions.autoSync) tags.push({ label: '自动同步', color: 'purple' });
    return tags;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>同步模板</Title>
          <Text type="secondary">保存常用的目录、规则和设备搭配，接入新设备时一键套用</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          新建模板
        </Button>
      </div>

      {templates.length === 0 ? (
        <Empty description="暂无模板，点击「新建模板」创建" style={{ marginTop: 80 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            新建模板
          </Button>
        </Empty>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          dataSource={templates}
          renderItem={(template) => {
            const permTags = renderPermissionTags(template.permissions);
            const platformInfo = platformOptions.find((p) => p.value === template.platform);

            return (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Tooltip title="套用模板并接入新设备" key="apply">
                      <Button
                        type="link"
                        icon={<ThunderboltOutlined />}
                        onClick={() => handleApplyTemplate(template)}
                      >
                        套用
                      </Button>
                    </Tooltip>,
                    <Tooltip title="编辑" key="edit">
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(template)}
                      />
                    </Tooltip>,
                    <Tooltip title="复制为新模板" key="copy">
                      <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          onAdd({
                            name: `${template.name} (副本)`,
                            description: template.description,
                            platform: template.platform,
                            syncDirectories: [...template.syncDirectories],
                            permissions: { ...template.permissions },
                          });
                          message.success('模板已复制');
                        }}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="确定删除此模板？"
                      onConfirm={() => onDelete(template.id)}
                      okText="删除"
                      cancelText="取消"
                      key="delete"
                    >
                      <Tooltip title="删除">
                        <Button type="link" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{template.name}</span>
                        <Tag
                          style={{ marginLeft: 'auto' }}
                          color={platformInfo?.value === 'windows' ? 'blue' : platformInfo?.value === 'mac' ? 'geekblue' : 'volcano'}
                        >
                          {platformInfo?.icon} {platformInfo?.label}
                        </Tag>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {template.description && (
                          <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                            {template.description}
                          </Paragraph>
                        )}
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>同步目录</Text>
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {template.syncDirectories.map((dir) => (
                              <Tag key={dir} color="cyan" style={{ fontSize: 11 }}>
                                {dir}
                              </Tag>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>权限配置</Text>
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {permTags.map((tag) => (
                              <Tag key={tag.label} color={tag.color} style={{ fontSize: 11 }}>
                                {tag.label}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={showModal}
        onOk={handleSave}
        onCancel={handleCloseModal}
        width={600}
        okText={editingTemplate ? '保存' : '创建'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={defaultFormValues}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="例如：办公电脑标准配置" />
          </Form.Item>
          <Form.Item name="description" label="模板描述">
            <TextArea rows={2} placeholder="简要描述此模板的适用场景" />
          </Form.Item>
          <Form.Item
            name="platform"
            label="适用平台"
            rules={[{ required: true, message: '请选择适用平台' }]}
          >
            <Select>
              {platformOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>同步目录</Text>
            <Card size="small" style={{ marginBottom: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {presetDirectories.map((dir) => (
                  <Checkbox
                    key={dir}
                    checked={selectedDirs.includes(dir)}
                    onChange={(e) => handleToggleDir(dir, e.target.checked)}
                  >
                    {dir}
                  </Checkbox>
                ))}
              </Space>
            </Card>
            {selectedDirs.length > 0 && (
              <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selectedDirs.map((dir) => (
                  <Tag
                    key={dir}
                    closable
                    onClose={() => handleRemoveDir(dir)}
                    color="blue"
                  >
                    {dir}
                  </Tag>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="输入自定义目录路径"
                value={customDirectory}
                onChange={(e) => setCustomDirectory(e.target.value)}
                onPressEnter={handleAddCustomDir}
                size="small"
              />
              <Button size="small" icon={<PlusOutlined />} onClick={handleAddCustomDir}>
                添加
              </Button>
            </div>
          </div>

          <Form.Item name="permissions" label="权限配置">
            <Input.Group>
              <Space direction="vertical">
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    const perms = form.getFieldValue('permissions') || defaultFormValues.permissions;
                    form.setFieldsValue({ permissions: { ...perms, readFiles: e.target.checked } });
                  }}
                >
                  读取文件
                </Checkbox>
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    const perms = form.getFieldValue('permissions') || defaultFormValues.permissions;
                    form.setFieldsValue({ permissions: { ...perms, writeFiles: e.target.checked } });
                  }}
                >
                  写入文件
                </Checkbox>
                <Checkbox
                  defaultChecked={false}
                  onChange={(e) => {
                    const perms = form.getFieldValue('permissions') || defaultFormValues.permissions;
                    form.setFieldsValue({ permissions: { ...perms, deleteFiles: e.target.checked } });
                  }}
                >
                  删除文件
                </Checkbox>
                <Checkbox
                  defaultChecked
                  onChange={(e) => {
                    const perms = form.getFieldValue('permissions') || defaultFormValues.permissions;
                    form.setFieldsValue({ permissions: { ...perms, autoSync: e.target.checked } });
                  }}
                >
                  自动同步
                </Checkbox>
              </Space>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
