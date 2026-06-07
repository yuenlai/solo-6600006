import React, { useState } from 'react';
import { SyncSchedule, ScheduleType, Weekday, ScheduleExecution } from '../types';

interface Props {
  schedules: SyncSchedule[];
  executions: ScheduleExecution[];
  folders: { id: string; name: string; path: string }[];
  onAddSchedule: (schedule: Omit<SyncSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSchedule: (id: string, updates: Partial<SyncSchedule>) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleSchedule: (id: string) => void;
  onRunNow: (id: string) => void;
}

const weekdayLabels: Record<Weekday, string> = {
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
  saturday: '周六',
  sunday: '周日',
};

const allWeekdays: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const workdays: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const weekends: Weekday[] = ['saturday', 'sunday'];

const scheduleTypeLabels: Record<ScheduleType, { label: string; icon: string; description: string }> = {
  workday: { label: '工作日', icon: '💼', description: '周一至周五工作时段同步' },
  night: { label: '夜间', icon: '🌙', description: '每天夜间闲时自动同步' },
  custom: { label: '自定义', icon: '⚙️', description: '自定义同步时段和频率' },
};

const presetTimeRanges: Record<ScheduleType, { start: string; end: string }> = {
  workday: { start: '09:00', end: '18:00' },
  night: { start: '22:00', end: '06:00' },
  custom: { start: '00:00', end: '23:59' },
};

export const SyncSchedulePanel: React.FC<Props> = ({
  schedules,
  executions,
  folders,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onToggleSchedule,
  onRunNow,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('workday');
  const [weekdays, setWeekdays] = useState<Weekday[]>(workdays);
  const [timeStart, setTimeStart] = useState(presetTimeRanges.workday.start);
  const [timeEnd, setTimeEnd] = useState(presetTimeRanges.workday.end);
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  const resetForm = () => {
    setSelectedFolder('');
    setScheduleType('workday');
    setWeekdays(workdays);
    setTimeStart(presetTimeRanges.workday.start);
    setTimeEnd(presetTimeRanges.workday.end);
    setIntervalMinutes(60);
    setEditingId(null);
    setShowForm(false);
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    if (type === 'workday') {
      setWeekdays(workdays);
      setTimeStart(presetTimeRanges.workday.start);
      setTimeEnd(presetTimeRanges.workday.end);
    } else if (type === 'night') {
      setWeekdays(allWeekdays);
      setTimeStart(presetTimeRanges.night.start);
      setTimeEnd(presetTimeRanges.night.end);
    }
  };

  const toggleWeekday = (day: Weekday) => {
    setWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!selectedFolder) return;
    const folder = folders.find(f => f.id === selectedFolder);
    if (!folder) return;

    const scheduleData = {
      folderId: selectedFolder,
      folderName: folder.name,
      folderPath: folder.path,
      scheduleType,
      enabled: true,
      weekdays,
      timeRange: { start: timeStart, end: timeEnd },
      intervalMinutes: scheduleType === 'custom' ? intervalMinutes : undefined,
    };

    if (editingId) {
      onUpdateSchedule(editingId, scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }
    resetForm();
  };

  const handleEdit = (schedule: SyncSchedule) => {
    setEditingId(schedule.id);
    setSelectedFolder(schedule.folderId);
    setScheduleType(schedule.scheduleType);
    setWeekdays(schedule.weekdays);
    setTimeStart(schedule.timeRange.start);
    setTimeEnd(schedule.timeRange.end);
    setIntervalMinutes(schedule.intervalMinutes || 60);
    setShowForm(true);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeekdayDisplay = (days: Weekday[]) => {
    if (days.length === 7) return '每天';
    if (days.length === 5 && days.every(d => workdays.includes(d))) return '工作日';
    if (days.length === 2 && days.every(d => weekends.includes(d))) return '周末';
    return days.map(d => weekdayLabels[d]).join('、');
  };

  const getLatestExecution = (scheduleId: string) => {
    return executions.find(e => e.scheduleId === scheduleId);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>定时同步</h3>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + 添加计划
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '20px',
        }}>
          <h4 style={{ margin: '0 0 16px' }}>{editingId ? '编辑同步计划' : '新建同步计划'}</h4>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
              选择同步目录
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="">请选择目录...</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name} ({folder.path})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              计划类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {(Object.keys(scheduleTypeLabels) as ScheduleType[]).map(type => {
                const config = scheduleTypeLabels[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleScheduleTypeChange(type)}
                    style={{
                      padding: '16px 12px',
                      border: `2px solid ${scheduleType === type ? '#1976d2' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      background: scheduleType === type ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{config.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{config.label}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{config.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              重复日期
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {allWeekdays.map(day => (
                <button
                  key={day}
                  onClick={() => toggleWeekday(day)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${weekdays.includes(day) ? '#1976d2' : '#ddd'}`,
                    borderRadius: '6px',
                    background: weekdays.includes(day) ? '#e3f2fd' : '#fff',
                    color: weekdays.includes(day) ? '#1976d2' : '#333',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {weekdayLabels[day]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              同步时段
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <span style={{ color: '#888' }}>至</span>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {scheduleType === 'custom' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                同步间隔（分钟）
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 60)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  width: '120px',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFolder || weekdays.length === 0}
              style={{
                padding: '8px 16px',
                background: selectedFolder && weekdays.length > 0 ? '#1976d2' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedFolder && weekdays.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
            >
              {editingId ? '保存修改' : '创建计划'}
            </button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏰</div>
          <p>暂无定时同步计划</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>点击上方按钮创建您的第一个同步计划</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {schedules.map(schedule => {
            const typeConfig = scheduleTypeLabels[schedule.scheduleType];
            const latestExecution = getLatestExecution(schedule.id);
            return (
              <div
                key={schedule.id}
                style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${schedule.enabled ? '#e0e0e0' : '#f0f0f0'}`,
                  opacity: schedule.enabled ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>{typeConfig.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, fontSize: '15px' }}>{schedule.folderName}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: schedule.enabled ? '#e8f5e9' : '#f5f5f5',
                          color: schedule.enabled ? '#2e7d32' : '#999',
                        }}
                      >
                        {schedule.enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                      {schedule.folderPath}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#666' }}>
                      <span>📅 {getWeekdayDisplay(schedule.weekdays)}</span>
                      <span>🕐 {schedule.timeRange.start} - {schedule.timeRange.end}</span>
                      {schedule.intervalMinutes && (
                        <span>🔄 每 {schedule.intervalMinutes} 分钟</span>
                      )}
                    </div>
                    {latestExecution && (
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                        上次执行：{formatTime(latestExecution.endTime || latestExecution.startTime)}
                        {latestExecution.filesSynced !== undefined && ` · 同步 ${latestExecution.filesSynced} 个文件`}
                        {latestExecution.status === 'success' && (
                          <span style={{ color: '#2e7d32', marginLeft: '4px' }}>✓ 成功</span>
                        )}
                        {latestExecution.status === 'failed' && (
                          <span style={{ color: '#c62828', marginLeft: '4px' }}>✗ 失败</span>
                        )}
                        {latestExecution.status === 'running' && (
                          <span style={{ color: '#1565c0', marginLeft: '4px' }}>⏳ 进行中</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onRunNow(schedule.id)}
                      title="立即同步"
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ▶ 立即同步
                    </button>
                    <button
                      onClick={() => onToggleSchedule(schedule.id)}
                      title={schedule.enabled ? '禁用' : '启用'}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      {schedule.enabled ? '⏸ 禁用' : '▶ 启用'}
                    </button>
                    <button
                      onClick={() => handleEdit(schedule)}
                      title="编辑"
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      title="删除"
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ffcdd2',
                        borderRadius: '4px',
                        background: '#ffebee',
                        color: '#c62828',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🗑 删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
