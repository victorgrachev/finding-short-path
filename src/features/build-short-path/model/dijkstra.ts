import { fieldItemModel } from '@/entities/field-item';
import { getPath } from './get-path.ts';

export const dijkstra = (fieldItems: fieldItemModel.FieldItem[][]) => {
    const renderingSteps = [fieldItems];

    const startItem = fieldItemModel.getStartFieldItem(fieldItems);

    const endItem = fieldItemModel.getEndFieldItem(fieldItems);

    const queue = [startItem];

    const passed = new Set([startItem.id]);

    const pathToEnd: Record<string, string | null> = {
        [startItem.id]: null,
    };

    const costItems = new Map([[startItem.id, startItem.cost ?? 0]]);

    const lastStep = renderingSteps[renderingSteps.length - 1];

    renderingSteps.push(
        lastStep.map((cols) =>
            cols.map((item) => {
                if (item.id === startItem.id) {
                    return {
                        ...item,
                        isPassed: true,
                    };
                }

                return { ...item };
            }),
        ),
    );

    while (queue.length > 0) {
        const currentFieldItem = queue.shift();

        if (currentFieldItem.id === endItem.id) {
            break;
        }

        const nextItems = (fieldItemModel.getPathsFieldItem(fieldItems, currentFieldItem) ?? []).filter(
            ({ id }) => !passed.has(id),
        );

        nextItems.forEach((item) => {
            if (!costItems.has(item.id)) {
                costItems.set(item.id, Infinity);

                pathToEnd[item.id] = currentFieldItem.id;
            }

            const lastCost = costItems.get(item.id);

            const nextCost = (item.cost ?? 0) + (currentFieldItem.cost ?? 0);

            if (lastCost > nextCost) {
                costItems.set(item.id, nextCost);
            }
        });

        let nextItem: fieldItemModel.FieldItem;

        Array.from(costItems.entries()).forEach(([id, cost]) => {
            if (!passed.has(id) && cost < (costItems.get(nextItem?.id) ?? Infinity)) {
                for (const cols of fieldItems) {
                    let isFind = false;

                    for (const item of cols) {
                        if (item.id === id) {
                            nextItem = item;

                            isFind = true;

                            break;
                        }
                    }

                    if (isFind) {
                        break;
                    }
                }
            }
        });

        if (nextItem) {
            passed.add(nextItem.id);

            const lastStep = renderingSteps[renderingSteps.length - 1];

            renderingSteps.push(
                lastStep.map((cols) =>
                    cols.map((item) => {
                        if (item.id === nextItem.id) {
                            return {
                                ...item,
                                isPassed: true,
                            };
                        }

                        return { ...item };
                    }),
                ),
            );

            queue.push(nextItem);
        }
    }

    const path = getPath(pathToEnd, endItem.id);

    path.filter((idPath) => idPath !== startItem.id && idPath !== endItem.id).forEach((idPath) => {
        const lastStep = renderingSteps[renderingSteps.length - 1];

        renderingSteps.push(
            lastStep.map((cols) =>
                cols.map((item) => {
                    if (item.id === idPath) {
                        return {
                            ...item,
                            isAddedToPath: true,
                        };
                    }

                    return { ...item };
                }),
            ),
        );
    });

    return renderingSteps;
};
