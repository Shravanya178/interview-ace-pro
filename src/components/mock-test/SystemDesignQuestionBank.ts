import { Question } from './QuestionBank';

// Large bank of System Design questions
export const systemDesignQuestionBank: Question[] = [
  {
    id: 1,
    question: "How would you design a URL shortening service like bit.ly?",
    options: [
      "Use MD5 hash of the original URL and truncate it to get a short URL",
      "Maintain a counter and convert the counter value to base62 for each new URL",
      "Use a random string generator and check for collisions in a database",
      "Store the URL path in a binary tree and use the tree path as the short URL"
    ],
    correctAnswer: "Maintain a counter and convert the counter value to base62 for each new URL",
    explanation: "Using a counter with base62 conversion ensures unique, short URLs that can be generated without expensive collision checks."
  },
  {
    id: 2,
    question: "What is the best approach for designing a distributed cache system?",
    options: [
      "Use a single server with large memory to avoid network latency",
      "Implement consistent hashing to distribute keys across multiple nodes",
      "Store all data in a relational database with replication",
      "Create multiple independent caches without coordination"
    ],
    correctAnswer: "Implement consistent hashing to distribute keys across multiple nodes",
    explanation: "Consistent hashing allows for efficient distribution and redistribution of keys when nodes are added or removed."
  },
  {
    id: 3,
    question: "How would you design a news feed system like Facebook or Twitter?",
    options: [
      "Use a single database to store all posts and query it directly when users log in",
      "Push model: fanout writes to all followers' feeds when a post is created",
      "Pull model: retrieve and merge posts from followed accounts when a user views their feed",
      "Hybrid approach: push to active users, pull for inactive users"
    ],
    correctAnswer: "Hybrid approach: push to active users, pull for inactive users",
    explanation: "A hybrid approach optimizes for both write and read efficiency based on user activity patterns."
  },
  {
    id: 4,
    question: "What database would you choose for implementing a real-time leaderboard with millions of users?",
    options: [
      "MySQL with regular indexing",
      "MongoDB with sharding",
      "Redis with sorted sets",
      "Cassandra with wide row storage"
    ],
    correctAnswer: "Redis with sorted sets",
    explanation: "Redis sorted sets are ideal for leaderboards, providing O(log(N)) time complexity for score updates and range queries."
  },
  {
    id: 5,
    question: "How would you design a file storage service like Dropbox or Google Drive?",
    options: [
      "Store complete file copies for each user to maximize read performance",
      "Use delta sync and block-level deduplication to minimize storage and bandwidth",
      "Keep all files in memory for fast access",
      "Store only metadata in the database and keep files in a single storage server"
    ],
    correctAnswer: "Use delta sync and block-level deduplication to minimize storage and bandwidth",
    explanation: "Delta sync and deduplication minimize storage costs and bandwidth usage by only transferring and storing changes or unique blocks."
  },
  {
    id: 6,
    question: "What's the best approach for handling payments in a large-scale e-commerce system?",
    options: [
      "Process payments synchronously within the checkout transaction",
      "Use a queue-based asynchronous payment processing system",
      "Store payment details and process them in nightly batches",
      "Handle all payment logic in the frontend for security"
    ],
    correctAnswer: "Use a queue-based asynchronous payment processing system",
    explanation: "Queue-based payment processing provides reliability, retries, and decouples the payment process from the checkout flow."
  },
  {
    id: 7,
    question: "How would you design a rate limiter for an API?",
    options: [
      "Count requests in application memory for each user",
      "Use a token bucket or leaky bucket algorithm with Redis",
      "Implement a fixed window counter in a database",
      "Limit APIs based on server CPU usage"
    ],
    correctAnswer: "Use a token bucket or leaky bucket algorithm with Redis",
    explanation: "Token bucket or leaky bucket algorithms provide smooth rate limiting with burstiness control, and Redis ensures distributed consistency."
  },
  {
    id: 8,
    question: "What's the most efficient way to design a system that needs to count unique visitors to a website?",
    options: [
      "Store all visitor IPs in a database and count distinct values",
      "Use a relational database with an index on visitor ID",
      "Implement a HyperLogLog data structure",
      "Keep a simple counter and reset it daily"
    ],
    correctAnswer: "Implement a HyperLogLog data structure",
    explanation: "HyperLogLog provides memory-efficient approximate cardinality counting with error bounds around 2-3%."
  },
  {
    id: 9,
    question: "How would you design a system to handle millions of websocket connections?",
    options: [
      "Use a traditional web server with threading",
      "Implement a non-blocking event loop architecture with connection pooling",
      "Create one server process per connection",
      "Store connection state in a database"
    ],
    correctAnswer: "Implement a non-blocking event loop architecture with connection pooling",
    explanation: "Non-blocking event loops (like in Node.js or Nginx) are efficient for handling many concurrent connections with minimal resources."
  },
  {
    id: 10,
    question: "What's the best approach for designing a distributed task scheduler?",
    options: [
      "Use a centralized scheduler with a relational database",
      "Implement leader election with distributed consensus",
      "Schedule tasks independently on each node",
      "Use a message queue with worker nodes and poison message handling"
    ],
    correctAnswer: "Use a message queue with worker nodes and poison message handling",
    explanation: "Message queues provide reliability, retries, and distributed processing capabilities ideal for task scheduling."
  },
  {
    id: 11,
    question: "How would you design a notification system that supports multiple channels (push, email, SMS)?",
    options: [
      "Send notifications directly from the application code",
      "Use a single queue for all notification types",
      "Implement a publisher-subscriber pattern with separate queues for each channel",
      "Store notifications in a database and poll regularly"
    ],
    correctAnswer: "Implement a publisher-subscriber pattern with separate queues for each channel",
    explanation: "Pub-sub with separate queues allows for channel-specific processing, retry policies, and scaling."
  },
  {
    id: 12,
    question: "What approach would you take for designing a system to detect fraud in real-time?",
    options: [
      "Batch processing of transactions every hour",
      "Real-time stream processing with a rules engine",
      "Manual review of all transactions",
      "Simple threshold-based checks in the application"
    ],
    correctAnswer: "Real-time stream processing with a rules engine",
    explanation: "Stream processing allows for immediate detection while a rules engine provides flexibility in fraud detection logic."
  },
  {
    id: 13,
    question: "How would you design a scalable image processing service?",
    options: [
      "Process images synchronously during upload",
      "Use serverless functions with a queue for asynchronous processing",
      "Store original images and process on-demand",
      "Pre-generate all possible image variants"
    ],
    correctAnswer: "Use serverless functions with a queue for asynchronous processing",
    explanation: "Serverless functions with queues allow for efficient scaling based on load and ensure reliable processing."
  },
  {
    id: 14,
    question: "What's the most effective approach for implementing full-text search in a large application?",
    options: [
      "Use SQL LIKE queries with indexes",
      "Implement a custom search algorithm with in-memory data structures",
      "Use a specialized search engine like Elasticsearch or Solr",
      "Store pre-computed search results for common queries"
    ],
    correctAnswer: "Use a specialized search engine like Elasticsearch or Solr",
    explanation: "Specialized search engines provide efficient indexing, relevance scoring, and advanced features like faceting and highlighting."
  },
  {
    id: 15,
    question: "How would you design a content delivery network (CDN)?",
    options: [
      "Use a single central server with high bandwidth",
      "Implement geographical load balancing with distributed edge servers",
      "Cache content only at the application level",
      "Serve different content based on user location"
    ],
    correctAnswer: "Implement geographical load balancing with distributed edge servers",
    explanation: "Edge servers reduce latency by serving content from locations geographically closer to users."
  },
  {
    id: 16,
    question: "What's the best approach for designing a distributed configuration system?",
    options: [
      "Store configurations in local files and deploy with code",
      "Use a central database with polling",
      "Implement a service with a distributed consensus algorithm like Raft",
      "Hardcode configuration values in the application"
    ],
    correctAnswer: "Implement a service with a distributed consensus algorithm like Raft",
    explanation: "Consensus algorithms ensure configuration consistency across distributed systems, even during network partitions."
  },
  {
    id: 17,
    question: "How would you design a service that needs to maintain strict order of messages?",
    options: [
      "Use a regular message queue with multiple consumers",
      "Implement a single consumer with sequential processing",
      "Partition messages by a key and guarantee order within partitions",
      "Process messages in batches sorted by timestamp"
    ],
    correctAnswer: "Partition messages by a key and guarantee order within partitions",
    explanation: "Partitioning by key allows for parallelism while maintaining order where it matters (e.g., per user or entity)."
  },
  {
    id: 18,
    question: "What approach would you take for designing a scalable recommendation system?",
    options: [
      "Calculate recommendations on-demand for each user request",
      "Use a simple rules-based system",
      "Pre-compute recommendations offline and serve from a fast data store",
      "Show the same popular items to all users"
    ],
    correctAnswer: "Pre-compute recommendations offline and serve from a fast data store",
    explanation: "Pre-computation allows for complex algorithms to run efficiently, with results served quickly from a cache or fast database."
  },
  {
    id: 19,
    question: "How would you design a distributed lock service?",
    options: [
      "Use a database with transaction isolation",
      "Implement a lease-based system with a consensus algorithm",
      "Use file system locks on a shared drive",
      "Create a central locking server"
    ],
    correctAnswer: "Implement a lease-based system with a consensus algorithm",
    explanation: "Lease-based locks with consensus prevent split-brain issues and handle node failures gracefully in distributed systems."
  },
  {
    id: 20,
    question: "What's the best approach for handling eventual consistency in a distributed database?",
    options: [
      "Always use strong consistency instead",
      "Implement version vectors or vector clocks to track causality",
      "Ignore consistency issues as they're rare",
      "Use timestamps to resolve all conflicts"
    ],
    correctAnswer: "Implement version vectors or vector clocks to track causality",
    explanation: "Version vectors track update causality, enabling conflict detection and resolution in eventually consistent systems."
  },
  {
    id: 21,
    question: "How would you design a system for processing large amounts of log data?",
    options: [
      "Store all logs in a relational database",
      "Use a stream processing pipeline with aggregation",
      "Write logs to local files and analyze manually",
      "Send logs directly to a visualization tool"
    ],
    correctAnswer: "Use a stream processing pipeline with aggregation",
    explanation: "Stream processing allows for real-time analysis and efficient storage through aggregation and filtering."
  },
  {
    id: 22,
    question: "What's the most appropriate approach for designing a microservice architecture?",
    options: [
      "Create services based on technical layers (UI, business logic, data)",
      "Design services around business capabilities and bounded contexts",
      "Make every function a separate microservice",
      "Use a single database for all microservices"
    ],
    correctAnswer: "Design services around business capabilities and bounded contexts",
    explanation: "Business capabilities provide natural boundaries for services, leading to higher cohesion and lower coupling."
  },
  {
    id: 23,
    question: "How would you design an efficient data pipeline for a machine learning system?",
    options: [
      "Process all data in real-time",
      "Use a lambda architecture with batch and speed layers",
      "Train models directly on production databases",
      "Use only batch processing for all data"
    ],
    correctAnswer: "Use a lambda architecture with batch and speed layers",
    explanation: "Lambda architecture provides accurate batch results combined with real-time updates for timely predictions."
  },
  {
    id: 24,
    question: "What approach would you take for designing a system with 99.999% availability?",
    options: [
      "Use a single high-quality server",
      "Implement redundancy, fault tolerance, and automated recovery",
      "Schedule maintenance during off-hours only",
      "Use the most expensive cloud provider"
    ],
    correctAnswer: "Implement redundancy, fault tolerance, and automated recovery",
    explanation: "High availability requires eliminating single points of failure, automatic failover, and quick recovery mechanisms."
  },
  {
    id: 25,
    question: "How would you design a system to handle traffic spikes (e.g., Black Friday sales)?",
    options: [
      "Provision for peak load at all times",
      "Implement rate limiting to prevent spikes",
      "Use auto-scaling, graceful degradation, and caching strategies",
      "Add servers manually when traffic increases"
    ],
    correctAnswer: "Use auto-scaling, graceful degradation, and caching strategies",
    explanation: "Auto-scaling adjusts resources dynamically, while degradation and caching help maintain core functionality during extreme loads."
  },
  {
    id: 26,
    question: "What's the best approach for handling distributed transactions across microservices?",
    options: [
      "Use two-phase commit for all transactions",
      "Implement ACID transactions across all services",
      "Use the Saga pattern with compensating transactions",
      "Combine all related operations into a single service"
    ],
    correctAnswer: "Use the Saga pattern with compensating transactions",
    explanation: "Sagas maintain data consistency through a sequence of local transactions with compensating actions for failures."
  },
  {
    id: 27,
    question: "How would you design an API gateway for a microservices architecture?",
    options: [
      "Allow clients to call all microservices directly",
      "Create a gateway with routing, aggregation, and cross-cutting concerns",
      "Build a single monolithic API layer",
      "Use a simple load balancer without additional logic"
    ],
    correctAnswer: "Create a gateway with routing, aggregation, and cross-cutting concerns",
    explanation: "API gateways simplify client interfaces and handle cross-cutting concerns like authentication and rate limiting."
  },
  {
    id: 28,
    question: "What approach would you take for data partitioning in a large database?",
    options: [
      "Use vertical partitioning only",
      "Implement horizontal sharding based on a consistent hashing algorithm",
      "Keep all data in a single partition for consistency",
      "Randomly distribute data across partitions"
    ],
    correctAnswer: "Implement horizontal sharding based on a consistent hashing algorithm",
    explanation: "Horizontal sharding with consistent hashing distributes data evenly and minimizes redistribution when nodes change."
  },
  {
    id: 29,
    question: "How would you design a system to ensure data privacy and compliance with regulations like GDPR?",
    options: [
      "Store all user data indefinitely for business purposes",
      "Implement data minimization, encryption, and right-to-be-forgotten capabilities",
      "Let each service handle privacy independently",
      "Collect consent once and apply it to all data usage"
    ],
    correctAnswer: "Implement data minimization, encryption, and right-to-be-forgotten capabilities",
    explanation: "Privacy by design includes collecting only necessary data, protecting it through encryption, and supporting user rights."
  },
  {
    id: 30,
    question: "What's the most effective caching strategy for a web application?",
    options: [
      "Cache everything for maximum performance",
      "Don't use caching to ensure data freshness",
      "Use a multi-level caching strategy with appropriate invalidation",
      "Cache only at the database level"
    ],
    correctAnswer: "Use a multi-level caching strategy with appropriate invalidation",
    explanation: "Multi-level caching (CDN, application, database) with proper invalidation balances performance and data freshness."
  }
];

// Get random system design questions
export const getRandomSystemDesignQuestions = (count: number): Question[] => {
  const shuffled = [...systemDesignQuestionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 