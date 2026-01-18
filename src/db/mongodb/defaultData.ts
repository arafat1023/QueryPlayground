import type { MongoDocument } from './types';
import { insertMany, getCollection, getCollectionNames } from './queryExecutor';

/**
 * Seed data for users collection (10 docs)
 */
const USERS_DATA: MongoDocument[] = [
  {
    _id: 'u001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    city: 'New York',
  },
  {
    _id: 'u002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 35,
    city: 'Los Angeles',
  },
  {
    _id: 'u003',
    name: 'Carol Williams',
    email: 'carol@example.com',
    age: 42,
    city: 'Chicago',
  },
  {
    _id: 'u004',
    name: 'David Brown',
    email: 'david@example.com',
    age: 31,
    city: 'Houston',
  },
  {
    _id: 'u005',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    age: 26,
    city: 'Phoenix',
  },
  {
    _id: 'u006',
    name: 'Frank Lee',
    email: 'frank@example.com',
    age: 39,
    city: 'Philadelphia',
  },
  {
    _id: 'u007',
    name: 'Grace Kim',
    email: 'grace@example.com',
    age: 33,
    city: 'San Antonio',
  },
  {
    _id: 'u008',
    name: 'Henry Davis',
    email: 'henry@example.com',
    age: 45,
    city: 'San Diego',
  },
  {
    _id: 'u009',
    name: 'Ivy Chen',
    email: 'ivy@example.com',
    age: 29,
    city: 'Dallas',
  },
  {
    _id: 'u010',
    name: 'Jack Wilson',
    email: 'jack@example.com',
    age: 37,
    city: 'San Jose',
  },
];

/**
 * Seed data for posts collection (15 docs)
 */
const POSTS_DATA: MongoDocument[] = [
  {
    _id: 'p001',
    title: 'Getting Started with MongoDB',
    content: 'MongoDB is a document database that provides high performance, high availability, and easy scalability.',
    authorId: 'u001',
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['mongodb', 'database', 'tutorial'],
    likes: 42,
  },
  {
    _id: 'p002',
    title: 'Introduction to React Hooks',
    content: 'React Hooks are functions that let you use state and other React features in functional components.',
    authorId: 'u002',
    createdAt: '2024-01-16T14:20:00Z',
    tags: ['react', 'javascript', 'frontend'],
    likes: 38,
  },
  {
    _id: 'p003',
    title: 'Understanding TypeScript Generics',
    content: 'Generics allow you to create reusable components that work with a variety of types while maintaining type safety.',
    authorId: 'u001',
    createdAt: '2024-01-17T09:15:00Z',
    tags: ['typescript', 'programming'],
    likes: 55,
  },
  {
    _id: 'p004',
    title: 'CSS Grid vs Flexbox',
    content: 'Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes and excel in different scenarios.',
    authorId: 'u003',
    createdAt: '2024-01-18T16:45:00Z',
    tags: ['css', 'layout', 'frontend'],
    likes: 29,
  },
  {
    _id: 'p005',
    title: 'Node.js Best Practices',
    content: 'Follow these best practices to build scalable and maintainable Node.js applications.',
    authorId: 'u004',
    createdAt: '2024-01-19T11:00:00Z',
    tags: ['nodejs', 'backend', 'javascript'],
    likes: 67,
  },
  {
    _id: 'p006',
    title: 'RESTful API Design Principles',
    content: 'Learn the key principles for designing clean and intuitive RESTful APIs.',
    authorId: 'u002',
    createdAt: '2024-01-20T13:30:00Z',
    tags: ['api', 'rest', 'backend'],
    likes: 44,
  },
  {
    _id: 'p007',
    title: 'Modern JavaScript Features',
    content: 'Explore the latest features in JavaScript ES2024 that you can start using today.',
    authorId: 'u005',
    createdAt: '2024-01-21T10:00:00Z',
    tags: ['javascript', 'es6', 'programming'],
    likes: 51,
  },
  {
    _id: 'p008',
    title: 'Docker for Developers',
    content: 'A comprehensive guide to using Docker for containerizing your applications.',
    authorId: 'u006',
    createdAt: '2024-01-22T15:20:00Z',
    tags: ['docker', 'devops', 'containers'],
    likes: 39,
  },
  {
    _id: 'p009',
    title: 'Git Workflow Strategies',
    content: 'Compare different Git workflow strategies like Git Flow, GitHub Flow, and Trunk-Based Development.',
    authorId: 'u003',
    createdAt: '2024-01-23T08:45:00Z',
    tags: ['git', 'version-control', 'workflow'],
    likes: 33,
  },
  {
    _id: 'p010',
    title: 'Testing React Applications',
    content: 'Learn how to effectively test your React applications using Jest and React Testing Library.',
    authorId: 'u007',
    createdAt: '2024-01-24T12:10:00Z',
    tags: ['react', 'testing', 'jest'],
    likes: 48,
  },
  {
    _id: 'p011',
    title: 'Web Performance Optimization',
    content: 'Discover techniques to optimize your web applications for better performance and user experience.',
    authorId: 'u004',
    createdAt: '2024-01-25T14:30:00Z',
    tags: ['performance', 'optimization', 'web'],
    likes: 56,
  },
  {
    _id: 'p012',
    title: 'Introduction to GraphQL',
    content: 'GraphQL is a query language for APIs that gives clients the power to ask for exactly what they need.',
    authorId: 'u008',
    createdAt: '2024-01-26T09:00:00Z',
    tags: ['graphql', 'api', 'backend'],
    likes: 41,
  },
  {
    _id: 'p013',
    title: 'State Management in React',
    content: 'Explore different state management solutions for React applications, from Context API to Redux.',
    authorId: 'u001',
    createdAt: '2024-01-27T11:45:00Z',
    tags: ['react', 'state-management', 'javascript'],
    likes: 62,
  },
  {
    _id: 'p014',
    title: 'Secure Authentication Practices',
    content: 'Learn about secure authentication practices including JWT, OAuth, and session management.',
    authorId: 'u009',
    createdAt: '2024-01-28T16:00:00Z',
    tags: ['security', 'authentication', 'backend'],
    likes: 58,
  },
  {
    _id: 'p015',
    title: 'Progressive Web Apps',
    content: 'Discover how to build Progressive Web Apps that work offline and provide a native app-like experience.',
    authorId: 'u005',
    createdAt: '2024-01-29T10:15:00Z',
    tags: ['pwa', 'web-development', 'javascript'],
    likes: 47,
  },
];

