import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canWritePost, canEditOrDeletePost } from '../services/firebase/userService';
import { toggleFavorite, getUserFavorites } from '../services/firebase/favoriteService';
import { getPosts, createPost, updatePost, deletePost } from '../services/firebase/boardService';
import { PostData } from '../types';
import { Edit2, Trash2, Megaphone, AlertCircle } from 'lucide-react';
import BoardLayout from '../components/BoardLayout';

type ViewMode = 'list' | 'detail' | 'write' | 'edit';

const BoardPage: React.FC = () => {
  const { category, subCategory, gradeId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // UI States
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [showOnMain, setShowOnMain] = useState(false);
  const [publishStartDate, setPublishStartDate] = useState('');
  const [publishEndDate, setPublishEndDate] = useState('');
  const [noEndDate, setNoEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Breadcrumb 및 Title 계산
  let mainTitle = '게시판';
  let breadcrumb = '게시판';

  const subTitleMap: Record<string, string> = {
    korean: '국어', english: '영어', math: '수학', music: '음악', pe: '체육',
    social: '사회', science: '과학', foreign: '외국어', it: '정보', tech: '기술가정', hanja: '한문',
    info: '진로정보', university: '대학정보', department: '학과정보', counseling: '상담신청', resources: '자료실',
    wee: 'Wee클래스', health: '보건실', library: '꿈마루도서관', cafeteria: '학생식당',
    notice: '공지사항', calendar: '학사일정', enrollment: '수강신청'
  };

  const getCategoryName = (cat?: string) => {
    switch (cat) {
      case 'subject': return '교과';
      case 'career': return '진로';
      case 'support': return '학생지원';
      case 'grade': return '학년';
      default: return cat || '';
    }
  };

  const subTitle = subCategory ? (subTitleMap[subCategory] || subCategory) : '';

  if (gradeId) {
    breadcrumb = `학년 > ${gradeId}학년`;
    if (subTitle) breadcrumb += ` > ${subTitle}`;
    mainTitle = subTitle || `${gradeId}학년`;
  } else if (category && subTitle) {
    const catName = getCategoryName(category);
    breadcrumb = `${catName} > ${subTitle}`;
    mainTitle = subTitle;
  } else if (subTitle) {
    mainTitle = subTitle;
    breadcrumb = subTitle;
  }

  const loadPosts = async () => {
    setLoading(true);
    const fetched = await getPosts(category, subCategory, gradeId);
    setPosts(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, gradeId]);

  useEffect(() => {
    if (currentUser?.internalId) {
      getUserFavorites(currentUser.internalId).then((favIds) => {
        setFavorites(new Set(favIds));
      });
    } else {
      setFavorites(new Set());
    }
  }, [currentUser]);

  const writeAllowed = currentUser ? canWritePost(currentUser) : false;

  const handleToggleFavorite = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const internalId = currentUser.internalId;
    if (!internalId) return;

    const newFavs = new Set(favorites);
    const isAdding = !newFavs.has(postId);
    if (isAdding) newFavs.add(postId);
    else newFavs.delete(postId);
    setFavorites(newFavs);

    try {
      await toggleFavorite(internalId, postId);
    } catch (error) {
      const revertedFavs = new Set(favorites);
      if (isAdding) revertedFavs.delete(postId);
      else revertedFavs.add(postId);
      setFavorites(revertedFavs);
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
  };

  const openWrite = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!canWritePost(currentUser)) {
      alert("작성 권한이 없습니다.");
      return;
    }
    setTitle('');
    setContent('');
    setIsImportant(false);
    setShowOnMain(false);
    setNoEndDate(false);
    setPublishStartDate(new Date().toLocaleDateString('en-CA'));
    setPublishEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
    setViewMode('write');
  };

  const openEdit = (post: PostData) => {
    if (!canEditOrDeletePost(currentUser, post.authorId)) {
      alert("수정 권한이 없습니다.");
      return;
    }
    setTitle(post.title);
    setContent(post.content);
    setIsImportant(post.isImportant || false);
    setShowOnMain(post.showOnMain || false);
    setNoEndDate(post.noEndDate || false);
    setPublishStartDate(post.publishStartDate || new Date().toLocaleDateString('en-CA'));
    setPublishEndDate(post.publishEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
    setSelectedPost(post);
    setViewMode('edit');
  };

  const openDetail = (post: PostData) => {
    setSelectedPost(post);
    setViewMode('detail');
  };

  const closeView = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  const handleDelete = async (post: PostData) => {
    if (!canEditOrDeletePost(currentUser, post.authorId)) {
      alert("삭제 권한이 없습니다.");
      return;
    }
    if (!post.id) return;

    const confirmDelete = window.confirm(`정말 삭제하시겠습니까?`);
    if (confirmDelete) {
      await deletePost(post.id);
      alert("삭제되었습니다.");
      loadPosts();
      if (viewMode === 'detail') closeView();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    if (!publishStartDate) {
      alert("게시 시작일을 설정해 주세요.");
      return;
    }
    if (!noEndDate && !publishEndDate) {
      alert("게시 종료일을 설정하거나 '종료일 없음'을 체크해 주세요.");
      return;
    }
    if (!noEndDate && publishStartDate > publishEndDate) {
      alert("종료일은 시작일 이후여야 합니다.");
      return;
    }
    
    // 카테고리 로직 Validation
    let finalCategory = category;
    if (gradeId) {
      finalCategory = 'grade';
    }

    console.log("--- [DEBUG: handleSubmit] ---");
    console.log("URL Params:", { category, subCategory, gradeId });
    console.log("Resolved values:", { finalCategory, finalSubCategory: subCategory });
    
    if (!finalCategory) {
      alert("게시판 카테고리 정보가 누락되었습니다. (예: grade, subject 등)");
      return;
    }
    
    if (!subCategory && !gradeId) {
      alert("세부 게시판 정보가 올바르지 않습니다.");
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    if (viewMode === 'write') {
      const newPost: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content,
        category: finalCategory,
        subCategory,
        grade: gradeId,
        isImportant,
        showOnMain,
        publishStartDate,
        publishEndDate: noEndDate ? undefined : publishEndDate,
        noEndDate,
        authorId: currentUser.internalId,
        authorUserId: currentUser.userId,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorUserType: currentUser.userType
      };
      const id = await createPost(newPost);
      if (id) {
        alert("등록되었습니다.");
        closeView();
        loadPosts();
      } else {
        alert("등록 중 오류가 발생했습니다.");
      }
    } else if (viewMode === 'edit' && selectedPost?.id) {
      const success = await updatePost(selectedPost.id, { 
        title, 
        content, 
        isImportant,
        showOnMain,
        publishStartDate,
        publishEndDate: noEndDate ? undefined : publishEndDate,
        noEndDate
      });
      if (success) {
        alert("수정되었습니다.");
        closeView();
        loadPosts();
      } else {
        alert("수정 중 오류가 발생했습니다.");
      }
    }
    setIsSubmitting(false);
  };

  // 검색 필터링
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
    p.content.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (viewMode === 'write' || viewMode === 'edit') {
    return (
      <BoardLayout
        title={viewMode === 'write' ? '새 글 작성' : '글 수정'}
        breadcrumb={breadcrumb}
        onGoBack={closeView}
        narrow={true}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex-grow flex flex-col shadow-sm">
          
          {/* 게시 위치 (읽기 전용) */}
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 block mb-1">게시 위치(읽기 전용)</span>
            <span className="text-sm font-semibold text-gray-700">{breadcrumb}</span>
          </div>

          {/* 제목 */}
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold border-b border-gray-200 pb-3 outline-none focus:border-blue-500 transition-colors bg-transparent"
            />
          </div>
          
          {/* 옵션 */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
            <div className="mb-6 p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col gap-4">
              <span className="text-sm font-bold text-gray-800">옵션</span>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isImportant" 
                    checked={isImportant} 
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="isImportant" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    중요공지
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showOnMain" 
                    checked={showOnMain} 
                    onChange={(e) => setShowOnMain(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="showOnMain" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    메인에 표시
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4 border-t border-gray-100 pt-4 mt-1">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 font-medium">게시 시작일</label>
                  <input 
                    type="date" 
                    value={publishStartDate}
                    onChange={(e) => setPublishStartDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 font-medium">게시 종료일</label>
                  <input 
                    type="date" 
                    value={publishEndDate}
                    onChange={(e) => setPublishEndDate(e.target.value)}
                    disabled={noEndDate}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-2 mb-2 ml-2">
                  <input 
                    type="checkbox" 
                    id="noEndDate" 
                    checked={noEndDate} 
                    onChange={(e) => setNoEndDate(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="noEndDate" className="text-sm font-semibold text-gray-600 cursor-pointer">
                    종료일 없음
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 내용 */}
          <div className="flex-grow min-h-[300px] mb-4">
            <textarea 
              placeholder="내용을 입력하세요..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none outline-none text-gray-700 leading-relaxed bg-transparent p-2 border border-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button onClick={closeView} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              취소
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {isSubmitting ? '처리 중...' : (viewMode === 'write' ? '등록' : '수정 완료')}
            </button>
          </div>
        </div>
      </BoardLayout>
    );
  }

  if (viewMode === 'detail' && selectedPost) {
    const editOrDeleteAllowed = currentUser ? canEditOrDeletePost(currentUser, selectedPost.authorId) : false;
    
    return (
      <BoardLayout
        title={mainTitle}
        breadcrumb={breadcrumb}
        onGoBack={closeView}
        narrow={true}
      >
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex gap-2 mb-3">
              {selectedPost.isImportant && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                  <AlertCircle className="w-3 h-3" /> 중요
                </span>
              )}
              {selectedPost.showOnMain && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  <Megaphone className="w-3 h-3" /> 메인
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
            <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">{selectedPost.authorName}</span>
                <span>{selectedPost.createdAt?.toLocaleString()}</span>
              </div>
              
              {editOrDeleteAllowed && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(selectedPost)} className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" /> 수정
                  </button>
                  <button onClick={() => handleDelete(selectedPost)} className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 sm:p-8 min-h-[300px]">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-[15px] sm:text-base">
              {selectedPost.content}
            </p>
          </div>
        </div>
      </BoardLayout>
    );
  }

  // List View
  return (
    <BoardLayout
      title={mainTitle}
      breadcrumb={breadcrumb}
      showSearch={true}
      searchKeyword={searchKeyword}
      onSearchChange={setSearchKeyword}
      showWriteButton={writeAllowed}
      onWriteClick={openWrite}
    >
      {loading ? (
        <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-gray-500 shadow-sm">
          {searchKeyword ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              onClick={() => openDetail(post)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {post.isImportant && (
                    <span className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">중요</span>
                  )}
                  {post.showOnMain && (
                    <span className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">메인</span>
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {post.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-medium text-gray-600">{post.authorName}</span>
                  <span>•</span>
                  <span>{post.createdAt?.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center sm:flex-col gap-2 sm:gap-3 flex-shrink-0">
                <button 
                  onClick={(e) => post.id && handleToggleFavorite(post.id, e)}
                  className="p-2 -m-2 text-gray-300 hover:text-yellow-400 transition-colors self-end sm:self-center"
                  title="즐겨찾기 토글"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {post.id && favorites.has(post.id) ? 'star' : 'star_border'}
                  </span>
                </button>
                
                {currentUser?.role === 'teacher' && canEditOrDeletePost(currentUser, post.authorId) && (
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEdit(post); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(post); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </BoardLayout>
  );
};

export default BoardPage;
