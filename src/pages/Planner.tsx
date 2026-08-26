import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable as DraggableDnd, DropResult } from '@hello-pangea/dnd';
import { 
  Calendar, 
  LayoutGrid, 
  List, 
  Sparkles
} from 'lucide-react';
import { useStore } from '../store';
import { Status } from '../types';
import { format, isSameDay } from 'date-fns';
import { cn, STATUS_COLORS } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import DailyScheduler from '../components/DailyScheduler';
import WeeklyPlannerModal from '../components/WeeklyPlannerModal';
import { io } from 'socket.io-client';

const Draggable = DraggableDnd as any;

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'IDEA', title: 'Ideas' },
  { id: 'RESEARCH', title: 'Research' },
  { id: 'BRIEF', title: 'Briefing' },
  { id: 'DRAFT', title: 'Drafting' },
  { id: 'DESIGN', title: 'Design' },
  { id: 'REVIEW', title: 'In Review' },
  { id: 'APPROVED', title: 'Approved' },
  { id: 'SCHEDULED', title: 'Scheduled' },
  { id: 'PUBLISHED', title: 'Published' }
];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  TikTok: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  YouTube: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LinkedIn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  X: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

const formatFriendlyDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
};

export default function Planner() {
  const { content, updateContent, moveContent, addContent } = useStore();
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'calendar' | 'list'>('board');
  const [showScheduler, setShowScheduler] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    try {
      const socket = io({ transports: ['websocket', 'polling'], autoConnect: true });
      socketRef.current = socket;

      socket.on('global-synced', (payload: any) => {
        if (!payload) return;
        if (payload.type === 'content-moved' && payload.id) {
          moveContent(payload.id, payload.newStatus, payload.index);
        } else if (payload.type === 'content-added' && payload.item) {
          addContent(payload.item);
        }
      });

      socket.on('global-content-updated', ({ documentId, updates }: any) => {
        if (documentId && updates) {
          updateContent(documentId, updates);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      // Safe fallback if offline
    }
  }, [moveContent, addContent, updateContent]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId as Status;
    if (moveContent) {
      moveContent(draggableId, newStatus, destination.index);
    } else {
      updateContent(draggableId, { status: newStatus });
    }

    if (socketRef.current) {
      socketRef.current.emit('global-update', {
        type: 'content-moved',
        id: draggableId,
        newStatus,
        index: destination.index
      });
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Planner</h1>
          <button
            onClick={() => setShowScheduler(!showScheduler)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              showScheduler 
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-white bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Sparkles className="w-4 h-4" />
            {showScheduler ? 'Close Daily AI' : 'Daily AI'}
          </button>
          <button
            onClick={() => setShowWeeklyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Weekly AI Plan
          </button>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setView('board')}
            className={cn("p-1.5 rounded-md transition-colors", view === 'board' ? "bg-white dark:bg-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={cn("p-1.5 rounded-md transition-colors", view === 'calendar' ? "bg-white dark:bg-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={cn("p-1.5 rounded-md transition-colors", view === 'list' ? "bg-white dark:bg-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showWeeklyModal && <WeeklyPlannerModal onClose={() => setShowWeeklyModal(false)} />}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out h-full overflow-hidden",
          showScheduler ? "mr-96" : ""
        )}>
          {/* Board View */}
          {view === 'board' && (
            <div className="h-full overflow-x-auto overflow-y-hidden p-6">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full items-start pr-6">
                  {COLUMNS.map((column) => {
                    const columnItems = content.filter(item => item.status === column.id);

                    return (
                      <div key={column.id} className="flex flex-col w-80 shrink-0 h-full max-h-full bg-slate-100/50 dark:bg-slate-800/30 rounded-xl">
                        <div className="p-4 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-700 dark:text-slate-300">{column.title}</h3>
                          <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            {columnItems.length}
                          </span>
                        </div>
                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                "flex-1 overflow-y-auto p-3 space-y-3 transition-colors",
                                snapshot.isDraggingOver && "bg-slate-200/50 dark:bg-slate-800/50 rounded-b-xl"
                              )}
                            >
                              {columnItems.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided: any, snapshot: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => navigate(`/content/${item.id}`)}
                                      className={cn(
                                        "bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer group hover:border-blue-500 dark:hover:border-blue-500 transition-all",
                                        snapshot.isDragging && "shadow-lg scale-[1.02] rotate-1 z-50 border-blue-500 ring-2 ring-blue-500/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-600")}>
                                          {item.platform}
                                        </span>
                                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600")}>
                                          {item.status.replace(/_/g, ' ')}
                                        </span>
                                      </div>
                                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                                        {item.title}
                                      </p>
                                      <div 
                                        className="mt-4 flex items-center justify-between text-xs text-slate-500"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full relative group/date">
                                          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover/date:text-blue-500 transition-colors" />
                                          <span className={cn(
                                            "font-medium truncate flex-1", 
                                            item.publishAt ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
                                          )}>
                                            {item.publishAt ? formatFriendlyDate(item.publishAt) : 'Schedule date...'}
                                          </span>
                                          <input 
                                            type="date"
                                            value={item.publishAt ? item.publishAt.split('T')[0] : ''}
                                            onChange={(e) => {
                                              const date = e.target.value;
                                              if (date) {
                                                // Create a proper date string for noon to avoid timezone shift issues
                                                const newDate = new Date(`${date}T12:00:00Z`).toISOString();
                                                updateContent(item.id, { 
                                                  publishAt: newDate,
                                                  status: item.status === 'PUBLISHED' ? 'PUBLISHED' : 'SCHEDULED' 
                                                });
                                              } else {
                                                updateContent(item.id, { publishAt: undefined });
                                              }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            </div>
          )}

          
          {view === 'calendar' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="font-medium text-slate-500 text-center pb-2 border-b border-slate-200 dark:border-slate-800">{day}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - d.getDay() + i);
                  const dayContent = content.filter(c => c.publishAt && new Date(c.publishAt).toDateString() === d.toDateString());
                  
                  return (
                    <div key={i} className={cn("min-h-[120px] p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900", d.toDateString() === new Date().toDateString() && "ring-2 ring-blue-500")}>
                      <div className="text-sm font-medium text-slate-500 mb-2">{d.getDate()}</div>
                      <div className="space-y-1">
                        {dayContent.map(item => (
                          <div key={item.id} onClick={() => navigate(`/content/${item.id}`)} className="text-xs p-1.5 rounded bg-slate-100 dark:bg-slate-800 cursor-pointer truncate hover:bg-slate-200 dark:hover:bg-slate-700">
                            <span className={cn("inline-block w-2 h-2 rounded-full mr-1", item.status === 'PUBLISHED' ? "bg-emerald-500" : "bg-blue-500")}></span>
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {view === 'list' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Platform</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Publish Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {content.sort((a,b) => new Date(a.publishAt || 0).getTime() - new Date(b.publishAt || 0).getTime()).map(item => (
                      <tr key={item.id} onClick={() => navigate(`/content/${item.id}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                        <td className="px-4 py-3 font-medium truncate max-w-[300px]">{item.title}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-700")}>{item.platform}</span>
                        </td>
                        <td className="px-4 py-3 text-xs uppercase tracking-wide">{item.status.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-slate-500">{item.publishAt ? new Date(item.publishAt).toLocaleDateString() : 'Unscheduled'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Scheduler Side Panel */}
        <div className={cn(
          "absolute top-0 right-0 h-full w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 ease-in-out z-20 flex flex-col",
          showScheduler ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex-1 overflow-hidden h-full">
            <DailyScheduler onClose={() => setShowScheduler(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
