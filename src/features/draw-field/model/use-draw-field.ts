import { useEffect, useRef } from 'react';
import { drawField } from './draw-field.ts';
import { fieldItemModel } from '@/entities/field-item';
import { Simulate } from 'react-dom/test-utils';
import resize = Simulate.resize;

export const useDrawField = (fieldItems: fieldItemModel.FieldItem[][]) => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;

        let frameId;

        if (canvas && fieldItems.length > 0) {
            frameId = requestAnimationFrame(() => drawField(canvas, fieldItems));
        }

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [fieldItems]);

    const drawFieldWithAwait: fieldItemModel.DrawFieldWithAwait = (fieldItems) => {
        const canvas = ref.current;

        return new Promise((resolve) => {
            const start = performance.now();

            const draw = (time: DOMHighResTimeStamp) => {
                if (time - start >= 30) {
                    drawField(canvas!, fieldItems);
                    resolve();
                } else {
                    requestAnimationFrame(draw);
                }
            };

            requestAnimationFrame(draw);
        });
    };

    return { ref, fieldItems, drawFieldWithAwait };
};
