import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LayoutGrid, Settings, Shield, Users } from 'lucide-react';
import { type AvailableModule, type ModuleOrder } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ModuleOrderDragDropProps {
    modules: AvailableModule[];
    moduleOrder: ModuleOrder[];
    onChange: (newOrder: ModuleOrder[]) => void;
}

interface SortableModuleItemProps {
    module: AvailableModule;
    order: number;
}

const iconMap = {
    LayoutGrid,
    Users,
    Settings,
    Shield,
};

function SortableModuleItem({ module, order }: SortableModuleItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const Icon = iconMap[module.icon as keyof typeof iconMap] || LayoutGrid;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg border bg-background p-3 hover:bg-accent/50"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="size-5 text-muted-foreground" />
            </div>
            <Icon className="size-4 text-primary" />
            <span className="flex-1 font-medium">{module.title}</span>
            <span className="text-sm text-muted-foreground">#{order}</span>
        </div>
    );
}

export function ModuleOrderDragDrop({ modules, moduleOrder, onChange }: ModuleOrderDragDropProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = moduleOrder.findIndex((item) => item.module === active.id);
            const newIndex = moduleOrder.findIndex((item) => item.module === over.id);

            const newOrder = arrayMove(moduleOrder, oldIndex, newIndex).map((item, index) => ({
                ...item,
                order: index + 1,
            }));

            onChange(newOrder);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Sidebar Module Order</CardTitle>
                <CardDescription>
                    Drag and drop to reorder sidebar modules for this role
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={moduleOrder.map((item) => item.module)}
                        strategy={verticalListSortingStrategy}
                    >
                        {moduleOrder.map((item) => {
                            const module = modules.find((m) => m.name === item.module);
                            if (!module) return null;

                            return (
                                <SortableModuleItem
                                    key={module.name}
                                    module={module}
                                    order={item.order}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </CardContent>
        </Card>
    );
}
