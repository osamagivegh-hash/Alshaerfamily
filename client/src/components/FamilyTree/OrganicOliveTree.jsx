/**
 * شجرة العائلة - إصدار "شجرة الزيتون العضوية"
 * Organic Olive Tree - Consistent & Non-Overlapping
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ==================== CONFIGURATION ====================
const COLORS = {
    bg: '#F9F9F0',
    trunk: '#5D4037',
    branch: '#795548',
    leafFill: '#558B2F',
    leafStroke: '#33691E',
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
            const width = Math.max(rect.width || 1200, 1200); // Ensure ample width
            const height = Math.max(rect.height || 900, 900); // Ensure ample height

            const cx = width / 2;
            const cy = height - 100; // Shift trunk down slightly
            const radius = Math.min(width, height / 1.1) * 0.85; // Use 85% of available space

            // Clear SVG
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            // Setup Zoom Group
            const g = svg.append('g').attr('class', 'tree-layer');
            const zoom = d3.zoom()
                .scaleExtent([0.1, 8]) // Allow deeper zoom
                .on('zoom', (e) => g.attr('transform', e.transform));
            svg.call(zoom);

            // =========================================================
            // ALGORITHM: Weighted Radial Cluster with Improved Separation
            // =========================================================

            const cluster = d3.cluster()
                .size([Math.PI, radius]) // 180 degrees
                .separation((a, b) => {
                    // Constant separation to prevent overlap regardless of depth
                    // Give slightly more space between different parents
                    return (a.parent === b.parent ? 1 : 2);
                });

            cluster(root);

            // =========================================================
            // DRAW LINKS (BRANCHES)
            // =========================================================

            const linkGenerator = d3.linkRadial()
                .angle(d => d.x - Math.PI) // Map 0..PI to -PI..0 (Left to Right arc)
                .radius(d => d.y);

            g.selectAll('.link')
                .data(root.links())
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke', COLORS.branch)
                // Tapering stroke width based on depth
                .attr('stroke-width', d => Math.max(1.5, 8 - d.target.depth))
                .attr('stroke-opacity', 0.8)
                .attr('stroke-linecap', 'round')
                .attr('d', linkGenerator)
                .attr('transform', `translate(${cx},${cy})`);

            // =========================================================
            // DRAW TRUNK (Explicit Root Visuals)
            // =========================================================

            const trunkGroup = g.append('g').attr('class', 'trunk-group')
                .attr('transform', `translate(${cx}, ${cy})`);

            // Stylized Trunk base
            trunkGroup.append('path')
                .attr('d', `M -20 0 L 20 0 Q 15 -40 30 -80 L -30 -80 Q -15 -40 -20 0 Z`)
                .attr('fill', COLORS.trunk)
                .attr('stroke', 'none');

            // Roots effect
            trunkGroup.append('path')
                .attr('d', 'M -20 0 Q -40 40 -80 50 M 20 0 Q 40 40 80 50')
                .attr('fill', 'none')
                .attr('stroke', COLORS.trunk)
                .attr('stroke-width', 4)
                .attr('stroke-linecap', 'round');

            // Root Label Box
            trunkGroup.append('rect')
                .attr('x', -70)
                .attr('y', -30)
                .attr('width', 140)
                .attr('height', 36)
                .attr('rx', 8)
                .attr('fill', COLORS.trunk)
                .attr('stroke', COLORS.gold)
                .attr('stroke-width', 2)
                .style('filter', 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))');

            trunkGroup.append('text')
                .attr('x', 0)
                .attr('y', -8)
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('font-weight', '800')
                .attr('fill', COLORS.gold)
                .attr('font-size', '18px')
                .text(root.data.fullName || "محمد الشاعر");

            // =========================================================
            // DRAW LEAVES (NODES)
            // =========================================================

            const nodes = g.selectAll('.node')
                .data(root.descendants().slice(1)) // Skip root
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', d => {
                    const angle = d.x - Math.PI; // -PI to 0
                    const r = d.y;
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    return `translate(${cx + x}, ${cy + y})`;
                })
                .style('cursor', 'pointer')
                .on('click', (e, d) => {
                    e.stopPropagation();
                    setSelectedNode(d.data);
                    if (onNodeClick) onNodeClick(d.data);
                });

            // Leaf Graphics
            const leafW = 55;
            const leafH = 26;

            nodes.append('ellipse')
                .attr('rx', leafW / 2)
                .attr('ry', leafH / 2)
                .attr('fill', COLORS.leafFill)
                .attr('stroke', COLORS.leafStroke)
                .attr('stroke-width', 1.5)
                .attr('transform', d => {
                    // Rotate leaf to follow radius
                    const angleDeg = (d.x - Math.PI) * 180 / Math.PI;
                    return `rotate(${angleDeg})`;
                })
                .on('mouseover', function () {
                    d3.select(this).attr('fill', '#689F38').attr('stroke', COLORS.gold);
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
                    let angleDeg = (d.x - Math.PI) * 180 / Math.PI;

                    // SMART ROTATION:
                    // d.x ranges from 0 to PI.
                    // Left Side: 0 < d.x < PI/2 (Angle -180 to -90) -> Text is upside down. Flip it.
                    // Right Side: PI/2 < d.x < PI (Angle -90 to 0) -> Text is upright. Keep it.

                    if (d.x < Math.PI / 2) {
                        angleDeg += 180;
                    }

                    return `rotate(${angleDeg})`;
                });

            nodes.append('title').text(d => d.data.fullName);

            // Initial Zoom to fit beautifully
            // Center the tree bottom (cy) to the bottom of the screen
            const initialScale = 0.85;
            svg.call(zoom.transform, d3.zoomIdentity
                .translate(width / 2, height - (height * 0.1))
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
