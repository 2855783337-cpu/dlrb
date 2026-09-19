import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { JournalEntry } from '../types';

interface CalendarScheduleViewProps {
  journals: JournalEntry[];
  onOpenJournal: (journal: JournalEntry) => void;
}

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  journals,
  onOpenJournal,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 19)); // Sep 2026 as per local time context
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date(2026, 8, 19).toISOString().slice(0, 10)
  );
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedules'>('calendar');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Calendar cells generation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay();

  // Map journals and schedules by date string (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map: Record<string, { regular: JournalEntry[]; schedules: JournalEntry[] }> = {};

    journals.forEach((j) => {
      // 1. Check record date
      const recordDate = j.createdAt.slice(0, 10);
      if (!map[recordDate]) map[recordDate] = { regular: [], schedules: [] };
      map[recordDate].regular.push(j);

      // 2. Check schedule linkage date if enabled
      if (j.schedule && j.schedule.enabled && j.schedule.startDate) {
        const schedDate = j.schedule.startDate;
        if (!map[schedDate]) map[schedDate] = { regular: [], schedules: [] };
        if (!map[schedDate].schedules.some((s) => s.id === j.id)) {
          map[schedDate].schedules.push(j);
        }
      }
    });

    return map;
  }, [journals]);

  // All active schedules
  const allSchedules = useMemo(() => {
    return journals.filter((j) => j.schedule?.enabled);
  }, [journals]);

  // Selected date entries
  const selectedEntries = entriesByDate[selectedDateStr] || { regular: [], schedules: [] };

  return (
    <div id="calendar-schedule-module" className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Header with Title and Mode Switch */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wide">
            日历与日程联动
          </h1>
          <p className="text-xs text-[#9E8F80] mt-0.5">
            手账随手转日程 · 颜色圆点分类 · App内贴心提醒
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-[#EFE9DF] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-white text-[#4A3E34] shadow-xs'
                : 'text-[#8C7D70]'
            }`}
          >
            月历视图
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'schedules'
                ? 'bg-white text-[#4A3E34] shadow-xs'
                : 'text-[#8C7D70]'
            }`}
          >
            日程清单 ({allSchedules.length})
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div className="space-y-4">
          {/* Month Navigator */}
          <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-[#E8E1D5] shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold text-[#4A3E34]">
                  {year}年 {month + 1}月
                </span>
                <button
                  onClick={goToday}
                  className="px-2 py-0.5 rounded-full text-[11px] bg-[#EFE8DE] text-[#6E5D4F] hover:bg-[#E3D9CD]"
                >
                  今天
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl hover:bg-[#EFE8DE] text-[#6E5D4F]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl hover:bg-[#EFE8DE] text-[#6E5D4F]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs text-[#9E8F80] font-medium py-1.5 border-b border-[#EFE8DE]">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 pt-2">
              {/* Empty padding cells */}
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 rounded-xl" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const data = entriesByDate[dateStr];
                const hasRegular = data && data.regular.length > 0;
                const hasSchedule = data && data.schedules.length > 0;
                const isSelected = selectedDateStr === dateStr;

                // Thumbnails preview (first 3 images)
                const dayImages = (data?.regular || [])
                  .flatMap((j) => j.images)
                  .slice(0, 3);

                const primarySchedule = data?.schedules?.[0];
                const scheduleDotColor =
                  primarySchedule?.schedule?.tagColor || '#A8BBA2';

                return (
                  <button
                    key={dateStr}
                    id={`cal-day-${dateStr}`}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-16 p-1 rounded-xl flex flex-col justify-between items-center transition-all relative border text-left ${
                      isSelected
                        ? 'bg-[#F2ECE3] border-[#7D6B5D] ring-1 ring-[#7D6B5D]'
                        : 'bg-white/70 border-[#EFE9DF] hover:bg-white'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono leading-none ${
                          isSelected ? 'font-bold text-[#4A3E34]' : 'text-[#7A6B5E]'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Custom color dots: distinguish regular vs schedule */}
                      <div className="flex items-center space-x-0.5">
                        {hasRegular && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#B5A799]"
                            title="普通手账记录"
                          />
                        )}
                        {hasSchedule && (
                          <span
                            className="w-2 h-2 rounded-full ring-1 ring-white"
                            style={{ backgroundColor: scheduleDotColor }}
                            title="日程提醒任务"
                          />
                        )}
                      </div>
                    </div>

                    {/* Thumbnails preview: up to 3 images */}
                    {dayImages.length > 0 ? (
                      <div className="flex items-center space-x-0.5 mt-1 overflow-hidden w-full justify-center">
                        {dayImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt="thumb"
                            className="w-3.5 h-3.5 object-cover rounded-xs"
                          />
                        ))}
                      </div>
                    ) : hasRegular ? (
                      <span className="text-[9px] text-[#A6998C] truncate w-full px-0.5">
                        {data.regular[0].title}
                      </span>
                    ) : (
                      <div />
                    )}

                    <div />
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 mt-3 pt-2 text-[10px] text-[#9A897B] border-t border-[#EFE8DE]">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#B5A799]" />
                <span>普通手账记录</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#A8BBA2]" />
                <span>日程提醒任务（自定义颜色圆点）</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="bg-[#FAF7F2] rounded-3xl p-4 border border-[#E8E1D5] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE5DA]">
              <h3 className="text-xs font-semibold text-[#4A3E34] flex items-center space-x-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#736354]" />
                <span>{selectedDateStr} 当日记录与日程</span>
              </h3>
              <span className="text-[11px] text-[#9E8F80]">
                {selectedEntries.schedules.length} 项日程 · {selectedEntries.regular.length} 篇手账
              </span>
            </div>

            {/* Empty state */}
            {selectedEntries.schedules.length === 0 && selectedEntries.regular.length === 0 && (
              <div className="py-6 text-center text-xs text-[#A69B90]">
                这一天还没有记录或日程，点击底栏「写手账」开启一段新回忆吧 🌱
              </div>
            )}

            {/* Schedules on this day */}
            {selectedEntries.schedules.map((entry) => (
              <div
                key={`sched-${entry.id}`}
                onClick={() => onOpenJournal(entry)}
                className="p-3 rounded-2xl bg-white border border-[#EAE2D5] hover:border-[#8C7A6A] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-8 rounded-full"
                    style={{ backgroundColor: entry.schedule?.tagColor || '#A8BBA2' }}
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-[#4A3E34] group-hover:text-[#68584B]">
                        {entry.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EFF5EE] text-[#4F734F]">
                        日程
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#8C7D70] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {entry.schedule?.startTime} - {entry.schedule?.endTime}
                      </span>
                      <span>·</span>
                      <span>{entry.schedule?.reminderTimes?.[0] || '准时提醒'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-xs text-[#A08F80] group-hover:text-[#5E4D40]">
                  <span>查看手账</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            ))}

            {/* Regular journals on this day */}
            {selectedEntries.regular.map((entry) => (
              <div
                key={`reg-${entry.id}`}
                onClick={() => onOpenJournal(entry)}
                className="p-3 rounded-2xl bg-white/70 border border-[#EAE2D5] hover:bg-white transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  {entry.images.length > 0 ? (
                    <img
                      src={entry.images[0].url}
                      alt="cover"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#8C7D70]">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-[#4A3E34] group-hover:text-[#68584B]">
                      {entry.title}
                    </h4>
                    <p className="text-[10px] text-[#9A897B] mt-0.5 line-clamp-1">
                      {entry.content || '纯图手账'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#A08F80] group-hover:text-[#5E4D40]">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* All Schedules List Tab */
        <div className="space-y-3">
          {allSchedules.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-3xl p-8 text-center text-xs text-[#9E8F80] border border-[#E8E1D5]">
              暂无开启日程提醒的手账。在编辑手账时点击底栏「日程联动」即可转为日程！
            </div>
          ) : (
            allSchedules.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenJournal(entry)}
                className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-2xs hover:border-[#8C7A6A] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: entry.schedule?.tagColor || '#A8BBA2' }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-[#4A3E34] group-hover:text-[#68584B]">
                        {entry.title}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FAF3EC] text-[#B36829]">
                        {entry.mood}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#8C7D70] mt-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{entry.schedule?.startDate}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {entry.schedule?.startTime} - {entry.schedule?.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-xs text-[#8C7D70] group-hover:text-[#4A3E34]">
                  <span>手账详情</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
