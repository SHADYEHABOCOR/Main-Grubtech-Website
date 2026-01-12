/**
 * Usage examples for AnimatedElement component
 * This file demonstrates various ways to use the AnimatedElement component
 * as a replacement for framer-motion in simple animation scenarios.
 */

import React from 'react';
import { AnimatedElement } from './AnimatedElement';

export function AnimatedElementExamples() {
  return (
    <div className="space-y-12 p-8">
      {/* Example 1: Basic fade-up animation */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Basic Fade-Up Animation</h2>
        <AnimatedElement animation="fade-up">
          <div className="p-6 bg-white rounded-lg shadow">
            This element fades in from bottom with default settings
          </div>
        </AnimatedElement>
      </section>

      {/* Example 2: With scroll trigger */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Scroll-Triggered Animation</h2>
        <AnimatedElement animation="fade-left" scrollTrigger once>
          <div className="p-6 bg-blue-50 rounded-lg">
            This animates when scrolled into view (once)
          </div>
        </AnimatedElement>
      </section>

      {/* Example 3: Staggered animations with delays */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Staggered Animations</h2>
        <div className="space-y-4">
          <AnimatedElement animation="fade-right" delay={0} scrollTrigger>
            <div className="p-4 bg-green-50 rounded">Item 1 - No delay</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-right" delay={200} scrollTrigger>
            <div className="p-4 bg-green-50 rounded">Item 2 - 200ms delay</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-right" delay={400} scrollTrigger>
            <div className="p-4 bg-green-50 rounded">Item 3 - 400ms delay</div>
          </AnimatedElement>
        </div>
      </section>

      {/* Example 4: Different animation variants */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Animation Variants</h2>
        <div className="grid grid-cols-2 gap-4">
          <AnimatedElement animation="fade-up" scrollTrigger>
            <div className="p-4 bg-purple-50 rounded text-center">Fade Up</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-down" scrollTrigger>
            <div className="p-4 bg-purple-50 rounded text-center">Fade Down</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-left" scrollTrigger>
            <div className="p-4 bg-purple-50 rounded text-center">Fade Left</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-right" scrollTrigger>
            <div className="p-4 bg-purple-50 rounded text-center">Fade Right</div>
          </AnimatedElement>
          <AnimatedElement animation="scale-in" scrollTrigger>
            <div className="p-4 bg-purple-50 rounded text-center col-span-2">
              Scale In
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Example 5: Speed variants */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Speed Variants</h2>
        <div className="space-y-4">
          <AnimatedElement animation="fade-up" speed="fast" scrollTrigger>
            <div className="p-4 bg-yellow-50 rounded">Fast (0.3s)</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-up" speed="default" scrollTrigger>
            <div className="p-4 bg-yellow-50 rounded">Default (0.5s)</div>
          </AnimatedElement>
          <AnimatedElement animation="fade-up" speed="slow" scrollTrigger>
            <div className="p-4 bg-yellow-50 rounded">Slow (0.6s)</div>
          </AnimatedElement>
        </div>
      </section>

      {/* Example 6: Custom timing functions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Timing Functions</h2>
        <div className="space-y-4">
          <AnimatedElement animation="scale-in" timing="ease-out" scrollTrigger>
            <div className="p-4 bg-red-50 rounded">Ease Out</div>
          </AnimatedElement>
          <AnimatedElement animation="scale-in" timing="ease-in-out" scrollTrigger>
            <div className="p-4 bg-red-50 rounded">Ease In-Out</div>
          </AnimatedElement>
          <AnimatedElement animation="scale-in" timing="ease-spring" scrollTrigger>
            <div className="p-4 bg-red-50 rounded">Spring (Bouncy)</div>
          </AnimatedElement>
        </div>
      </section>

      {/* Example 7: As different HTML elements */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Different HTML Elements</h2>
        <AnimatedElement as="section" animation="fade-up" scrollTrigger>
          <p className="p-4 bg-gray-50 rounded">
            This is rendered as a {'<section>'} element
          </p>
        </AnimatedElement>
        <AnimatedElement as="article" animation="fade-up" delay={200} scrollTrigger>
          <p className="p-4 bg-gray-50 rounded">
            This is rendered as an {'<article>'} element
          </p>
        </AnimatedElement>
      </section>

      {/* Example 8: Migration from framer-motion */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Framer Motion Migration</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Before (framer-motion):</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {`<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.5 }}
>
  Content
</motion.div>`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">After (AnimatedElement):</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {`<AnimatedElement animation="fade-up" delay={200}>
  <div>Content</div>
</AnimatedElement>`}
            </pre>
          </div>
          <AnimatedElement animation="fade-up" delay={200}>
            <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              Live example: This uses the new AnimatedElement instead of motion.div
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}

export default AnimatedElementExamples;
