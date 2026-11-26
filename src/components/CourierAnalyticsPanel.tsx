import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { RefreshCw, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import {
  CourierPerformanceAnalytics,
  CourierZoneMetric,
  Order
} from '../types/resale';

interface CourierAnalyticsPanelProps {
  orders: Order[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  lines: { label: string; value: string; color?: string }[];
}

const STEADFAST_COLOR = '#1A4231';
const PATHAO_COLOR = '#B83B4B';

export const CourierAnalyticsPanel: React.FC<CourierAnalyticsPanelProps> = ({ orders }) => {
  const [analytics, setAnalytics] = useState<CourierPerformanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>('ALL');
  const [speedChartMode, setSpeedChartMode] = useState<'BY_ZONE' | 'TREND'>('BY_ZONE');
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    lines: []
  });

  const successContainerRef = useRef<HTMLDivElement>(null);
  const successSvgRef = useRef<SVGSVGElement>(null);
  const speedContainerRef = useRef<HTMLDivElement>(null);
  const speedSvgRef = useRef<SVGSVGElement>(null);
  const [containerWidths, setContainerWidths] = useState<{ success: number; speed: number }>({
    success: 520,
    speed: 520
  });

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/courier/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.error('Failed to fetch courier analytics', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, orders.length]);

  // Responsive ResizeObserver for both D3 SVG viewports
  useEffect(() => {
    const updateWidths = () => {
      setContainerWidths({
        success: successContainerRef.current?.clientWidth || 520,
        speed: speedContainerRef.current?.clientWidth || 520
      });
    };

    updateWidths();
    const observer = new ResizeObserver(updateWidths);
    if (successContainerRef.current) observer.observe(successContainerRef.current);
    if (speedContainerRef.current) observer.observe(speedContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredZones: CourierZoneMetric[] = (analytics?.byZone || []).filter((z) => {
    if (zoneFilter === 'ALL') return true;
    return z.zoneKey === zoneFilter || z.zoneKey === 'ALL';
  });

  // =========================================================================
  // D3 CHART 1: GROUPED BAR CHART — FULFILLMENT SUCCESS RATE (%)
  // =========================================================================
  useEffect(() => {
    if (!analytics || !successSvgRef.current || filteredZones.length === 0) return;

    const width = Math.max(320, containerWidths.success);
    const height = 310;
    const margin = { top: 28, right: 20, bottom: 52, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(successSvgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const groups = filteredZones.map((d) => d.segment);
    const subGroups = ['STEADFAST', 'PATHAO'] as const;

    const x0 = d3.scaleBand<string>().domain(groups).range([0, innerWidth]).paddingInner(0.28).paddingOuter(0.12);
    const x1 = d3.scaleBand<string>().domain(subGroups).range([0, x0.bandwidth()]).padding(0.14);
    const y = d3.scaleLinear().domain([75, 100]).range([innerHeight, 0]).nice();

    // Horizontal Gridlines
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call((grid) => grid.select('.domain').remove())
      .call((grid) =>
        grid.selectAll('line').attr('stroke', '#EDE7DC').attr('stroke-dasharray', '3,3')
      );

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call((ax) => ax.select('.domain').attr('stroke', '#DED7CB'))
      .call((ax) =>
        ax
          .selectAll('text')
          .attr('fill', '#5C5449')
          .style('font-size', '11px')
          .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
      );

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) =>
        ax
          .selectAll('text')
          .attr('fill', '#7A7165')
          .style('font-size', '11px')
          .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
      );

    // Draw Grouped Bars
    const segmentGroups = g
      .selectAll('.segment-group')
      .data(filteredZones)
      .enter()
      .append('g')
      .attr('class', 'segment-group')
      .attr('transform', (d) => `translate(${x0(d.segment) || 0},0)`);

    const barEntries = (d: CourierZoneMetric) => [
      {
        key: 'STEADFAST' as const,
        label: 'Steadfast',
        value: d.steadfastSuccessRate,
        volume: d.steadfastVolume,
        avgHours: d.steadfastAvgHours,
        segment: d.segment,
        color: STEADFAST_COLOR
      },
      {
        key: 'PATHAO' as const,
        label: 'Pathao',
        value: d.pathaoSuccessRate,
        volume: d.pathaoVolume,
        avgHours: d.pathaoAvgHours,
        segment: d.segment,
        color: PATHAO_COLOR
      }
    ];

    const bars = segmentGroups
      .selectAll('rect')
      .data(barEntries)
      .enter()
      .append('rect')
      .attr('x', (d) => x1(d.key) || 0)
      .attr('y', (d) => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => Math.max(0, innerHeight - y(d.value)))
      .attr('rx', 2)
      .attr('fill', (d) => d.color)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          title: `${d.label} · ${d.segment}`,
          lines: [
            { label: 'Fulfillment Success', value: `${d.value.toFixed(1)}%`, color: d.color },
            { label: 'Avg Delivery Time', value: `${d.avgHours.toFixed(1)} hrs` },
            { label: 'Consignments', value: `${d.volume}` }
          ]
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    void bars;

    // Direct Value Labels above bars
    segmentGroups
      .selectAll('text.bar-value')
      .data(barEntries)
      .enter()
      .append('text')
      .attr('class', 'bar-value')
      .attr('x', (d) => (x1(d.key) || 0) + x1.bandwidth() / 2)
      .attr('y', (d) => y(d.value) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#171513')
      .style('font-size', '10.5px')
      .style('font-weight', '700')
      .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
      .text((d) => `${d.value.toFixed(1)}%`);
  }, [analytics, filteredZones, containerWidths.success]);

  // =========================================================================
  // D3 CHART 2: AVERAGE DELIVERY TIME (HOURS) — ZONE BARS OR MONTHLY TREND
  // =========================================================================
  useEffect(() => {
    if (!analytics || !speedSvgRef.current) return;

    const width = Math.max(320, containerWidths.speed);
    const height = 310;
    const margin = { top: 28, right: 24, bottom: 52, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(speedSvgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (speedChartMode === 'BY_ZONE' && filteredZones.length > 0) {
      const groups = filteredZones.map((d) => d.segment);
      const subGroups = ['STEADFAST', 'PATHAO'] as const;
      const maxHrs =
        d3.max(filteredZones, (d) => Math.max(d.steadfastAvgHours, d.pathaoAvgHours)) || 65;

      const x0 = d3.scaleBand<string>().domain(groups).range([0, innerWidth]).paddingInner(0.28).paddingOuter(0.12);
      const x1 = d3.scaleBand<string>().domain(subGroups).range([0, x0.bandwidth()]).padding(0.14);
      const y = d3.scaleLinear().domain([0, Math.ceil(maxHrs / 10) * 10]).range([innerHeight, 0]).nice();

      // Gridlines
      g.append('g')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call((grid) => grid.select('.domain').remove())
        .call((grid) =>
          grid.selectAll('line').attr('stroke', '#EDE7DC').attr('stroke-dasharray', '3,3')
        );

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0).tickSizeOuter(0))
        .call((ax) => ax.select('.domain').attr('stroke', '#DED7CB'))
        .call((ax) =>
          ax
            .selectAll('text')
            .attr('fill', '#5C5449')
            .style('font-size', '11px')
            .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        );

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}h`))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) =>
          ax
            .selectAll('text')
            .attr('fill', '#7A7165')
            .style('font-size', '11px')
            .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        );

      const segmentGroups = g
        .selectAll('.speed-group')
        .data(filteredZones)
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${x0(d.segment) || 0},0)`);

      const entries = (d: CourierZoneMetric) => [
        {
          key: 'STEADFAST' as const,
          label: 'Steadfast',
          hours: d.steadfastAvgHours,
          rate: d.steadfastSuccessRate,
          segment: d.segment,
          color: STEADFAST_COLOR
        },
        {
          key: 'PATHAO' as const,
          label: 'Pathao',
          hours: d.pathaoAvgHours,
          rate: d.pathaoSuccessRate,
          segment: d.segment,
          color: PATHAO_COLOR
        }
      ];

      segmentGroups
        .selectAll('rect')
        .data(entries)
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.key) || 0)
        .attr('y', (d) => y(d.hours))
        .attr('width', x1.bandwidth())
        .attr('height', (d) => Math.max(0, innerHeight - y(d.hours)))
        .attr('rx', 2)
        .attr('fill', (d) => d.color)
        .style('cursor', 'pointer')
        .on('mousemove', (event, d) => {
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            title: `${d.label} · ${d.segment}`,
            lines: [
              { label: 'Avg Delivery Time', value: `${d.hours.toFixed(1)} hours`, color: d.color },
              { label: 'Success Rate', value: `${d.rate.toFixed(1)}%` }
            ]
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      segmentGroups
        .selectAll('text.speed-label')
        .data(entries)
        .enter()
        .append('text')
        .attr('x', (d) => (x1(d.key) || 0) + x1.bandwidth() / 2)
        .attr('y', (d) => y(d.hours) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#171513')
        .style('font-size', '10.5px')
        .style('font-weight', '700')
        .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .text((d) => `${d.hours.toFixed(1)}h`);
    } else if (analytics.monthlyTrend.length > 0) {
      // Multi-Series D3 Line Chart for Monthly Average Delivery Time Trend
      const data = analytics.monthlyTrend;
      const x = d3
        .scalePoint<string>()
        .domain(data.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.25);

      const maxHrs = d3.max(data, (d) => Math.max(d.steadfastAvgHours, d.pathaoAvgHours)) || 40;
      const minHrs = d3.min(data, (d) => Math.min(d.steadfastAvgHours, d.pathaoAvgHours)) || 15;
      const y = d3
        .scaleLinear()
        .domain([Math.max(0, Math.floor(minHrs - 5)), Math.ceil(maxHrs + 5)])
        .range([innerHeight, 0])
        .nice();

      g.append('g')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call((grid) => grid.select('.domain').remove())
        .call((grid) =>
          grid.selectAll('line').attr('stroke', '#EDE7DC').attr('stroke-dasharray', '3,3')
        );

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call((ax) => ax.select('.domain').attr('stroke', '#DED7CB'))
        .call((ax) =>
          ax
            .selectAll('text')
            .attr('fill', '#5C5449')
            .style('font-size', '11px')
            .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        );

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}h`))
        .call((ax) => ax.select('.domain').remove())
        .call((ax) =>
          ax
            .selectAll('text')
            .attr('fill', '#7A7165')
            .style('font-size', '11px')
            .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        );

      const steadfastLine = d3
        .line<(typeof data)[number]>()
        .x((d) => x(d.month) || 0)
        .y((d) => y(d.steadfastAvgHours))
        .curve(d3.curveMonotoneX);

      const pathaoLine = d3
        .line<(typeof data)[number]>()
        .x((d) => x(d.month) || 0)
        .y((d) => y(d.pathaoAvgHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', STEADFAST_COLOR)
        .attr('stroke-width', 2.5)
        .attr('d', steadfastLine);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', PATHAO_COLOR)
        .attr('stroke-width', 2.5)
        .attr('d', pathaoLine);

      // Steadfast Data Points
      g.selectAll('.dot-sf')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.month) || 0)
        .attr('cy', (d) => y(d.steadfastAvgHours))
        .attr('r', 5)
        .attr('fill', STEADFAST_COLOR)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mousemove', (event, d) => {
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            title: `${d.month} Transit Speed`,
            lines: [
              { label: 'Steadfast Avg', value: `${d.steadfastAvgHours} hrs`, color: STEADFAST_COLOR },
              { label: 'Pathao Avg', value: `${d.pathaoAvgHours} hrs`, color: PATHAO_COLOR },
              { label: 'Steadfast Success', value: `${d.steadfastSuccessRate}%` }
            ]
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));

      // Pathao Data Points
      g.selectAll('.dot-pt')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.month) || 0)
        .attr('cy', (d) => y(d.pathaoAvgHours))
        .attr('r', 5)
        .attr('fill', PATHAO_COLOR)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mousemove', (event, d) => {
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            title: `${d.month} Transit Speed`,
            lines: [
              { label: 'Pathao Avg', value: `${d.pathaoAvgHours} hrs`, color: PATHAO_COLOR },
              { label: 'Steadfast Avg', value: `${d.steadfastAvgHours} hrs`, color: STEADFAST_COLOR },
              { label: 'Pathao Success', value: `${d.pathaoSuccessRate}%` }
            ]
          });
        })
        .on('mouseleave', () => setTooltip((prev) => ({ ...prev, visible: false })));
    }
  }, [analytics, filteredZones, speedChartMode, containerWidths.speed]);

  const sf = analytics?.summary.steadfast;
  const pt = analytics?.summary.pathao;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* Header & Interactive Controls */}
      <div className="bg-white border border-[#E8E2D8] rounded-xs p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-2xl font-normal text-[#171513]">
            Courier fulfillment <span className="italic">analytics</span>
          </h3>
          <p className="text-xs text-[#7A7165] mt-0.5">
            Steadfast vs Pathao delivery success rates, average transit hours, and regional SLA comparison
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interactive Zone Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs">
            {(
              [
                { id: 'ALL', label: 'All Zones' },
                { id: 'INSIDE_DHAKA', label: 'Inside Dhaka' },
                { id: 'OUTSIDE_DHAKA', label: 'Outside Dhaka' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setZoneFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-2xs cursor-pointer transition-colors ${
                  zoneFilter === opt.id
                    ? 'bg-[#171513] text-[#FAF5EB]'
                    : 'text-[#5C5449] hover:text-[#171513]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#DED7CB] rounded-xs text-xs font-medium text-[#171513] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9E7D47] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top KPI Comparison Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2D8] rounded-xs p-4.5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7A7165]">
            <span>Steadfast Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#1A4231]" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#1A4231]">
            {sf ? `${sf.fulfillmentSuccessRate.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs text-[#7A7165]">
            {sf ? `${sf.deliveredCount} of ${sf.totalShipments} parcels · 64 districts` : 'Loading...'}
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-xs p-4.5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7A7165]">
            <span>Pathao Success Rate</span>
            <TrendingUp className="w-4 h-4 text-[#B83B4B]" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#B83B4B]">
            {pt ? `${pt.fulfillmentSuccessRate.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs text-[#7A7165]">
            {pt ? `${pt.deliveredCount} of ${pt.totalShipments} parcels · Express tier` : 'Loading...'}
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-xs p-4.5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7A7165]">
            <span>Steadfast Avg Delivery Time</span>
            <Clock className="w-4 h-4 text-[#1A4231]" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#171513]">
            {sf ? `${sf.avgDeliveryTimeHours.toFixed(1)} hrs` : '—'}
          </div>
          <div className="text-xs text-[#7A7165]">
            {sf
              ? `Dhaka ${sf.insideDhakaAvgHours}h · Outside ${sf.outsideDhakaAvgHours}h`
              : 'Loading...'}
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-xs p-4.5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7A7165]">
            <span>Pathao Avg Delivery Time</span>
            <Clock className="w-4 h-4 text-[#B83B4B]" />
          </div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#171513]">
            {pt ? `${pt.avgDeliveryTimeHours.toFixed(1)} hrs` : '—'}
          </div>
          <div className="text-xs text-[#7A7165]">
            {pt
              ? `Dhaka ${pt.insideDhakaAvgHours}h · Outside ${pt.outsideDhakaAvgHours}h`
              : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Dual D3 Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: D3 Fulfillment Success Rate Comparison */}
        <div
          ref={successContainerRef}
          className="bg-white border border-[#E8E2D8] rounded-xs p-5 shadow-xs relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EAE1]">
            <div>
              <h4 className="text-sm font-bold text-[#171513]">
                Fulfillment Success Rate (%)
              </h4>
              <p className="text-xs text-[#7A7165]">
                Completed deliveries without return or carrier delay
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#5C5449]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-2xs inline-block" style={{ backgroundColor: STEADFAST_COLOR }} />
                <span>Steadfast</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-2xs inline-block" style={{ backgroundColor: PATHAO_COLOR }} />
                <span>Pathao</span>
              </span>
            </div>
          </div>

          <div className="mt-3 overflow-hidden">
            <svg ref={successSvgRef} className="w-full h-auto block" />
          </div>
        </div>

        {/* Chart 2: D3 Average Delivery Time (Hours) */}
        <div
          ref={speedContainerRef}
          className="bg-white border border-[#E8E2D8] rounded-xs p-5 shadow-xs relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EAE1]">
            <div>
              <h4 className="text-sm font-bold text-[#171513]">
                Average Delivery Time (Hours)
              </h4>
              <p className="text-xs text-[#7A7165]">
                Lower hours indicate faster vault-to-door handover
              </p>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs self-start sm:self-center">
              <button
                type="button"
                onClick={() => setSpeedChartMode('BY_ZONE')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-2xs cursor-pointer transition-colors ${
                  speedChartMode === 'BY_ZONE'
                    ? 'bg-[#171513] text-[#FAF5EB]'
                    : 'text-[#5C5449] hover:text-[#171513]'
                }`}
              >
                By Zone
              </button>
              <button
                type="button"
                onClick={() => setSpeedChartMode('TREND')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-2xs cursor-pointer transition-colors ${
                  speedChartMode === 'TREND'
                    ? 'bg-[#171513] text-[#FAF5EB]'
                    : 'text-[#5C5449] hover:text-[#171513]'
                }`}
              >
                6-Month Trend
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-hidden">
            <svg ref={speedSvgRef} className="w-full h-auto block" />
          </div>
        </div>

        {/* Shared Interactive Floating Tooltip */}
        {tooltip.visible && (
          <div
            className="fixed z-50 pointer-events-none bg-[#171513] text-[#FAF5EB] px-3.5 py-2.5 rounded-xs shadow-lg border border-[#2E2A26] text-xs space-y-1 max-w-xs"
            style={{
              left: Math.min(window.innerWidth - 230, Math.max(12, tooltip.x + 14)),
              top: Math.max(12, tooltip.y - 16)
            }}
          >
            <div className="font-bold text-[#E5BA6A]">{tooltip.title}</div>
            {tooltip.lines.map((line, i) => (
              <div key={i} className="flex items-center justify-between gap-4 font-mono tabular-nums text-[11px]">
                <span className="text-[#A89F91]">{line.label}:</span>
                <span className="font-bold text-white">{line.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regional Breakdown Ledger Table */}
      <div className="bg-white border border-[#E8E2D8] rounded-xs shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F0EAE1] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#171513]">Regional Carrier Benchmark</h4>
            <p className="text-xs text-[#7A7165]">
              Zone-by-zone fulfillment reliability and average transit duration
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A7165] font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Delivery Segment</th>
                <th>Steadfast Success</th>
                <th>Pathao Success</th>
                <th>Steadfast Avg Time</th>
                <th>Pathao Avg Time</th>
                <th className="text-right px-4">Total Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1] font-mono tabular-nums">
              {filteredZones.map((row) => (
                <tr key={row.segment} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-4 font-sans font-semibold text-[#171513]">{row.segment}</td>
                  <td className="font-bold text-[#1A4231]">{row.steadfastSuccessRate.toFixed(1)}%</td>
                  <td className="font-bold text-[#B83B4B]">{row.pathaoSuccessRate.toFixed(1)}%</td>
                  <td className="text-[#171513]">{row.steadfastAvgHours.toFixed(1)} hrs</td>
                  <td className="text-[#171513]">{row.pathaoAvgHours.toFixed(1)} hrs</td>
                  <td className="text-right px-4 text-[#5C5449]">
                    {row.steadfastVolume + row.pathaoVolume} parcels
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
