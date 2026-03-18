import { AlgorithmStep, AlgorithmInfo, ArraySnapshot } from '@/types/graph';

export const mergesortInfo: AlgorithmInfo = {
    id: 'mergesort',
    name: "Merge Sort",
    description: "An efficient, stable, divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges the sorted halves.",
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    pseudocode: [
        "MergeSort(arr, l, r):",
        "  if l < r:",
        "    m = l + (r - l) / 2",
        "    MergeSort(arr, l, m)",
        "    MergeSort(arr, m + 1, r)",
        "    Merge(arr, l, m, r)",
        "",
        "Merge(arr, l, m, r):",
        "  Create temp arrays L and R",
        "  Copy data to temp arrays",
        "  Merge L and R back into arr[l..r]"
    ],
};

export function runMergeSort(initialArray: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const array = [...initialArray];

    const getStates = (
        activeRange: [number, number],
        comparing: number[] = [],
        swapping: number[] = [],
        sorted: number[] = []
    ) => {
        const states: Record<number, ArraySnapshot['states'][number]> = {};
        for (let k = 0; k < array.length; k++) {
            if (sorted.includes(k)) states[k] = 'sorted';
            else if (swapping.includes(k)) states[k] = 'swapping';
            else if (comparing.includes(k)) states[k] = 'comparing';
            else if (k >= activeRange[0] && k <= activeRange[1]) states[k] = 'target';
            else states[k] = 'default';
        }
        return states;
    };

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
        nodeStates: {},
        edgeStates: {},
        dataStructures: {},
        arraySnapshot: {
            array: [...array],
            states
        }
    });

    const merge = (l: number, m: number, r: number) => {
        steps.push(snap('visit', `Merge [${l}, ${m}] and [${m + 1}, ${r}]`, `Merging two sorted halves.`, 7, getStates([l, r])));

        const n1 = m - l + 1;
        const n2 = r - m;
        const L = new Array(n1);
        const R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = array[l + i];
        for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

        let i = 0;
        let j = 0;
        let k = l;

        while (i < n1 && j < n2) {
            steps.push(snap('explore', `Compare L[${i}] and R[${j}]`, `Comparing ${L[i]} and ${R[j]}.`, 10, getStates([l, r], [l + i, m + 1 + j])));
            if (L[i] <= R[j]) {
                array[k] = L[i];
                steps.push(snap('update', `Copy ${L[i]} into arr[${k}]`, `${L[i]} is smaller.`, 10, getStates([l, r], [], [k])));
                i++;
            } else {
                array[k] = R[j];
                steps.push(snap('update', `Copy ${R[j]} into arr[${k}]`, `${R[j]} is smaller.`, 10, getStates([l, r], [], [k])));
                j++;
            }
            k++;
        }

        while (i < n1) {
            array[k] = L[i];
            steps.push(snap('update', `Copy remainder from L into arr[${k}]`, `Copying ${L[i]}.`, 10, getStates([l, r], [], [k])));
            i++;
            k++;
        }

        while (j < n2) {
            array[k] = R[j];
            steps.push(snap('update', `Copy remainder from R into arr[${k}]`, `Copying ${R[j]}.`, 10, getStates([l, r], [], [k])));
            j++;
            k++;
        }

        const sortedRange: number[] = [];
        for (let x = l; x <= r; x++) sortedRange.push(x);
        steps.push(snap('done', `Merged [${l}, ${r}]`, `The segment is now sorted.`, 10, getStates([-1, -1], [], [], sortedRange)));
    };

    const mergeSort = (l: number, r: number) => {
        steps.push(snap('visit', `MergeSort [${l}, ${r}]`, `Dividing array.`, 0, getStates([l, r])));
        if (l >= r) {
            return;
        }
        const m = l + Math.floor((r - l) / 2);

        steps.push(snap('update', `Midpoint m=${m}`, `Dividing at index ${m}.`, 2, getStates([l, r])));

        mergeSort(l, m);
        mergeSort(m + 1, r);
        merge(l, m, r);
    };

    steps.push(snap('visit', 'Start Merge Sort', 'Begin recursive merge sort.', 0, getStates([0, array.length - 1])));
    mergeSort(0, array.length - 1);

    const finalStates: Record<number, ArraySnapshot['states'][number]> = {};
    for (let k = 0; k < array.length; k++) finalStates[k] = 'sorted';
    steps.push(snap('done', 'Array Sorted', 'Merge Sort complete.', 0, finalStates));

    return steps;
}
