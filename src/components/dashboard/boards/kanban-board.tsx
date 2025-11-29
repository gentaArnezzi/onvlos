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
import { Plus, Loader2 } from "lucide-react";
import { createCard, moveCard } from "@/actions/boards";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

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
            className={cn(
                "cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 touch-none",
                "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700",
                "hover:border-orange-300 dark:hover:border-orange-600",
                "hover:scale-[1.02]"
            )}
        >
            <CardContent className="p-4">
                <div className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                    {card.title}
                </div>
                {card.description && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                        {card.description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Column({ column, onCardAdded }: { column: BoardColumn; onCardAdded?: () => void }) {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: { type: "Column", column },
    });

    return (
        <div className="w-80 flex flex-col bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-full max-h-full shadow-sm">
            <div className="p-4 font-semibold text-sm flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-xl">
                <span className="text-slate-900 dark:text-white">{column.name}</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full min-w-[24px] text-center">
                    {column.cards.length}
                </span>
            </div>
            
            <div 
                ref={setNodeRef} 
                className={cn(
                    "flex-1 p-3 space-y-3 overflow-y-auto min-h-[100px]",
                    "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                )}
            >
                {column.cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">No cards yet</p>
                    </div>
                ) : (
                    <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {column.cards.map((card) => (
                            <SortableCard key={card.id} card={card} />
                        ))}
                    </SortableContext>
                )}
            </div>
            
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                <AddCardButton columnId={column.id} onCardAdded={onCardAdded} />
            </div>
        </div>
    );
}

function AddCardButton({ columnId, onCardAdded }: { columnId: string; onCardAdded?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        const result = await createCard(columnId, title.trim(), description.trim() || null);
        setLoading(false);

        if (result.success) {
            setOpen(false);
            setTitle("");
            setDescription("");
            if (onCardAdded) {
                onCardAdded();
            } else {
                router.refresh();
            }
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Add New Card</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new card for this column.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-900 dark:text-white">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter card title..."
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-900 dark:text-white">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter card description..."
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-slate-200 dark:border-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Card"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


// --- Main Board Component ---

export function KanbanBoard({ boardId, initialColumns }: KanbanBoardProps) {
    const [columns, setColumns] = useState(initialColumns);
    const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
    const router = useRouter();

    const handleCardAdded = () => {
        router.refresh();
    };

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
            <div className="flex h-full space-x-4 overflow-x-auto overflow-y-hidden pb-2 min-w-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {columns.map((column) => (
                    <Column key={column.id} column={column} onCardAdded={handleCardAdded} />
                ))}
            </div>
            
            <DragOverlay>
                {activeCard ? (
                    <div className="rotate-2 opacity-90">
                        <SortableCard card={activeCard} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
