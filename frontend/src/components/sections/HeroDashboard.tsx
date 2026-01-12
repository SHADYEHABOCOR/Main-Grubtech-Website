import React, { memo } from 'react';
import { Activity, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedElement } from '../ui/AnimatedElement';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Memoize component to prevent unnecessary re-renders
export const HeroDashboard: React.FC = memo(() => {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    // Line chart data points
    const linePoints = [15, 35, 25, 55, 40, 70, 55, 80, 65, 90];
    const chartWidth = 280;
    const chartHeight = 80;
    const pointSpacing = chartWidth / (linePoints.length - 1);

    const pathData = linePoints
        .map((point, i) => {
            const x = i * pointSpacing;
            const y = chartHeight - (point / 100) * chartHeight;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    return (
        <div className="w-full relative pointer-events-none">
            {/* Clean White Dashboard */}
            <div className="relative rounded-2xl md:rounded-3xl p-5 md:p-8 bg-white border border-gray-200 shadow-lg">
                {/* Header */}
                <AnimatedElement
                    animation="fade-up"
                    speed="fast"
                    delay={500}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-primary rounded-full" />
                        <h3 className="text-lg font-semibold text-gray-900 tracking-wide">{t('homepage.hero.dashboard.connect', 'CONNECT')}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        <span className="text-xs font-medium text-emerald-600">{t('homepage.hero.live', 'Live')}</span>
                    </div>
                </AnimatedElement>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: t('homepage.hero.posSystems'), value: '8/8', icon: CheckCircle2 },
                        { label: t('homepage.hero.deliveryApps'), value: '12/12', icon: CheckCircle2 },
                        { label: t('homepage.hero.activeSync'), value: t('homepage.hero.live'), icon: Activity, live: true },
                    ].map((item, i) => (
                        <AnimatedElement
                            key={i}
                            animation="fade-up"
                            speed="fast"
                            delay={600 + i * 100}
                            className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <item.icon className={`w-3.5 h-3.5 ${item.live ? 'text-emerald-500' : 'text-gray-400'}`} />
                                <span className={`text-sm font-bold font-mono ${item.live ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {item.value}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">{item.label}</span>
                        </AnimatedElement>
                    ))}
                </div>

                {/* Line Chart */}
                <AnimatedElement
                    animation="fade-up"
                    speed="fast"
                    delay={900}
                    className="mb-6"
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">{t('homepage.hero.dashboard.performance', 'Performance')}</span>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600">+24%</span>
                        </div>
                    </div>
                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full h-20 overflow-visible"
                        preserveAspectRatio="none"
                    >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((percent) => (
                            <line
                                key={percent}
                                x1="0"
                                y1={chartHeight - (percent / 100) * chartHeight}
                                x2={chartWidth}
                                y2={chartHeight - (percent / 100) * chartHeight}
                                stroke="#f3f4f6"
                                strokeWidth="1"
                            />
                        ))}
                        {/* Gradient fill under line */}
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                            fill="url(#lineGradient)"
                            className={prefersReducedMotion ? '' : 'opacity-0 animate-[fade-in_0.5s_ease-out_1.2s_forwards]'}
                        />
                        {/* Main line */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={prefersReducedMotion ? '' : '[stroke-dasharray:1000] [stroke-dashoffset:1000] animate-[draw-line_1.2s_ease-out_1.0s_forwards]'}
                        />
                    </svg>
                </AnimatedElement>

                {/* Progress bar */}
                <AnimatedElement
                    animation="fade-up"
                    speed="fast"
                    delay={1000}
                    className="mb-5"
                >
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">{t('homepage.hero.dashboard.syncProgress', 'Sync Progress')}</span>
                        <span className="font-semibold text-gray-900">100%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-primary rounded-full ${prefersReducedMotion ? 'w-full' : 'w-0 animate-[progress-fill_0.8s_ease-out_1.1s_forwards]'}`}
                        />
                    </div>
                </AnimatedElement>

                {/* Bottom Stats */}
                <AnimatedElement
                    animation="fade-up"
                    speed="fast"
                    delay={1200}
                    className="flex items-center justify-between pt-4 border-t border-gray-100"
                >
                    {[
                        { label: t('homepage.hero.dashboard.orders', 'Orders'), value: '+23%' },
                        { label: t('homepage.hero.dashboard.revenue', 'Revenue'), value: '+18%' },
                        { label: t('homepage.hero.dashboard.efficiency', 'Efficiency'), value: '+31%' },
                    ].map((stat, i) => (
                        <AnimatedElement
                            key={i}
                            animation="scale-in"
                            speed="fast"
                            delay={1300 + i * 100}
                            className="text-center"
                        >
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Zap className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 font-bold text-sm">{stat.value}</span>
                            </div>
                            <span className="text-gray-400 text-xs">{stat.label}</span>
                        </AnimatedElement>
                    ))}
                </AnimatedElement>
            </div>
        </div>
    );
});
