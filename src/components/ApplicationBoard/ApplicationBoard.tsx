import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPosts, createPost, updatePost, deletePost } from '../../services/firebase/boardService';
import { PostData } from '../../types';
import BoardLayout from '../BoardLayout';
import { Edit2, Trash2, Lock, MessageSquare, CheckCircle } from 'lucide-react';

interface ApplicationBoardProps {
  department: string;
  subCategory: string;
  departmentName?: string;
  menuTitle?: string;
  topContent?: React.ReactNode;
}

type ViewMode = 'list' | 'detail' | 'write';

const getStatusColor = (status?: string) => {
  switch (status) {
    case '접수': return 'bg-gray-100 text-gray-700 border-gray-200';
    case '검토 중': return 'bg-blue-50 text-blue-700 border-blue-200';
    case '처리 완료': return 'bg-green-50 text-green-700 border-green-200';
    case '답변 완료': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const ApplicationBoard: React.FC<ApplicationBoardProps> = ({ department, subCategory, departmentName, menuTitle, topContent }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Write Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Reply Form
  const [replyContent, setReplyContent] = useState('');
  const [statusValue, setStatusValue] = useState<'접수' | '검토 중' | '처리 완료' | '답변 완료'>('접수');

  const loadPosts = async () => {
    setLoading(true);
    const fetched = await getPosts('support', subCategory);
    
    // 학생은 자신의 글만, 교사/관리자는 전체 글 확인
    if (currentUser?.role === 'student') {
      setPosts(fetched.filter(p => p.authorId === currentUser.internalId));
    } else {
      setPosts(fetched);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory, currentUser]);

  const openWrite = () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    setTitle('');
    setContent('');
    setViewMode('write');
  };

  const closeView = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    const newPost: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      category: 'support',
      subCategory,
      serviceType: 'APPLICATION',
      applicationStatus: '접수',
      isPrivate: true,
      authorId: currentUser.internalId,
      authorUserId: currentUser.userId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorUserType: currentUser.userType
    };

    const id = await createPost(newPost);
    setIsSubmitting(false);

    if (id) {
      alert("신청이 접수되었습니다.");
      closeView();
      loadPosts();
    } else {
      alert("오류가 발생했습니다.");
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedPost?.id || !currentUser) return;
    
    setIsSubmitting(true);
    const updateData: Partial<PostData> = {
      applicationStatus: statusValue,
    };

    if (replyContent.trim()) {
      updateData.adminReply = {
        content: replyContent,
        authorName: currentUser.name,
        createdAt: new Date()
      };
      if (statusValue === '접수' || statusValue === '검토 중') {
        updateData.applicationStatus = '답변 완료';
      }
    }

    const success = await updatePost(selectedPost.id, updateData);
    setIsSubmitting(false);

    if (success) {
      alert("처리되었습니다.");
      closeView();
      loadPosts();
    } else {
      alert("오류가 발생했습니다.");
    }
  };

  const handleDelete = async (post: PostData) => {
    if (!post.id) return;
    if (currentUser?.role === 'student' && currentUser.internalId !== post.authorId) return;
    
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deletePost(post.id);
      loadPosts();
      if (viewMode === 'detail') closeView();
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
    p.authorName.includes(searchKeyword)
  );

  if (viewMode === 'write') {
    return (
      <BoardLayout 
        title={menuTitle || "신청 게시판"} 
        breadcrumb={departmentName && menuTitle ? `학생지원 > ${departmentName} > ${menuTitle}` : "신청형 게시판"} 
        onGoBack={closeView} narrow={true} topContent={topContent}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col shadow-sm">
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-2">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>이 게시판은 작성 즉시 비공개 처리되며, 본인과 담당 교사만 확인할 수 있습니다.</div>
          </div>
          <input 
            type="text" 
            placeholder="제목" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-xl font-bold border-b border-gray-200 pb-3 mb-6 outline-none focus:border-blue-500 bg-transparent"
          />
          <textarea 
            placeholder="신청 내용을 자세히 적어주세요..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full min-h-[300px] resize-none outline-none text-gray-700 leading-relaxed p-4 border border-gray-100 rounded-xl focus:border-blue-500 transition-colors"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeView} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">취소</button>
            <button onClick={handleCreatePost} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600">제출하기</button>
          </div>
        </div>
      </BoardLayout>
    );
  }

  if (viewMode === 'detail' && selectedPost) {
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    
    // Set initial reply form state when opening detail
    useEffect(() => {
      if (selectedPost) {
        setStatusValue((selectedPost.applicationStatus as any) || '접수');
        setReplyContent(selectedPost.adminReply?.content || '');
      }
    }, [selectedPost]);

    return (
      <BoardLayout 
        title={menuTitle || "신청 상세"} 
        breadcrumb={departmentName && menuTitle ? `학생지원 > ${departmentName} > ${menuTitle}` : "신청형 게시판"} 
        onGoBack={closeView} narrow={true} topContent={topContent}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedPost.applicationStatus)}`}>
                {selectedPost.applicationStatus || '접수'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{selectedPost.authorName}</span>
              <span>{selectedPost.createdAt?.toLocaleString()}</span>
              <div className="flex items-center gap-1 text-red-500 ml-auto">
                <Lock className="w-3.5 h-3.5" /> 비공개
              </div>
            </div>
          </div>
          <div className="p-6 min-h-[200px]">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{selectedPost.content}</p>
          </div>
          {(currentUser?.internalId === selectedPost.authorId || isTeacher) && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => handleDelete(selectedPost)} className="flex items-center gap-1 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">
                <Trash2 className="w-4 h-4" /> 삭제
              </button>
            </div>
          )}
        </div>

        {/* 답변 영역 */}
        {selectedPost.adminReply && !isTeacher && (
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold">
              <MessageSquare className="w-5 h-5" />
              담당 교사 답변
            </div>
            <div className="text-gray-800 whitespace-pre-wrap mb-4">{selectedPost.adminReply.content}</div>
            <div className="text-sm text-indigo-500 font-medium text-right">
              {selectedPost.adminReply.authorName} 교사
            </div>
          </div>
        )}

        {/* 교사 처리 폼 */}
        {isTeacher && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" /> 담당자 처리
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">진행 상태</label>
              <select 
                value={statusValue} 
                onChange={e => setStatusValue(e.target.value as any)}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="접수">접수</option>
                <option value="검토 중">검토 중</option>
                <option value="처리 완료">처리 완료</option>
                <option value="답변 완료">답변 완료</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">답변 작성 (선택)</label>
              <textarea 
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="신청자에게 전달할 답변을 입력하세요..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleReplySubmit} 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                {isSubmitting ? '저장 중...' : '상태 및 답변 저장'}
              </button>
            </div>
          </div>
        )}
      </BoardLayout>
    );
  }

  // List View
  return (
    <BoardLayout
      title={menuTitle || "신청 게시판"}
      breadcrumb={departmentName && menuTitle ? `학생지원 > ${departmentName} > ${menuTitle}` : "신청형 게시판"}
      showSearch={true}
      searchKeyword={searchKeyword}
      onSearchChange={setSearchKeyword}
      showWriteButton={currentUser?.role === 'student'}
      onWriteClick={openWrite}
      topContent={topContent}
    >
      {loading ? (
        <div className="py-20 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-gray-500">
          신청 내역이 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              onClick={() => { setSelectedPost(post); setViewMode('detail'); }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors cursor-pointer flex justify-between items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(post.applicationStatus)}`}>
                    {post.applicationStatus || '접수'}
                  </span>
                  <h3 className="font-bold text-gray-800 text-lg">{post.title}</h3>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 flex gap-3">
                  <span>{post.authorName}</span>
                  <span>{post.createdAt?.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BoardLayout>
  );
};

export default ApplicationBoard;
