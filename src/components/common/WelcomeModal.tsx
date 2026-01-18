import { Database, FileCode, Play, Github } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Welcome modal shown on first visit
 * Displays app information, sample data summary, and quick start guide
 */
export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to QueryPlayground!" size="lg" showCloseButton={false}>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            A browser-based SQL & NoSQL query practice platform with AI learning.
            Zero setup, pure client-side, BYOK (Bring Your Own API key).
          </p>
        </div>

        {/* Sample Data Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Sample Data Loaded
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">PostgreSQL Tables</p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>• users (10 rows)</li>
                <li>• products (15 rows)</li>
                <li>• orders (20 rows)</li>
                <li>• order_items (30 rows)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">MongoDB Collections</p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>• users (10 docs)</li>
                <li>• posts (15 docs)</li>
                <li>• comments (25 docs)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Play className="w-4 h-4" />
            Quick Start Guide
          </h3>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>Select your database mode (PostgreSQL or MongoDB) from the header</li>
            <li>Explore the schema in the left sidebar</li>
            <li>Write your query in the editor</li>
            <li>Press Ctrl+Enter or click Run to execute</li>
          </ol>
        </div>

        {/* Example Queries */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Example Queries to Try
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">PostgreSQL:</p>
              <code className="text-xs text-gray-600 dark:text-gray-400">
                SELECT u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name;
              </code>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">MongoDB:</p>
              <code className="text-xs text-gray-600 dark:text-gray-400">
                {'db.posts.aggregate([{ $lookup: { from: "comments", localField: "_id", foreignField: "postId", as: "comments" } }, { $project: { title: 1, commentCount: { $size: "$comments" } } }]);'}
              </code>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={onClose}
            className="flex-1"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open('https://github.com/arafat1023/queryplayground', '_blank')}
            className="flex-1"
            size="lg"
            leftIcon={<Github className="w-4 h-4" />}
          >
            View on GitHub
          </Button>
        </div>
      </div>
    </Modal>
  );
}
