const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const questions = [
        {
            text: "Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target. You may assume that each input would have exactly one solution.",
            language: "Python",
            constraints: "2 <= nums.length <= 104, -109 <= nums[i] <= 109, -109 <= target <= 109",
            difficulty: "Easy"
        },
        {
            text: "Valid Parentheses: Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1) Open brackets must be closed by the same type of brackets. 2) Open brackets must be closed in the correct order.",
            language: "Python",
            constraints: "1 <= s.length <= 104, s consists of parentheses only '()[]{}'",
            difficulty: "Easy"
        },
        {
            text: "Merge Two Sorted Lists: Given the heads of two sorted linked lists list1 and list2, merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.",
            language: "Python",
            constraints: "The number of nodes in both lists is in the range [0, 50], -100 <= Node.val <= 100",
            difficulty: "Easy"
        },
        {
            text: "Group Anagrams: Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
            language: "Python",
            constraints: "1 <= strs.length <= 104, 0 <= strs[i].length <= 100",
            difficulty: "Medium"
        },
        {
            text: "Longest Palindromic Substring: Given a string s, return the longest palindromic substring in s.",
            language: "Python",
            constraints: "1 <= s.length <= 1000, s consist of only digits and English letters",
            difficulty: "Medium"
        },
        {
            text: "3Sum: Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            language: "Python",
            constraints: "3 <= nums.length <= 3000, -105 <= nums[i] <= 105",
            difficulty: "Medium"
        },
        {
            text: "Trapping Rain Water: Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            language: "Python",
            constraints: "n == height.length, 1 <= n <= 2 * 104, 0 <= height[i] <= 105",
            difficulty: "High"
        },
        {
            text: "Median of Two Sorted Arrays: Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
            language: "Python",
            constraints: "nums1.length == m, nums2.length == n, 0 <= m <= 1000, 0 <= n <= 1000, 1 <= m + n <= 2000",
            difficulty: "High"
        }
    ];

    for (const question of questions) {
        await prisma.question.create({
            data: question
        });
    }

    console.log('Seed data inserted successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 