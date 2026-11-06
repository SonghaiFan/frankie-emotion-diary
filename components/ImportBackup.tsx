import React, { useEffect, useRef, useState } from 'react';
import { MAX_BACKUP_BYTES, parseBackup, type LocalSnapshot } from '../services/localStorage';

interface Props {
  language: 'en' | 'cn';
  waitingForAI: boolean;
  onClose: () => void;
  onExport: () => void;
  onRestore: (snapshot: LocalSnapshot) => void;
}

export default function ImportBackup({ language, waitingForAI, onClose, onExport, onRestore }: Props) {
  const zh = language === 'cn';
  const [backup, setBackup] = useState<LocalSnapshot | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const readVersion = useRef(0);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => {
      readVersion.current++;
      if (previous?.isConnected) previous.focus();
      else document.querySelector<HTMLButtonElement>('[aria-controls="local-records"]')?.focus();
    };
  }, []);

  const selectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const version = ++readVersion.current;
    setBackup(null); setError(''); setFileName('');
    if (!file) { setReading(false); return; }
    if (file.size > MAX_BACKUP_BYTES) {
      setError(zh ? '文件超过 10 MB，请选择较小的 Aurora JSON 备份。' : 'File exceeds 10 MB. Choose a smaller Aurora JSON backup.');
      return;
    }
    setReading(true);
    try {
      const parsed = parseBackup(await file.text());
      if (version !== readVersion.current) return;
      setBackup(parsed); setFileName(file.name);
    } catch {
      if (version !== readVersion.current) return;
      setError(zh ? '无法读取有效的 Aurora v1 JSON 备份。请检查文件、版本和记录格式；当前数据未改变。' : 'This is not a valid Aurora v1 JSON backup. Check its format, version and records. Current data is unchanged.');
    } finally {
      if (version === readVersion.current) setReading(false);
    }
  };

  const restore = () => {
    if (!backup || waitingForAI || reading || restoring) return;
    setRestoring(true); setError('');
    try { onRestore(backup); }
    catch {
      setRestoring(false);
      setError(zh ? '恢复失败，当前记录未被替换。请检查浏览器存储权限或可用空间。' : 'Restore failed; current records were not replaced. Check browser storage permissions or available space.');
    }
  };

  const counts = backup ? [
    [zh ? '对话消息' : 'Chat messages', backup.messages.filter(m => m.type !== 'diary').length],
    [zh ? '日记' : 'Diary entries', backup.messages.filter(m => m.type === 'diary').length],
    [zh ? '便签' : 'Notes', backup.todos.length],
    [zh ? '情绪记录' : 'Mood records', backup.emotionLogs.length],
  ] as const : [];

  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/30 p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="import-title" aria-describedby="import-description" tabIndex={-1}
      className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-stone-50 p-6 shadow-xl outline-none"
      onKeyDown={event => {
        if (event.key === 'Escape' && !restoring) { event.stopPropagation(); onClose(); }
        if (event.key === 'Tab') {
          const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]') || []) as HTMLElement[];
          const first = nodes[0], last = nodes[nodes.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <h2 id="import-title" className="text-xl font-medium text-stone-800">{zh ? '导入 JSON 备份' : 'Import JSON backup'}</h2>
      <p id="import-description" className="mt-3 text-sm leading-relaxed text-stone-600">{zh ? '文件只在此浏览器读取，不会上传。确认恢复将替换当前对话、日记、便签、情绪记录及偏好，不会合并。建议先导出当前记录。' : 'The file is read in this browser and is not uploaded. Confirming restore replaces current chats, diary, notes, mood history and preferences; it does not merge them. Export your current records first.'}</p>
      <button type="button" onClick={onExport} className="mt-3 min-h-11 text-sm underline text-stone-700">{zh ? '先导出当前记录' : 'Export current records first'}</button>
      <label className="mt-4 block text-sm text-stone-700" htmlFor="backup-file">{zh ? '选择 Aurora JSON 文件（最大 10 MB）' : 'Choose an Aurora JSON file (up to 10 MB)'}</label>
      <input id="backup-file" type="file" accept=".json,application/json" onChange={selectFile} disabled={reading || restoring} className="mt-2 block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-3" />
      {reading ? <p role="status" className="mt-4 text-sm">{zh ? '正在校验文件…' : 'Checking file…'}</p> : null}
      {backup ? <div className="mt-5 rounded-xl border border-stone-200 bg-white p-4" aria-label={zh ? '备份预览' : 'Backup preview'}>
        <p className="text-sm font-medium text-stone-700 break-all">{fileName}</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-stone-600">{counts.map(([label, count]) => <div key={label}><dt>{label}</dt><dd className="mt-1 text-lg text-stone-800">{count}</dd></div>)}</dl>
        {counts.every(([, count]) => count === 0) ? <p className="mt-3 text-sm text-amber-800">{zh ? '这是空备份，恢复后将清空当前记录。' : 'This backup is empty. Restoring it clears current records.'}</p> : null}
      </div> : null}
      {waitingForAI ? <p role="status" className="mt-4 text-sm text-stone-600">{zh ? '请等待当前 AI 回复完成后再恢复。' : 'Wait for the current AI reply before restoring.'}</p> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} disabled={restoring} className="min-h-11 rounded-full border border-stone-300 px-5 text-sm text-stone-700">{zh ? '取消' : 'Cancel'}</button>
        <button type="button" onClick={restore} disabled={!backup || reading || restoring || waitingForAI} className="min-h-11 rounded-full bg-stone-800 px-5 text-sm text-white disabled:opacity-35">{restoring ? (zh ? '正在恢复…' : 'Restoring…') : (zh ? '确认替换并恢复' : 'Replace records and restore')}</button>
      </div>
    </div>
  </div>;
}
