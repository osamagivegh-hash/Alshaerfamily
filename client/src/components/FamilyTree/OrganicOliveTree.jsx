/**
 * شجرة العائلة - إصدار "شجرة الزيتون العضوية" - دائري كامل 360 درجة
 * Organic Olive Tree - Full 360 Radial Layout
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ==================== CONFIGURATION ====================
const COLORS = {
    bg: '#F9F9F0',
    trunk: '#3E2723', // Darker brown
    branch: '#5D4037', // Dark brown
    leafFill: '#2E7D32', // Vibrant green
    leafStroke: '#1B5E20',
    text: '#FFFFFF',
    gold: '#FFD700',
    rootText: '#FFFFFF'
};

const OrganicOliveTree = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [renderError, setRenderError] = useState(null);

    // ==================== DATA PROCESSING ====================
    const processedData = useMemo(() => {
        try {
            if (!data || Object.keys(data).length === 0) return null;

            // 1. Hierarchy & Sort
            // Sort by children length to balance the tree visually
            const root = d3.hierarchy(data)
                .sort((a, b) => (b.height - a.height) || (a.data.fullName || "").localeCompare(b.data.fullName || ""));

            // 2. Count Leaves (Weight)
            root.count();

            return { root };
        } catch (err) {
            console.error("Error processing hierarchy:", err);
            setRenderError("خطأ في معالجة بيانات الشجرة");
            return null;
        }
    }, [data]);

    // ==================== RENDER ====================
    useEffect(() => {
        if (!processedData) return;
        if (!svgRef.current || !containerRef.current) return;

        try {
            const { root } = processedData;

            // Setup Dimensions
            const rect = containerRef.current.getBoundingClientRect();
            const width = Math.max(rect.width || 1200, 1200);
            const height = Math.max(rect.height || 1200, 1200); // Improved height for full circle

            const cx = width / 2;
            const cy = height / 2; // Center exactly
            // Use a generous radius but keep padding for leaf labels
            const radius = Math.min(width, height) / 2 * 0.85;

            // Clear SVG
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            // Setup Zoom Group
            const g = svg.append('g').attr('class', 'tree-layer');
            const zoom = d3.zoom()
                .scaleExtent([0.1, 8])
                .on('zoom', (e) => g.attr('transform', e.transform));
            svg.call(zoom);

            // =========================================================
            // ALGORITHM: Weighted Radial Cluster (360 Degrees)
            // =========================================================

            const cluster = d3.cluster()
                .size([2 * Math.PI, radius]) // 360 degrees
                .separation((a, b) => {
                    // Expanded separation
                    return (a.parent === b.parent ? 1 : 3) / a.depth;
                });

            cluster(root);

            // =========================================================
            // DRAW LINKS (BRANCHES)
            // =========================================================

            const linkGenerator = d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y);

            g.selectAll('.link')
                .data(root.links())
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke', COLORS.branch)
                // Stronger branches
                .attr('stroke-width', d => Math.max(1, 12 - d.target.depth * 2))
                .attr('stroke-opacity', 0.8)
                .attr('stroke-linecap', 'round')
                .attr('d', linkGenerator)
                .attr('transform', `translate(${cx},${cy})`);

            // =========================================================
            // DRAW CENTERS (Root Visuals)
            // =========================================================

            const trunkGroup = g.append('g').attr('class', 'trunk-group')
                .attr('transform', `translate(${cx}, ${cy})`);

            // Central Core Circle for Founder
            trunkGroup.append('circle')
                .attr('r', 40)
                .attr('fill', COLORS.trunk)
                .attr('stroke', COLORS.gold)
                .attr('stroke-width', 3)
                .style('filter', 'drop-shadow(0px 0px 10px rgba(93, 64, 55, 0.5))');

            trunkGroup.append('text')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('font-weight', '800')
                .attr('fill', COLORS.gold)
                .attr('font-size', '14px')
                .text(root.data.fullName || "محمد الشاعر")
                // Split text if needed, or keep simple
                .call(text => {
                    // Simple wrap logic could go here if name is long, 
                    // but "محمد الشاعر" fits well.
                });

            // =========================================================
            // DRAW LEAVES (NODES)
            // =========================================================

            const nodes = g.selectAll('.node')
                .data(root.descendants().slice(1)) // Skip root
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', d => {
                    const r = d.y;
                    const a = d.x - Math.PI / 2; // subtract PI/2 to align with standard d3 radial layout (0 is up)
                    const x = r * Math.cos(a);
                    const y = r * Math.sin(a);
                    return `translate(${cx + x}, ${cy + y})`;
                })
                .style('cursor', 'pointer')
                .on('click', (e, d) => {
                    e.stopPropagation();
                    setSelectedNode(d.data);
                    if (onNodeClick) onNodeClick(d.data);
                });

            // Leaf Graphics
            const leafW = 60;
            const leafH = 28;

            nodes.append('ellipse')
                .attr('rx', leafW / 2)
                .attr('ry', leafH / 2)
                .attr('fill', COLORS.leafFill)
                .attr('stroke', COLORS.leafStroke)
                .attr('stroke-width', 1.5)
                .attr('transform', d => {
                    // Rotate leaf to align with radius
                    // d.x is angle.
                    const angleDeg = (d.x * 180 / Math.PI) - 90;
                    return `rotate(${angleDeg})`;
                })
                .on('mouseover', function () {
                    d3.select(this).attr('fill', '#4CAF50').attr('stroke', COLORS.gold);
                })
                .on('mouseout', function () {
                    d3.select(this).attr('fill', COLORS.leafFill).attr('stroke', COLORS.leafStroke);
                });

            // Leaf Labels
            nodes.append('text')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('font-size', '11px')
                .attr('font-weight', '600')
                .attr('fill', 'white')
                .text(d => d.data.fullName ? d.data.fullName.split(' ')[0] : '')
                .attr('transform', d => {
                    let angleDeg = (d.x * 180 / Math.PI) - 90;

                    // SMART ROTATION 360:
                    // If angle is between 90 and 270 (Left Side), flip text 180.
                    // Normalize angle to 0-360 first
                    let normalizedAngle = angleDeg % 360;
                    if (normalizedAngle < 0) normalizedAngle += 360;

                    if (normalizedAngle > 90 && normalizedAngle < 270) {
                        angleDeg += 180;
                    }

                    return `rotate(${angleDeg})`;
                });

            nodes.append('title').text(d => d.data.fullName);

            // Initial Zoom to fit center
            const initialScale = 0.95;
            svg.call(zoom.transform, d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(initialScale)
                .translate(-cx, -cy)
            );

        } catch (err) {
            console.error("Error rendering tree:", err);
            setRenderError("حدث خطأ أثناء رسم الشجرة: " + err.message);
        }

    }, [processedData]);

    if (renderError) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-[#F9F9F0] text-red-600">
                <div className="text-center">
                    <p className="text-xl font-bold mb-2">⚠️ عذراً</p>
                    <p>{renderError}</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full relative bg-[#F9F9F0] overflow-hidden" dir="rtl">
            <svg ref={svgRef} className="w-full h-full block touch-action-none" />

            {selectedNode && (
                <div className="absolute bottom-10 right-10 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-amber-200 z-50 max-w-sm transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-amber-900">{selectedNode.fullName}</h3>
                        <button
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => setSelectedNode(null)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-2 text-right">
                        {selectedNode.fatherName && <p className="text-sm text-gray-700"><strong>الأب:</strong> {selectedNode.fatherName}</p>}
                        {selectedNode.motherName && <p className="text-sm text-gray-700"><strong>الأم:</strong> {selectedNode.motherName}</p>}
                        {selectedNode.birthDate && <p className="text-sm text-gray-700"><strong>الميلاد:</strong> {new Date(selectedNode.birthDate).toLocaleDateString('ar-SA')}</p>}
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedNode.biography || 'لا توجد سيرة ذاتية متاحة حالياً.'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
