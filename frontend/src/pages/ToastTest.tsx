import { useState } from 'react';
import { useToast } from '../components/ui/Toast';

/**
 * Toast Test Page
 * Comprehensive manual testing page for toast notifications with progress bar feature
 */
export function ToastTest() {
  const toast = useToast();
  const [customDuration, setCustomDuration] = useState(4000);
  const [customMessage, setCustomMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Toast Notification Testing</h1>
          <p className="text-gray-600 mb-8">Test all toast types, custom durations, and pause-on-hover functionality</p>

          {/* Test Cases Section */}
          <div className="space-y-8">
            {/* Basic Toast Types */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Basic Toast Types (Default Duration: 4s)</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => toast.success('Operation completed successfully!')}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Success Toast
                </button>
                <button
                  onClick={() => toast.error('An error occurred while processing your request.')}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Error Toast
                </button>
                <button
                  onClick={() => toast.warning('Please review the following warnings before continuing.')}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                  Warning Toast
                </button>
                <button
                  onClick={() => toast.info('New updates are available for your application.')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Info Toast
                </button>
              </div>
            </section>

            {/* Custom Durations */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Custom Duration Testing</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => toast.success('Quick toast (2s)', 2000)}
                  className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  2 Seconds
                </button>
                <button
                  onClick={() => toast.info('Normal toast (4s)', 4000)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  4 Seconds
                </button>
                <button
                  onClick={() => toast.warning('Long toast (8s)', 8000)}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  8 Seconds
                </button>
                <button
                  onClick={() => toast.error('Very short (500ms)', 500)}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  500ms
                </button>
              </div>
            </section>

            {/* Infinite Toast */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Edge Case: Infinite Toast (duration=0)</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Expected behavior:</strong> Toast should stay visible indefinitely with no progress bar.
                  Manual dismissal required (click X button).
                </p>
              </div>
              <button
                onClick={() => toast.info('This toast will not auto-dismiss. Click X to close.', 0)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Show Infinite Toast
              </button>
            </section>

            {/* Pause on Hover */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Pause-on-Hover Feature</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>Test Instructions:</strong>
                </p>
                <ol className="text-sm text-purple-800 list-decimal list-inside space-y-1">
                  <li>Click the button to show a toast</li>
                  <li>Hover over the toast - progress bar should pause</li>
                  <li>Move mouse away - progress bar should resume</li>
                  <li>Toast should take total time = initial duration + hover time</li>
                </ol>
              </div>
              <button
                onClick={() => toast.success('Hover over me to pause the countdown! Move away to resume.', 6000)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Test Pause-on-Hover (6s)
              </button>
            </section>

            {/* Multiple Toasts */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Multiple Toasts (Stacking Test)</h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Expected behavior:</strong> Multiple toasts should stack vertically, each with its own
                  independent progress bar that animates correctly.
                </p>
              </div>
              <button
                onClick={() => {
                  toast.success('First toast - Success');
                  setTimeout(() => toast.error('Second toast - Error'), 300);
                  setTimeout(() => toast.warning('Third toast - Warning'), 600);
                  setTimeout(() => toast.info('Fourth toast - Info'), 900);
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Show 4 Toasts Rapidly
              </button>
            </section>

            {/* Custom Message Tester */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Custom Toast Tester</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message:
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter your custom message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (ms): {customDuration}ms
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => toast.success(customMessage || 'Custom success message', customDuration)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Success
                  </button>
                  <button
                    onClick={() => toast.error(customMessage || 'Custom error message', customDuration)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Error
                  </button>
                  <button
                    onClick={() => toast.warning(customMessage || 'Custom warning message', customDuration)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                  >
                    Warning
                  </button>
                  <button
                    onClick={() => toast.info(customMessage || 'Custom info message', customDuration)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Info
                  </button>
                </div>
              </div>
            </section>

            {/* Visual Checklist */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Visual Quality Checklist</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-4 font-medium">Verify the following:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Progress bar is visible at the bottom of each toast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Progress bar color matches the toast type (green/red/yellow/blue)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Progress bar animates smoothly from 100% to 0% (60fps)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Toast dismisses automatically when progress reaches 0%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Progress bar pauses when hovering over toast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Progress bar resumes when mouse leaves toast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>No progress bar shown for infinite toasts (duration=0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Custom durations work correctly with progress bar timing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Multiple toasts stack properly with independent progress bars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>No visual glitches or jerky animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Manual dismiss (X button) works at any time</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Accessibility Testing */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Accessibility Testing</h2>
              <div className="bg-indigo-50 rounded-lg p-6">
                <p className="text-sm text-indigo-800 mb-4 font-medium">Reduced Motion Testing:</p>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Enable "Reduce Motion" in your OS accessibility settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Trigger any toast notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Verify: Progress bar should be hidden (no visual animation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>Verify: Toast should still auto-dismiss after the specified duration</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
