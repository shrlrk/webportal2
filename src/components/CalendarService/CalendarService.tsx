import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCalendarEvents, bulkUploadCalendarEvents } from '../../services/firebase/calendarService';
import { CalendarData } from '../../types';
import { ChevronLeft, ChevronRight, Upload, Calendar as CalendarIcon, Info } from 'lucide-react';
import Papa from 'papaparse';

interface CalendarServiceProps {
  department: string;
  subCategory: string; // 'diet' 등
  topContent?: React.ReactNode;
}

const CalendarService: React.FC<CalendarServiceProps> = ({ department, subCategory, topContent }) => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDayEvent, setSelectedDayEvent] = useState<CalendarData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  const loadEvents = async () => {
    setLoading(true);
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    const fetched = await getCalendarEvents(department, yearMonth);
    setEvents(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, department]);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedEvents = results.data.map((row: any) => {
            // CSV 헤더 이름에 따라 매핑. 예: Date(YYYY-MM-DD), Menu, Nutrition, Allergy
            const dateStr = row['Date'] || row['날짜'];
            if (!dateStr) throw new Error('날짜(Date) 컬럼이 없습니다.');
            
            return {
              date: dateStr,
              data: {
                menu: row['Menu'] || row['메뉴'] || row['식단'],
                nutrition: row['Nutrition'] || row['영양정보'],
                allergy: row['Allergy'] || row['알레르기'],
              }
            };
          });

          setLoading(true);
          const success = await bulkUploadCalendarEvents(department, parsedEvents);
          if (success) {
            alert('업로드 완료되었습니다.');
            loadEvents();
          } else {
            alert('업로드 중 오류가 발생했습니다.');
          }
        } catch (err: any) {
          alert('CSV 파싱 오류: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 달력 렌더링 로직
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handleDayClick = (day: Date) => {
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const ev = events.find(e => e.date === dateStr);
    setSelectedDayEvent(ev || null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      {topContent && <div className="mb-6">{topContent}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* 달력 영역 */}
        <div className="flex-grow p-6 md:border-r border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
              {year}년 {month + 1}월
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden flex-grow">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-600">{d}</div>
            ))}
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-white min-h-[80px]" />;
              
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const ev = events.find(e => e.date === dateStr);
              
              return (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(day)}
                  className="bg-white min-h-[80px] p-2 cursor-pointer hover:bg-blue-50 transition-colors flex flex-col"
                >
                  <span className={`text-sm font-medium mb-1 ${day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </span>
                  {ev && ev.data?.menu && (
                    <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded line-clamp-3 leading-snug">
                      {ev.data.menu}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isTeacher && (
            <div className="mt-6 flex justify-end">
              <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition-colors"
              >
                <Upload className="w-4 h-4" /> CSV 데이터 일괄 업로드
              </button>
            </div>
          )}
        </div>

        {/* 상세 패널 영역 */}
        <div className="w-full md:w-80 bg-gray-50 p-6 flex flex-col flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" /> 상세 정보
          </h3>
          
          {selectedDayEvent ? (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-sm font-bold text-gray-500 block mb-1">선택된 날짜</span>
                <span className="text-gray-900 font-medium">{selectedDayEvent.date}</span>
              </div>
              
              {selectedDayEvent.data?.menu && (
                <div>
                  <span className="text-sm font-bold text-gray-500 block mb-2">식단</span>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap leading-relaxed text-gray-800 shadow-sm">
                    {selectedDayEvent.data.menu.replace(/,/g, '\n')}
                  </div>
                </div>
              )}

              {selectedDayEvent.data?.nutrition && (
                <div>
                  <span className="text-sm font-bold text-gray-500 block mb-2">영양 정보</span>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap leading-relaxed text-gray-800 shadow-sm">
                    {selectedDayEvent.data.nutrition}
                  </div>
                </div>
              )}

              {selectedDayEvent.data?.allergy && (
                <div>
                  <span className="text-sm font-bold text-gray-500 block mb-2">알레르기 정보</span>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap leading-relaxed text-red-600 font-medium shadow-sm">
                    {selectedDayEvent.data.allergy}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-center gap-3 py-10">
              <CalendarIcon className="w-12 h-12 opacity-20" />
              <p className="text-sm">달력에서 날짜를 선택하시면<br/>상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarService;
