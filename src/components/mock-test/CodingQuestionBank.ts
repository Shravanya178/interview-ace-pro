export interface CodingQuestion {
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
  solutions: {
    python: string;
    cpp: string;
    java: string;
    c: string;
  };
  buggy_code?: string;
  hints?: string[];
  explanation?: string;
  time_complexity?: string;
  space_complexity?: string;
  function_signatures: {
    python: string;
    cpp: string;
    java: string;
    c: string;
  };
}

// Helper function to get language-specific template
export const getLanguageTemplate = (language: string, signature: string): string => {
  switch (language) {
    case 'python':
      return `${signature}\n    # Write your solution here\n    pass`;
    case 'cpp':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    case 'java':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    case 'c':
      return `${signature} {\n    // Write your solution here\n    \n}`;
    default:
      return '// Write your solution here';
  }
};

export const codingQuestions: CodingQuestion[] = [
  // Easy questions
  {
    id: 101,
    title: 'Two Sum',
    description: 'Given an array of integers and a target sum, return the indices of the two numbers that add up to the target.',
    difficulty: 'Easy',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
    ],
    hints: [
      'Consider using a hash map to store values you\'ve seen',
      'For each number, check if its complement (target - num) exists in the hash map',
      'Be careful about using the same element twice'
    ],
    function_signatures: {
      python: 'def twoSum(nums: List[int], target: int) -> List[int]:',
      cpp: 'vector<int> twoSum(vector<int>& nums, int target)',
      java: 'public int[] twoSum(int[] nums, int target)',
      c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize)'
    },
    solution: `def twoSum(nums: List[int], target: int) -> List[int]:
    num_map = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
    solutions: {
      python: `def twoSum(nums: List[int], target: int) -> List[int]:
    num_map = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> num_map;  // value -> index
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (num_map.count(complement)) {
            return {num_map[complement], i};
        }
        num_map[nums[i]] = i;
    }
    return {};
}`,
      java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> numMap = new HashMap<>();  // value -> index
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (numMap.containsKey(complement)) {
            return new int[] {numMap.get(complement), i};
        }
        numMap.put(nums[i], i);
    }
    return new int[0];
}`,
      c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Using a simple approach for C (no hash maps)
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    
    *returnSize = 0;
    return NULL;
}`
    },
    explanation: 'We use a hash map to store each number and its index. For each number, we check if its complement (target - current number) exists in the hash map. This gives us O(n) time complexity as we only need to scan the array once.',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)'
  },
  {
    id: 102,
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'Easy',
    sampleInput: 's = "()[]{}"',
    sampleOutput: 'true',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'\nA string is valid if: (1) Open brackets must be closed by the same type of brackets. (2) Open brackets must be closed in the correct order. (3) Every close bracket has a corresponding open bracket of the same type.',
    testCases: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "([)]"', output: 'false' }
    ],
    hints: [
      'Consider using a stack',
      'Push opening brackets onto the stack and pop when you encounter closing brackets',
      'Check if the popped bracket matches the current closing bracket'
    ],
    function_signatures: {
      python: 'def isValid(s: str) -> bool:',
      cpp: 'bool isValid(string s)',
      java: 'public boolean isValid(String s)',
      c: 'bool isValid(char* s)'
    },
    solution: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:  # closing bracket
            if not stack or stack.pop() != mapping[char]:
                return False
        else:  # opening bracket
            stack.append(char)
    
    return len(stack) == 0`,
    solutions: {
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:  # closing bracket
            if not stack or stack.pop() != mapping[char]:
                return False
        else:  # opening bracket
            stack.append(char)
    
    return len(stack) == 0`,
      cpp: `bool isValid(string s) {
    stack<char> stack;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    
    for (char c : s) {
        if (mapping.find(c) != mapping.end()) {  // closing bracket
            if (stack.empty() || stack.top() != mapping[c])
                return false;
            stack.pop();
        } else {  // opening bracket
            stack.push(c);
        }
    }
    
    return stack.empty();
}`,
      java: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> mapping = new HashMap<>();
    mapping.put(')', '(');
    mapping.put('}', '{');
    mapping.put(']', '[');
    
    for (char c : s.toCharArray()) {
        if (mapping.containsKey(c)) {  // closing bracket
            if (stack.isEmpty() || stack.pop() != mapping.get(c))
                return false;
        } else {  // opening bracket
            stack.push(c);
        }
    }
    
    return stack.isEmpty();
}`,
      c: `bool isValid(char* s) {
    int len = strlen(s);
    char* stack = (char*)malloc(len + 1);
    int top = -1;
    
    for (int i = 0; i < len; i++) {
        if (s[i] == '(' || s[i] == '{' || s[i] == '[') {
            stack[++top] = s[i];
        } else {
            if (top == -1) {
                free(stack);
                return false;
            }
            
            char expectedOpen;
            if (s[i] == ')') expectedOpen = '(';
            else if (s[i] == '}') expectedOpen = '{';
            else expectedOpen = '[';  // s[i] == ']'
            
            if (stack[top] != expectedOpen) {
                free(stack);
                return false;
            }
            top--;
        }
    }
    
    bool result = (top == -1);
    free(stack);
    return result;
}`
    },
    explanation: 'We use a stack to keep track of opening brackets. When we encounter a closing bracket, we check if it matches the most recent opening bracket (which should be at the top of the stack). The string is valid if all brackets are properly matched and the stack is empty at the end.',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)'
  },
  
  // Medium questions
  {
    id: 201,
    title: 'Binary Search Tree Validator',
    description: 'Debug the following binary search tree validation function. The function should return true if a binary tree is a valid binary search tree (BST), and false otherwise.',
    difficulty: 'Medium',
    sampleInput: 'root = [2,1,3]',
    sampleOutput: 'true',
    constraints: 'The number of nodes in the tree is in the range [1, 10^4]',
    testCases: [
      { input: '[2,1,3]', output: 'true' },
      { input: '[5,1,4,null,null,3,6]', output: 'false' }
    ],
    buggy_code: `def isValidBST(root):
    def validate(node):
        if not node:
            return True
        
        if node.left and node.left.val >= node.val:
            return False
        if node.right and node.right.val <= node.val:
            return False
        
        return validate(node.left) and validate(node.right)
    
    return validate(root)`,
    hints: [
      'The current implementation only checks immediate children',
      'Consider using value ranges for each subtree',
      'Think about edge cases with duplicate values'
    ],
    function_signatures: {
      python: 'def isValidBST(root: TreeNode) -> bool:',
      cpp: 'bool isValidBST(TreeNode* root)',
      java: 'public boolean isValidBST(TreeNode root)',
      c: 'bool isValidBST(struct TreeNode* root)'
    },
    solution: `def isValidBST(root: TreeNode) -> bool:
    def validate(node, min_val, max_val):
        if not node:
            return True
            
        if node.val <= min_val or node.val >= max_val:
            return False
            
        return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
    
    return validate(root, float('-inf'), float('inf'))`,
    solutions: {
      python: `def isValidBST(root: TreeNode) -> bool:
    def validate(node, min_val, max_val):
        if not node:
            return True
            
        if node.val <= min_val or node.val >= max_val:
            return False
            
        return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
    
    return validate(root, float('-inf'), float('inf'))`,
      cpp: `bool isValidBST(TreeNode* root) {
    return validate(root, LONG_MIN, LONG_MAX);
}

bool validate(TreeNode* node, long min_val, long max_val) {
    if (!node) return true;
    
    if (node->val <= min_val || node->val >= max_val)
        return false;
        
    return validate(node->left, min_val, node->val) 
        && validate(node->right, node->val, max_val);
}`,
      java: `public boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean validate(TreeNode node, long min, long max) {
    if (node == null) return true;
    
    if (node.val <= min || node.val >= max)
        return false;
        
    return validate(node.left, min, node.val) 
        && validate(node.right, node.val, max);
}`,
      c: `bool validate(struct TreeNode* node, long min_val, long max_val) {
    if (!node) return true;
    
    if (node->val <= min_val || node->val >= max_val)
        return false;
        
    return validate(node->left, min_val, node->val) 
        && validate(node->right, node->val, max_val);
}

bool isValidBST(struct TreeNode* root) {
    return validate(root, LONG_MIN, LONG_MAX);
}`
    },
    explanation: 'The buggy code only checks immediate parent-child relationships. The correct solution uses a range-based approach where each node must fall within a valid range. For the left subtree, the upper bound is the parent\'s value, and for the right subtree, the lower bound is the parent\'s value.',
    time_complexity: 'O(n)',
    space_complexity: 'O(h) where h is the height of the tree'
  },
  {
    id: 202,
    title: 'Decode String',
    description: 'Debug the following implementation of a string decoding function. The encoding rule is: k[encoded_string], where encoded_string inside the square brackets is repeated exactly k times.',
    difficulty: 'Medium',
    sampleInput: 's = "3[a]2[bc]"',
    sampleOutput: '"aaabcbc"',
    constraints: '1 <= s.length <= 30\ns consists of lowercase English letters, digits, and square brackets.',
    testCases: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 's = "3[a2[c]]"', output: '"accaccacc"' }
    ],
    buggy_code: `def decodeString(s: str) -> str:
    stack = []
    for char in s:
        if char != ']':
            stack.append(char)
        else:
            # Pop until we find the matching '['
            substr = ""
            while stack[-1] != '[':
                substr = stack.pop() + substr
            
            # Remove '['
            stack.pop()
            
            # Get the number
            k = ""
            while stack and stack[-1].isdigit():
                k = stack.pop() + k
            
            # Push the decoded substring back to stack
            stack.append(substr * int(k))
    
    return ''.join(stack)`,
    hints: [
      'Check what happens when there are no square brackets in the input',
      'Make sure you handle nested encodings correctly',
      'Check the order of characters when building the decoded string'
    ],
    function_signatures: {
      python: 'def decodeString(s: str) -> str:',
      cpp: 'string decodeString(string s)',
      java: 'public String decodeString(String s)',
      c: 'char* decodeString(char* s)'
    },
    solution: `def decodeString(s: str) -> str:
    stack = []
    for char in s:
        if char != ']':
            stack.append(char)
        else:
            # Pop until we find the matching '['
            substr = ""
            while stack and stack[-1] != '[':
                substr = stack.pop() + substr
            
            # Remove '['
            if stack: stack.pop()
            
            # Get the number
            k = ""
            while stack and stack[-1].isdigit():
                k = stack.pop() + k
            
            # Push the decoded substring back to stack
            stack.append(substr * int(k or '1'))
    
    return ''.join(stack)`,
    solutions: {
      python: `def decodeString(s: str) -> str:
    stack = []
    for char in s:
        if char != ']':
            stack.append(char)
        else:
            # Pop until we find the matching '['
            substr = ""
            while stack and stack[-1] != '[':
                substr = stack.pop() + substr
            
            # Remove '['
            if stack: stack.pop()
            
            # Get the number
            k = ""
            while stack and stack[-1].isdigit():
                k = stack.pop() + k
            
            # Push the decoded substring back to stack
            stack.append(substr * int(k or '1'))
    
    return ''.join(stack)`,
      cpp: `string decodeString(string s) {
    stack<char> chars;
    
    for (char c : s) {
        if (c != ']') {
            chars.push(c);
        } else {
            string substr = "";
            while (!chars.empty() && chars.top() != '[') {
                substr = chars.top() + substr;
                chars.pop();
            }
            
            // Remove '['
            if (!chars.empty()) chars.pop();
            
            // Get the number
            string k = "";
            while (!chars.empty() && isdigit(chars.top())) {
                k = chars.top() + k;
                chars.pop();
            }
            
            // Push the decoded substring back to stack
            int repeat = k.empty() ? 1 : stoi(k);
            string decoded = "";
            for (int i = 0; i < repeat; i++) {
                decoded += substr;
            }
            
            for (char dc : decoded) {
                chars.push(dc);
            }
        }
    }
    
    string result = "";
    while (!chars.empty()) {
        result = chars.top() + result;
        chars.pop();
    }
    
    return result;
}`,
      java: `public String decodeString(String s) {
    Stack<Character> chars = new Stack<>();
    
    for (char c : s.toCharArray()) {
        if (c != ']') {
            chars.push(c);
        } else {
            StringBuilder substr = new StringBuilder();
            while (!chars.isEmpty() && chars.peek() != '[') {
                substr.insert(0, chars.pop());
            }
            
            // Remove '['
            if (!chars.isEmpty()) chars.pop();
            
            // Get the number
            StringBuilder k = new StringBuilder();
            while (!chars.isEmpty() && Character.isDigit(chars.peek())) {
                k.insert(0, chars.pop());
            }
            
            // Push the decoded substring back to stack
            int repeat = k.length() > 0 ? Integer.parseInt(k.toString()) : 1;
            String decoded = substr.toString().repeat(repeat);
            
            for (char dc : decoded.toCharArray()) {
                chars.push(dc);
            }
        }
    }
    
    StringBuilder result = new StringBuilder();
    while (!chars.isEmpty()) {
        result.insert(0, chars.pop());
    }
    
    return result.toString();
}`,
      c: `char* decodeString(char* s) {
    int len = strlen(s);
    char* stack = (char*)malloc(len * 100); // Allow for decoded string expansion
    int stackIndex = 0;
    
    for (int i = 0; i < len; i++) {
        if (s[i] != ']') {
            stack[stackIndex++] = s[i];
        } else {
            // Extract substring
            char substr[10000] = "";
            int substrIndex = 0;
            
            while (stackIndex > 0 && stack[stackIndex-1] != '[') {
                substr[substrIndex++] = stack[--stackIndex];
            }
            substr[substrIndex] = '\\0';
            
            // Reverse the substring
            for (int j = 0; j < substrIndex / 2; j++) {
                char temp = substr[j];
                substr[j] = substr[substrIndex - j - 1];
                substr[substrIndex - j - 1] = temp;
            }
            
            // Remove '['
            if (stackIndex > 0) stackIndex--;
            
            // Extract number
            char kStr[10] = "";
            int kIndex = 0;
            
            while (stackIndex > 0 && stack[stackIndex-1] >= '0' && stack[stackIndex-1] <= '9') {
                kStr[kIndex++] = stack[--stackIndex];
            }
            kStr[kIndex] = '\\0';
            
            // Reverse the number
            for (int j = 0; j < kIndex / 2; j++) {
                char temp = kStr[j];
                kStr[j] = kStr[kIndex - j - 1];
                kStr[kIndex - j - 1] = temp;
            }
            
            int k = kIndex > 0 ? atoi(kStr) : 1;
            
            // Push the decoded substring back to stack
            for (int j = 0; j < k; j++) {
                for (int l = 0; l < substrIndex; l++) {
                    stack[stackIndex++] = substr[l];
                }
            }
        }
    }
    
    stack[stackIndex] = '\\0';
    return stack;
}`
    },
    explanation: 'The buggy code fails to handle empty stacks when checking for "[" and doesn\'t handle the case when there\'s no number before the brackets (should be treated as 1). The fixed solution adds checks for these edge cases and properly handles all valid inputs according to the problem definition.',
    time_complexity: 'O(n)',
    space_complexity: 'O(n)'
  },
  
  // Hard questions
  {
    id: 301,
    title: 'LRU Cache Implementation',
    description: 'Design and implement a data structure for Least Recently Used (LRU) cache. It should support the following operations: get and put.',
    difficulty: 'Hard',
    sampleInput: 'LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);',
    sampleOutput: '1',
    constraints: '1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5',
    testCases: [
      {
        input: 'cache.put(1,1);cache.put(2,2);cache.get(1);cache.put(3,3);cache.get(2);',
        output: '1,-1'
      },
      {
        input: 'cache.put(1,1);cache.put(2,2);cache.put(3,3);cache.get(1);',
        output: '-1'
      }
    ],
    function_signatures: {
      python: 'class LRUCache:\n    def __init__(self, capacity: int):\n    def get(self, key: int) -> int:\n    def put(self, key: int, value: int) -> None:',
      cpp: 'class LRUCache {\npublic:\n    LRUCache(int capacity);\n    int get(int key);\n    void put(int key, int value);\n};',
      java: 'class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) {}\n    public void put(int key, int value) {}\n}',
      c: 'typedef struct {\n} LRUCache;\nLRUCache* lRUCacheCreate(int capacity);\nint lRUCacheGet(LRUCache* obj, int key);\nvoid lRUCachePut(LRUCache* obj, int key, int value);'
    },
    solution: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.lru = {}
        self.time = 0
        
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.time += 1
        self.lru[key] = self.time
        return self.cache[key]
        
    def put(self, key: int, value: int) -> None:
        self.time += 1
        if key in self.cache:
            self.cache[key] = value
            self.lru[key] = self.time
            return
            
        if len(self.cache) >= self.capacity:
            # Find least recently used
            lru_key = min(self.lru.items(), key=lambda x: x[1])[0]
            del self.cache[lru_key]
            del self.lru[lru_key]
            
        self.cache[key] = value
        self.lru[key] = self.time`,
    solutions: {
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.lru = {}
        self.time = 0
        
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.time += 1
        self.lru[key] = self.time
        return self.cache[key]
        
    def put(self, key: int, value: int) -> None:
        self.time += 1
        if key in self.cache:
            self.cache[key] = value
            self.lru[key] = self.time
            return
            
        if len(self.cache) >= self.capacity:
            # Find least recently used
            lru_key = min(self.lru.items(), key=lambda x: x[1])[0]
            del self.cache[lru_key]
            del self.lru[lru_key]
            
        self.cache[key] = value
        self.lru[key] = self.time`,
      cpp: `class LRUCache {
private:
    int capacity;
    list<pair<int, int>> cache;  // key, value pairs
    unordered_map<int, list<pair<int, int>>::iterator> map;
    
public:
    LRUCache(int capacity) : capacity(capacity) {}
    
    int get(int key) {
        auto it = map.find(key);
        if (it == map.end())
            return -1;
        cache.splice(cache.begin(), cache, it->second);
        return it->second->second;
    }
    
    void put(int key, int value) {
        auto it = map.find(key);
        if (it != map.end()) {
            it->second->second = value;
            cache.splice(cache.begin(), cache, it->second);
            return;
        }
        
        if (cache.size() >= capacity) {
            auto last = cache.back();
            map.erase(last.first);
            cache.pop_back();
        }
        
        cache.push_front({key, value});
        map[key] = cache.begin();
    }
};`,
      java: `class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) {
            key = k;
            value = v;
        }
    }
    
    private Map<Integer, Node> cache;
    private Node head, tail;
    private int capacity;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        cache = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        Node node = cache.get(key);
        if (node == null)
            return -1;
        moveToHead(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        Node node = cache.get(key);
        if (node != null) {
            node.value = value;
            moveToHead(node);
            return;
        }
        
        Node newNode = new Node(key, value);
        cache.put(key, newNode);
        addNode(newNode);
        
        if (cache.size() > capacity) {
            Node tail = popTail();
            cache.remove(tail.key);
        }
    }
    
    private void addNode(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    
    private void removeNode(Node node) {
        Node prev = node.prev;
        Node next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    
    private void moveToHead(Node node) {
        removeNode(node);
        addNode(node);
    }
    
    private Node popTail() {
        Node res = tail.prev;
        removeNode(res);
        return res;
    }
}`,
      c: `typedef struct Node {
    int key;
    int value;
    struct Node* prev;
    struct Node* next;
} Node;

typedef struct {
    int capacity;
    Node* head;
    Node* tail;
    Node* cache[10001];
} LRUCache;

Node* createNode(int key, int value) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->key = key;
    node->value = value;
    node->prev = NULL;
    node->next = NULL;
    return node;
}

LRUCache* lRUCacheCreate(int capacity) {
    LRUCache* obj = (LRUCache*)malloc(sizeof(LRUCache));
    obj->capacity = capacity;
    obj->head = createNode(0, 0);
    obj->tail = createNode(0, 0);
    obj->head->next = obj->tail;
    obj->tail->prev = obj->head;
    memset(obj->cache, 0, sizeof(obj->cache));
    return obj;
}

void addNode(LRUCache* obj, Node* node) {
    node->prev = obj->head;
    node->next = obj->head->next;
    obj->head->next->prev = node;
    obj->head->next = node;
}

void removeNode(Node* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
}

void moveToHead(LRUCache* obj, Node* node) {
    removeNode(node);
    addNode(obj, node);
}

Node* popTail(LRUCache* obj) {
    Node* node = obj->tail->prev;
    removeNode(node);
    return node;
}

int lRUCacheGet(LRUCache* obj, int key) {
    Node* node = obj->cache[key];
    if (!node) return -1;
    moveToHead(obj, node);
    return node->value;
}

void lRUCachePut(LRUCache* obj, int key, int value) {
    Node* node = obj->cache[key];
    if (node) {
        node->value = value;
        moveToHead(obj, node);
        return;
    }
    
    Node* newNode = createNode(key, value);
    obj->cache[key] = newNode;
    addNode(obj, newNode);
    
    if (--obj->capacity < 0) {
        Node* tail = popTail(obj);
        obj->cache[tail->key] = NULL;
        free(tail);
        obj->capacity++;
    }
}`
    },
    explanation: 'The LRU Cache is implemented using a combination of a hash map for O(1) lookups and a doubly linked list for O(1) removals and insertions. The hash map stores key-node pairs for quick access, while the linked list maintains the order of elements based on their usage. When an element is accessed or updated, it\'s moved to the front of the list. When the cache is full, the least recently used element (at the end of the list) is removed.',
    time_complexity: 'O(1) for both get and put operations',
    space_complexity: 'O(capacity)'
  },
  {
    id: 302,
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, find the median of the two sorted arrays.',
    difficulty: 'Hard',
    sampleInput: 'nums1 = [1,3], nums2 = [2]',
    sampleOutput: '2.0',
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000',
    testCases: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5' }
    ],
    hints: [
      'Think about dividing the problem into finding the k-th smallest element',
      'Consider using binary search to optimize the solution',
      'Handle odd and even length scenarios differently'
    ],
    function_signatures: {
      python: 'def findMedianSortedArrays(nums1: List[int], nums2: List[int]) -> float:',
      cpp: 'double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2)',
      java: 'public double findMedianSortedArrays(int[] nums1, int[] nums2)',
      c: 'double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size)'
    },
    solution: `def findMedianSortedArrays(nums1: List[int], nums2: List[int]) -> float:
    # Ensure nums1 is the shorter array for simplicity
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    x, y = len(nums1), len(nums2)
    low, high = 0, x
    
    while low <= high:
        partitionX = (low + high) // 2
        partitionY = (x + y + 1) // 2 - partitionX
        
        # If partitionX is 0, use -infinity for maxX
        # If partitionX is length of input array, use +infinity for minX
        maxX = float('-inf') if partitionX == 0 else nums1[partitionX - 1]
        minX = float('inf') if partitionX == x else nums1[partitionX]
        
        maxY = float('-inf') if partitionY == 0 else nums2[partitionY - 1]
        minY = float('inf') if partitionY == y else nums2[partitionY]
        
        if maxX <= minY and maxY <= minX:
            # We found the correct partition
            # Odd total length
            if (x + y) % 2 != 0:
                return max(maxX, maxY)
            # Even total length
            return (max(maxX, maxY) + min(minX, minY)) / 2
        elif maxX > minY:
            high = partitionX - 1
        else:
            low = partitionX + 1
    
    # If we reach here, the input arrays were not sorted
    raise ValueError("Input arrays are not sorted")`,
    solutions: {
      python: `def findMedianSortedArrays(nums1: List[int], nums2: List[int]) -> float:
    # Ensure nums1 is the shorter array for simplicity
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    x, y = len(nums1), len(nums2)
    low, high = 0, x
    
    while low <= high:
        partitionX = (low + high) // 2
        partitionY = (x + y + 1) // 2 - partitionX
        
        # If partitionX is 0, use -infinity for maxX
        # If partitionX is length of input array, use +infinity for minX
        maxX = float('-inf') if partitionX == 0 else nums1[partitionX - 1]
        minX = float('inf') if partitionX == x else nums1[partitionX]
        
        maxY = float('-inf') if partitionY == 0 else nums2[partitionY - 1]
        minY = float('inf') if partitionY == y else nums2[partitionY]
        
        if maxX <= minY and maxY <= minX:
            # We found the correct partition
            # Odd total length
            if (x + y) % 2 != 0:
                return max(maxX, maxY)
            # Even total length
            return (max(maxX, maxY) + min(minX, minY)) / 2
        elif maxX > minY:
            high = partitionX - 1
        else:
            low = partitionX + 1
    
    # If we reach here, the input arrays were not sorted
    raise ValueError("Input arrays are not sorted")`,
      cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Ensure nums1 is the shorter array for simplicity
    if (nums1.size() > nums2.size()) {
        return findMedianSortedArrays(nums2, nums1);
    }
    
    int x = nums1.size();
    int y = nums2.size();
    int low = 0;
    int high = x;
    
    while (low <= high) {
        int partitionX = (low + high) / 2;
        int partitionY = (x + y + 1) / 2 - partitionX;
        
        // If partitionX is 0, use -infinity for maxX
        // If partitionX is length of input array, use +infinity for minX
        int maxX = (partitionX == 0) ? INT_MIN : nums1[partitionX - 1];
        int minX = (partitionX == x) ? INT_MAX : nums1[partitionX];
        
        int maxY = (partitionY == 0) ? INT_MIN : nums2[partitionY - 1];
        int minY = (partitionY == y) ? INT_MAX : nums2[partitionY];
        
        if (maxX <= minY && maxY <= minX) {
            // We found the correct partition
            // Odd total length
            if ((x + y) % 2 != 0) {
                return max(maxX, maxY);
            }
            // Even total length
            return (max(maxX, maxY) + min(minX, minY)) / 2.0;
        } else if (maxX > minY) {
            high = partitionX - 1;
        } else {
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    throw invalid_argument("Input arrays are not sorted");
}`,
      java: `public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    // Ensure nums1 is the shorter array for simplicity
    if (nums1.length > nums2.length) {
        return findMedianSortedArrays(nums2, nums1);
    }
    
    int x = nums1.length;
    int y = nums2.length;
    int low = 0;
    int high = x;
    
    while (low <= high) {
        int partitionX = (low + high) / 2;
        int partitionY = (x + y + 1) / 2 - partitionX;
        
        // If partitionX is 0, use -infinity for maxX
        // If partitionX is length of input array, use +infinity for minX
        int maxX = (partitionX == 0) ? Integer.MIN_VALUE : nums1[partitionX - 1];
        int minX = (partitionX == x) ? Integer.MAX_VALUE : nums1[partitionX];
        
        int maxY = (partitionY == 0) ? Integer.MIN_VALUE : nums2[partitionY - 1];
        int minY = (partitionY == y) ? Integer.MAX_VALUE : nums2[partitionY];
        
        if (maxX <= minY && maxY <= minX) {
            // We found the correct partition
            // Odd total length
            if ((x + y) % 2 != 0) {
                return Math.max(maxX, maxY);
            }
            // Even total length
            return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2.0;
        } else if (maxX > minY) {
            high = partitionX - 1;
        } else {
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    throw new IllegalArgumentException("Input arrays are not sorted");
}`,
      c: `double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    // Ensure nums1 is the shorter array for simplicity
    if (nums1Size > nums2Size) {
        return findMedianSortedArrays(nums2, nums2Size, nums1, nums1Size);
    }
    
    int x = nums1Size;
    int y = nums2Size;
    int low = 0;
    int high = x;
    
    while (low <= high) {
        int partitionX = (low + high) / 2;
        int partitionY = (x + y + 1) / 2 - partitionX;
        
        // If partitionX is 0, use -infinity for maxX
        // If partitionX is length of input array, use +infinity for minX
        int maxX = (partitionX == 0) ? INT_MIN : nums1[partitionX - 1];
        int minX = (partitionX == x) ? INT_MAX : nums1[partitionX];
        
        int maxY = (partitionY == 0) ? INT_MIN : nums2[partitionY - 1];
        int minY = (partitionY == y) ? INT_MAX : nums2[partitionY];
        
        if (maxX <= minY && maxY <= minX) {
            // We found the correct partition
            // Odd total length
            if ((x + y) % 2 != 0) {
                return fmax(maxX, maxY);
            }
            // Even total length
            return (fmax(maxX, maxY) + fmin(minX, minY)) / 2.0;
        } else if (maxX > minY) {
            high = partitionX - 1;
        } else {
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays were not sorted
    return -1;  // Error case
}`
    },
    explanation: 'The solution uses binary search to find the correct partition of the two arrays that divides all elements into two equal halves. Once we find this partition, the median is either the maximum of the left halves (for odd total length) or the average of the maximum of left halves and minimum of right halves (for even total length). This gives us O(log(min(m,n))) time complexity.',
    time_complexity: 'O(log(min(m,n)))',
    space_complexity: 'O(1)'
  }
];

let lastEasyIds: Set<number> = new Set();
let lastMediumIds: Set<number> = new Set();
let lastHardIds: Set<number> = new Set();

export const getRandomQuestion = (difficulty: 'Easy' | 'Medium' | 'Hard'): CodingQuestion => {
  const questions = codingQuestions.filter(q => q.difficulty === difficulty);
  let idSet: Set<number>;
  
  // Select the appropriate ID set based on difficulty
  if (difficulty === 'Easy') {
    idSet = lastEasyIds;
  } else if (difficulty === 'Medium') {
    idSet = lastMediumIds;
  } else {
    idSet = lastHardIds;
  }
  
  // Reset if all questions have been used
  if (idSet.size >= questions.length) {
    idSet.clear();
  }
  
  // Filter out recently used questions
  const availableQuestions = questions.filter(q => !idSet.has(q.id));
  
  // If no available questions (shouldn't happen due to reset above, but just in case)
  if (availableQuestions.length === 0) {
    idSet.clear();
    const randomIndex = Math.floor(Math.random() * questions.length);
    idSet.add(questions[randomIndex].id);
    return questions[randomIndex];
  }
  
  // Get random question from available ones
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const question = availableQuestions[randomIndex];
  
  // Add to recently used set
  idSet.add(question.id);
  
  return question;
}; 