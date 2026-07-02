import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LibraryProgram, LibraryProgramApplication } from '../../types';
import { 
  getLibraryPrograms, 
  createLibraryProgram, 
  updateLibraryProgram, 
  deleteLibraryProgram,
  applyForLibraryProgram,
  cancelLibraryProgramApplication,
  getProgramApplications,
  getMyProgramApplications
} from '../../services/firebase/libraryProgramService';
import BoardLayout from '../BoardLayout';
import { Edit2, Trash2, Calendar, MapPin, Users, CheckCircle, Clock } from 'lucide-react';

interface ProgramRegistrationBoardProps {
  departmentName: string;
  menuTitle: string;
  topContent?: React.ReactNode;
}

type ViewMode = 'list' | 'detail' | 'write' | 'edit';

const ProgramRegistrationBoard: React.FC<ProgramRegistrationBoardProps> = ({ departmentName, menuTitle, topContent }) => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const [programs, setPrograms] = useState<LibraryProgram[]>([]);
  const [myApplications, setMyApplications] = useState<LibraryProgramApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProgram, setSelectedProgram] = useState<LibraryProgram | null>(null);
  
  // Applications for teacher view
  const [applications, setApplications] = useState<LibraryProgramApplication[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [applyStartDate, setApplyStartDate] = useState('');
  const [applyEndDate, setApplyEndDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const fetchedPrograms = await getLibraryPrograms();
    setPrograms(fetchedPrograms);

    if (currentUser && isStudent) {
      const myApps = await getMyProgramApplications(currentUser.internalId);
      setMyApplications(myApps);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadApplicationsForProgram = async (programId: string) => {
    const apps = await getProgramApplications(programId);
    setApplications(apps);
  };

  const openWrite = () => {
    setTitle('');
    setApplyStartDate(new Date().toLocaleDateString('en-CA'));
    setApplyEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
    setEventDate('');
    setLocation('');
    setTargetGrade('전학년');
    setMaxParticipants(20);
    setContent('');
    setViewMode('write');
  };

  const openEdit = (program: LibraryProgram) => {
    setTitle(program.title);
    setApplyStartDate(program.applyStartDate);
    setApplyEndDate(program.applyEndDate);
    setEventDate(program.eventDate);
    setLocation(program.location);
    setTargetGrade(program.targetGrade);
    setMaxParticipants(program.maxParticipants);
    setContent(program.content);
    setSelectedProgram(program);
    setViewMode('edit');
  };

  const closeView = () => {
    setViewMode('list');
    setSelectedProgram(null);
    setApplications([]);
  };

  const openDetail = (program: LibraryProgram) => {
    setSelectedProgram(program);
    setViewMode('detail');
    if (isTeacher && program.id) {
      loadApplicationsForProgram(program.id);
    }
  };

  const handleTeacherSubmit = async () => {
    if (!title.trim() || !content.trim() || !applyStartDate || !applyEndDate || !eventDate || !location || !maxParticipants) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }
    if (applyStartDate > applyEndDate) {
      alert("신청 종료일은 시작일 이후여야 합니다.");
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    if (viewMode === 'write') {
      const newProgram: Omit<LibraryProgram, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'status'> = {
        title,
        applyStartDate,
        applyEndDate,
        eventDate,
        location,
        targetGrade,
        maxParticipants,
        content,
        authorId: currentUser.internalId,
        authorName: currentUser.name,
      };
      const id = await createLibraryProgram(newProgram);
      if (id) {
        alert("프로그램이 등록되었습니다.");
        closeView();
        loadData();
      } else {
        alert("등록 중 오류가 발생했습니다.");
      }
    } else if (viewMode === 'edit' && selectedProgram?.id) {
      const success = await updateLibraryProgram(selectedProgram.id, {
        title,
        applyStartDate,
        applyEndDate,
        eventDate,
        location,
        targetGrade,
        maxParticipants,
        content
      });
      if (success) {
        alert("수정되었습니다.");
        closeView();
        loadData();
      } else {
        alert("수정 중 오류가 발생했습니다.");
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (program: LibraryProgram) => {
    if (!program.id) return;
    if (window.confirm('정말 삭제하시겠습니까? (신청자 내역도 함께 삭제 처리해야 합니다)')) {
      await deleteLibraryProgram(program.id);
      alert('삭제되었습니다.');
      loadData();
      if (viewMode === 'detail') closeView();
    }
  };

  const handleApply = async (program: LibraryProgram) => {
    if (!currentUser || !program.id) return;
    if (program.status === '마감') {
      alert("이미 마감된 프로그램입니다.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await applyForLibraryProgram(program.id, currentUser);
    setIsSubmitting(false);
    
    if (result.success) {
      alert(result.message);
      loadData();
      if (selectedProgram?.id === program.id) {
        // Refresh detail view count
        setSelectedProgram({ ...selectedProgram, currentParticipants: selectedProgram.currentParticipants + 1, status: (selectedProgram.currentParticipants + 1) >= selectedProgram.maxParticipants ? '마감' : '접수중' });
      }
    } else {
      alert(result.message);
    }
  };

  const handleCancelApplication = async (program: LibraryProgram) => {
    if (!currentUser || !program.id) return;
    if (window.confirm("정말 신청을 취소하시겠습니까?")) {
      setIsSubmitting(true);
      const success = await cancelLibraryProgramApplication(program.id, currentUser.internalId);
      setIsSubmitting(false);
      
      if (success) {
        alert("신청이 취소되었습니다.");
        loadData();
        if (selectedProgram?.id === program.id) {
          const newCount = Math.max(0, selectedProgram.currentParticipants - 1);
          setSelectedProgram({ ...selectedProgram, currentParticipants: newCount, status: newCount < selectedProgram.maxParticipants ? '접수중' : '마감' });
        }
      } else {
        alert("취소 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCloseProgram = async (program: LibraryProgram) => {
    if (!program.id) return;
    if (window.confirm("프로그램을 마감하시겠습니까? (학생들이 더 이상 신청할 수 없게 됩니다)")) {
      const success = await updateLibraryProgram(program.id, { status: '마감' });
      if (success) {
        alert("마감 처리되었습니다.");
        loadData();
        if (selectedProgram?.id === program.id) {
          setSelectedProgram({ ...selectedProgram, status: '마감' });
        }
      }
    }
  };

  if (viewMode === 'write' || viewMode === 'edit') {
    return (
      <BoardLayout title={viewMode === 'write' ? "새 프로그램 등록" : "프로그램 수정"} breadcrumb={`학생지원 > ${departmentName} > ${menuTitle}`} onGoBack={closeView} narrow={true} topContent={topContent}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col shadow-sm">
          <input 
            type="text" placeholder="프로그램명" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full text-xl font-bold border-b border-gray-200 pb-3 mb-6 outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">신청 시작일</label>
              <input type="date" value={applyStartDate} onChange={e => setApplyStartDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">신청 종료일</label>
              <input type="date" value={applyEndDate} onChange={e => setApplyEndDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">운영 일시</label>
              <input type="text" placeholder="예: 2026.07.15 14:00~16:00" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">장소</label>
              <input type="text" placeholder="예: 꿈마루도서관 제1열람실" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">대상 학년</label>
              <input type="text" placeholder="예: 1,2학년 / 전학년" value={targetGrade} onChange={e => setTargetGrade(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">모집 인원</label>
              <input type="number" min="1" value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" />
            </div>
          </div>
          <textarea 
            placeholder="상세 내용을 입력하세요..." value={content} onChange={e => setContent(e.target.value)}
            className="w-full min-h-[250px] resize-none outline-none text-gray-700 leading-relaxed p-4 border border-gray-100 rounded-xl focus:border-blue-500"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeView} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">취소</button>
            <button onClick={handleTeacherSubmit} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600">
              {isSubmitting ? '처리 중...' : (viewMode === 'write' ? '등록' : '수정')}
            </button>
          </div>
        </div>
      </BoardLayout>
    );
  }

  if (viewMode === 'detail' && selectedProgram) {
    const isApplied = myApplications.some(app => app.programId === selectedProgram.id);

    return (
      <BoardLayout title={selectedProgram.title} breadcrumb={`학생지원 > ${departmentName} > ${menuTitle}`} onGoBack={closeView} narrow={true} topContent={topContent}>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProgram.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedProgram.status === '마감' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                {selectedProgram.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <b>신청기간:</b> {selectedProgram.applyStartDate} ~ {selectedProgram.applyEndDate}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> <b>운영일시:</b> {selectedProgram.eventDate}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <b>장소:</b> {selectedProgram.location}</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-400" /> <b>대상:</b> {selectedProgram.targetGrade}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> <b>모집인원:</b> {selectedProgram.currentParticipants}명 / {selectedProgram.maxParticipants}명</div>
            </div>
          </div>
          <div className="p-6 min-h-[200px]">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{selectedProgram.content}</p>
          </div>
          
          {/* 하단 버튼 영역 */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              {isTeacher && (
                <>
                  <button onClick={() => openEdit(selectedProgram)} className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                    <Edit2 className="w-4 h-4" /> 수정
                  </button>
                  <button onClick={() => handleDelete(selectedProgram)} className="flex items-center gap-1 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                  {selectedProgram.status === '접수중' && (
                    <button onClick={() => handleCloseProgram(selectedProgram)} className="flex items-center gap-1 px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg font-medium transition-colors">
                      마감 처리
                    </button>
                  )}
                </>
              )}
            </div>
            
            {isStudent && (
              <div>
                {isApplied ? (
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg">신청 완료된 프로그램입니다.</span>
                    <button onClick={() => handleCancelApplication(selectedProgram)} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors">
                      {isSubmitting ? '처리 중...' : '신청 취소'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApply(selectedProgram)} 
                    disabled={isSubmitting || selectedProgram.status === '마감'}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {isSubmitting ? '처리 중...' : (selectedProgram.status === '마감' ? '마감됨' : '신청하기')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 교사용 신청자 목록 */}
        {isTeacher && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">신청자 목록 ({applications.length}명)</h3>
            </div>
            {applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">신청자가 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                      <th className="p-4 font-semibold">학번</th>
                      <th className="p-4 font-semibold">이름</th>
                      <th className="p-4 font-semibold">신청일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 text-gray-700">{app.studentUserId}</td>
                        <td className="p-4 text-gray-700 font-medium">{app.studentName}</td>
                        <td className="p-4 text-gray-500 text-sm">{app.appliedAt?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </BoardLayout>
    );
  }

  // List View
  return (
    <BoardLayout
      title={menuTitle}
      breadcrumb={`학생지원 > ${departmentName} > ${menuTitle}`}
      showWriteButton={isTeacher} // 학생에게는 새 글 작성 버튼 미표시
      onWriteClick={openWrite}
      topContent={topContent}
    >
      {loading ? (
        <div className="py-20 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-gray-500 shadow-sm">
          등록된 프로그램이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(program => {
            const isApplied = myApplications.some(app => app.programId === program.id);
            return (
              <div 
                key={program.id} 
                onClick={() => openDetail(program)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${program.status === '마감' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {program.status}
                  </span>
                  {isApplied && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">신청완료</span>}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{program.title}</h3>
                <div className="mt-auto pt-4 flex flex-col gap-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {program.applyStartDate} ~ {program.applyEndDate}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {program.location}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">대상: {program.targetGrade}</span>
                    <span className="text-xs font-bold text-blue-600">{program.currentParticipants}명 / {program.maxParticipants}명</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BoardLayout>
  );
};

export default ProgramRegistrationBoard;
