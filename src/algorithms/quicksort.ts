import { AlgorithmStep, AlgorithmInfo, ArraySnapshot } from '@/types/graph';

export const quicksortInfo: AlgorithmInfo = {
    id: 'quicksort',
    name: "Quick Sort",
    description: "An efficient, divide-and-conquer, recursive sorting algorithm that picks an element as a pivot and partitions the given array around the picked pivot.",
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    pseudocode: [
        "QuickSort(arr, low, high):",
        "  if low < high:",
        "    pi = Partition(arr, low, high)",
        "    QuickSort(arr, low, pi - 1)",
        "    QuickSort(arr, pi + 1, high)",
        "",
        "Partition(arr, low, high):",
        "  pivot = arr[high]",
        "  i = low - 1",
        "  for j = low to high - 1:",
        "    if arr[j] < pivot:",
        "      i++",
        "      swap(arr[i], arr[j])",
        "  swap(arr[i + 1], arr[high])",
        "  return i + 1"
    ],
};

export function runQuickSort(initialArray: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const array = [...initialArray];
    const sortedIndices = new Set<number>();

    const getStates = (
        low: number,
        high: number,
        pivot: number,
        i: number | null,
        j: number | null,
        comparing: number[] = [],
        swapping: number[] = []
    ) => {
        const states: Record<number, ArraySnapshot['states'][number]> = {};
        for (let k = 0; k < array.length; k++) {
            if (sortedIndices.has(k)) {
                states[k] = 'sorted';
            } else if (k === pivot) {
                states[k] = 'target';
            } else if (swapping.includes(k)) {
                states[k] = 'swapping';
            } else if (comparing.includes(k) || k === i || k === j) {
                states[k] = 'comparing';
            } else if (k >= low && k <= high) {
                states[k] = 'default';
            } else {
                states[k] = 'default';
            }
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

    const partition = (low: number, high: number): number => {
        const pivotVal = array[high];
        steps.push(snap('visit', `Partition [${low}, ${high}]`, `Choosing pivot ${pivotVal} at index ${high}.`, 7, getStates(low, high, high, null, null)));

        let i = low - 1;
        steps.push(snap('update', `Initialize i=${i}`, `i tracks the boundary of elements smaller than the pivot.`, 8, getStates(low, high, high, i < 0 ? null : i, null)));

        for (let j = low; j < high; j++) {
            steps.push(snap('explore', `Check arr[${j}] < ${pivotVal}`, `Comparing elements.`, 10, getStates(low, high, high, i < 0 ? null : i, j, [j, high])));
            if (array[j] < pivotVal) {
                i++;
                steps.push(snap('update', `arr[${j}] < pivot, i++`, `Increment i to ${i} and swap arr[${i}] with arr[${j}].`, 11, getStates(low, high, high, i, j, [j, high])));

                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;

                steps.push(snap('update', `Swapped arr[${i}] and arr[${j}]`, `Swapped ${array[j]} and ${array[i]}.`, 12, getStates(low, high, high, i, j, [], [i, j])));
            }
        }

        steps.push(snap('explore', `Swap pivot into place`, `Swap arr[${i + 1}] (${array[i + 1]}) with pivot (${array[high]}).`, 13, getStates(low, high, high, i + 1, high, [], [i + 1, high])));

        const temp = array[i + 1];
        array[i + 1] = array[high];
        array[high] = temp;

        steps.push(snap('update', `Pivot ${array[i + 1]} is now sorted`, `Pivot placed in its final sorted position at index ${i + 1}.`, 14, getStates(low, high, i + 1, null, null)));

        sortedIndices.add(i + 1);
        return i + 1;
    };

    const quickSort = (low: number, high: number) => {
        steps.push(snap('visit', `QuickSort [${low}, ${high}]`, `Sorting subgroup.`, 1, getStates(low, high, -1, null, null)));
        if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
        } else if (low === high) {
            sortedIndices.add(low);
            steps.push(snap('update', `Index ${low} sorted`, `Base case of 1 element.`, 1, getStates(low, high, -1, null, null)));
        }
    };

    steps.push(snap('visit', 'Start Quick Sort', 'Begin recursive sorting.', 0, getStates(0, array.length - 1, -1, null, null)));

    quickSort(0, array.length - 1);

    const finalStates: Record<number, ArraySnapshot['states'][number]> = {};
    for (let k = 0; k < array.length; k++) finalStates[k] = 'sorted';
    steps.push(snap('done', 'Array Sorted', 'Quick Sort complete.', 0, finalStates));

    return steps;
}
