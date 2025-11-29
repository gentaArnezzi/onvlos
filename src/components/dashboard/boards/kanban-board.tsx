"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createCard, moveCard } from "@/actions/boards";
import { cn } from "@/lib/utils";

// --- Types ---
interface BoardCard {
    id: string;
    title: string;
    description: string | null;
    column_id: string;
    order: number | null;
}

interface BoardColumn {
    id: string;
    name: string;
    cards: BoardCard[];
}

interface KanbanBoardProps {
    boardId: string;
    initialColumns: BoardColumn[];
}

// --- Components ---

function SortableCard({ card }: { card: BoardCard }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: card.id, data: { type: "Card", card } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} 
            className="cursor-grab hover:shadow-md transition touch-none"
        >
            <CardContent className="p-4">
                <div className="font-medium">{card.title}</div>
                {card.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {card.description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Column({ column }: { column: BoardColumn }) {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: { type: "Column", column },
    });

    return (
        <div className="w-80 flex flex-col bg-muted/20 rounded-lg border h-full max-h-full">
            <div className="p-4 font-semibold text-sm flex items-center justify-between border-b bg-muted/10">
                {column.name}
                <span className="text-xs text-muted-foreground bg-background border px-2 py-0.5 rounded-full">
                    {column.cards.length}
                </span>
            </div>
            
            <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]">
                 <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {column.cards.map((card) => (
                        <SortableCard key={card.id} card={card} />
                    ))}
                 </SortableContext>
            </div>
            
            <div className="p-2 border-t">
                 <AddCardButton columnId={column.id} />
            </div>
        </div>
    );
}

function AddCardButton({ columnId }: { columnId: string }) {
    const handleAdd = async () => {
        const title = prompt("Card Title:");
        if (title) {
            await createCard(columnId, title);
        }
    };
    
    return (
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Card
        </Button>
    )
}


// --- Main Board Component ---

export function KanbanBoard({ boardId, initialColumns }: KanbanBoardProps) {
    const [columns, setColumns] = useState(initialColumns);
    const [activeCard, setActiveCard] = useState<BoardCard | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Wait 5px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findColumn = (cardId: string) => {
        return columns.find(col => col.cards.some(c => c.id === cardId));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const card = active.data.current?.card as BoardCard;
        if (card) {
            setActiveCard(card);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeColumn = findColumn(activeId as string);
        const overColumn = findColumn(overId as string) || columns.find(col => col.id === overId);

        if (!activeColumn || !overColumn) return;

        if (activeColumn.id !== overColumn.id) {
            setColumns(prev => {
                const activeItems = activeColumn.cards;
                const overItems = overColumn.cards;
                const activeIndex = activeItems.findIndex(i => i.id === activeId);
                const overIndex = overItems.findIndex(i => i.id === overId);

                let newIndex;
                if (overItems.some(i => i.id === overId)) {
                    newIndex = overIndex >= 0 ? overIndex + (active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height ? 1 : 0) : overItems.length + 1;
                } else {
                    newIndex = overItems.length + 1;
                }

                return prev.map(col => {
                    if (col.id === activeColumn.id) {
                        return { ...col, cards: activeItems.filter(i => i.id !== activeId) };
                    }
                    if (col.id === overColumn.id) {
                        return {
                            ...col,
                            cards: [
                                ...overItems.slice(0, newIndex),
                                activeColumn.cards[activeIndex],
                                ...overItems.slice(newIndex, overItems.length)
                            ]
                        };
                    }
                    return col;
                });
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumn(activeId);
        const overColumn = findColumn(overId) || columns.find(col => col.id === overId); // If dropped on empty column container

        if (!activeColumn || !overColumn) return;
        
        const activeIndex = activeColumn.cards.findIndex(c => c.id === activeId);
        const overIndex = overColumn.cards.findIndex(c => c.id === overId);
        
        // Only trigger server update if changed
        if (activeColumn.id !== overColumn.id || activeIndex !== overIndex) {
             // Optimistic update already handled in DragOver/DragEnd for local state logic if same column
             // But for simplicity in this complex hook setup, let's finalize the local state here for same-column reorder
             
             if (activeColumn.id === overColumn.id) {
                 const newIndex = overIndex;
                 const newCards = arrayMove(activeColumn.cards, activeIndex, newIndex);
                 
                 setColumns(prev => prev.map(col => 
                     col.id === activeColumn.id ? { ...col, cards: newCards } : col
                 ));
                 
                 // Server Action
                 await moveCard(activeId, activeColumn.id, newIndex);
             } else {
                 // Cross column move
                 // State was technically updated in DragOver, we just need to find the final index in the new column
                 // Wait, `columns` state is fresh from DragOver.
                 // We just need to persist the new state.
                 
                 const finalColumn = columns.find(c => c.id === overColumn.id);
                 if (finalColumn) {
                     const finalIndex = finalColumn.cards.findIndex(c => c.id === activeId);
                     await moveCard(activeId, overColumn.id, finalIndex);
                 }
             }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full space-x-4 overflow-x-auto pb-4 min-w-full">
                {columns.map((column) => (
                    <Column key={column.id} column={column} />
                ))}
            </div>
            
            <DragOverlay>
                {activeCard ? <SortableCard card={activeCard} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
