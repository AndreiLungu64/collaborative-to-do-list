import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { Task, ColumnDef } from '../../types';

interface KanbanBoardProps {
  columns: Record<string, Task[]>;
  columnDefs: ColumnDef[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanBoard = ({ columns, columnDefs, onDragEnd, onTaskClick }: KanbanBoardProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {columnDefs.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            tasks={columns[col.id]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
