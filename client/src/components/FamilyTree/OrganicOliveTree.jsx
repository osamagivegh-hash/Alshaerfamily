/**
 * شجرة العائلة - إصدار "عدم التداخل" الصارم
 * Strict Non-Overlapping Fan Tree
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
            const root = d3.hierarchy(data)
                .sort((a, b) => (b.value || 0) - (a.value || 0));

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
            // Ensure reasonable defaults to prevent negative/zero values
            const width = Math.max(rect.width || 1000, 1000);
            const height = Math.max(rect.height || 800, 800);

            // Tree Geometry
            const cx = width / 2;
            const cy = height - 120; // Trunk base
            const radius = Math.min(width, height) * 0.9;

            // Clear SVG
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            // Setup Zoom Group
            const g = svg.append('g').attr('class', 'tree-layer');
            const zoom = d3.zoom()
                .scaleExtent([0.1, 5])
                .on('zoom', (e) => g.attr('transform', e.transform));
            svg.call(zoom);

            // =========================================================
            // ALGORITHM: Weighted Radial Partitioning
            // =========================================================

            const cluster = d3.cluster()
                .size([Math.PI, radius - 150]) // 180 degrees, full radius minus padding
                .separation((a, b) => {
                    return (a.parent === b.parent ? 1 : 1.5) / a.depth;
                });

            cluster(root);

            // =========================================================
            // DRAW LINKS (BRANCHES)
            // =========================================================

            const linkGenerator = d3.linkRadial()
                .angle(d => d.x - Math.PI)
                .radius(d => d.depth === 0 ? 0 : d.y);

            g.selectAll('.link')
                .data(root.links())
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke', COLORS.branch)
                .attr('stroke-width', d => Math.max(1, 10 - d.target.depth * 1.5))
                .attr('stroke-linecap', 'round')
                .attr('d', linkGenerator)
                .attr('transform', `translate(${cx},${cy})`);

            // =========================================================
            // DRAW TRUNK (Explicit Root)
            // =========================================================

            const trunkGroup = g.append('g').attr('class', 'trunk-group')
                .attr('transform', `translate(${cx}, ${cy})`);

            // Brown thick trunk
            trunkGroup.append('path')
                .attr('d', 'M -15 0 L 15 0 L 10 -60 L -10 -60 Z')
                .attr('fill', COLORS.trunk)
                .attr('stroke', COLORS.trunk)
                .attr('stroke-width', 2);

            // Roots
            trunkGroup.append('path')
                .attr('d', 'M -15 0 Q -30 30 -60 40 M 15 0 Q 30 30 60 40')
                .attr('fill', 'none')
                .attr('stroke', COLORS.trunk)
                .attr('stroke-width', 4);

            // Root Label
            trunkGroup.append('rect')
                .attr('x', -60)
                .attr('y', -30)
                .attr('width', 120)
                .attr('height', 30)
                .attr('rx', 5)
                .attr('fill', COLORS.trunk)
                .attr('stroke', COLORS.gold)
                .attr('stroke-width', 2);

            trunkGroup.append('text')
                .attr('x', 0)
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('font-weight', 'bold')
                .attr('fill', COLORS.gold)
                .attr('font-size', '16px')
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
                    const angle = d.x - Math.PI;
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

            const leafW = 50;
            const leafH = 22;

            nodes.append('ellipse')
                .attr('rx', leafW / 2)
                .attr('ry', leafH / 2)
                .attr('fill', COLORS.leafFill)
                .attr('stroke', COLORS.leafStroke)
                .attr('stroke-width', 1)
                .attr('transform', d => {
                    const angle = (d.x - Math.PI) * 180 / Math.PI;
                    return `rotate(${angle})`;
                });

            nodes.append('text')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('font-size', '10px')
                .attr('fill', 'white')
                .text(d => d.data.fullName ? d.data.fullName.split(' ')[0] : '')
                .attr('transform', d => {
                    const angle = (d.x - Math.PI) * 180 / Math.PI;
                    return `rotate(${angle})`;
                });

            nodes.append('title').text(d => d.data.fullName);

            // Initial Zoom to fit
            svg.call(zoom.transform, d3.zoomIdentity
                .translate(width / 2, height - 50)
                .scale(0.8)
                .translate(-width / 2, -height + 150)
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
            <svg ref={svgRef} className="w-full h-full block" />

            {selectedNode && (
                <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow-xl border border-amber-200 z-50">
                    <h3 className="font-bold text-lg text-amber-900">{selectedNode.fullName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedNode.biography || 'لا توجد سيرة ذاتية'}</p>
                    <button className="text-sm text-red-500 mt-2" onClick={() => setSelectedNode(null)}>إغلاق</button>
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
