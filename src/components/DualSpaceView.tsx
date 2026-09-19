import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Lock,
  MessageCircle,
  Trash2,
  Send,
  Sparkles,
  AlertTriangle,
  UserPlus,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { DualSpace, JournalEntry, CommentItem } from '../types';
import { StorageService } from '../utils/storage';

interface DualSpaceViewProps {
  journals: JournalEntry[];
  onOpenJournal: (entry: JournalEntry) => void;
  onNewSpaceJournal: (spaceId: string) => void;
  onDeleteJournal: (id: string) => void;
}

export const DualSpaceView: React.FC<DualSpaceViewProps> = ({
  journals,
  onOpenJournal,
  onNewSpaceJournal,
  onDeleteJournal,
}) => {
  const [spaces, setSpaces] = useState<DualSpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activeCommentJournalId, setActiveCommentJournalId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [newPartnerName, setNewPartnerName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadData = () => {
    const list = StorageService.getDualSpaces();
    setSpaces(list);
    if (list.length > 0 && !activeSpaceId) {
      setActiveSpaceId(list[0].id);
    }
    setComments(StorageService.getComments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

  // Filter journals belonging exclusively to this dual space
  const spaceJournals = journals.filter(
    (j) => j.scope === 'shared' && j.spaceId === activeSpace?.id && !j.deletedAt
  );

  // Create new space
  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) {
      showToast('请输入双人空间名称');
      return;
    }
    const partner = newPartnerName.trim() || '亲密的TA';
    const code = `SPACE-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSpace: DualSpace = {
      id: `space_${Date.now()}`,
      name: newSpaceName.trim(),
      description: '两个人都是空间主人，手账专属同步留存。',
      creatorId: 'user_self',
      creatorName: '我',
      partnerId: `user_partner_${Date.now()}`,
      partnerName: partner,
      code,
      coverColor: '#D3A29D',
      createdAt: new Date().toISOString(),
      isDisbanded: false,
    };

    StorageService.saveDualSpace(newSpace);
    loadData();
    setActiveSpaceId(newSpace.id);
    setShowCreateModal(false);
    setNewSpaceName('');
    setNewPartnerName('');
    showToast(`双人空间创建成功！空间口令：${code}`);
  };

  // Join space via in-app code
  const handleJoinSpace = () => {
    if (!joinCode.trim()) {
      showToast('请输入好友空间口令');
      return;
    }

    const newSpace: DualSpace = {
      id: `space_joined_${Date.now()}`,
      name: `与好友的秘密空间`,
      description: '两个人都是空间主人，双人回忆专属留存。',
      creatorId: 'user_friend',
      creatorName: '好友',
      partnerId: 'user_self',
      partnerName: '我',
      code: joinCode.trim().toUpperCase(),
      coverColor: '#98B4D4',
      createdAt: new Date().toISOString(),
      isDisbanded: false,
    };

    StorageService.saveDualSpace(newSpace);
    loadData();
    setActiveSpaceId(newSpace.id);
    setShowJoinModal(false);
    setJoinCode('');
    showToast('已通过口令成功加入双人空间！');
  };

  // Disband space (history preserved, partner can no longer view)
  const handleDisbandSpace = () => {
    if (
      window.confirm(
        '确认解除该双人空间？\n解除后：历史手账在你的本地档案中完整保留，对方将无法继续查看与更新。'
      )
    ) {
      if (activeSpace) {
        StorageService.disbandDualSpace(activeSpace.id);
        loadData();
        showToast('空间已解除，历史内容已在个人档案中冻结保留。');
      }
    }
  };

  // Synchronous delete of space journal (either party deleting it removes it synchronously for both)
  const handleDeleteSpaceJournal = (journalId: string) => {
    if (
      window.confirm('在双人空间中删除手账，双方将同步消失。确认删除这篇手账吗？')
    ) {
      onDeleteJournal(journalId);
      showToast('手账已从双人空间中同步删除');
    }
  };

  // Comments
  const handleAddComment = (journalId: string) => {
    if (!newCommentText.trim() || !activeSpace) return;

    const newCmt: CommentItem = {
      id: `cmt_${Date.now()}`,
      journalId,
      spaceId: activeSpace.id,
      authorId: 'user_self',
      authorName: '我',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    StorageService.addComment(newCmt);
    setComments(StorageService.getComments());
    setNewCommentText('');
    showToast('留言已同步到双人空间 · 仅对方收到通知');
  };

  // Comment deletion rule:
  // "自己可删自己评论，双方可删除空间任意评论"
  const handleDeleteComment = (comment: CommentItem) => {
    StorageService.deleteComment(comment.id);
    setComments(StorageService.getComments());
    showToast('评论已删除');
  };

  return (
    <div id="dual-space-module" className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wide flex items-center space-x-1.5">
            <span>双人私密空间</span>
            <Lock className="w-4 h-4 text-[#A86F68]" />
          </h1>
          <p className="text-xs text-[#9E8F80] mt-0.5">
            双人共同主人 · 专属手账同步留存 · 与个人手账完全隔离
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E3D8CC] text-xs text-[#6B5A4D] hover:bg-[#F7EFE6] flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>口令加好友</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] flex items-center space-x-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>创建新空间</span>
          </button>
        </div>
      </div>

      {/* Spaces Tab Switcher (if multiple spaces) */}
      {spaces.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {spaces.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSpaceId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all ${
                activeSpaceId === s.id
                  ? 'bg-[#A86F68] text-white shadow-xs font-medium'
                  : 'bg-white text-[#7A6B5E] border border-[#E8E1D5]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Space Hero Card */}
      {activeSpace && (
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A86F68] animate-pulse" />
                <h2 className="text-base font-semibold text-[#4A3E34]">{activeSpace.name}</h2>
              </div>
              <p className="text-xs text-[#8C7D70] mt-1">{activeSpace.description}</p>
            </div>

            <button
              onClick={() => onNewSpaceJournal(activeSpace.id)}
              className="px-3 py-1.5 rounded-xl bg-[#A86F68] text-white text-xs font-medium hover:bg-[#915B54] active:scale-95 transition-all flex items-center space-x-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>发双人手账</span>
            </button>
          </div>

          {/* Co-Owners info & Isolation Notice */}
          <div className="p-3 bg-white/80 rounded-2xl border border-[#EBE2D5] flex items-center justify-between text-xs text-[#7A6B5E]">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#EAE2D5] flex items-center justify-center font-medium text-[10px]">
                我
              </span>
              <span className="text-[#A09386]">&</span>
              <span className="w-6 h-6 rounded-full bg-[#F3DDD9] text-[#A86F68] flex items-center justify-center font-medium text-[10px]">
                {activeSpace.partnerName}
              </span>
              <span className="text-[11px] text-[#9E8F80]">两人均为主人 · 仅双人可见</span>
            </div>

            <span className="text-[10px] text-[#A69B90] font-mono">
              口令: {activeSpace.code}
            </span>
          </div>

          {/* Space Disband warning/button */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#9A897B]">
            <span>手账修改静默同步 · 仅评论有消息提醒</span>
            {!activeSpace.isDisbanded ? (
              <button
                onClick={handleDisbandSpace}
                className="text-[#B36829] hover:underline"
              >
                解除空间
              </button>
            ) : (
              <span className="text-[#D9776C]">已解除（历史已冻结封存）</span>
            )}
          </div>
        </div>
      )}

      {/* Space Journals Feed */}
      <div className="space-y-4">
        {spaceJournals.length === 0 ? (
          <div className="bg-[#FAF7F2] rounded-3xl p-8 text-center text-xs text-[#9E8F80] border border-[#E8E1D5] space-y-2">
            <HeartHandshake className="w-8 h-8 mx-auto text-[#C29892] stroke-[1.5]" />
            <p>空间里还没有手账呢。</p>
            <p className="text-[11px] text-[#B0A295]">
              点击右上角「发双人手账」，写下专属二人的温暖生活片段吧 🌱
            </p>
          </div>
        ) : (
          spaceJournals.map((journal) => {
            const journalComments = comments.filter((c) => c.journalId === journal.id);
            const isCommentsOpen = activeCommentJournalId === journal.id;

            return (
              <div
                key={journal.id}
                className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-2xs space-y-3"
              >
                {/* Journal Author & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#EFE8DE] text-[10px] font-medium text-[#6E5D4F]">
                      {journal.authorName} 的手账
                    </span>
                    <span className="text-xs text-[#B36829]">{journal.mood}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-[#A69B90] font-mono">
                      {journal.createdAt.slice(0, 10)}
                    </span>
                    {/* Delete button: synchronous deletion for both co-owners */}
                    <button
                      onClick={() => handleDeleteSpaceJournal(journal.id)}
                      className="p-1 rounded-lg text-[#A69B90] hover:text-[#D9776C] transition-colors"
                      title="删除这篇手账（双方同步消失）"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clickable Card Body */}
                <div
                  onClick={() => onOpenJournal(journal)}
                  className="bg-white/80 rounded-2xl p-4 border border-[#ECE4D8] cursor-pointer hover:bg-white transition-all space-y-2.5"
                >
                  <h3 className="text-sm font-semibold text-[#4A3E34]">{journal.title}</h3>
                  <p className="text-xs text-[#5C4D41] leading-relaxed line-clamp-3">
                    {journal.content}
                  </p>

                  {/* Photos */}
                  {journal.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {journal.images.slice(0, 2).map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                          <img
                            src={img.doodleOverlay || img.url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stickers count if any */}
                  {journal.stickers.length > 0 && (
                    <div className="flex items-center space-x-1 text-[10px] text-[#A69B90]">
                      <Sparkles className="w-3 h-3 text-[#B36829]" />
                      <span>带有 {journal.stickers.length} 个治愈贴纸</span>
                    </div>
                  )}
                </div>

                {/* Comment Bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs text-[#8C7D70]">
                    <button
                      onClick={() =>
                        setActiveCommentJournalId(isCommentsOpen ? null : journal.id)
                      }
                      className="flex items-center space-x-1 hover:text-[#4A3E34]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>专属留言 ({journalComments.length})</span>
                    </button>
                  </div>

                  {/* Comment list accordion */}
                  {isCommentsOpen && (
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-[#EAE2D5]">
                      {journalComments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white/70 p-2.5 rounded-xl text-xs flex items-start justify-between border border-[#EAE2D5]"
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-[#4A3E34]">{c.authorName}</span>
                              <span className="text-[10px] text-[#A69B90]">
                                {c.createdAt.slice(11, 16)}
                              </span>
                            </div>
                            <p className="text-[#5C4D41] mt-0.5">{c.text}</p>
                          </div>

                          {/* Both owners can delete any comment; author can delete own */}
                          <button
                            onClick={() => handleDeleteComment(c)}
                            className="text-[#B3A497] hover:text-[#D9776C] text-[10px] p-1"
                            title="双方主人均可删除留言"
                          >
                            删除
                          </button>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="写下温暖留言，仅对方能看见..."
                          className="flex-1 bg-white border border-[#E0D5C7] rounded-xl px-3 py-1.5 text-xs text-[#4A3E34] focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(journal.id);
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(journal.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#A86F68] text-white text-xs font-medium hover:bg-[#915B54] active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="text-sm font-semibold text-[#4A3E34]">创建专属双人回忆空间</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6E5D4F] block mb-1">空间名称：</label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="如：两颗小松果的秘密树洞 🌰"
                  className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#6E5D4F] block mb-1">对方昵称：</label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="如：小暖 / 闺蜜 / 恋人"
                  className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-[#A69B90] leading-relaxed">
                创建后将生成专属空间口令，直接发给对方输入口令即可进入，不支持外部公域分享。
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#7A6B5E]"
              >
                取消
              </button>
              <button
                onClick={handleCreateSpace}
                className="px-4 py-2 rounded-xl bg-[#A86F68] text-white text-xs font-medium hover:bg-[#915B54]"
              >
                立即创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Space Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="text-sm font-semibold text-[#4A3E34]">通过口令加入双人空间</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6E5D4F] block mb-1">输入空间口令 (如 WARM-2026)：</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="请输入对方分享给你的口令..."
                  className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] font-mono tracking-wider focus:outline-none uppercase"
                />
              </div>

              <p className="text-[11px] text-[#A69B90] leading-relaxed">
                加入后两个人均为主创者，手账仅你们双方可见，安全私密。
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#7A6B5E]"
              >
                取消
              </button>
              <button
                onClick={handleJoinSpace}
                className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B]"
              >
                确认加入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#4A3E34]/95 text-white text-xs px-4 py-2 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
