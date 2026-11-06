import React from 'react';
import { Book, Calendar, FileClock, Download, Upload, Wrench, Menu } from 'lucide-react';
interface Props { language: 'en'|'cn'; onOpenCalendar:()=>void; onOpenChatHistory:()=>void; onOpenMyDiary:()=>void; onExport:()=>void; onImport:()=>void; onOpenDebug?:()=>void; }
export default function LocalMenu(props: Props) {
 const [open,setOpen]=React.useState(false); const zh=props.language==='cn';
 const items=[[Calendar,zh?'情绪日历':'Mood calendar',props.onOpenCalendar],[Book,zh?'我的日记':'My diary',props.onOpenMyDiary],[FileClock,zh?'对话记录':'Chat history',props.onOpenChatHistory],[Download,zh?'导出备份':'Export backup',props.onExport],[Upload,zh?'导入备份':'Import backup',props.onImport],...(props.onOpenDebug?[[Wrench,'Debug',props.onOpenDebug]]:[])] as const;
 return <div className="relative" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>
  <button aria-label={zh?'打开本地记录':'Open local records'} aria-expanded={open} aria-controls="local-records" onClick={()=>setOpen(!open)} className="w-11 h-11 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-600"><Menu size={18}/></button>
  {open?<div id="local-records" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-100 p-2 z-50">
   <p className="text-xs text-stone-500 p-2">{zh?'仅保存在此浏览器':'Stored only in this browser'}</p>
   {items.map(([Icon,label,action])=><button key={label} onClick={()=>{setOpen(false);action();}} className="w-full min-h-11 text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2"><Icon size={15}/>{label}</button>)}
  </div>:null}
 </div>;
}
