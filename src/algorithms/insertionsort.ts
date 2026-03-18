import { AlgorithmStep, AlgorithmInfo, ArraySnapshot } from '@/types/graph';

export const insertionsortInfo: AlgorithmInfo = {
    id: 'insertionsort',
    name: "Insertion Sort",
    description: "A simple sorting algorithm that builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the sorted portion.",
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
        "InsertionSort(arr):",
        "  for i = 1 to n - 1:",
        "    key = arr[i]",
        "    j = i - 1",
        "    while j >= 0 and arr[j] > key:",
        "      arr[j + 1] = arr[j]",
        "      j = j - 1",
        "    arr[j + 1] = key"
    ],
};

export function runInsertionSort(initialArray: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const array = [...initialArray];
    const n = array.length;

    const getStates = (
        sortedUpTo: number,
        comparing: number[] = [],
        swapping: number[] = [],
        keyIdx: number = -1
    ) => {
        const states: Record<number, ArraySnapshot['states'][number]> = {};
        for (let k = 0; k < array.length; k++) {
            if (keyIdx === k) states[k] = 'target';
            else if (swapping.includes(k)) states[k] = 'swapping';
            else if (comparing.includes(k)) states[k] = 'comparing';
            else if (k <= sortedUpTo) states[k] = 'sorted';
            else states[k] = 'default';
        }
        return states;
    };

    const snap = (
        type: AlgorithmStep['type'],
        desc: string,
        explanation: string,
        line: number,
        states: Record<number, ArraySnapshot['states'][number]>,
        keyVal: number | string = 'none'
    ): AlgorithmStep => ({
        type,
        description: desc,
        explanation,
        pseudocodeLine: line,
        nodeStates: {},
        edgeStates: {},
        dataStructures: {
            keyInfo: { label: 'Key', type: 'value', data: keyVal }
        },
        arraySnapshot: {
            array: [...array],
            states
        }
    });

    steps.push(snap('visit', 'Start Insertion Sort', 'Begin insertion sort. The first element is considered sorted.', 0, getStates(0)));

    for (let i = 1; i < n; i++) {
        const key = array[i];
        steps.push(snap('update', `Key = ${key}`, `Set key to arr[${i}].`, 2, getStates(i - 1, [], [], i), key));

        let j = i - 1;

        steps.push(snap('explore', `Check arr[${j}] > key`, `Is ${array[j]} > ${key}?`, 4, getStates(i - 1, [j], [], i), key));

        while (j >= 0 && array[j] > key) {
            steps.push(snap('update', `Shift arr[${j}] right`, `${array[j]} > ${key}, shifting to arr[${j + 1}].`, 5, getStates(i - 1, [], [j, j + 1], -1), key));
            array[j + 1] = array[j];
            j = j - 1;

            if (j >= 0) {
                steps.push(snap('explore', `Check arr[${j}] > key`, `Is ${array[j]} > ${key}?`, 4, getStates(i, [j], [], j + 1), key));
            }
        }

        array[j + 1] = key;
        steps.push(snap('update', `Insert key at arr[${j + 1}]`, `Found correct position. Insert ${key}. Range [0, ${i}] is now sorted.`, 7, getStates(i, [], [j + 1], -1), key));
    }

    const finalStates: Record<number, ArraySnapshot['states'][number]> = {};
    for (let k = 0; k < array.length; k++) finalStates[k] = 'sorted';
    steps.push(snap('done', 'Array Sorted', 'Insertion Sort complete.', 0, finalStates, 'none'));

    return steps;
}
