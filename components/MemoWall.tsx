
import React, { useState, useEffect, useRef } from 'react';
import { TodoItem } from '../types';

interface MemoWallProps {
  todos: TodoItem[];
  onUpdateTodoPosition: (id: string, x: number, y: number) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  canvasOffset: { x: number; y: number };
  onPanChange: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

// Sub-component for individual notes to manage their own exit animation state
const MemoNote: React.FC<{
  todo: TodoItem;
  canvasOffset: { x: number; y: number };
  isDragging: boolean;
  isPanning: boolean;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent, todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}> = ({ todo, canvasOffset, isDragging, isPanning, onMouseDown, onDelete, onToggle }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    // Wait for animation to finish before removing from state
    setTimeout(() => {
      onDelete(todo.id);
    }, 300); // Matches .animate-sticker-disappear duration
  };

  return (
    <div
      className={`absolute w-36 md:w-48 cursor-grab active:cursor-grabbing pointer-events-auto select-none`}
      style={{
        left: `${todo.x + canvasOffset.x}px`,
        top: `${todo.y + canvasOffset.y}px`,
        transform: `rotate(${todo.rotation}deg)`,
        zIndex: isDragging ? 100 : 10,
        // Disable transition during drag OR pan to prevent lag
        transition: (isDragging || isPanning) ? 'none' : 'top 0.1s, left 0.1s', 
      }}
      onMouseDown={(e) => onMouseDown(e, todo)}
      onTouchStart={(e) => onMouseDown(e, todo)}
    >
      {/* Inner visual container for scale/opacity animations */}
      <div 
        className={`relative p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg group rounded-sm ${
          isExiting ? 'animate-sticker-disappear' : 'animate-sticker-appear'
        } ${isDragging ? 'scale-105 shadow-xl' : ''}`}
        style={{
          backgroundColor: todo.color,
          fontFamily: '"Zen Maru Gothic", sans-serif',
        }}
      >
        {/* Visual tape/pin */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-white/30 backdrop-blur-sm rotate-2 pointer-events-none"></div>

        <p className="text-stone-700 text-xs md:text-sm leading-relaxed pointer-events-none break-words">
          <span className={todo.completed ? 'line-through opacity-50' : ''}>{todo.text}</span>
        </p>

        {/* DELETE BUTTON */}
        <button 
          onClick={handleDeleteClick}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full text-stone-400 opacity-0 group-hover:opacity-100 shadow-sm flex items-center justify-center hover:text-red-400 transition-opacity"
          title="Remove note"
          onMouseDown={(e) => e.stopPropagation()} 
          onTouchStart={(e) => e.stopPropagation()}
        >
          ×
        </button>
        
        {/* TOGGLE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
          className={`absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            todo.completed 
              ? 'text-green-500' 
              : 'text-stone-300 hover:text-green-400'
          }`}
          title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const MemoWall: React.FC<MemoWallProps> = ({ todos, onUpdateTodoPosition, onDeleteTodo, onToggleTodo, canvasOffset, onPanChange }) => {
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  
  // Refs for tracking deltas and interaction state
  const dragStart = useRef({ x: 0, y: 0 });
  const initialOffset = useRef({ x: 0, y: 0 }); // For panning
  const initialNotePos = useRef({ x: 0, y: 0 }); // For note dragging
  const hasMoved = useRef(false); // Distinction between click and drag

  // --- 1. Background Panning Logic ---
  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true);
    hasMoved.current = false;
    dragStart.current = { x: clientX, y: clientY };
    initialOffset.current = { ...canvasOffset };
  };

  // --- 2. Note Dragging Logic ---
  const handleNoteDragStart = (e: React.MouseEvent | React.TouchEvent, todo: TodoItem) => {
    e.stopPropagation(); // Stop background pan
    setDraggingNoteId(todo.id);
    hasMoved.current = false;
    
    // Normalize coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragStart.current = { x: clientX, y: clientY };
    initialNotePos.current = { x: todo.x, y: todo.y };
  };

  // --- 3. Global Move/Up Handlers ---
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const deltaX = clientX - dragStart.current.x;
      const deltaY = clientY - dragStart.current.y;

      // Threshold check: ignore micro-movements to allow clicking
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMoved.current = true;
      }

      if (isPanning) {
        onPanChange({
          x: initialOffset.current.x + deltaX,
          y: initialOffset.current.y + deltaY
        });
      } else if (draggingNoteId) {
        onUpdateTodoPosition(
          draggingNoteId,
          initialNotePos.current.x + deltaX,
          initialNotePos.current.y + deltaY
        );
      }
    };

    const handleEnd = () => {
      setIsPanning(false);
      setDraggingNoteId(null);
    };

    if (isPanning || draggingNoteId) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isPanning, draggingNoteId, onPanChange, onUpdateTodoPosition, canvasOffset]);

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden z-10 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} touch-none`}
      onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
      onTouchStart={(e) => handlePanStart(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${canvasOffset.x % 24}px ${canvasOffset.y % 24}px`
        }}
      />

      {todos.map((todo) => (
        <MemoNote
          key={todo.id}
          todo={todo}
          canvasOffset={canvasOffset}
          isDragging={draggingNoteId === todo.id}
          isPanning={isPanning}
          onMouseDown={handleNoteDragStart}
          onDelete={onDeleteTodo}
          onToggle={onToggleTodo}
        />
      ))}
      
       {/* Hint text */}
      {todos.length > 0 && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 text-stone-300 text-xs font-medium pointer-events-none opacity-50 select-none">
            Drag background to pan
         </div>
      )}
    </div>
  );
};

export default MemoWall;
