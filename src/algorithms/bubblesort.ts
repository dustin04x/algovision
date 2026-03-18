import { AlgorithmStep, AlgorithmInfo, ArraySnapshot } from '@/types/graph';

export const bubblesortInfo: AlgorithmInfo = {
    id: 'bubblesort',
    name: "Bubble Sort",
    description: "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
        "BubbleSort(array):",
        "  for i from 0 to n - 1:",
        "    for j from 0 to n - i - 1:",
        "      if array[j] > array[j + 1]:",
        "        swap(array[j], array[j + 1])"
    ],
};

export function runBubbleSort(initialArray: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const array = [...initialArray];
    const n = array.length;

    const snap = (
        type: AlgorithmStep['type'],
        desc: string,
        explanation: string,
        line: number,
        states: Record<number, ArraySnapshot['states'][number]>
    ): AlgorithmStep => ({
        type,
        description: desc,
        explanation,
        pseudocodeLine: line,
        nodeStates: {}, // Graphs unused
        edgeStates: {},
        dataStructures: {},
        arraySnapshot: {
            array: [...array],
            states
        }
    });

    steps.push(snap('visit', 'Start Bubble Sort', 'Begin sorting the array using Bubble Sort.', 1, {}));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Comparing
            const cmpStates: Record<number, ArraySnapshot['states'][number]> = {};
            for (let k = n - i; k < n; k++) cmpStates[k] = 'sorted';
            cmpStates[j] = 'comparing';
            cmpStates[j + 1] = 'comparing';

            steps.push(snap('update', `Compare ${array[j]} and ${array[j + 1]}`, `Comparing adjacent elements at indices ${j} and ${j + 1}.`, 4, { ...cmpStates }));

            if (array[j] > array[j + 1]) {
                // Swapping
                const swapStates = { ...cmpStates };
                swapStates[j] = 'swapping';
                swapStates[j + 1] = 'swapping';
                steps.push(snap('explore', `Swap ${array[j]} and ${array[j + 1]}`, `${array[j]} is greater than ${array[j + 1]}, swapping them.`, 5, { ...swapStates }));

                const temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                steps.push(snap('update', `Swapped`, `Elements swapped.`, 5, { ...swapStates }));
            }
        }
    }

    const finalStates: Record<number, ArraySnapshot['states'][number]> = {};
    for (let i = 0; i < n; i++) finalStates[i] = 'sorted';
    steps.push(snap('done', 'Array Sorted', 'Bubble Sort complete. The array is fully sorted.', 1, finalStates));

    return steps;
}
