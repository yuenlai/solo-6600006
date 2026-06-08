import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Select, Space, Card, Checkbox, Button, Progress, Alert, List, Tag, InputNumber, Typography, message, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useSyncStore } from '../store/sync';
import { WizardStep, SpaceValidationResult, SyncTemplate } from '../types';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const stepTitles: Record<WizardStep, string> = {
  template: '选择模板',
  name: '设备命名',
  space: '空间校验',
  directory: '同步目录',
  permissions: '权限确认',
};

const stepOrder: WizardStep[] = ['template', 'name', 'space', 'directory', 'permissions'];

const presetDirectories = [
  '/Users/Documents',
  '/Users/Pictures',
  '/Users/Desktop',
  '/Users/Downloads',
  '/Users/Music',
  '/Users/Videos',
];

const platformOptions = [
  { value: 'windows', label: 'Windows', icon: '💻' },
  { value: 'mac', label: 'macOS', icon: '🍎' },
  { value: 'linux', label: 'Linux', icon: '🐧' },
];

const defaultFormValues = {
  name: '',
  platform: 'windows',
  storageTotal: 100,
  storageUsed: 0,
  requiredSpace: 10,
};

export const DeviceOnboardingWizard: React.FC = () => {
  const {
    isOnboardingWizardOpen,
    onboardingWizardData,
    closeOnboardingWizard,
    updateOnboardingData,
    validateSpace,
    completeOnboarding,
    syncTemplates,
    applySyncTemplate,
    addSyncTemplate,
  } = useSyncStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form] = Form.useForm();
  const [spaceValidation, setSpaceValidation] = useState<SpaceValidationResult | null>(null);
  const [customDirectory, setCustomDirectory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');

  const currentStep = stepOrder[currentStepIndex];

  useEffect(() => {
    if (isOnboardingWizardOpen) {
      setCurrentStepIndex(0);
      setSpaceValidation(null);
      setCustomDirectory('');
      form.setFieldsValue(defaultFormValues);
    }
  }, [isOnboardingWizardOpen, form]);

  const goToNextStep = () => {
    if (currentStepIndex < stepOrder.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleApplyTemplate = (template: SyncTemplate) => {
    applySyncTemplate(template.id);
    form.setFieldsValue({
      platform: template.platform,
    });
    setCurrentStepIndex(1);
    message.success(`已应用模板「${template.name}」，请继续填写设备信息`);
  };

  const handleSkipTemplate = () => {
    setCurrentStepIndex(1);
  };

  const handleSaveAsTemplate = () => {
    setSaveTemplateName('');
    setSaveTemplateDesc('');
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveTemplate = () => {
    if (!saveTemplateName.trim()) {
      message.warning('请输入模板名称');
      return;
    }
    addSyncTemplate({
      name: saveTemplateName.trim(),
      description: saveTemplateDesc.trim() || undefined,
      platform: onboardingWizardData.platform,
      syncDirectories: [...onboardingWizardData.syncDirectories],
      permissions: { ...onboardingWizardData.permissions },
    });
    message.success('当前配置已保存为模板');
    setShowSaveTemplateModal(false);
  };

  const handleNext = async () => {
    if (currentStep === 'template') {
      goToNextStep();
      return;
    }

    if (currentStep === 'name') {
      try {
        const values = await form.validateFields(['name', 'platform', 'storageTotal', 'storageUsed']);
        const storageTotalBytes = values.storageTotal * 1024 * 1024 * 1024;
        const storageUsedBytes = values.storageUsed * 1024 * 1024 * 1024;

        if (storageUsedBytes > storageTotalBytes) {
          message.error('已使用容量不能大于总容量');
          return;
        }

        updateOnboardingData({
          name: values.name,
          platform: values.platform,
          storageTotal: storageTotalBytes,
          storageUsed: storageUsedBytes,
        });

        goToNextStep();
      } catch {
        message.warning('请填写完整的设备信息');
      }
      return;
    }

    if (currentStep === 'space') {
      try {
        const values = await form.validateFields(['requiredSpace']);
        const requiredSpaceBytes = values.requiredSpace * 1024 * 1024 * 1024;
        const result = validateSpace(requiredSpaceBytes);
        setSpaceValidation(result);
        if (!result.valid) {
          return;
        }
        goToNextStep();
      } catch {
        message.warning('请输入预计需要的存储空间');
      }
      return;
    }

    if (currentStep === 'directory') {
      if (onboardingWizardData.syncDirectories.length === 0) {
        message.warning('请至少选择一个同步目录');
        return;
      }
      goToNextStep();
      return;
    }

    if (currentStep === 'permissions') {
      handleComplete();
    }
  };

  const handleAddDirectory = () => {
    if (customDirectory && !onboardingWizardData.syncDirectories.includes(customDirectory)) {
      updateOnboardingData({
        syncDirectories: [...onboardingWizardData.syncDirectories, customDirectory],
      });
      setCustomDirectory('');
      message.success('目录已添加');
    }
  };

  const handleRemoveDirectory = (dir: string) => {
    updateOnboardingData({
      syncDirectories: onboardingWizardData.syncDirectories.filter(d => d !== dir),
    });
  };

  const handleToggleDirectory = (dir: string, checked: boolean) => {
    if (checked) {
      if (!onboardingWizardData.syncDirectories.includes(dir)) {
        updateOnboardingData({
          syncDirectories: [...onboardingWizardData.syncDirectories, dir],
        });
      }
    } else {
      handleRemoveDirectory(dir);
    }
  };

  const handlePermissionChange = (key: keyof typeof onboardingWizardData.permissions, checked: boolean) => {
    updateOnboardingData({
      permissions: {
        ...onboardingWizardData.permissions,
        [key]: checked,
      },
    });
  };

  const handleComplete = async () => {
    if (onboardingWizardData.syncDirectories.length === 0) {
      message.warning('请至少选择一个同步目录');
      return;
    }
    if (!onboardingWizardData.name) {
      message.warning('请输入设备名称');
      return;
    }

    setLoading(true);
    try {
      const newDevice = completeOnboarding();
      message.success(`设备 "${newDevice.name}" 已成功添加！`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'template':
        return (
          <div>
            <Title level={5}>选择同步模板</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              选择一个预设模板快速填充目录和权限配置，或跳过手动设置。
            </Text>
            {syncTemplates.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <Text type="secondary">暂无可用模板，请跳过此步骤手动配置</Text>
              </Card>
            ) : (
              <List
                dataSource={syncTemplates}
                renderItem={(template) => {
                  const platformInfo = platformOptions.find(p => p.value === template.platform);
                  const permTags: { label: string; color: string }[] = [];
                  if (template.permissions.readFiles) permTags.push({ label: '读取', color: 'green' });
                  if (template.permissions.writeFiles) permTags.push({ label: '写入', color: 'blue' });
                  if (template.permissions.deleteFiles) permTags.push({ label: '删除', color: 'orange' });
                  if (template.permissions.autoSync) permTags.push({ label: '自动同步', color: 'purple' });

                  return (
                    <Card
                      hoverable
                      style={{ marginBottom: 12, cursor: 'pointer' }}
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 15 }}>{template.name}</Text>
                            <Tag color={platformInfo?.value === 'windows' ? 'blue' : platformInfo?.value === 'mac' ? 'geekblue' : 'volcano'}>
                              {platformInfo?.icon} {platformInfo?.label}
                            </Tag>
                          </div>
                          {template.description && (
                            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                              {template.description}
                            </Text>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                            {template.syncDirectories.map(dir => (
                              <Tag key={dir} color="cyan" style={{ fontSize: 11 }}>{dir}</Tag>
                            ))}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {permTags.map(tag => (
                              <Tag key={tag.label} color={tag.color} style={{ fontSize: 11 }}>{tag.label}</Tag>
                            ))}
                          </div>
                        </div>
                        <Button type="primary" icon={<ThunderboltOutlined />} size="small">
                          套用
                        </Button>
                      </div>
                    </Card>
                  );
                }}
              />
            )}
            <Divider style={{ margin: '16px 0' }} />
            <Button type="default" block onClick={handleSkipTemplate}>
              跳过，手动配置
            </Button>
          </div>
        );

      case 'name':
        return (
          <Form form={form} layout="vertical" initialValues={defaultFormValues}>
            <Form.Item
              name="name"
              label="设备名称"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="例如：我的 MacBook Pro" size="large" />
            </Form.Item>
            <Form.Item
              name="platform"
              label="操作系统"
              rules={[{ required: true, message: '请选择操作系统' }]}
            >
              <Select size="large" placeholder="选择操作系统">
                {platformOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    <span style={{ marginRight: 8 }}>{opt.icon}</span>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Form.Item
                name="storageTotal"
                label="总存储容量 (GB)"
                rules={[
                  { required: true, message: '请输入总存储容量' },
                  { type: 'number', min: 1, message: '容量至少为 1 GB' },
                ]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber size="large" style={{ width: '100%' }} min={1} />
              </Form.Item>
              <Form.Item
                name="storageUsed"
                label="已使用容量 (GB)"
                rules={[
                  { required: true, message: '请输入已使用容量' },
                  { type: 'number', min: 0, message: '已使用容量不能为负数' },
                ]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber size="large" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Space>
          </Form>
        );

      case 'space':
        return (
          <Form form={form} layout="vertical">
            <Title level={5}>存储空间预估</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              请输入预计需要占用的存储空间，系统将校验设备是否有足够空间。
            </Text>
            <Form.Item
              name="requiredSpace"
              label="预计需要存储空间 (GB)"
              rules={[
                { required: true, message: '请输入预计需要的存储空间' },
                { type: 'number', min: 0.1, message: '至少需要 0.1 GB' },
              ]}
            >
              <InputNumber size="large" style={{ width: '100%' }} min={0.1} step={0.1} />
            </Form.Item>
            {spaceValidation && (
              <Alert
                icon={spaceValidation.valid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                type={spaceValidation.valid ? 'success' : 'error'}
                message={spaceValidation.valid ? '空间校验通过' : '空间校验失败'}
                description={spaceValidation.message}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            {onboardingWizardData.storageTotal > 0 && (
              <Card>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>总容量</Text>
                    <Text>{(onboardingWizardData.storageTotal / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>已使用</Text>
                    <Text>{(onboardingWizardData.storageUsed / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
                  </div>
                  <Progress
                    percent={Math.round((onboardingWizardData.storageUsed / onboardingWizardData.storageTotal) * 100)}
                    status={onboardingWizardData.storageUsed / onboardingWizardData.storageTotal > 0.9 ? 'exception' : 'normal'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>可用空间</Text>
                    <Text>
                      {((onboardingWizardData.storageTotal - onboardingWizardData.storageUsed) / 1024 / 1024 / 1024).toFixed(1)} GB
                    </Text>
                  </div>
                </Space>
              </Card>
            )}
          </Form>
        );

      case 'directory':
        return (
          <div>
            <Title level={5}>选择同步目录</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              选择需要同步的文件夹，也可以手动添加自定义目录。
            </Text>
            <Card title="常用目录" size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {presetDirectories.map(dir => (
                  <Checkbox
                    key={dir}
                    checked={onboardingWizardData.syncDirectories.includes(dir)}
                    onChange={e => handleToggleDirectory(dir, e.target.checked)}
                  >
                    {dir}
                  </Checkbox>
                ))}
              </Space>
            </Card>
            <Card title="已选目录" size="small">
              {onboardingWizardData.syncDirectories.length === 0 ? (
                <Text type="secondary">暂无选择的目录</Text>
              ) : (
                <List
                  size="small"
                  dataSource={onboardingWizardData.syncDirectories}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button
                          key="delete"
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveDirectory(item)}
                        />,
                      ]}
                    >
                      <Tag color="blue">{item}</Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Input
                placeholder="输入自定义目录路径，例如：/work/projects"
                value={customDirectory}
                onChange={e => setCustomDirectory(e.target.value)}
                onPressEnter={handleAddDirectory}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDirectory}>
                添加
              </Button>
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div>
            <Title level={5}>同步权限配置</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              配置该设备的同步权限，确保数据安全。
            </Text>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Checkbox
                  checked={onboardingWizardData.permissions.readFiles}
                  onChange={e => handlePermissionChange('readFiles', e.target.checked)}
                >
                  <Text strong>读取文件</Text>
                  <Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
                    允许该设备读取云端同步的文件
                  </Text>
                </Checkbox>
                <Checkbox
                  checked={onboardingWizardData.permissions.writeFiles}
                  onChange={e => handlePermissionChange('writeFiles', e.target.checked)}
                >
                  <Text strong>写入文件</Text>
                  <Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
                    允许该设备上传和修改文件
                  </Text>
                </Checkbox>
                <Checkbox
                  checked={onboardingWizardData.permissions.deleteFiles}
                  onChange={e => handlePermissionChange('deleteFiles', e.target.checked)}
                >
                  <Text strong>删除文件</Text>
                  <Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
                    允许该设备删除云端文件（删除后将进入回收站）
                  </Text>
                </Checkbox>
                <Checkbox
                  checked={onboardingWizardData.permissions.autoSync}
                  onChange={e => handlePermissionChange('autoSync', e.target.checked)}
                >
                  <Text strong>自动同步</Text>
                  <Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
                    检测到文件变化时自动同步
                  </Text>
                </Checkbox>
              </Space>
            </Card>
            <Card title="配置摘要" size="small" extra={
              <Button size="small" icon={<SaveOutlined />} onClick={handleSaveAsTemplate}>
                保存为模板
              </Button>
            }>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">设备名称</Text>
                  <Text strong>{onboardingWizardData.name || '-'}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">操作系统</Text>
                  <Text strong>
                    {platformOptions.find(p => p.value === onboardingWizardData.platform)?.label || '-'}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">同步目录数</Text>
                  <Text strong>{onboardingWizardData.syncDirectories.length} 个</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">权限配置</Text>
                  <Space size={4}>
                    {onboardingWizardData.permissions.readFiles && <Tag color="green">读取</Tag>}
                    {onboardingWizardData.permissions.writeFiles && <Tag color="blue">写入</Tag>}
                    {onboardingWizardData.permissions.deleteFiles && <Tag color="orange">删除</Tag>}
                    {onboardingWizardData.permissions.autoSync && <Tag color="purple">自动同步</Tag>}
                  </Space>
                </div>
              </Space>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStepIndex === stepOrder.length - 1;

  return (
    <>
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>新设备接入向导</Title>}
        open={isOnboardingWizardOpen}
        onCancel={closeOnboardingWizard}
        width={640}
        footer={null}
        destroyOnClose
        maskClosable={false}
      >
        <Steps current={currentStepIndex} size="small" style={{ marginBottom: 32 }}>
          {stepOrder.map(step => (
            <Step key={step} title={stepTitles[step]} />
          ))}
        </Steps>
        <div style={{ minHeight: 360, marginBottom: 24 }}>
          {renderStepContent()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={goToPrevStep} disabled={currentStepIndex === 0}>
            上一步
          </Button>
          <Button
            type="primary"
            onClick={handleNext}
            loading={loading}
            disabled={isLastStep && onboardingWizardData.syncDirectories.length === 0}
          >
            {isLastStep ? '完成配置' : '下一步'}
          </Button>
        </div>
      </Modal>

      <Modal
        title="保存为模板"
        open={showSaveTemplateModal}
        onOk={handleConfirmSaveTemplate}
        onCancel={() => setShowSaveTemplateModal(false)}
        okText="保存"
        width={440}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            将当前目录和权限配置保存为模板，方便后续接入新设备时快速套用。
          </Text>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>模板名称</Text>
          <Input
            placeholder="例如：办公电脑标准配置"
            value={saveTemplateName}
            onChange={e => setSaveTemplateName(e.target.value)}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>模板描述（可选）</Text>
          <TextArea
            rows={2}
            placeholder="简要描述此模板的适用场景"
            value={saveTemplateDesc}
            onChange={e => setSaveTemplateDesc(e.target.value)}
          />
        </div>
        <Card size="small" style={{ marginTop: 12, background: '#f5f5f5' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">适用平台</Text>
              <Text>{platformOptions.find(p => p.value === onboardingWizardData.platform)?.label || '-'}</Text>
            </div>
            <div>
              <Text type="secondary">同步目录：</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {onboardingWizardData.syncDirectories.map(dir => (
                  <Tag key={dir} color="cyan">{dir}</Tag>
                ))}
              </div>
            </div>
            <div>
              <Text type="secondary">权限：</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {onboardingWizardData.permissions.readFiles && <Tag color="green">读取</Tag>}
                {onboardingWizardData.permissions.writeFiles && <Tag color="blue">写入</Tag>}
                {onboardingWizardData.permissions.deleteFiles && <Tag color="orange">删除</Tag>}
                {onboardingWizardData.permissions.autoSync && <Tag color="purple">自动同步</Tag>}
              </div>
            </div>
          </Space>
        </Card>
      </Modal>
    </>
  );
};
