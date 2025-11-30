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
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  restrictToWindowEdges,
  restrictToParentElement,
  snapCenterToCursor,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo, useCallback, useRef, memo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Pencil, Trash2, MoreVertical } from "lucide-react";
import { createCard, moveCard, updateCard, deleteCard } from "@/actions/boards";
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
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    language?: Language;
}

// --- Components ---

function SortableCard({ card, onCardUpdated, onCardDeleted }: { 
    card: BoardCard; 
    onCardUpdated?: () => void;
    onCardDeleted?: () => void;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(card.title);
    const [editDescription, setEditDescription] = useState(card.description || "");
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleEdit = async () => {
        const result = await updateCard(card.id, {
            title: editTitle,
            description: editDescription || null,
        });
        if (result.success) {
            toast.success(t("boards.cardUpdated") || "Card updated successfully");
            setIsEditOpen(false);
            router.refresh();
            onCardUpdated?.();
        } else {
            toast.error(result.error || "Failed to update card");
        }
    };

    const handleDelete = async () => {
        if (!confirm(t("boards.deleteCardConfirm") || "Are you sure you want to delete this card?")) {
            return;
        }
        setIsDeleting(true);
        const result = await deleteCard(card.id);
        setIsDeleting(false);
        if (result.success) {
            toast.success(t("boards.cardDeleted") || "Card deleted successfully");
            router.refresh();
            onCardDeleted?.();
        } else {
            toast.error(result.error || "Failed to delete card");
        }
    };

    return (
        <>
            <Card 
                ref={setNodeRef} 
                style={style} 
                {...attributes} 
                className={cn(
                    "hover:shadow-lg transition-all duration-200",
                    "bg-white border-[#EDEDED]",
                    "hover:border-orange-300",
                    isDragging && "opacity-50"
                )}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div 
                            {...listeners}
                            className={cn(
                                "flex-1 cursor-grab active:cursor-grabbing",
                                "touch-none"
                            )}
                        >
                            <div className="font-semibold font-primary text-[#02041D] text-sm leading-tight">
                                {card.title}
                            </div>
                            {card.description && (
                                <div className="text-xs font-primary text-[#606170] mt-2 line-clamp-2">
                                    {card.description}
                                </div>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 font-primary text-[#606170] hover:font-primary text-[#02041D]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-[#EDEDED]">
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditOpen(true);
                                    }}
                                    className="font-primary text-[#02041D] hover:bg-[#EDEDED] cursor-pointer"
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("common.edit") || "Edit"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete") || "Delete"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
                    <DialogHeader>
                        <DialogTitle className="font-primary text-[#02041D]">{t("boards.editCard") || "Edit Card"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-primary text-[#02041D]">{t("boards.cardTitle") || "Title"}</Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-primary text-[#02041D]">{t("common.description") || "Description"}</Label>
                            <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            className="border-[#EDEDED] font-primary text-[#02041D] bg-white hover:bg-[#EDEDED]"
                        >
                            {t("common.cancel") || "Cancel"}
                        </Button>
                        <Button
                            onClick={handleEdit}
                            className="bg-gradient-to-r from-[#0A33C6] to-[#0A33C6] hover:from-[#0A33C6]/90 hover:to-[#0A33C6]/90 text-white"
                        >
                            {t("common.save") || "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Helper function to translate column names
function translateColumnName(name: string, t: (key: string) => string): string {
    const columnNameMap: Record<string, string> = {
        "Leads": "boards.column.leads",
        "Contacted": "boards.column.contacted",
        "Proposal Sent": "boards.column.proposalSent",
        "Closed": "boards.column.closed",
        // Indonesian fallbacks
        "Lead": "boards.column.leads",
        "Dihubungi": "boards.column.contacted",
        "Proposal Dikirim": "boards.column.proposalSent",
        "Ditutup": "boards.column.closed",
    };
    
    const translationKey = columnNameMap[name];
    if (translationKey) {
        return t(translationKey);
    }
    return name; // Return original if no mapping found
}

const Column = memo(function Column({ column, onCardAdded, onCardDeleted }: { column: BoardColumn; onCardAdded?: (card: BoardCard) => void; onCardDeleted?: (cardId: string) => void }) {
    const { t } = useTranslation();
    const { setNodeRef } = useSortable({
        id: column.id,
        data: { type: "Column", column },
    });

    const translatedColumnName = translateColumnName(column.name, t);

    return (
        <div className="w-80 flex flex-col bg-white rounded-xl border border-[#EDEDED] h-full max-h-full shadow-sm">
            <div className="p-4 font-semibold text-sm flex items-center justify-between border-b border-[#EDEDED] bg-[#EDEDED]/50 rounded-t-xl">
                <span className="font-primary text-[#02041D]">{translatedColumnName}</span>
                <span className="text-xs font-medium font-primary text-[#606170] bg-slate-200 px-2.5 py-1 rounded-full min-w-[24px] text-center">
                    {column.cards.length}
                </span>
            </div>
            
            <div 
                ref={setNodeRef} 
                className={cn(
                    "flex-1 p-3 space-y-3 overflow-y-auto min-h-[100px]",
                    "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                )}
            >
                {column.cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EDEDED] flex items-center justify-center mb-3">
                            <Plus className="w-5 h-5 font-primary text-[#606170]" />
                        </div>
                        <p className="text-xs font-primary text-[#606170]">{t("boards.noCardsYet")}</p>
                    </div>
                ) : (
                    <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {column.cards.map((card) => (
                            <SortableCard 
                                key={card.id} 
                                card={card}
                                onCardUpdated={() => {
                                    // Refresh will be handled by router.refresh() in SortableCard
                                }}
                                onCardDeleted={() => {
                                    onCardDeleted?.(card.id);
                                }}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
            
            <div className="p-3 border-t border-[#EDEDED] rounded-b-xl">
                <AddCardButton columnId={column.id} onCardAdded={onCardAdded} />
            </div>
        </div>
    );
});

function AddCardButton({ columnId, onCardAdded }: { columnId: string; onCardAdded?: (card: BoardCard) => void }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        const result = await createCard(columnId, title.trim(), description.trim() || null);
        setLoading(false);

        if (result.success && result.card) {
            setOpen(false);
            setTitle("");
            setDescription("");
            // Pass the new card to parent for optimistic update
            if (onCardAdded) {
                onCardAdded({
                    id: result.card.id,
                    title: result.card.title,
                    description: result.card.description,
                    column_id: result.card.column_id,
                    order: result.card.order
                });
            }
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start font-primary text-[#606170] hover:font-primary text-[#02041D] hover:bg-[#EDEDED] transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t("boards.addCard")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
                <DialogHeader>
                    <DialogTitle className="font-primary text-[#02041D]">{t("boards.addNewCard")}</DialogTitle>
                    <DialogDescription className="font-primary text-[#606170]">
                        {t("boards.createNewCard")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-primary text-[#02041D]">
                                {t("common.title")}
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("boards.enterCardTitle")}
                                className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-primary text-[#02041D]">
                                {t("common.description")} ({t("common.optional")})
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t("boards.enterCardDescription")}
                                className="bg-white border-[#EDEDED] font-primary text-[#02041D] resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-[#EDEDED] font-primary text-[#02041D] bg-white hover:bg-[#EDEDED]"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="bg-gradient-to-r from-[#0A33C6] to-[#0A33C6] hover:from-[#0A33C6]/90 hover:to-[#0A33C6]/90 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("boards.creating")}
                                </>
                            ) : (
                                t("boards.createCard")
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
    const [dragStartState, setDragStartState] = useState<{ cardId: string; columnId: string; index: number } | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastDragOverState = useRef<{ activeId: string; overId: string } | null>(null);
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
    const cardDimensionsRef = useRef<{ width: number; height: number } | null>(null);

    // Prevent hydration mismatch by only rendering DndContext on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleCardAdded = useCallback((newCard: BoardCard) => {
        // Optimistic update: add card to the column immediately
        setColumns(prevColumns => 
            prevColumns.map(col => 
                col.id === newCard.column_id
                    ? { ...col, cards: [...col.cards, newCard] }
                    : col
            )
        );
    }, []);

    const handleCardDeleted = useCallback((cardId: string) => {
        // Remove card from local state
        setColumns(prev => prev.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== cardId)
        })));
    }, []);

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

    // Memoize findColumn to avoid recalculating on every render
    const findColumn = useCallback((cardId: string) => {
        return columns.find(col => col.cards.some(c => c.id === cardId));
    }, [columns]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const card = active.data.current?.card as BoardCard;
        if (card) {
            setActiveCard(card);
            // Store original position before drag starts
            const originalColumn = columns.find(col => col.cards.some(c => c.id === card.id));
            if (originalColumn) {
                const originalIndex = originalColumn.cards.findIndex(c => c.id === card.id);
                setDragStartState({
                    cardId: card.id,
                    columnId: originalColumn.id,
                    index: originalIndex
                });
            }
            
            // Calculate offset from cursor to card top-left for accurate positioning
            if (event.activatorEvent instanceof MouseEvent) {
                const rect = active.rect.current.initial;
                if (rect) {
                    const clickX = event.activatorEvent.clientX;
                    const clickY = event.activatorEvent.clientY;
                    
                    // Calculate offset from top-left corner of card to click position
                    // rect.left and rect.top are relative to viewport
                    // This is the exact point where user clicked/grab the card
                    dragOffsetRef.current = {
                        x: clickX - rect.left,
                        y: clickY - rect.top
                    };
                    // Store card dimensions for use in modifier
                    cardDimensionsRef.current = {
                        width: rect.width,
                        height: rect.height
                    };
                } else {
                    dragOffsetRef.current = { x: 0, y: 0 };
                    cardDimensionsRef.current = null;
                }
            } else {
                dragOffsetRef.current = { x: 0, y: 0 };
                cardDimensionsRef.current = null;
            }
        }
    }, [columns]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        // Throttle updates - only update if state actually changed
        const currentState = { activeId, overId };
        if (lastDragOverState.current && 
            lastDragOverState.current.activeId === currentState.activeId &&
            lastDragOverState.current.overId === currentState.overId) {
            return; // Skip if same state
        }
        lastDragOverState.current = currentState;

        // Clear any pending timeout
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current);
        }

        // Throttle the actual state update
        dragOverTimeoutRef.current = setTimeout(() => {
            const activeColumn = findColumn(activeId);
            const overColumn = findColumn(overId) || columns.find(col => col.id === overId);

        if (!activeColumn || !overColumn) return;

            // Only update for cross-column moves (same-column reorder is handled in handleDragEnd)
        if (activeColumn.id !== overColumn.id) {
            setColumns(prev => {
                const activeItems = activeColumn.cards;
                const overItems = overColumn.cards;
                const activeIndex = activeItems.findIndex(i => i.id === activeId);
                const overIndex = overItems.findIndex(i => i.id === overId);

                    if (activeIndex === -1) return prev; // Card not found

                    let newIndex: number;
                if (overItems.some(i => i.id === overId)) {
                        newIndex = overIndex >= 0 ? overIndex : overItems.length;
                } else {
                        newIndex = overItems.length;
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
        }, 16); // ~60fps throttle
    }, [columns, findColumn]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        dragOffsetRef.current = null;
        cardDimensionsRef.current = null;
        
        // Clear drag over timeout
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current);
            dragOverTimeoutRef.current = null;
        }
        lastDragOverState.current = null;

        if (!over || !dragStartState) {
            setDragStartState(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;
        const originalColumnId = dragStartState.columnId;
        const originalIndex = dragStartState.index;

        // Find target column
        const overColumn = columns.find(col => col.cards.some(c => c.id === overId)) || 
                          columns.find(col => col.id === overId);

        if (!overColumn) {
            console.error("[handleDragEnd] Could not find target column");
            setDragStartState(null);
            return;
        }

        const isSameColumn = originalColumnId === overColumn.id;

        // Calculate final index
        let finalIndex: number;
        const overCardIndex = overColumn.cards.findIndex(c => c.id === overId);
        
        if (overCardIndex >= 0) {
            // Dropped on a card
            finalIndex = overCardIndex;
        } else {
            // Dropped on empty column area
            if (isSameColumn) {
                // Same column - append to end
                finalIndex = overColumn.cards.filter(c => c.id !== activeId).length;
            } else {
                // Cross column - append to end (excluding the card if already there from handleDragOver)
                const cardsInTarget = overColumn.cards.filter(c => c.id !== activeId);
                finalIndex = cardsInTarget.length;
            }
        }

        // Check if position actually changed
        const isSamePosition = isSameColumn && originalIndex === finalIndex;
        
        console.log(`[handleDragEnd] Position check:`, {
            isSameColumn,
            originalIndex,
            finalIndex,
            isSamePosition,
            originalColumnId,
            overColumnId: overColumn.id
        });

        if (isSamePosition) {
            console.log("[handleDragEnd] No position change, skipping");
            setDragStartState(null);
            return;
        }

        const finalColumnId = overColumn.id;

        // Update local state using functional update to get latest state
        setColumns(prevColumns => {
            const originalColumn = prevColumns.find(col => col.id === originalColumnId);
            if (!originalColumn) {
                console.error("[handleDragEnd] Original column not found");
                return prevColumns;
            }

            // Get the card from original position (before any dragOver changes)
            // For cross-column moves, card might already be in target column from handleDragOver
            // So we need to find it in the original column first
            let cardToMove: BoardCard | undefined;
            if (isSameColumn) {
                // Same column - card should still be in original column
                cardToMove = originalColumn.cards[originalIndex];
            } else {
                // Cross column - card might be in target column from handleDragOver
                // Try to find it in original column first
                cardToMove = originalColumn.cards.find(c => c.id === activeId);
                // If not found, it might have been moved by handleDragOver, get from activeCard
                if (!cardToMove && activeCard) {
                    cardToMove = activeCard;
                }
            }

            if (!cardToMove) {
                console.error("[handleDragEnd] Card to move not found");
                return prevColumns;
            }

            if (isSameColumn) {
                // Same column reorder
                const newCards = arrayMove(originalColumn.cards, originalIndex, finalIndex);
                return prevColumns.map(col => 
                    col.id === originalColumnId ? { ...col, cards: newCards } : col
                );
             } else {
                 // Cross column move
                return prevColumns.map(col => {
                    if (col.id === originalColumnId) {
                        // Remove from source
                        return { ...col, cards: col.cards.filter(c => c.id !== activeId) };
                    }
                    if (col.id === overColumn.id) {
                        // Add to target - remove card first if it exists (from handleDragOver)
                        const cardsWithoutMoved = col.cards.filter(c => c.id !== activeId);
                        const newCards = [...cardsWithoutMoved];
                        newCards.splice(finalIndex, 0, cardToMove);
                        return { ...col, cards: newCards };
                    }
                    return col;
                });
            }
        });

        // Save to database asynchronously (non-blocking)
        // UI is already updated optimistically, so we can save in background
        moveCard(activeId, finalColumnId, finalIndex)
            .then(result => {
                if (!result.success) {
                    console.error("[handleDragEnd] Failed to save:", result.error);
                    // Only reload on critical errors
                    if (result.error?.includes("not found") || result.error?.includes("constraint")) {
                        window.location.reload();
                    }
                }
            })
            .catch(error => {
                console.error("[handleDragEnd] Exception saving:", error);
                // Don't reload on network errors - optimistic update is already shown
            })
            .finally(() => {
                setDragStartState(null);
            });
    }, [columns, dragStartState, findColumn]);

    // Memoize columns rendering - must be called before any early returns to follow Rules of Hooks
    const renderedColumns = useMemo(() => 
        columns.map((column) => (
            <Column key={column.id} column={column} onCardAdded={handleCardAdded} onCardDeleted={handleCardDeleted} />
        )), [columns, handleCardAdded, handleCardDeleted]);

    // Render static content during SSR to prevent hydration mismatch
    if (!isMounted) {
        return (
            <div className="flex h-full space-x-4 overflow-x-auto overflow-y-hidden pb-2 min-w-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {renderedColumns}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full space-x-4 overflow-x-auto overflow-y-hidden pb-2 min-w-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {renderedColumns}
            </div>
            
            <DragOverlay
                dropAnimation={{
                    duration: 200,
                    easing: 'ease-out',
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.5',
                            },
                        },
                    }),
                }}
                style={{
                    cursor: 'grabbing',
                    pointerEvents: 'none',
                }}
                modifiers={(() => {
                    const offset = dragOffsetRef.current;
                    const dims = cardDimensionsRef.current;
                    if (!offset || !dims) return [snapCenterToCursor, restrictToWindowEdges];
                    
                    return [
                        snapCenterToCursor,
                        ({ transform }) => {
                            // snapCenterToCursor centers the card at cursor
                            // Now we need to shift so the grab point (where user clicked) stays under the cursor
                            // offset.x and offset.y = distance from top-left of card to grab point
                            
                            const width = dims.width;
                            const height = dims.height;
                            
                            // After snapCenterToCursor, card is centered at cursor
                            // To move grab point to cursor, shift by: (offset.x - width/2, offset.y - height/2)
                            const offsetX = offset.x - (width / 2);
                            const offsetY = offset.y - (height / 2);
                            
                            return {
                                ...transform,
                                x: transform.x + offsetX,
                                y: transform.y + offsetY,
                            };
                        },
                        restrictToWindowEdges,
                    ];
                })()}
            >
                {activeCard ? (
                    <div 
                        className="rotate-2 opacity-90"
                        style={{
                            transformOrigin: 'center center',
                            willChange: 'transform',
                        }}
                    >
                        <SortableCard card={activeCard} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
