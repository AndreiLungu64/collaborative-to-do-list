import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Task, ColumnDef } from '../../types';

interface KanbanColumnProps {
  col: ColumnDef;
  tasks?: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn = ({ col, tasks = [], onTaskClick }: KanbanColumnProps) => {
  return (
    <div className="kanban-column">
      <div
        className="kanban-column-header"
        style={{ '--col-color': col.color } as React.CSSProperties}
      >
        <div className="kanban-column-title">
          <span className="kanban-column-icon">{col.icon}</span>
          <span>{col.title}</span>
        </div>
        <span
          className="badge-count"
          style={{ background: `${col.color}20`, color: col.color }}
        >
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`kanban-column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <TaskCard
                      task={task}
                      onClick={onTaskClick}
                      provided={provided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="kanban-empty">
                <p>Nicio activitate</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
