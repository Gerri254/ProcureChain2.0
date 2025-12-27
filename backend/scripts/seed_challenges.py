"""Seed sample coding challenges into the database"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.challenge_service import challenge_service
from models.challenge import ChallengeModel


# Sample challenges for different skills and difficulty levels
SAMPLE_CHALLENGES = [
    # ========== REACT CHALLENGES ==========
    {
        'title': 'Build a Counter Component',
        'description': 'Create a simple React counter component with increment and decrement functionality',
        'skill': 'react',
        'difficulty_level': 'beginner',
        'challenge_type': 'coding',
        'prompt': '''Create a React component called Counter that displays a number and has two buttons:
- One button to increment the counter
- One button to decrement the counter

The counter should start at 0.

Requirements:
1. Use React hooks (useState)
2. Display the current count
3. Add increment (+1) and decrement (-1) buttons
4. The counter can go negative''',
        'starter_code': '''import React, { useState } from 'react';

function Counter() {
  // Your code here

  return (
    <div>
      {/* Display counter and buttons here */}
    </div>
  );
}

export default Counter;''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'Initial render',
                'Count should be 0',
                'Counter starts at 0'
            ),
            ChallengeModel.create_test_case(
                'Click increment button',
                'Count should increase by 1',
                'Increment works correctly'
            ),
            ChallengeModel.create_test_case(
                'Click decrement button',
                'Count should decrease by 1',
                'Decrement works correctly'
            )
        ],
        'expected_concepts': ['useState', 'event handlers', 'JSX', 'component'],
        'time_limit_minutes': 20,
        'estimated_time_minutes': 15,
        'is_active': True,
        'is_public': True
    },
    {
        'title': 'Todo List with State Management',
        'description': 'Build a todo list application with add and remove functionality',
        'skill': 'react',
        'difficulty_level': 'intermediate',
        'challenge_type': 'coding',
        'prompt': '''Create a TodoList component that allows users to:
1. Add new todo items via an input field and button
2. Display all todo items in a list
3. Mark todos as complete (with a checkbox)
4. Delete individual todos

Requirements:
- Use useState to manage the todo list
- Each todo should have: id, text, and completed status
- Implement proper event handling
- Clear the input field after adding a todo''',
        'starter_code': '''import React, { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  // Implement your functions here

  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}

export default TodoList;''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'Add todo',
                'New todo appears in the list',
                'Can add todos'
            ),
            ChallengeModel.create_test_case(
                'Toggle complete',
                'Todo marked as completed',
                'Can complete todos'
            ),
            ChallengeModel.create_test_case(
                'Delete todo',
                'Todo removed from list',
                'Can delete todos'
            )
        ],
        'expected_concepts': ['useState', 'array manipulation', 'map', 'event handling', 'controlled inputs'],
        'time_limit_minutes': 45,
        'estimated_time_minutes': 35,
        'is_active': True,
        'is_public': True
    },

    # ========== PYTHON CHALLENGES ==========
    {
        'title': 'List Comprehension Basics',
        'description': 'Use Python list comprehensions to transform data',
        'skill': 'python',
        'difficulty_level': 'beginner',
        'challenge_type': 'coding',
        'prompt': '''Write three functions using list comprehensions:

1. `squares(n)`: Return a list of squares from 1 to n
2. `evens(numbers)`: Return only the even numbers from a list
3. `uppercase_words(text)`: Return a list of uppercase words from a string

Example:
squares(5) → [1, 4, 9, 16, 25]
evens([1, 2, 3, 4, 5]) → [2, 4]
uppercase_words("hello world") → ["HELLO", "WORLD"]''',
        'starter_code': '''def squares(n):
    """Return list of squares from 1 to n"""
    # Your code here
    pass

def evens(numbers):
    """Return only even numbers"""
    # Your code here
    pass

def uppercase_words(text):
    """Return list of uppercase words"""
    # Your code here
    pass''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'squares(5)',
                '[1, 4, 9, 16, 25]',
                'Squares function works'
            ),
            ChallengeModel.create_test_case(
                'evens([1, 2, 3, 4, 5, 6])',
                '[2, 4, 6]',
                'Evens function works'
            ),
            ChallengeModel.create_test_case(
                'uppercase_words("hello world")',
                '["HELLO", "WORLD"]',
                'Uppercase function works'
            )
        ],
        'expected_concepts': ['list comprehension', 'lambda', 'string methods'],
        'time_limit_minutes': 25,
        'estimated_time_minutes': 20,
        'is_active': True,
        'is_public': True
    },
    {
        'title': 'Dictionary Data Processing',
        'description': 'Process and analyze data stored in Python dictionaries',
        'skill': 'python',
        'difficulty_level': 'intermediate',
        'challenge_type': 'coding',
        'prompt': '''Given a list of student dictionaries, implement these functions:

1. `average_grade(students)`: Calculate average grade across all students
2. `top_student(students)`: Return the student with highest grade
3. `passing_students(students, threshold)`: Return students with grade >= threshold
4. `grade_distribution(students)`: Return dict with count of A, B, C, D, F grades

Each student dict has: {'name': str, 'grade': int}

Grade scale: A(90+), B(80-89), C(70-79), D(60-69), F(<60)''',
        'starter_code': '''def average_grade(students):
    """Calculate average grade"""
    pass

def top_student(students):
    """Return student with highest grade"""
    pass

def passing_students(students, threshold=60):
    """Return students with grade >= threshold"""
    pass

def grade_distribution(students):
    """Return count of each letter grade"""
    pass''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'students = [{"name": "Alice", "grade": 95}, {"name": "Bob", "grade": 82}]',
                'average_grade(students) → 88.5',
                'Average calculation works'
            ),
            ChallengeModel.create_test_case(
                'top_student(students)',
                '{"name": "Alice", "grade": 95}',
                'Top student identified'
            )
        ],
        'expected_concepts': ['dictionaries', 'list operations', 'max/min', 'conditionals'],
        'time_limit_minutes': 40,
        'estimated_time_minutes': 30,
        'is_active': True,
        'is_public': True
    },

    # ========== JAVASCRIPT CHALLENGES ==========
    {
        'title': 'Array Manipulation Basics',
        'description': 'Practice JavaScript array methods and operations',
        'skill': 'javascript',
        'difficulty_level': 'beginner',
        'challenge_type': 'coding',
        'prompt': '''Implement these array manipulation functions:

1. `doubleNumbers(arr)`: Return new array with each number doubled
2. `filterEven(arr)`: Return only even numbers
3. `sumArray(arr)`: Return sum of all numbers
4. `findMax(arr)`: Return the largest number

Use appropriate array methods (map, filter, reduce, etc.)''',
        'starter_code': '''function doubleNumbers(arr) {
  // Your code here
}

function filterEven(arr) {
  // Your code here
}

function sumArray(arr) {
  // Your code here
}

function findMax(arr) {
  // Your code here
}''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'doubleNumbers([1, 2, 3])',
                '[2, 4, 6]',
                'Map function works'
            ),
            ChallengeModel.create_test_case(
                'filterEven([1, 2, 3, 4, 5])',
                '[2, 4]',
                'Filter function works'
            ),
            ChallengeModel.create_test_case(
                'sumArray([1, 2, 3, 4])',
                '10',
                'Reduce function works'
            )
        ],
        'expected_concepts': ['map', 'filter', 'reduce', 'arrow functions'],
        'time_limit_minutes': 25,
        'estimated_time_minutes': 20,
        'is_active': True,
        'is_public': True
    },
    {
        'title': 'Async/Await Data Fetching',
        'description': 'Handle asynchronous operations with async/await',
        'skill': 'javascript',
        'difficulty_level': 'intermediate',
        'challenge_type': 'coding',
        'prompt': '''Create an async function that fetches user data:

1. `fetchUserData(userId)`: Fetch user data from API (simulated)
2. `fetchMultipleUsers(userIds)`: Fetch multiple users in parallel
3. Handle errors gracefully with try/catch
4. Return data in a consistent format

Simulate API delay with:
await new Promise(resolve => setTimeout(resolve, 100))''',
        'starter_code': '''// Simulated API
const fakeAPI = {
  users: {
    1: { id: 1, name: 'Alice', email: 'alice@example.com' },
    2: { id: 2, name: 'Bob', email: 'bob@example.com' },
    3: { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  }
};

async function fetchUserData(userId) {
  // Simulate API delay and fetch user
  // Your code here
}

async function fetchMultipleUsers(userIds) {
  // Fetch multiple users in parallel
  // Your code here
}''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'await fetchUserData(1)',
                '{ id: 1, name: "Alice", email: "alice@example.com" }',
                'Single user fetch works'
            ),
            ChallengeModel.create_test_case(
                'await fetchMultipleUsers([1, 2])',
                'Array of 2 users',
                'Parallel fetch works'
            )
        ],
        'expected_concepts': ['async/await', 'promises', 'Promise.all', 'error handling'],
        'time_limit_minutes': 35,
        'estimated_time_minutes': 25,
        'is_active': True,
        'is_public': True
    },

    # ========== TYPESCRIPT CHALLENGES ==========
    {
        'title': 'Type-Safe User Interface',
        'description': 'Define TypeScript interfaces and types for user data',
        'skill': 'typescript',
        'difficulty_level': 'beginner',
        'challenge_type': 'coding',
        'prompt': '''Create TypeScript types and interfaces:

1. Define a `User` interface with: id (number), name (string), email (string), role (admin/user)
2. Define a `Post` interface with: id, title, content, authorId, createdAt (Date)
3. Create a function `getUserPosts(user: User, posts: Post[]): Post[]` that returns posts by the user
4. All types should be strictly typed''',
        'starter_code': '''// Define your interfaces here

interface User {
  // Your code here
}

interface Post {
  // Your code here
}

function getUserPosts(user: User, posts: Post[]): Post[] {
  // Your code here
  return [];
}''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'User interface has required fields',
                'Compiles without errors',
                'User type is correct'
            ),
            ChallengeModel.create_test_case(
                'getUserPosts filters correctly',
                'Returns only user posts',
                'Function works'
            )
        ],
        'expected_concepts': ['interfaces', 'types', 'type annotations', 'generics'],
        'time_limit_minutes': 30,
        'estimated_time_minutes': 20,
        'is_active': True,
        'is_public': True
    },

    # ========== SQL CHALLENGES ==========
    {
        'title': 'Basic SQL Queries',
        'description': 'Write SQL queries to retrieve and filter data',
        'skill': 'sql',
        'difficulty_level': 'beginner',
        'challenge_type': 'coding',
        'prompt': '''Given a `users` table with columns: id, name, email, age, city
Write SQL queries for:

1. Select all users from "New York"
2. Find users older than 25
3. Count total number of users
4. List unique cities''',
        'starter_code': '''-- Query 1: Users from New York
SELECT * FROM users WHERE city = 'New York';

-- Query 2: Users older than 25
-- Your code here

-- Query 3: Count total users
-- Your code here

-- Query 4: List unique cities
-- Your code here''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'Query 2',
                'Returns users with age > 25',
                'WHERE clause works'
            ),
            ChallengeModel.create_test_case(
                'Query 3',
                'Returns COUNT(*)',
                'COUNT function works'
            ),
            ChallengeModel.create_test_case(
                'Query 4',
                'Uses DISTINCT',
                'DISTINCT works'
            )
        ],
        'expected_concepts': ['SELECT', 'WHERE', 'COUNT', 'DISTINCT'],
        'time_limit_minutes': 25,
        'estimated_time_minutes': 15,
        'is_active': True,
        'is_public': True
    },

    # ========== NODE.JS CHALLENGES ==========
    {
        'title': 'Express REST API Endpoint',
        'description': 'Create a RESTful API endpoint with Express.js',
        'skill': 'nodejs',
        'difficulty_level': 'intermediate',
        'challenge_type': 'coding',
        'prompt': '''Create an Express.js API endpoint for managing books:

1. POST /books - Create a new book (title, author, year)
2. GET /books - Get all books
3. GET /books/:id - Get book by ID
4. Use proper HTTP status codes
5. Validate input data

Store books in an array (no database needed)''',
        'starter_code': '''const express = require('express');
const app = express();

app.use(express.json());

let books = [];
let nextId = 1;

// POST /books
app.post('/books', (req, res) => {
  // Your code here
});

// GET /books
app.get('/books', (req, res) => {
  // Your code here
});

// GET /books/:id
app.get('/books/:id', (req, res) => {
  // Your code here
});

module.exports = app;''',
        'test_cases': [
            ChallengeModel.create_test_case(
                'POST /books with valid data',
                'Returns 201 and created book',
                'Create endpoint works'
            ),
            ChallengeModel.create_test_case(
                'GET /books',
                'Returns array of books',
                'List endpoint works'
            ),
            ChallengeModel.create_test_case(
                'GET /books/999 (non-existent)',
                'Returns 404',
                'Error handling works'
            )
        ],
        'expected_concepts': ['Express', 'REST API', 'HTTP methods', 'middleware', 'routing'],
        'time_limit_minutes': 40,
        'estimated_time_minutes': 30,
        'is_active': True,
        'is_public': True
    },
]


def seed_challenges():
    """Seed sample challenges into the database"""
    print("🌱 Seeding challenges into database...\n")

    created_count = 0
    failed_count = 0

    for challenge_data in SAMPLE_CHALLENGES:
        try:
            challenge_id = challenge_service.create_challenge(challenge_data)

            if challenge_id:
                print(f"✓ Created: {challenge_data['title']} ({challenge_data['skill']} - {challenge_data['difficulty_level']})")
                created_count += 1
            else:
                print(f"✗ Failed: {challenge_data['title']}")
                failed_count += 1

        except Exception as e:
            print(f"✗ Error creating {challenge_data['title']}: {e}")
            failed_count += 1

    print(f"\n{'='*60}")
    print(f"✓ Successfully created: {created_count} challenges")
    print(f"✗ Failed: {failed_count} challenges")
    print(f"{'='*60}\n")

    # Print summary statistics
    stats = challenge_service.get_challenge_stats()
    print("📊 Challenge Statistics:")
    print(f"Total challenges: {stats.get('total_challenges', 0)}")
    print(f"\nBy skill:")
    for skill, count in stats.get('by_skill', {}).items():
        print(f"  - {skill}: {count}")
    print(f"\nBy difficulty:")
    for diff, count in stats.get('by_difficulty', {}).items():
        print(f"  - {diff}: {count}")


if __name__ == '__main__':
    seed_challenges()
