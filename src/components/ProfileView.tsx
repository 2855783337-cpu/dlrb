import React, { useState, useEffect } from 'react';
import {
  Lock,
  Trash2,
  FileText,
  Smile,
  Download,
  Upload,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Heart,
  HelpCircle,
  KeyRound,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  FileJson,
  Copy,
  HardDrive,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { JournalEntry, StickerItem, SecuritySettings } from '../types';
import { StorageService } from '../utils/storage';

interface ProfileViewProps {
  onOpenJournal: (entry: JournalEntry) => void;
  onOpenDraft: (draft: JournalEntry) => void;
  onOpenStickerStudio: () => void;
  onRefreshData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenJournal,
  onOpenDraft,
  onOpenStickerStudio,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'main' | 'drafts' | 'recycle' | 'stickers'>(
    'main'
  );
  const [drafts, setDrafts] = useState<JournalEntry[]>([]);
  const [recycled, setRecycled] = useState<JournalEntry[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [journalsCount, setJournalsCount] = useState<number>(0);
  const [security, setSecurity] = useState<SecuritySettings>(StorageService.getSecuritySettings());
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const loadAll = () => {
    setDrafts(StorageService.getDrafts());
    setRecycled(StorageService.getRecycledJournals());
    setStickers(StorageService.getStickers());
    setSecurity(StorageService.getSecuritySettings());
    const all = StorageService.getJournals();
    setJournalsCount(all.length);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Toggle App Lock
  const handleToggleLock = () => {
    if (!security.hasPasscode) {
      setShowPasscodeModal(true);
      return;
    }
    const updated: SecuritySettings = {
      ...security,
      appLockEnabled: !security.appLockEnabled,
    };
    StorageService.saveSecuritySettings(updated);
    setSecurity(updated);
    showToast(updated.appLockEnabled ? '应用隐私锁已开启' : '应用隐私锁已关闭');
  };

  // Set Passcode
  const handleSetPasscode = () => {
    if (newPasscode.length !== 4) {
      showToast('请输入 4 位数字密码');
      return;
    }
    const updated: SecuritySettings = {
      ...security,
      appLockEnabled: true,
      hasPasscode: true,
      passcode: newPasscode,
    };
    StorageService.saveSecuritySettings(updated);
    setSecurity(updated);
    setShowPasscodeModal(false);
    setNewPasscode('');
    showToast('4位数字隐私密码设置成功');
  };

  // Restore from recycle bin
  const handleRestoreJournal = (id: string) => {
    StorageService.restoreJournal(id);
    loadAll();
    onRefreshData();
    showToast('手账已成功恢复');
  };

  // Permanently delete
  const handlePermanentDelete = (id: string) => {
    StorageService.permanentDeleteJournal(id);
    loadAll();
    onRefreshData();
    showToast('已彻底删除该条手账');
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    StorageService.deleteDraft(id);
    loadAll();
    showToast('草稿已删除');
  };

  // Delete custom sticker
  const handleDeleteSticker = (id: string) => {
    StorageService.deleteSticker(id);
    loadAll();
    showToast('贴纸已删除');
  };

  // Direct export all data to local JSON file
  const handleExportBackup = () => {
    try {
      const exportData = StorageService.exportJournalsData();
      const blob = new Blob([exportData.json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`已成功导出 ${exportData.totalCount} 篇手账数据到本地 JSON 文件`);
    } catch (err) {
      console.error('Export error', err);
      showToast('导出失败，请重试');
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    try {
      const exportData = StorageService.exportJournalsData();
      navigator.clipboard.writeText(exportData.json).then(() => {
        setCopiedJson(true);
        showToast('备份 JSON 数据已完整复制到剪贴板');
        setTimeout(() => setCopiedJson(false), 2000);
      }).catch(() => {
        showToast('复制失败，请直接点击下载文件');
      });
    } catch {
      showToast('复制失败，请直接点击下载文件');
    }
  };

  // Import backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = StorageService.importData(text);
      if (result.success) {
        loadAll();
        onRefreshData();
        showToast(`手账数据恢复成功！共导入 ${result.count ?? 0} 篇手账`);
      } else {
        showToast(result.message || '备份文件格式有误，导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportSummary = StorageService.exportJournalsData();

  return (
    <div id="personal-center-module" className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wide">个人中心</h1>
          <p className="text-xs text-[#9E8F80] mt-0.5">隐私锁 · 草稿箱 · 回收站 · 贴纸库</p>
        </div>

        {activeSubTab !== 'main' && (
          <button
            onClick={() => setActiveSubTab('main')}
            className="px-3 py-1 rounded-xl bg-[#EFE9DF] text-[#6E5D4F] text-xs font-medium hover:bg-[#E2D8CC]"
          >
            返回设置
          </button>
        )}
      </div>

      {activeSubTab === 'main' && (
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-xs flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8DDD1] flex items-center justify-center text-xl shadow-inner">
              📖
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-[#4A3E34]">手账生活家</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF5EE] text-[#4F734F]">
                  纯免费永久使用
                </span>
              </div>
              <p className="text-xs text-[#9A897B] mt-1">
                草稿箱 {drafts.length} 篇 · 贴纸库 {stickers.length} 个 · 回收站 {recycled.length} 篇
              </p>
            </div>
          </div>

          {/* Feature Shortcuts Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              id="btn-nav-drafts"
              onClick={() => setActiveSubTab('drafts')}
              className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5] flex flex-col items-center hover:bg-white transition-all shadow-2xs group"
            >
              <FileText className="w-5 h-5 text-[#8C6D53] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#4A3E34] mt-1.5">草稿箱</span>
              <span className="text-[10px] text-[#A69B90]">{drafts.length} 篇待续</span>
            </button>

            <button
              id="btn-nav-recycle"
              onClick={() => setActiveSubTab('recycle')}
              className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5] flex flex-col items-center hover:bg-white transition-all shadow-2xs group"
            >
              <Trash2 className="w-5 h-5 text-[#8C6D53] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#4A3E34] mt-1.5">回收站</span>
              <span className="text-[10px] text-[#A69B90]">30天自动清理</span>
            </button>

            <button
              id="btn-nav-stickers"
              onClick={() => setActiveSubTab('stickers')}
              className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5] flex flex-col items-center hover:bg-white transition-all shadow-2xs group"
            >
              <Smile className="w-5 h-5 text-[#8C6D53] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#4A3E34] mt-1.5">贴纸库</span>
              <span className="text-[10px] text-[#A69B90]">无上限免扣</span>
            </button>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#6B5A4D]" />
                <h3 className="text-sm font-semibold text-[#4A3E34]">隐私锁保护</h3>
              </div>
              <span className="text-[11px] text-[#9A897B]">锁定时隐藏全部手账</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-medium text-[#4A3E34]">开启 4 位数字应用锁</span>
                <p className="text-[11px] text-[#9E8F80]">退出切出应用后自动加密保护私密日记</p>
              </div>
              <button
                id="btn-toggle-app-lock"
                onClick={handleToggleLock}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  security.appLockEnabled ? 'bg-[#7D6B5D]' : 'bg-[#D6CBBF]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    security.appLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-[#EAE2D5] flex items-center justify-between">
              <span className="text-xs text-[#7A6B5E]">修改隐私解锁密码</span>
              <button
                onClick={() => setShowPasscodeModal(true)}
                className="text-xs text-[#8C6D53] hover:underline font-medium"
              >
                {security.hasPasscode ? '重设密码' : '设置密码'}
              </button>
            </div>
          </div>

          {/* Data Backup & Export Section */}
          <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8E1D5] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-[#EFE9DF] flex items-center justify-center">
                  <FileJson className="w-4 h-4 text-[#6B5A4D]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#4A3E34]">数据资产自主备份</h3>
                  <p className="text-[10px] text-[#9A897B]">本地 JSON 格式 · 100% 自主掌控</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF5EE] text-[#4F734F] font-medium">
                无云端绑定
              </span>
            </div>

            <p className="text-xs text-[#7A6B5E] leading-relaxed">
              数据完全属于你。可随时将全部手账、自制贴纸、草稿、回忆空间及排版完整导出为标准本地 JSON 文件，实现完全自主的数据离线备份与跨设备迁移。
            </p>

            {/* Asset statistics overview */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-white/80 rounded-xl p-2 border border-[#EAE2D5] text-center">
                <span className="text-[10px] text-[#9A897B] block">全部手账</span>
                <span className="text-sm font-semibold text-[#4A3E34]">{exportSummary.totalCount} 篇</span>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-[#EAE2D5] text-center">
                <span className="text-[10px] text-[#9A897B] block">自制贴纸</span>
                <span className="text-sm font-semibold text-[#4A3E34]">{exportSummary.stickersCount} 张</span>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-[#EAE2D5] text-center">
                <span className="text-[10px] text-[#9A897B] block">预估体积</span>
                <span className="text-sm font-semibold text-[#4A3E34]">{exportSummary.sizeKb} KB</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  id="btn-export-backup-json"
                  onClick={handleExportBackup}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>导出本地 JSON 文件</span>
                </button>

                <button
                  id="btn-open-export-details"
                  onClick={() => setShowExportModal(true)}
                  className="py-2.5 px-3 rounded-2xl bg-white border border-[#DDD2C4] text-xs font-medium text-[#4A3E34] hover:bg-[#F2ECE3] flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                  title="查看备份详情与复制"
                >
                  <Eye className="w-4 h-4 text-[#7A6B5E]" />
                  <span>详情</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyJson}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#DDD2C4] text-[11px] font-medium text-[#6B5A4D] hover:bg-[#F2ECE3] flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                >
                  {copiedJson ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4F734F]" />
                      <span className="text-[#4F734F]">JSON 已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#7A6B5E]" />
                      <span>复制 JSON 文本</span>
                    </>
                  )}
                </button>

                <label className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#DDD2C4] text-[11px] font-medium text-[#6B5A4D] hover:bg-[#F2ECE3] flex items-center justify-center space-x-1 shadow-2xs cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#7A6B5E]" />
                  <span>导入 JSON 恢复</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Free Commitment Card */}
          <div className="bg-[#FAF4ED] rounded-3xl p-5 border border-[#EADBCA] space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#B36829]" />
              <h3 className="text-xs font-bold text-[#7A5F45] tracking-wider uppercase">
                100% 极简治愈承诺
              </h3>
            </div>
            <p className="text-xs text-[#8C6D53] leading-relaxed">
              无开屏广告、无弹窗推广、无VIP字体、无付费排版模板、无云存储容量售卖。只是一本安安静静陪伴普通人随手记录生活的随身小本。
            </p>
          </div>
        </div>
      )}

      {/* Sub Tab: Drafts Box */}
      {activeSubTab === 'drafts' && (
        <div className="space-y-3">
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8E1D5] text-xs text-[#7A6B5E]">
            💡 退出手账编辑器时会自动为你存为草稿，可随时点开继续完成，正式保存后自动从草稿箱移出。
          </div>

          {drafts.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-3xl p-10 text-center text-xs text-[#9E8F80] border border-[#E8E1D5]">
              草稿箱是空的，没有未完成的手账~
            </div>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-2xs flex items-center justify-between group"
              >
                <div
                  onClick={() => onOpenDraft(d)}
                  className="cursor-pointer flex-1 space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-semibold text-[#4A3E34] group-hover:text-[#68584B]">
                      {d.title || '无标题草稿'}
                    </h3>
                    <span className="text-[10px] text-[#A69B90]">{d.mood}</span>
                  </div>
                  <p className="text-[11px] text-[#8C7D70] line-clamp-1">
                    {d.content || '(含照片与排版素材)'}
                  </p>
                  <span className="text-[10px] text-[#A69B90]">
                    最近编辑：{d.updatedAt.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteDraft(d.id)}
                  className="p-2 text-[#A69B90] hover:text-[#D9776C] transition-colors"
                  title="丢弃草稿"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub Tab: Recycle Bin */}
      {activeSubTab === 'recycle' && (
        <div className="space-y-3">
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8E1D5] text-xs text-[#7A6B5E]">
            ♻️ 回收站中的手账在 30 天后将彻底删除。误删的手账随时可以在此一键恢复。
          </div>

          {recycled.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-3xl p-10 text-center text-xs text-[#9E8F80] border border-[#E8E1D5]">
              回收站空空如也，没有被删除的手账。
            </div>
          ) : (
            recycled.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-2xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-[#4A3E34]">{r.title}</h3>
                  <p className="text-[11px] text-[#8C7D70] line-clamp-1">{r.content}</p>
                  <span className="text-[10px] text-[#B08D80]">
                    已移入回收站 · 自动保留30天
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleRestoreJournal(r.id)}
                    className="p-2 rounded-xl bg-[#EFF5EE] text-[#4F734F] hover:bg-[#E3EFE1] text-xs flex items-center space-x-1"
                    title="恢复手账"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(r.id)}
                    className="p-2 text-[#A69B90] hover:text-[#D9776C]"
                    title="彻底删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub Tab: Sticker Library Manager */}
      {activeSubTab === 'stickers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A6B5E]">
              个人贴纸库（共 {stickers.length} 个 · 无上限免费）
            </span>
            <button
              onClick={onOpenStickerStudio}
              className="px-3 py-1.5 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] flex items-center space-x-1 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI抠新贴纸</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stickers.map((stk) => (
              <div
                key={stk.id}
                className="bg-white rounded-2xl p-3 border border-[#E8E1D5] flex flex-col items-center relative group"
              >
                <img
                  src={stk.url}
                  alt={stk.name}
                  className="w-16 h-16 object-contain my-1 group-hover:scale-105 transition-transform"
                />
                <span className="text-[11px] text-[#5C4D41] mt-1 font-medium truncate w-full text-center">
                  {stk.name}
                </span>

                <button
                  onClick={() => handleDeleteSticker(stk.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D9776C]"
                  title="删除贴纸"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passcode Setup Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-xs w-full shadow-xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <h3 className="text-sm font-semibold text-[#4A3E34]">设置 4 位隐私密码</h3>
              <button
                onClick={() => setShowPasscodeModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs text-[#6E5D4F] block mb-1.5">请输入 4 位数字密码：</label>
              <input
                type="password"
                maxLength={4}
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="4位数字"
                className="w-full bg-white border border-[#E2D8CC] rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-[#4A3E34] focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowPasscodeModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#7A6B5E]"
              >
                取消
              </button>
              <button
                onClick={handleSetPasscode}
                disabled={newPasscode.length !== 4}
                className="px-4 py-1.5 rounded-xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] disabled:opacity-40"
              >
                保存密码
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export & Data Backup Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl p-5 max-w-sm w-full shadow-xl border border-[#E8E1D5] space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-[#EFE9DF] flex items-center justify-center">
                  <FileJson className="w-4 h-4 text-[#6B5A4D]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#4A3E34]">手账数据自主备份</h3>
                  <span className="text-[10px] text-[#9A897B] block truncate max-w-[180px]">
                    {exportSummary.fileName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#8C7D70] hover:text-[#4A3E34] text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="bg-[#FAF4ED] p-3 rounded-2xl border border-[#EADBCA] text-[#7A5F45] leading-relaxed">
                ✨ <strong>数据资产完全属于你</strong>
                <p className="mt-1 text-[11px] text-[#8C6D53]">
                  导出文件采用无加密、透明开放的标准 JSON 格式。包含全部手账正文、排版字体、纸张样式、手绘涂鸦轨迹点、图片素材及自制贴纸，永久离线可用。
                </p>
              </div>

              {/* Data checklist */}
              <div className="bg-white/80 rounded-2xl p-3 border border-[#E8E1D5] space-y-2">
                <span className="font-medium text-[#4A3E34] text-xs block">本次导出包含内容：</span>
                <div className="space-y-1.5 text-[11px] text-[#6E5D4F]">
                  <div className="flex items-center justify-between">
                    <span>📖 已发布手账</span>
                    <span className="font-semibold text-[#4A3E34]">{exportSummary.activeCount} 篇</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📝 未完结草稿</span>
                    <span className="font-semibold text-[#4A3E34]">{exportSummary.draftCount} 篇</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🗑️ 回收站手账</span>
                    <span className="font-semibold text-[#4A3E34]">{exportSummary.recycledCount} 篇</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✂️ 自制免抠贴纸</span>
                    <span className="font-semibold text-[#4A3E34]">{exportSummary.stickersCount} 张</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🌰 双人私密空间记录</span>
                    <span className="font-semibold text-[#4A3E34]">{exportSummary.spacesCount} 个</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#EAE2D5]">
                    <span>💾 预估体积</span>
                    <span className="font-semibold text-[#7D6B5D]">{exportSummary.sizeKb} KB</span>
                  </div>
                </div>
              </div>

              {/* JSON preview toggle */}
              <div>
                <button
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-[#E8E1D5] text-[11px] text-[#6E5D4F] hover:bg-white"
                >
                  <span className="font-medium">JSON 数据结构预览</span>
                  {showJsonPreview ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#9A897B]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#9A897B]" />
                  )}
                </button>

                {showJsonPreview && (
                  <div className="mt-1.5 p-2.5 bg-[#2D2824] text-[#E8DDD1] rounded-xl text-[10px] font-mono max-h-36 overflow-y-auto leading-relaxed select-all">
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        {
                          appName: '极简治愈手账',
                          exportedAt: new Date().toISOString(),
                          summary: {
                            totalJournals: exportSummary.totalCount,
                            active: exportSummary.activeCount,
                            drafts: exportSummary.draftCount,
                            stickers: exportSummary.stickersCount,
                          },
                          journalsCount: exportSummary.totalCount,
                          sampleEntryTitle: exportSummary.totalCount > 0 ? '手账数据已封装' : '无数据',
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 border-t border-[#E8E1D5]">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-2xl bg-[#7D6B5D] text-white text-xs font-medium hover:bg-[#68584B] flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>立即下载 JSON 备份文件</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleCopyJson}
                  className="flex-1 py-2 rounded-xl bg-white border border-[#DDD2C4] text-xs text-[#6B5A4D] hover:bg-[#F2ECE3] flex items-center justify-center space-x-1"
                >
                  {copiedJson ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4F734F]" />
                      <span className="text-[#4F734F]">已复制 JSON 文本</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#7A6B5E]" />
                      <span>复制全部 JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#7A6B5E] hover:bg-[#EAE2D5]"
                >
                  关闭
                </button>
              </div>
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
