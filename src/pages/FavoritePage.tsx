import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites, toggleFavorite } from '../services/firebase/favoriteService';
import { getPosts } from '../services/firebase/boardService';
import { PostData } from '../types';
import BoardLayout from '../components/BoardLayout';

const FavoritePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      const favIds = await getUserFavorites(currentUser.internalId);
      const favSet = new Set(favIds);
      setFavorites(favSet);

      if (favIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 모든 게시글을 불러와서 즐겨찾기 된 것만 필터링합니다.
      const allPosts = await getPosts();
      const filtered = allPosts.filter(p => p.id && favSet.has(p.id));
      setPosts(filtered);
      setLoading(false);
    };

    loadFavorites();
  }, [currentUser, navigate]);

  const handleToggleFavorite = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const internalId = currentUser.internalId;
    if (!internalId) return;

    const newFavs = new Set(favorites);
    const isAdding = !newFavs.has(postId);
    if (isAdding) newFavs.add(postId);
    else newFavs.delete(postId);
    setFavorites(newFavs);

    try {
      await toggleFavorite(internalId, postId);
      // 즐겨찾기 페이지에서는 해제 시 목록에서 바로 사라지도록 처리할 수도 있지만,
      // 일단은 별이 꺼진 상태로 두었다가 새로고침 시 사라지게 하거나 바로 제외할 수 있습니다.
      // 즉시 제외하는 UX가 더 자연스럽습니다.
      if (!isAdding) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      const revertedFavs = new Set(favorites);
      if (isAdding) revertedFavs.delete(postId);
      else revertedFavs.add(postId);
      setFavorites(revertedFavs);
      alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
  };

  const openDetail = (post: PostData) => {
    // 상세 화면으로 이동 (해당 게시판의 상세로 이동)
    if (post.category && post.subCategory) {
      navigate(`/board/${post.category}/${post.subCategory}`, { state: { openPostId: post.id } });
    } else if (post.category === 'grade' && post.grade) {
      navigate(`/board/grade/${post.grade}/${post.subCategory || 'notice'}`, { state: { openPostId: post.id } });
    } else {
      navigate('/board', { state: { openPostId: post.id } });
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
    p.content.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <BoardLayout
      title="내 즐겨찾기"
      breadcrumb="즐겨찾기 목록"
      onGoBack={() => navigate(-1)}
      showSearch={true}
      searchKeyword={searchKeyword}
      onSearchChange={setSearchKeyword}
    >
      {loading ? (
        <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center text-gray-500 shadow-sm">
          {searchKeyword ? '검색 결과가 없습니다.' : '즐겨찾기한 게시글이 없습니다.'}
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
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {post.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {post.category === 'grade' ? `${post.grade}학년` : post.category} {'>'} {post.subCategory}
                  </span>
                  <span className="font-medium text-gray-600">{post.authorName}</span>
                  <span>•</span>
                  <span>{post.createdAt?.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center sm:flex-col gap-2 sm:gap-3 flex-shrink-0">
                <button 
                  onClick={(e) => post.id && handleToggleFavorite(post.id, e)}
                  className="p-2 -m-2 text-yellow-400 hover:text-gray-300 transition-colors self-end sm:self-center"
                  title="즐겨찾기 해제"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    star
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BoardLayout>
  );
};

export default FavoritePage;