/**
 * Seed data for comments collection (25 docs)
 */
const COMMENTS_DATA: MongoDocument[] = [
  {
    _id: 'c001',
    text: 'Great post! Very helpful for beginners.',
    postId: 'p001',
    authorId: 'u002',
    createdAt: '2024-01-15T14:30:00Z',
  },
  {
    _id: 'c002',
    text: 'I have been using MongoDB for years and this is the best introduction I have seen.',
    postId: 'p001',
    authorId: 'u003',
    createdAt: '2024-01-15T16:45:00Z',
  },
  {
    _id: 'c003',
    text: 'Would love to see more advanced topics covered!',
    postId: 'p001',
    authorId: 'u004',
    createdAt: '2024-01-15T18:20:00Z',
  },
  {
    _id: 'c004',
    text: 'Finally I understand hooks! Thank you.',
    postId: 'p002',
    authorId: 'u001',
    createdAt: '2024-01-16T16:00:00Z',
  },
  {
    _id: 'c005',
    text: 'The examples are really clear and easy to follow.',
    postId: 'p002',
    authorId: 'u005',
    createdAt: '2024-01-16T18:30:00Z',
  },
  {
    _id: 'c006',
    text: 'Generics can be tricky but this explanation makes sense.',
    postId: 'p003',
    authorId: 'u006',
    createdAt: '2024-01-17T11:00:00Z',
  },
  {
    _id: 'c007',
    text: 'I always struggled with generics until now.',
    postId: 'p003',
    authorId: 'u007',
    createdAt: '2024-01-17T13:45:00Z',
  },
  {
    _id: 'c008',
    text: 'Grid vs Flexbox is always confusing. This helps clarify.',
    postId: 'p004',
    authorId: 'u002',
    createdAt: '2024-01-18T18:00:00Z',
  },
  {
    _id: 'c009',
    text: 'The comparison table was really useful.',
    postId: 'p004',
    authorId: 'u008',
    createdAt: '2024-01-18T20:15:00Z',
  },
  {
    _id: 'c010',
    text: 'These best practices have saved me so many headaches!',
    postId: 'p005',
    authorId: 'u003',
    createdAt: '2024-01-19T13:00:00Z',
  },
  {
    _id: 'c011',
    text: 'Bookmarking this for future reference.',
    postId: 'p005',
    authorId: 'u009',
    createdAt: '2024-01-19T15:30:00Z',
  },
  {
    _id: 'c012',
    text: 'RESTful design is so important for API usability.',
    postId: 'p006',
    authorId: 'u004',
    createdAt: '2024-01-20T15:00:00Z',
  },
  {
    _id: 'c013',
    text: 'The examples are practical and applicable.',
    postId: 'p006',
    authorId: 'u010',
    createdAt: '2024-01-20T17:45:00Z',
  },
  {
    _id: 'c014',
    text: 'ES2024 has some great features!',
    postId: 'p007',
    authorId: 'u001',
    createdAt: '2024-01-21T12:00:00Z',
  },
  {
    _id: 'c015',
    text: 'I did not know about some of these features.',
    postId: 'p007',
    authorId: 'u006',
    createdAt: '2024-01-21T14:30:00Z',
  },
  {
    _id: 'c016',
    text: 'Docker has revolutionized how I deploy applications.',
    postId: 'p008',
    authorId: 'u005',
    createdAt: '2024-01-22T17:00:00Z',
  },
  {
    _id: 'c017',
    text: 'The step-by-step guide is perfect for beginners.',
    postId: 'p008',
    authorId: 'u007',
    createdAt: '2024-01-22T19:30:00Z',
  },
  {
    _id: 'c018',
    text: 'Git Flow works well for our team.',
    postId: 'p009',
    authorId: 'u008',
    createdAt: '2024-01-23T10:30:00Z',
  },
  {
    _id: 'c019',
    text: 'We switched to Trunk-Based and it is great.',
    postId: 'p009',
    authorId: 'u002',
    createdAt: '2024-01-23T12:45:00Z',
  },
  {
    _id: 'c020',
    text: 'Testing is so important but often overlooked.',
    postId: 'p010',
    authorId: 'u003',
    createdAt: '2024-01-24T14:00:00Z',
  },
  {
    _id: 'c021',
    text: 'RTL makes testing React components so much easier.',
    postId: 'p010',
    authorId: 'u009',
    createdAt: '2024-01-24T16:30:00Z',
  },
  {
    _id: 'c022',
    text: 'Performance optimization is critical for user experience.',
    postId: 'p011',
    authorId: 'u004',
    createdAt: '2024-01-25T16:00:00Z',
  },
  {
    _id: 'c023',
    text: 'The tips on lazy loading were really helpful.',
    postId: 'p011',
    authorId: 'u010',
    createdAt: '2024-01-25T18:15:00Z',
  },
  {
    _id: 'c024',
    text: 'GraphQL is a game changer for frontend development.',
    postId: 'p012',
    authorId: 'u001',
    createdAt: '2024-01-26T11:00:00Z',
  },
  {
    _id: 'c025',
    text: 'The comparison with REST was really insightful.',
    postId: 'p012',
    authorId: 'u005',
    createdAt: '2024-01-26T13:30:00Z',
  },
];

