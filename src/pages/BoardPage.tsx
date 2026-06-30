import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canWritePost, canEditOrDeletePost } from '../services/firebase/userService';
import { PostData } from '../types';

// 임시 게시글 데이터
const DUMMY_POSTS: PostData[] = [
  {
    id: 'post_1',
    title: '전교생 공지사항',
    content: '공지사항 내용입니다.',
    authorId: 'T000001',
    authorUserId: '90001',
    authorName: '수교사',
    authorRole: 'admin',
    authorUserType: 'T',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'post_2',
    title: '학년 게시판 안내',
    content: '학년 게시판 내용입니다.',
    authorId: 'T000002',
    authorUserId: '90002',
    authorName: '우교사',
    authorRole: 'teacher',
    authorUserType: 'T',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const BoardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<PostData[]>(DUMMY_POSTS);

  const writeAllowed = canWritePost(currentUser);

  const handleEdit = (post: PostData) => {
    if (!canEditOrDeletePost(currentUser, post.authorId)) {
      alert("수정 권한이 없습니다.");
      return;
    }
    alert(`[${post.title}] 글을 수정합니다.`);
  };

  const handleDelete = (post: PostData) => {
    if (!canEditOrDeletePost(currentUser, post.authorId)) {
      alert("삭제 권한이 없습니다.");
      return;
    }
    const confirmDelete = window.confirm(`[${post.title}] 글을 정말 삭제하시겠습니까?`);
    if (confirmDelete) {
      setPosts(posts.filter(p => p.id !== post.id));
      alert("삭제되었습니다.");
    }
  };

  const handleWrite = () => {
    if (!writeAllowed) {
      alert("작성 권한이 없습니다.");
      return;
    }
    alert("새 게시글 작성 창으로 이동합니다.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">게시판 (RBAC 테스트)</h2>
        
        {/* 권한에 따른 글쓰기 버튼 표시 여부 */}
        {writeAllowed && (
          <button 
            onClick={handleWrite}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
            글쓰기
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {posts.map(post => {
          const editOrDeleteAllowed = canEditOrDeletePost(currentUser, post.authorId);
          
          return (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{post.authorName}</span>
                    <span>•</span>
                    <span>{post.authorRole}</span>
                  </div>
                </div>
                
                {/* 권한에 따른 수정/삭제 버튼 표시 여부 */}
                {editOrDeleteAllowed && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="text-sm px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(post)}
                      className="text-sm px-3 py-1.5 border border-red-200 rounded-md text-red-500 hover:bg-red-50 font-medium transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-4 text-gray-600 text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardPage;
