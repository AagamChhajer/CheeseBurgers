import { Question } from '@/types/exam';

export const questions: Question[] = [
  {
    id: 1,
    type: 'coding',
    difficulty: 'Hard',
    title: 'Median of Two Sorted Arrays',
    question: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example 1:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

Example 2:
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.

Constraints:
• nums1.length == m
• nums2.length == n
• 0 <= m <= 1000
• 0 <= n <= 1000
• 1 <= m + n <= 2000
• -106 <= nums1[i], nums2[i] <= 106`,
    language: 'javascript',
    template: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: [[1,3], [2]],
        expected: 2.0
      },
      {
        input: [[1,2], [3,4]],
        expected: 2.5
      }
    ]
  },
  {
    id: 2,
    type: 'coding',
    difficulty: 'Easy',
    title: 'Two Sum',
    question: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Constraints:
• 2 <= nums.length <= 104
• -109 <= nums[i] <= 109
• -109 <= target <= 109
• Only one valid answer exists`,
    language: 'javascript',
    template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: [[2,7,11,15], 9],
        expected: [0,1]
      },
      {
        input: [[3,2,4], 6],
        expected: [1,2]
      }
    ]
  },
  {
    id: 3,
    type: 'coding',
    difficulty: 'Easy',
    title: 'Valid Palindrome',
    question: `Given a string s, return true if it is a palindrome, or false otherwise.

A string is a palindrome when it reads the same backward as forward.
You should ignore cases and non-alphanumeric characters.

Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.

Example 2:
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.

Constraints:
• 1 <= s.length <= 2 * 105
• s consists only of printable ASCII characters`,
    language: 'javascript',
    template: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: ["A man, a plan, a canal: Panama"],
        expected: true
      },
      {
        input: ["race a car"],
        expected: false
      }
    ]
  },
  {
    id: 4,
    type: 'coding',
    difficulty: 'Medium',
    title: 'Maximum Subarray',
    question: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.

Constraints:
• 1 <= nums.length <= 105
• -104 <= nums[i] <= 104`,
    language: 'javascript',
    template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: [[-2,1,-3,4,-1,2,1,-5,4]],
        expected: 6
      },
      {
        input: [[1]],
        expected: 1
      }
    ]
  },
  {
    id: 5,
    type: 'mcq',
    difficulty: 'Medium',
    title: 'Time Complexity Analysis',
    question: 'What is the time complexity of QuickSort in the average case?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(log n)' }
    ],
    correctAnswer: 'b'
  }
]; 