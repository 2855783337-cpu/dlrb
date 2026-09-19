import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Copy,
  Flag,
  Share2,
  Check,
  Plus,
  ShieldCheck,
  Tag,
  Clock,
} from 'lucide-react';
import { TemplateItem, JournalEntry } from '../types';
import { StorageService } from '../utils/storage';

interface TemplateSquareProps {
  onUseTemplate: (template: TemplateItem) => void;
  myJournals: JournalEntry[];
}

export const TemplateSquare: React.FC<TemplateSquareProps> = ({
  onUseTemplate,
  myJournals,
}) => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [selectedJournalToPublish, setSelectedJournalToPublish] = useState<string>('');
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishDesc, setPublishDesc] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadTemplates = () => {
    setTemplates(StorageService.getTemplates());
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'daily', label: '日常生活' },
    { id: 'food', label: '美食烟火' },
    { id: 'travel', label: '旅行胶卷' },
    { id: 'reading', label: '书影摘抄' },
    { id: 'weekly', label: '周计划复盘' },
    { id: 'pet', label: '萌宠日常' },
  ];

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  // Report template -> delist immediately
  const handleReport = (tplId: string, title: string) => {
    if (window.confirm(`确认举报「${title}」？经审核将立即下架，不可继续使用。`)) {
      StorageService.reportTemplate(tplId);
      loadTemplates();
      showToast('已收到举报，该模板已立即从广场下架。');
    }
  };

  // Publish user journal as custom template to square
  const handlePublish = () => {
    const journal = myJournals.find((j) => j.id === selectedJournalToPublish);
    if (!journal) {
      showToast('请选择一篇手账进行发布');
      return;
    }

    const newTpl: TemplateItem = {
      id: `tpl_user_${Date.now()}`,
      title: publishTitle.trim() || `${journal.title} 模版`,
      description: publishDesc.trim() || '来自手账爱好者的免费共享模板',
      category: 'daily',
      isOfficial: false,
      authorName: '手账同好',
      authorId: 'user_self',
      paperStyle: journal.paperStyle,
      fontFamily: journal.fontFamily,
      tags: ['个人自制', '自由共享'],
      sampleTitle: journal.title,
      sampleContent: journal.content,
      sampleMood: journal.mood,
      sampleWeather: journal.weather,
      sampleImages: journal.images,
      sampleCollageLayout: journal.collageLayout,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveTemplate(newTpl);
    loadTemplates();
    setShowPublishModal(false);
    showToast('自制模板已成功发布到广场，全部免费共享！');
  };

  return (
    <div id="template-square-module" className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wide flex items-center space-x-1.5">
            <span>模板广场</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF5EE] text-[#4F734F] font-normal">
              100% 免费共享
            </span>
          </h1>
          <p className="text-xs text-[#9E8F80] mt-0.5">
            零排版压力 · 一键套用排版 · 支持自制发布与二次修改
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="px-3 py-1.5 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] active:scale-95 transition-all flex items-center space-x-1 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>发布我的模板</span>
        </button>
      </div>

      {/* Free Promise Banner */}
      <div className="bg-[#FAF4ED] border border-[#EADBCA] p-3 rounded-2xl flex items-center space-x-2.5">
        <ShieldCheck className="w-5 h-5 text-[#B36829] shrink-0" />
        <p className="text-xs text-[#7A5F45] leading-relaxed">
          治愈手账承诺：所有模板无付费、无VIP限制、无商业推广，每个人都能免费使用与共享创作。
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all ${
              selectedCategory === c.id
                ? 'bg-[#736254] text-white font-medium shadow-xs'
                : 'bg-[#FAF7F2] text-[#8C7D70] border border-[#E8E1D5] hover:bg-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-2xs hover:shadow-xs transition-all space-y-3"
          >
            {/* Top row: Title + Badges */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-[#4A3E34]">{tpl.title}</h3>
                  {tpl.isOfficial ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAE3D8] text-[#6E5D4F]">
                      官方推荐
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FAF0E6] text-[#A06C38]">
                      自制分享
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C7D70] mt-1">{tpl.description}</p>
              </div>

              {/* Report button */}
              <button
                onClick={() => handleReport(tpl.id, tpl.title)}
                className="text-[11px] text-[#A69B90] hover:text-[#D9776C] flex items-center space-x-0.5 p-1"
                title="举报违规模板"
              >
                <Flag className="w-3 h-3" />
                <span>举报</span>
              </button>
            </div>

            {/* Template Preview Card Snippet */}
            <div className="bg-white/80 rounded-2xl p-3.5 border border-[#EBE3D8] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#9E8F80]">
                <span>预设：{tpl.sampleMood} · {tpl.sampleWeather}</span>
                <span className="font-mono">{tpl.paperStyle}纸张</span>
              </div>
              <p className="text-xs text-[#5C4D41] line-clamp-2 leading-relaxed italic">
                "{tpl.sampleContent}"
              </p>
              {tpl.sampleImages.length > 0 && (
                <div className="flex items-center space-x-2 pt-1">
                  {tpl.sampleImages.slice(0, 2).map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt="preview"
                      className="w-12 h-12 object-cover rounded-lg border border-[#E3DACD]"
                    />
                  ))}
                  <span className="text-[10px] text-[#9A897B]">
                    包含 {tpl.sampleImages.length} 张模板排版配图
                  </span>
                </div>
              )}
            </div>

            {/* Tags and Action buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-1 text-[10px] text-[#9E8F80]">
                {tpl.tags.map((t, idx) => (
                  <span key={idx} className="bg-[#EFE8DE] px-2 py-0.5 rounded-full">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id={`btn-use-tpl-${tpl.id}`}
                  onClick={() => onUseTemplate(tpl)}
                  className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] active:scale-95 transition-all flex items-center space-x-1.5 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>一键套用</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Custom Template Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="text-sm font-semibold text-[#4A3E34]">发布我的自制手账模板</h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            {myJournals.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9E8F80]">
                你还没有写过手账，写好一篇后即可将其保存发布为模板！
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1">选择要发布的原创手账：</label>
                  <select
                    value={selectedJournalToPublish}
                    onChange={(e) => {
                      setSelectedJournalToPublish(e.target.value);
                      const j = myJournals.find((item) => item.id === e.target.value);
                      if (j) setPublishTitle(`${j.title} 模版`);
                    }}
                    className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] focus:outline-none"
                  >
                    <option value="">-- 请选择手账 --</option>
                    {myJournals.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.createdAt.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1">模板名称：</label>
                  <input
                    type="text"
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="如：今日咖啡漫记 · 模板"
                    className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#6E5D4F] block mb-1">模板简介：</label>
                  <input
                    type="text"
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    placeholder="简要描述这套模板的风格或使用场景..."
                    className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-xs text-[#4A3E34] focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF0E6] text-[11px] text-[#8C6D53]">
                  💡 所有人均可免费使用你发布的模板，互相传递治愈力量。
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-[#7A6B5E]"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={!selectedJournalToPublish}
                className="px-4 py-2 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] disabled:opacity-40"
              >
                确认发布
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