/**
 * Check if default data already exists
 */
function hasDefaultData(): boolean {
  const collectionNames = getCollectionNames();
  return collectionNames.includes('users') && getCollection('users').length > 0;
}

/**
 * Load default MongoDB data
 * @returns true if data was loaded, false if it already existed
 */
export function loadDefaultMongoData(): boolean {
  try {
    // Check if data already exists
    if (hasDefaultData()) {
      console.log('MongoDB: Default data already exists, skipping load');
      return false;
    }

    // Insert all default collections
    insertMany('users', USERS_DATA);
    insertMany('posts', POSTS_DATA);
    insertMany('comments', COMMENTS_DATA);

    console.log('MongoDB: Default data loaded successfully', {
      collections: getCollectionNames(),
      userCount: getCollection('users').length,
      postCount: getCollection('posts').length,
      commentCount: getCollection('comments').length,
    });

    return true;
  } catch (error) {
    console.error('Failed to load default MongoDB data:', error);
    throw error;
  }
}

/**
 * Reset MongoDB data to defaults
 * Clears all collections and reloads default data
 */
export function resetMongoData(): void {
  try {
    // Clear all collections
    const collectionNames = getCollectionNames();
    for (const name of collectionNames) {
      // Drop each collection
      const collection = getCollection(name);
      collection.length = 0;
    }

    // Reload default data
    loadDefaultMongoData();
  } catch (error) {
    console.error('Failed to reset MongoDB data:', error);
    throw error;
  }
}
