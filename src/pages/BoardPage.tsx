import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canWritePost, canEditOrDeletePost } from '../services/firebase/userService';
import { toggleFavorite, getUserFavorites } from '../services/firebase/favoriteService';
import { getPosts, createPost, updatePost, deletePost } from '../services/firebase/boardService';
import { PostData } from '../types';
import { ArrowLeft, Search, Plus, Edit2, Trash2, Megaphone } from 'lucide-react';

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
  const [isMainNotice, setIsMainNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 게시판 제목 계산
  let boardTitle = '게시판';
  if (gradeId) boardTitle = `${gradeId}학년 게시판`;
  if (subCategory) {
    const subTitleMap: Record<string, string> = {
      korean: '국어', english: '영어', math: '수학', music: '음악', pe: '체육',
      social: '사회', science: '과학', foreign: '외국어', it: '정보', tech: '기술가정', hanja: '한문',
      info: '진로정보', university: '대학정보', department: '학과정보', counseling: '상담신청', resources: '자료실',
      wee: 'Wee클래스', health: '보건실', library: '꿈마루도서관', cafeteria: '학생식당',
      notice: '공지사항', calendar: '학사일정'
    };
    if (subTitleMap[subCategory]) boardTitle += ` - ${subTitleMap[subCategory]}`;
    else boardTitle += ` - ${subCategory}`;
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

  const writeAllowed = currentUser ? canWritePost(currentUser) : true;

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
    setIsMainNotice(false);
    setViewMode('write');
  };

  const openEdit = (post: PostData) => {
    if (!canEditOrDeletePost(currentUser, post.authorId)) {
      alert("수정 권한이 없습니다.");
      return;
    }
    setTitle(post.title);
    setContent(post.content);
    setIsMainNotice(post.isMainNotice || false);
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

    const confirmDelete = window.confirm(`[${post.title}] 글을 정말 삭제하시겠습니까?`);
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
    if (!currentUser) return;

    setIsSubmitting(true);
    if (viewMode === 'write') {
      const newPost: Omit<PostData, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content,
        category,
        subCategory,
        grade: gradeId,
        isMainNotice,
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
      const success = await updatePost(selectedPost.id, { title, content, isMainNotice });
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

  // 공지사항 렌더링
  if (viewMode === 'write' || viewMode === 'edit') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-grow flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={closeView} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {viewMode === 'write' ? '새 글 작성' : '글 수정'}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex-grow flex flex-col shadow-sm">
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold border-b border-gray-200 pb-3 outline-none focus:border-blue-500 transition-colors bg-transparent"
            />
          </div>
          
          {currentUser?.role === 'admin' && (
            <div className="mb-4 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="mainNotice" 
                checked={isMainNotice} 
                onChange={(e) => setIsMainNotice(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="mainNotice" className="text-sm font-medium text-gray-700 flex items-center gap-1 cursor-pointer">
                <Megaphone className="w-4 h-4 text-red-500" /> 메인 노출 공지로 등록
              </label>
            </div>
          )}

          <div className="flex-grow min-h-[300px]">
            <textarea 
              placeholder="내용을 입력하세요..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none outline-none text-gray-700 leading-relaxed bg-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={closeView} className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              취소
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              {isSubmitting ? '처리 중...' : (viewMode === 'write' ? '등록' : '수정 완료')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedPost) {
    const editOrDeleteAllowed = currentUser ? canEditOrDeletePost(currentUser, selectedPost.authorId) : false;
    
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-grow">
        <div className="flex items-center mb-6">
          <button onClick={closeView} className="mr-4 text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">{boardTitle}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            {selectedPost.isMainNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full mb-3">
                <Megaphone className="w-3 h-3" /> 메인 공지
              </span>
            )}
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
      </div>
    );
  }

  // List View
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-grow">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{boardTitle}</h2>
          <p className="text-gray-500 mt-1 text-sm">목록을 확인하고 내용을 검색할 수 있습니다.</p>
        </div>
        
        {writeAllowed && (
          <button 
            onClick={openWrite}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            새 글 작성
          </button>
        )}
      </div>

      {/* 검색 바 */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="제목이나 내용으로 검색하세요..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
        />
      </div>

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
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    {post.isMainNotice && (
                      <span className="text-[10px] sm:text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">공지</span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
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
                
                <button 
                  onClick={(e) => post.id && handleToggleFavorite(post.id, e)}
                  className="p-2 -m-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  title="즐겨찾기 토글"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {post.id && favorites.has(post.id) ? 'star' : 'star_border'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardPage;
