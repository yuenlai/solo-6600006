import React, { useState, useMemo } from 'react';
import { Card, Tag, Button, Space, Empty, Badge, Tabs, Tooltip, Progress } from 'antd';
import {
  FileAddOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  InboxOutlined,
  CalendarOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { DailySyncReport } from '../types';

interface Props {
  reports: DailySyncReport[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onGenerateReport: (deviceId: string) => void;
  devices: { id: string; name: string }[];
}

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return '今天';
  if (dateStr === yesterday) return '昨天';
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
};

const formatGeneratedTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const metricCards = [
  { key: 'added' as const, label: '新增', icon: <FileAddOutlined />, color: '#1890ff', bg: '#e6f7ff' },
  { key: 'modified' as const, label: '修改', icon: <EditOutlined />, color: '#52c41a', bg: '#f6ffed' },
  { key: 'deleted' as const, label: '删除', icon: <DeleteOutlined />, color: '#fa8c16', bg: '#fff7e6' },
  { key: 'conflicted' as const, label: '冲突', icon: <WarningOutlined />, color: '#f5222d', bg: '#fff1f0' },
  { key: 'failed' as const, label: '失败', icon: <CloseCircleOutlined />, color: '#cf1322', bg: '#fff1f0' },
  { key: 'retried' as const, label: '重试', icon: <SyncOutlined />, color: '#722ed1', bg: '#f9f0ff' },
];

export const DailySyncReportPanel: React.FC<Props> = ({
  reports,
  onMarkAsRead,
  onMarkAllAsRead,
  onGenerateReport,
  devices,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [filterDevice, setFilterDevice] = useState<string>('all');

  const unreadCount = reports.filter(r => !r.read).length;

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (filterDevice !== 'all') {
      result = result.filter(r => r.deviceId === filterDevice);
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [reports, filterDevice]);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const groupedReports = useMemo(() => {
    const groups: Record<string, DailySyncReport[]> = {};
    filteredReports.forEach(report => {
      if (!groups[report.date]) groups[report.date] = [];
      groups[report.date].push(report);
    });
    return groups;
  }, [filteredReports]);

  const todayReports = reports.filter(r => r.date === new Date().toISOString().split('T')[0]);
  const todaySummary = todayReports.reduce(
    (acc, r) => ({
      added: acc.added + r.summary.added,
      modified: acc.modified + r.summary.modified,
      deleted: acc.deleted + r.summary.deleted,
      conflicted: acc.conflicted + r.summary.conflicted,
      failed: acc.failed + r.summary.failed,
      retried: acc.retried + r.summary.retried,
      totalSize: acc.totalSize + r.summary.totalSize,
    }),
    { added: 0, modified: 0, deleted: 0, conflicted: 0, failed: 0, retried: 0, totalSize: 0 }
  );

  const todayTotalOps = todaySummary.added + todaySummary.modified + todaySummary.deleted;
  const todaySuccessOps = todaySummary.added + todaySummary.modified + todaySummary.deleted - todaySummary.failed;
  const todaySuccessRate = todayTotalOps > 0 ? Math.round((todaySuccessOps / todayTotalOps) * 100) : 100;

  if (selectedReport) {
    const report = selectedReport;
    const totalOps = report.summary.added + report.summary.modified + report.summary.deleted;
    const successOps = totalOps - report.summary.failed;
    const successRate = totalOps > 0 ? Math.round((successOps / totalOps) * 100) : 100;

    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <Button onClick={() => setSelectedReportId(null)}>← 返回列表</Button>
          <h3 style={{ margin: 0, flex: 1 }}>
            {formatDate(report.date)} · {report.deviceName} 同步日报
          </h3>
          {!report.read && (
            <Button size="small" onClick={() => onMarkAsRead(report.id)}>
              标记已读
            </Button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>总操作数</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{totalOps}</div>
          </Card>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>成功率</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: successRate >= 90 ? '#52c41a' : successRate >= 70 ? '#faad14' : '#f5222d' }}>
              {successRate}%
            </div>
            <Progress
              percent={successRate}
              showInfo={false}
              strokeColor={successRate >= 90 ? '#52c41a' : successRate >= 70 ? '#faad14' : '#f5222d'}
              size="small"
            />
          </Card>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>数据量</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{formatSize(report.summary.totalSize)}</div>
          </Card>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>生成时间</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{formatGeneratedTime(report.generatedAt)}</div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          {metricCards.map(m => (
            <Card key={m.key} size="small" style={{ textAlign: 'center', borderLeft: `3px solid ${m.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: m.color }}>{m.icon}</span>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{report.summary[m.key]}</div>
            </Card>
          ))}
        </div>

        <Tabs
          defaultActiveKey="added"
          items={[
            {
              key: 'added',
              label: <span><FileAddOutlined style={{ color: '#1890ff' }} /> 新增 ({report.summary.added})</span>,
              children: report.details.addedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.addedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#e6f7ff', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileAddOutlined style={{ color: '#1890ff' }} />
                      <span style={{ fontFamily: 'monospace' }}>{f}</span>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无新增文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
            {
              key: 'modified',
              label: <span><EditOutlined style={{ color: '#52c41a' }} /> 修改 ({report.summary.modified})</span>,
              children: report.details.modifiedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.modifiedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EditOutlined style={{ color: '#52c41a' }} />
                      <span style={{ fontFamily: 'monospace' }}>{f}</span>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无修改文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
            {
              key: 'deleted',
              label: <span><DeleteOutlined style={{ color: '#fa8c16' }} /> 删除 ({report.summary.deleted})</span>,
              children: report.details.deletedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.deletedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#fff7e6', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DeleteOutlined style={{ color: '#fa8c16' }} />
                      <span style={{ fontFamily: 'monospace', textDecoration: 'line-through', opacity: 0.7 }}>{f}</span>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无删除文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
            {
              key: 'conflicted',
              label: <span><WarningOutlined style={{ color: '#f5222d' }} /> 冲突 ({report.summary.conflicted})</span>,
              children: report.details.conflictedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.conflictedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#fff1f0', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <WarningOutlined style={{ color: '#f5222d' }} />
                      <span style={{ fontFamily: 'monospace' }}>{f}</span>
                      <Tag color="red" style={{ marginLeft: 'auto' }}>需处理</Tag>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无冲突文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
            {
              key: 'failed',
              label: <span><CloseCircleOutlined style={{ color: '#cf1322' }} /> 失败 ({report.summary.failed})</span>,
              children: report.details.failedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.failedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: '#fff1f0', borderRadius: 6, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CloseCircleOutlined style={{ color: '#cf1322' }} />
                        <span style={{ fontFamily: 'monospace' }}>{f.path}</span>
                      </div>
                      <div style={{ marginTop: 4, paddingLeft: 24, color: '#cf1322', fontSize: 12 }}>
                        错误: {f.error}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无失败操作" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
            {
              key: 'retried',
              label: <span><SyncOutlined style={{ color: '#722ed1' }} /> 重试 ({report.summary.retried})</span>,
              children: report.details.retriedFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.details.retriedFiles.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#f9f0ff', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SyncOutlined style={{ color: '#722ed1' }} />
                      <span style={{ fontFamily: 'monospace' }}>{f.path}</span>
                      <Tag color="purple" style={{ marginLeft: 'auto' }}>第 {f.attempt} 次重试</Tag>
                    </div>
                  ))}
                </div>
              ) : <Empty description="无重试操作" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0 }}>同步结果日报</h3>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#f5222d' }} />
          )}
        </div>
        <Space>
          {unreadCount > 0 && (
            <Button size="small" onClick={onMarkAllAsRead}>
              全部已读
            </Button>
          )}
          {devices.length > 0 && (
            <Tooltip title="为设备生成今日日报">
              <Button
                size="small"
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => onGenerateReport(devices[0].id)}
              >
                生成日报
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {todayReports.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CalendarOutlined style={{ fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>今日同步概览</span>
            <Tag color="blue" style={{ marginLeft: 'auto' }}>{todayReports.length} 台设备</Tag>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>操作总数</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{todayTotalOps}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>成功率</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{todaySuccessRate}%</div>
              <Progress
                percent={todaySuccessRate}
                showInfo={false}
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.2)"
                size="small"
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>冲突 / 失败</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                <span style={{ color: '#ffa39e' }}>{todaySummary.conflicted}</span>
                {' / '}
                <span style={{ color: '#ff7875' }}>{todaySummary.failed}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>数据量</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{formatSize(todaySummary.totalSize)}</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Button
          size="small"
          type={filterDevice === 'all' ? 'primary' : 'default'}
          onClick={() => setFilterDevice('all')}
        >
          全部设备
        </Button>
        {devices.map(d => (
          <Button
            key={d.id}
            size="small"
            type={filterDevice === d.id ? 'primary' : 'default'}
            onClick={() => setFilterDevice(d.id)}
            icon={<DesktopOutlined />}
          >
            {d.name}
          </Button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <Empty
          description="暂无同步日报"
          image={<InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
        />
      ) : (
        Object.entries(groupedReports).map(([date, dateReports]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{formatDate(date)}</span>
              <span style={{ color: '#8c8c8c', fontSize: 13 }}>({date})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dateReports.map(report => {
                const totalOps = report.summary.added + report.summary.modified + report.summary.deleted;
                const hasIssues = report.summary.conflicted > 0 || report.summary.failed > 0;

                return (
                  <Card
                    key={report.id}
                    hoverable
                    style={{
                      borderLeft: hasIssues
                        ? `4px solid ${report.summary.conflicted > 0 ? '#f5222d' : '#faad14'}`
                        : '4px solid #52c41a',
                      cursor: 'pointer',
                      opacity: report.read ? 0.85 : 1,
                    }}
                    onClick={() => {
                      setSelectedReportId(report.id);
                      if (!report.read) onMarkAsRead(report.id);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <DesktopOutlined style={{ color: '#1890ff' }} />
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{report.deviceName}</span>
                          {!report.read && (
                            <Badge status="processing" color="#f5222d" text={<span style={{ fontSize: 11, color: '#f5222d' }}>新</span>} />
                          )}
                          {hasIssues && (
                            <Tag color={report.summary.conflicted > 0 ? 'red' : 'orange'}>
                              {report.summary.conflicted > 0
                                ? `${report.summary.conflicted} 个冲突`
                                : `${report.summary.failed} 个失败`}
                            </Tag>
                          )}
                          {!hasIssues && totalOps > 0 && (
                            <Tag color="green"><CheckCircleOutlined /> 一切正常</Tag>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {metricCards.map(m => {
                            const value = report.summary[m.key];
                            if (value === 0) return null;
                            return (
                              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                <span style={{ color: m.color }}>{m.icon}</span>
                                <span style={{ color: '#595959' }}>{m.label}</span>
                                <span style={{ fontWeight: 600, color: m.color }}>{value}</span>
                              </div>
                            );
                          })}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                            <span style={{ color: '#8c8c8c' }}>数据量</span>
                            <span style={{ fontWeight: 600 }}>{formatSize(report.summary.totalSize)}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 16 }}>
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                          生成于 {formatGeneratedTime(report.generatedAt)}
                        </span>
                        <Button
                          size="small"
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report.id);
                            if (!report.read) onMarkAsRead(report.id);
                          }}
                        >
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
