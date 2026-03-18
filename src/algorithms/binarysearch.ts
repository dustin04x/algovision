import { AlgorithmStep, AlgorithmInfo, ArraySnapshot } from '@/types/graph';

export const binarysearchInfo: AlgorithmInfo = {
    id: 'binarysearch',
    name: "Binary Search",
    description: "A search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array.",
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    pseudocode: [
        "BinarySearch(array, target):",
        "  left = 0, right = n - 1",
        "  while left <= right:",
        "    mid = floor((left + right) / 2)",
        "    if array[mid] == target:",
        "      return mid",
        "    else if array[mid] < target:",
        "      left = mid + 1",
        "    else:",
        "      right = mid - 1",
        "  return -1"
    ],
};

export function runBinarySearch(initialArray: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const array = [...initialArray];
    // Target is chosen randomly from the array or a non-existent value
    const target = Math.random() > 0.2 ? array[Math.floor(Math.random() * array.length)] : Math.floor(Math.random() * 100);

    const snap = (
        type: AlgorithmStep['type'],
        desc: string,
        explanation: string,
        line: number,
        left: number,
        right: number,
        mid: number | null,
        targetIndex: number | null
    ): AlgorithmStep => {
        const states: Record<number, ArraySnapshot['states'][number]> = {};
        for (let i = left; i <= right; i++) states[i] = 'default';
        if (mid !== null) states[mid] = 'comparing';
        if (targetIndex !== null) states[targetIndex] = 'target';

        return {
            type,
            description: desc,
            explanation,
            pseudocodeLine: line,
            nodeStates: {},
            edgeStates: {},
            dataStructures: {
                targetInfo: { label: 'Target Value', type: 'value', data: target }
            },
            arraySnapshot: {
                array: [...array],
                states
            }
        };
    };

    let left = 0;
    let right = array.length - 1;

    steps.push(snap('visit', `Start Binary Search for target: ${target}`, `Initialize left pointer at ${left} and right pointer at ${right}.`, 2, left, right, null, null));

    while (left <= right) {
        steps.push(snap('update', `Checking range [${left}, ${right}]`, `Left: ${left}, Right: ${right}.`, 3, left, right, null, null));

        const mid = Math.floor((left + right) / 2);
        steps.push(snap('explore', `Calculate Mid: ${mid}`, `Mid = floor((${left} + ${right}) / 2) = ${mid}. Array[${mid}] is ${array[mid]}.`, 4, left, right, mid, null));

        if (array[mid] === target) {
            steps.push(snap('path', `Found Target at index ${mid}!`, `array[${mid}] (${array[mid]}) is equal to target (${target}). Search successful.`, 6, left, right, mid, mid));
            return steps;
        } else if (array[mid] < target) {
            steps.push(snap('visit', `array[${mid}] < target`, `${array[mid]} is less than ${target}. Search right half. left = mid + 1.`, 8, left, right, mid, null));
            left = mid + 1;
        } else {
            steps.push(snap('backtrack', `array[${mid}] > target`, `${array[mid]} is greater than ${target}. Search left half. right = mid - 1.`, 10, left, right, mid, null));
            right = mid - 1;
        }
    }

    steps.push(snap('done', `Target not found`, `Left > Right. The target ${target} is not in the array.`, 11, -1, -1, null, null));
    return steps;
}
