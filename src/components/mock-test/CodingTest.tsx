import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface CodingQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  testCases: Array<{
    input: string;
    output: string;
  }>;
  solution: string;
}

// Large bank of coding questions
const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers in the array that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Easy",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1] (Because nums[0] + nums[1] == 9)",
    constraints: "2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109",
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]" },
      { input: "[3,2,4], 6", output: "[1,2]" }
    ],
    solution: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
  },
  {
    id: 2,
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    difficulty: "Easy",
    sampleInput: "s = '()'",
    sampleOutput: "true",
    constraints: "1 <= s.length <= 104\ns consists of parentheses only '()[]{}",
    testCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ],
    solution: `def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`
  },
  {
    id: 3,
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    difficulty: "Medium",
    sampleInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6 (The subarray [4,-1,2,1] has the largest sum 6)",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" }
    ],
    solution: `def maxSubArray(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`
  },
  {
    id: 4,
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    difficulty: "Medium",
    sampleInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    sampleOutput: "[[1,6],[8,10],[15,18]]",
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", output: "[[1,5]]" }
    ],
    solution: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged`
  },
  {
    id: 5,
    title: "LRU Cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods.",
    difficulty: "Hard",
    sampleInput: "LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2);",
    sampleOutput: "cache.get(1) returns 1, cache.get(2) returns 2",
    testCases: [
      { 
        input: "LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);", 
        output: "1" 
      },
      { 
        input: "LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.put(3, 3); cache.get(2);", 
        output: "2" 
      }
    ],
    solution: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.order = []
        
    def get(self, key):
        if key in self.cache:
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return -1
        
    def put(self, key, value):
        if key in self.cache:
            self.order.remove(key)
        elif len(self.cache) >= self.capacity:
            oldest = self.order.pop(0)
            del self.cache[oldest]
        self.cache[key] = value
        self.order.append(key)`
  },
  {
    id: 6,
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    difficulty: "Medium",
    sampleInput: "root = [3,9,20,null,null,15,7]",
    sampleOutput: "[[3],[9,20],[15,7]]",
    testCases: [
      { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "[1]", output: "[[1]]" }
    ],
    solution: `def levelOrder(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        level = []
        level_size = len(queue)
        for _ in range(level_size):
            node = queue.pop(0)
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`
  },
  {
    id: 7,
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Easy",
    sampleInput: "head = [1,2,3,4,5]",
    sampleOutput: "[5,4,3,2,1]",
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "[1,2]", output: "[2,1]" }
    ],
    solution: `def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev`
  },
  {
    id: 8,
    title: "Valid Palindrome",
    description: "Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases.",
    difficulty: "Easy",
    sampleInput: "s = 'A man, a plan, a canal: Panama'",
    sampleOutput: "true",
    testCases: [
      { input: "'A man, a plan, a canal: Panama'", output: "true" },
      { input: "'race a car'", output: "false" }
    ],
    solution: `def isPalindrome(s):
    filtered = ''.join(c.lower() for c in s if c.isalnum())
    return filtered == filtered[::-1]`
  },
  {
    id: 9,
    title: "Word Break",
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    difficulty: "Medium",
    sampleInput: "s = 'leetcode', wordDict = ['leet', 'code']",
    sampleOutput: "true",
    testCases: [
      { input: "s = 'leetcode', wordDict = ['leet', 'code']", output: "true" },
      { input: "s = 'applepenapple', wordDict = ['apple', 'pen']", output: "true" }
    ],
    solution: `def wordBreak(s, wordDict):
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for word in wordDict:
            if i >= len(word) and dp[i - len(word)] and s[i-len(word):i] == word:
                dp[i] = True
    return dp[-1]`
  },
  {
    id: 10,
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Medium",
    sampleInput: "s = 'babad'",
    sampleOutput: "'bab' or 'aba'",
    testCases: [
      { input: "'babad'", output: "'bab'" },
      { input: "'cbbd'", output: "'bb'" }
    ],
    solution: `def longestPalindrome(s):
    def expand(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]
    
    result = ""
    for i in range(len(s)):
        # odd length
        temp = expand(i, i)
        if len(temp) > len(result):
            result = temp
        # even length
        temp = expand(i, i + 1)
        if len(temp) > len(result):
            result = temp
    return result`
  },
  {
    id: 11,
    title: "Spiral Matrix",
    description: "Given an m x n matrix, return all elements of the matrix in spiral order.",
    difficulty: "Medium",
    sampleInput: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    sampleOutput: "[1,2,3,6,9,8,7,4,5]",
    testCases: [
      { input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" },
      { input: "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" }
    ],
    solution: `def spiralOrder(matrix):
    result = []
    while matrix:
        result.extend(matrix.pop(0))
        if matrix and matrix[0]:
            for row in matrix:
                result.append(row.pop())
        if matrix:
            result.extend(matrix.pop()[::-1])
        if matrix and matrix[0]:
            for row in matrix[::-1]:
                result.append(row.pop(0))
    return result`
  },
  {
    id: 12,
    title: "Kth Largest Element",
    description: "Given an integer array nums and an integer k, return the kth largest element in the array.",
    difficulty: "Medium",
    sampleInput: "nums = [3,2,1,5,6,4], k = 2",
    sampleOutput: "5",
    testCases: [
      { input: "[3,2,1,5,6,4], k = 2", output: "5" },
      { input: "[3,2,3,1,2,4,5,5,6], k = 4", output: "4" }
    ],
    solution: `def findKthLargest(nums, k):
    import heapq
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`
  },
  {
    id: 13,
    title: "Course Schedule",
    description: "There are numCourses courses you have to take. Some courses may have prerequisites. Return true if you can finish all courses.",
    difficulty: "Medium",
    sampleInput: "numCourses = 2, prerequisites = [[1,0]]",
    sampleOutput: "true",
    testCases: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" }
    ],
    solution: `def canFinish(numCourses, prerequisites):
    graph = [[] for _ in range(numCourses)]
    visited = [0] * numCourses
    
    for x, y in prerequisites:
        graph[x].append(y)
    
    def dfs(i):
        if visited[i] == -1:
            return False
        if visited[i] == 1:
            return True
        visited[i] = -1
        for j in graph[i]:
            if not dfs(j):
                return False
        visited[i] = 1
        return True
    
    for i in range(numCourses):
        if not dfs(i):
            return False
    return True`
  },
  {
    id: 14,
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    sampleInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    sampleOutput: "6",
    testCases: [
      { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "[4,2,0,3,2,5]", output: "9" }
    ],
    solution: `def trap(height):
    if not height:
        return 0
    
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    
    return water`
  },
  {
    id: 15,
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.",
    difficulty: "Medium",
    sampleInput: "nums = [100,4,200,1,3,2]",
    sampleOutput: "4",
    testCases: [
      { input: "[100,4,200,1,3,2]", output: "4" },
      { input: "[0,3,7,2,5,8,4,6,0,1]", output: "9" }
    ],
    solution: `def longestConsecutive(nums):
    if not nums:
        return 0
    
    num_set = set(nums)
    longest = 0
    
    for num in num_set:
        if num - 1 not in num_set:
            current = num
            current_streak = 1
            
            while current + 1 in num_set:
                current += 1
                current_streak += 1
            
            longest = max(longest, current_streak)
    
    return longest`
  },
  {
    id: 16,
    title: "Minimum Window Substring",
    description: "Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    difficulty: "Hard",
    sampleInput: "s = 'ADOBECODEBANC', t = 'ABC'",
    sampleOutput: "'BANC'",
    testCases: [
      { input: "'ADOBECODEBANC', 'ABC'", output: "'BANC'" },
      { input: "'a', 'a'", output: "'a'" }
    ],
    solution: `def minWindow(s, t):
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    start = 0
    end = 0
    i = 0
    
    for j, char in enumerate(s, 1):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1
        
        if missing == 0:
            while i < j and need[s[i]] < 0:
                need[s[i]] += 1
                i += 1
            if not end or j - i < end - start:
                start, end = i, j
    
    return s[start:end]`
  },
  {
    id: 17,
    title: "Serialize and Deserialize Binary Tree",
    description: "Design an algorithm to serialize and deserialize a binary tree.",
    difficulty: "Hard",
    sampleInput: "root = [1,2,3,null,null,4,5]",
    sampleOutput: "[1,2,3,null,null,4,5]",
    testCases: [
      { input: "[1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" },
      { input: "[]", output: "[]" }
    ],
    solution: `class Codec:
    def serialize(self, root):
        if not root:
            return 'null'
        return f'{root.val},{self.serialize(root.left)},{self.serialize(root.right)}'
        
    def deserialize(self, data):
        def dfs():
            val = next(values)
            if val == 'null':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node
            
        values = iter(data.split(','))
        return dfs()`
  },
  {
    id: 18,
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
    difficulty: "Hard",
    sampleInput: "s = 'aa', p = 'a*'",
    sampleOutput: "true",
    testCases: [
      { input: "'aa', 'a*'", output: "true" },
      { input: "'ab', '.*'", output: "true" }
    ],
    solution: `def isMatch(s, p):
    dp = [[False] * (len(p) + 1) for _ in range(len(s) + 1)]
    dp[0][0] = True
    
    for j in range(1, len(p) + 1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    
    for i in range(1, len(s) + 1):
        for j in range(1, len(p) + 1):
            if p[j-1] == s[i-1] or p[j-1] == '.':
                dp[i][j] = dp[i-1][j-1]
            elif p[j-1] == '*':
                dp[i][j] = dp[i][j-2]
                if p[j-2] == s[i-1] or p[j-2] == '.':
                    dp[i][j] = dp[i][j] or dp[i-1][j]
    
    return dp[len(s)][len(p)]`
  },
  {
    id: 19,
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "Hard",
    sampleInput: "nums1 = [1,3], nums2 = [2]",
    sampleOutput: "2.0",
    testCases: [
      { input: "[1,3], [2]", output: "2.0" },
      { input: "[1,2], [3,4]", output: "2.5" }
    ],
    solution: `def findMedianSortedArrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    x, y = len(nums1), len(nums2)
    low, high = 0, x

    while low <= high:
        partitionX = (low + high) // 2
        partitionY = (x + y + 1) // 2 - partitionX
        
        maxLeftX = float('-inf') if partitionX == 0 else nums1[partitionX - 1]
        minRightX = float('inf') if partitionX == x else nums1[partitionX]
        
        maxLeftY = float('-inf') if partitionY == 0 else nums2[partitionY - 1]
        minRightY = float('inf') if partitionY == y else nums2[partitionY]
        
        if maxLeftX <= minRightY and maxLeftY <= minRightX:
            if (x + y) % 2 == 0:
                return (max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2
            else:
                return max(maxLeftX, maxLeftY)
        elif maxLeftX > minRightY:
            high = partitionX - 1
        else:
            low = partitionX + 1`
  },
  {
    id: 20,
    title: "Word Search II",
    description: "Given an m x n board of characters and a list of strings words, return all words on the board that exist in the dictionary.",
    difficulty: "Hard",
    sampleInput: "board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], words = ['oath','pea','eat','rain']",
    sampleOutput: "['eat','oath']",
    testCases: [
      { input: "[['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], ['oath','pea','eat','rain']", output: "['eat','oath']" },
      { input: "[['a','b'],['c','d']], ['abcd']", output: "[]" }
    ],
    solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.isWord = False
        self.word = None

def findWords(board, words):
    root = TrieNode()
    for word in words:
        node = root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.isWord = True
        node.word = word
    
    result = []
    def dfs(node, i, j):
        if node.isWord:
            result.append(node.word)
            node.isWord = False
        
        if i < 0 or i >= len(board) or j < 0 or j >= len(board[0]):
            return
        
        char = board[i][j]
        node = node.children.get(char)
        if not node:
            return
        
        board[i][j] = '#'
        for x, y in [(i+1,j), (i-1,j), (i,j+1), (i,j-1)]:
            dfs(node, x, y)
        board[i][j] = char
    
    for i in range(len(board)):
        for j in range(len(board[0])):
            dfs(root, i, j)
    
    return result`
  }
];

const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' }
];

const CodingTest = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReview, setAiReview] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<CodingQuestion[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const { toast } = useToast();
  const [showSolution, setShowSolution] = useState(false);

  // Select 5 random questions when the test starts
  useEffect(() => {
    if (!testStarted) {
      const shuffled = [...CODING_QUESTIONS].sort(() => 0.5 - Math.random());
      setSelectedQuestions(shuffled.slice(0, 5));
      setTestStarted(true);
    }
  }, [testStarted]);

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  const getLanguageTemplate = (language: string, questionId: number): string => {
    const templates: { [key: string]: { [key: string]: string } } = {
      python: {
        1: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
        2: 'def isValid(s):\n    # Write your code here\n    pass',
        3: 'def maxSubArray(nums):\n    # Write your code here\n    pass',
        4: 'def merge(intervals):\n    # Write your code here\n    pass',
        5: 'class LRUCache:\n    def __init__(self, capacity):\n        # Write your code here\n        pass',
        6: 'def levelOrder(root):\n    # Write your code here\n    pass'
      },
      // Add templates for other languages...
    };
    return templates[language]?.[questionId] || '// Write your solution here';
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setCode(getLanguageTemplate(value, currentQuestion.id));
  };

  const checkCodeCorrectness = (code: string, question: CodingQuestion): boolean => {
    // This is a simplified check. In a real implementation, you would:
    // 1. Run the code against test cases
    // 2. Compare outputs
    // 3. Check for edge cases
    // For now, we'll do a basic check
    const strippedCode = code.replace(/\s+/g, '').toLowerCase();
    const strippedSolution = question.solution.replace(/\s+/g, '').toLowerCase();
    return strippedCode.includes(strippedSolution.substring(10, 30)); // Basic check for similar patterns
  };

  const analyzeCode = async () => {
    setIsSubmitting(true);
    try {
      // Simulate code execution and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isCorrect = checkCodeCorrectness(code, currentQuestion);
      
      if (isCorrect) {
        // Generate optimization suggestions
        const optimizationReview = `Code Review Analysis:

✅ Your solution is correct! Here are some optimization suggestions:

1. Time Complexity Analysis:
   - Current: O(n)
   - Could potentially optimize to O(log n) in certain cases

2. Space Optimization:
   - Consider using in-place operations where possible
   - Memory usage could be reduced by ${Math.floor(Math.random() * 20 + 10)}%

3. Code Style Improvements:
   - Consider adding type hints
   - Break down complex operations into smaller functions
   - Add comprehensive error handling

4. Alternative Approaches:
   - Consider using a hash map for O(1) lookups
   - A binary search approach might be more efficient
   - Dynamic programming could optimize repeated calculations

Would you like to see an example of an optimized solution?`;
        
        setAiReview(optimizationReview);
        toast({
          title: "Correct Solution!",
          description: "Check out optimization suggestions below.",
        });
      } else {
        // Generate helpful hints and solution guidance
        const helpfulReview = `Code Review Analysis:

❌ Your solution needs some work. Here's some guidance:

1. Logic Check:
   - The algorithm should handle ${currentQuestion.testCases[0].input} correctly
   - Expected output: ${currentQuestion.testCases[0].output}
   - Your code might be missing edge cases

2. Common Mistakes:
   - Check array bounds
   - Initialize variables properly
   - Handle empty input cases

3. Hints:
   - Consider using a ${Math.random() > 0.5 ? 'stack' : 'hash map'} data structure
   - Break down the problem into smaller steps
   - Think about the base cases first

4. Test Cases:
   - Try running your code with: ${currentQuestion.testCases[1].input}
   - Expected output: ${currentQuestion.testCases[1].output}

Would you like to see a step-by-step solution?`;
        
        setAiReview(helpfulReview);
        toast({
          title: "Solution Needs Improvement",
          description: "Check out the suggestions below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCode(getLanguageTemplate(selectedLanguage, selectedQuestions[currentQuestionIndex + 1].id));
      setAiReview('');
    }
  };

  const handleExit = () => {
    const confirmExit = window.confirm('Are you sure you want to exit the test? Your progress will be lost.');
    if (confirmExit) {
      navigate('/mock-test');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Advanced Coding Test</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} of {selectedQuestions.length}</CardDescription>
              </div>
              <Progress value={(currentQuestionIndex + 1) * 20} className="w-[200px]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion && (
              <>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Problem: {currentQuestion.title}</h3>
                  <p className="mb-4">{currentQuestion.description}</p>
                  
                  {currentQuestion.sampleInput && (
                    <div className="mt-4">
                      <p className="font-medium">Sample Input:</p>
                      <code className="block bg-slate-100 p-2 rounded mt-1">{currentQuestion.sampleInput}</code>
                    </div>
                  )}
                  
                  {currentQuestion.sampleOutput && (
                    <div className="mt-2">
                      <p className="font-medium">Sample Output:</p>
                      <code className="block bg-slate-100 p-2 rounded mt-1">{currentQuestion.sampleOutput}</code>
                    </div>
                  )}
                  
                  {currentQuestion.constraints && (
                    <div className="mt-2">
                      <p className="font-medium">Constraints:</p>
                      <pre className="bg-slate-100 p-2 rounded mt-1 text-sm">{currentQuestion.constraints}</pre>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Language:</label>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Code:</label>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono min-h-[300px]"
                      placeholder="Write your code here..."
                    />
                  </div>

                  <div className="flex gap-4 items-center justify-between">
                    <Button 
                      onClick={analyzeCode} 
                      disabled={isSubmitting || !code.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Submit & Analyze'
                      )}
                    </Button>
                    
                    {currentQuestionIndex < selectedQuestions.length - 1 && (
                      <Button
                        onClick={handleNextQuestion}
                        className="flex-1"
                      >
                        Next Question
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={handleExit}
                      className="flex-1"
                    >
                      Exit Test
                    </Button>
                  </div>
                </div>

                {aiReview && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">AI Code Review:</h3>
                        {aiReview.includes('✅') ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <pre className="whitespace-pre-wrap text-sm">{aiReview}</pre>
                      
                      {!aiReview.includes('✅') && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowSolution(true)}
                            className="w-full"
                          >
                            Yes, Show Me the Solution
                          </Button>
                        </div>
                      )}
                    </div>

                    {showSolution && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Step-by-Step Solution:</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSolution(false)}
                          >
                            Hide Solution
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Approach:</h4>
                            <p className="text-sm text-gray-600">
                              Here's how we can solve this problem step by step:
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Implementation:</h4>
                            <pre className="bg-slate-100 p-3 rounded text-sm font-mono overflow-x-auto">
                              {currentQuestion.solution}
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Explanation:</h4>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                              <li>First, we initialize our data structures and variables</li>
                              <li>Then, we handle the main logic of the problem</li>
                              <li>Finally, we return the result in the required format</li>
                            </ol>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Complexity Analysis:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              <li>Time Complexity: O(n)</li>
                              <li>Space Complexity: O(n)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CodingTest; 