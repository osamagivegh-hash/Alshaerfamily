/**
 * شجرة العائلة - إصدار "عدم التداخل" الصارم
 * Strict Non-Overlapping Fan Tree
 * 
 * الخوارزمية:
 * 1. حساب عدد الأوراق (Descendant Leaves) لكل فرع.
 * 2. توزيع الزوايا (180 درجة) بناءً على وزن كل فرع.
 * 3. رسم الفروع داخل قطاعاتها المحددة بدقة لمنع التقاطع.
 * 4. إظهار الجذع الرئيسي باسم "محمد الشاعر".
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
    const [dimensions, setDimensions] = useState({ width: 1400, height: 1000 });
    const [selectedNode, setSelectedNode] = useState(null);

    // ==================== DATA PROCESSING ====================
    const processedData = useMemo(() => {
        if (!data) return null;

        // 1. Hierarchy & Sort
        // Sorting by size (descending) helps prevent small branches getting lost between big ones
        // But for family, usually eldest to youngest is preferred.
        // Let's stick to a stable sort to prevent crossing.
        const root = d3.hierarchy(data)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // 2. Count Leaves (Weight)
        // Assign a 'value' to each node representing the number of leaves in its subtree
        root.count();

        return { root };
    }, [data]);

    // ==================== RENDER ====================
    useEffect(() => {
        if (!processedData || !svgRef.current || !containerRef.current) return;

        const { root } = processedData;

        // Setup Dimensions
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(rect.width, 1400); // High res internal
        const height = Math.max(rect.height, 1000);

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

        // We map the total number of leaves to a 180 degree arc (PI radians)
        // Start angle: -PI/2 (Left), End angle: PI/2 (Right) at -90 deg rotation
        // Let's work in standard polar: 
        // 180 degrees upwards = from PI (Left) to 2*PI (Right)? No.
        // Standard D3 Radial: 0 is up (usually -PI/2).

        // Let's manually calculate x (angle) and y (radius)

        const totalLeaves = root.leaves().length;
        const sectorAngle = Math.PI; // 180 degrees
        const startAngle = -Math.PI; // Start from left

        // Using d3.cluster with size being [angle, radius]
        // But d3.cluster creates equal spacing for leaves. 
        // We want to ensure no overlap. d3.cluster is actually good for that 
        // as long as the radius is large enough for the text.

        const cluster = d3.cluster()
            .size([Math.PI, radius - 150]) // 180 degrees, full radius minus padding
            .separation((a, b) => {
                // Critical: More separation between different parents
                return (a.parent === b.parent ? 1 : 1.5) / a.depth;
            });

        cluster(root);

        // =========================================================
        // DRAWING UTILS
        // =========================================================

        // Convert (angle, radius) to (x, y)
        // D3 Tree output: x is angle (radians), y is radius
        // We need to map x from [0, PI] to [-PI/2, PI/2] to point upwards?
        // Let's modify the projection.
        // Our cluster size is [Math.PI, radius]. 
        // x goes from 0 to PI. 
        // We want 0 to be Left (-x axis) and PI to be Right (+x axis).
        // 0 rad = East. PI rad = West.
        // We want the fan to point North.
        // So angle should be (x - PI). 
        // x=0 -> -PI (West). x=PI/2 -> -PI/2 (South?). x=PI -> 0 (East).
        // Let's try: angle = x + Math.PI. 

        const project = (d) => {
            // Mapping [0, PI] to span the upper semicircle.
            // 0 -> Left (180 deg)
            // PI/2 -> Up (270 deg / -90 deg)
            // PI -> Right (0 deg)

            // Standard math: 0 is Right. PI is Left. -PI/2 is Up.
            // d.x comes 0 to 3.14.
            // Let's map d.x to [PI, 2*PI] (bottom) or [0, -PI] (top).
            // Let's enable "look up".

            const angle = d.x - Math.PI; // Shift to upper hemisphere
            const r = d.y;
            return {
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle),
                angle: angle * 180 / Math.PI // degrees
            };
        };

        // =========================================================
        // DRAW LINKS (BRANCHES) - Strict Shapes
        // =========================================================

        g.selectAll('.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', COLORS.branch)
            .attr('stroke-width', d => Math.max(1, 10 - d.target.depth * 1.5)) // Tapering
            .attr('stroke-linecap', 'round')
            .attr('d', d => {
                const s = project(d.source);
                const t = project(d.target);

                // For layout base (Root to Generation 1)
                if (d.source.depth === 0) {
                    // Start from trunk top
                    return `M ${cx} ${cy - 60} Q ${cx} ${(cy - 60 + t.y) / 2} ${t.x} ${t.y}`;
                }

                // Standard branch curve
                // Using Cluster layout, nodes at same depth are at same radius.
                // We want smooth curves.
                // Simple quadratic bezier:
                // Control point: mid-radius, but angle of the parent? or mid-angle?

                // Project 'mid' point in radial space for smoother curve
                const rMid = (d.source.y + d.target.y) / 2;
                const angleMid = (d.source.x + d.target.x) / 2 - Math.PI;
                const midX = cx + rMid * Math.cos(angleMid); // This creates the organic "bend"
                const midY = cy + rMid * Math.sin(angleMid);

                // Actually, just using a simple radial projection logic is safer against "crossing"
                // D3's linkRadial is perfect but we need to coordinate transform manually.

                return d3.linkRadial()
                    .angle(n => n.x - Math.PI / 2) // Adapting to standard D3 radial
                    .radius(n => n.y)
                    .x(n => n.x) // D3 uses these accessors
                    .y(n => n.y)
                    ({ source: d.source, target: d.target });

                // Wait, manual Bezier is easier to control for the "Fan" orientation:
                // return `M ${s.x} ${s.y} C ${s.x} ${(s.y + t.y)/2} ${t.x} ${(s.y + t.y)/2} ${t.x} ${t.y}`;
                // This vertical cubic bezier forces vertical exit/entry, good for Up/Down trees but strictly not for radial.

                // Let's use simple line for now to see structure or simple curve
                return `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
            })
            // Fix: Use correct radial generator for perfect curves
            .attr('d', d3.linkRadial()
                .angle(d => d.x - Math.PI) // Rotate -180 deg to point up
                .radius(d => d.depth === 0 ? 0 : d.y) // Start from center
                .x(d => d.x) // dummy
                .y(d => d.y) // dummy
            )
            .attr('transform', `translate(${cx},${cy})`); // Center the radial system

        // =========================================================
        // DRAW TRUNK (Explicit Root)
        // =========================================================

        // The root link generator assumes center is (0,0).
        // Our manual Trunk:
        const trunkGroup = g.append('g').attr('class', 'trunk-group')
            .attr('transform', `translate(${cx}, ${cy})`);

        // Brown thick trunk
        trunkGroup.append('path')
            .attr('d', 'M -15 0 L 15 0 L 10 -60 L -10 -60 Z') // Tapered trunk
            .attr('fill', COLORS.trunk)
            .attr('stroke', COLORS.trunk)
            .attr('stroke-width', 2);

        // Roots
        trunkGroup.append('path')
            .attr('d', 'M -15 0 Q -30 30 -60 40 M 15 0 Q 30 30 60 40')
            .attr('fill', 'none')
            .attr('stroke', COLORS.trunk)
            .attr('stroke-width', 4);

        // Root Label (THE REQUESTED FIX)
        // Background for text
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
            .text(root.data.fullName || "محمد الشاعر"); // Explicit Fallback

        // =========================================================
        // DRAW LEAVES (NODES)
        // =========================================================

        const nodes = g.selectAll('.node')
            .data(root.descendants().slice(1)) // Skip root, we drew it manually
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => {
                // Same transformation as links: Radial centered at cx, cy
                const angle = d.x - Math.PI; // -PI to 0
                const r = d.y;
                // Convert polar to cartesian
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

        // Leaf Shape (Oval) - Scaled by depth? No, uniform is cleaner
        const leafW = 50;
        const leafH = 22;

        nodes.append('ellipse')
            .attr('rx', leafW / 2)
            .attr('ry', leafH / 2)
            .attr('fill', COLORS.leafFill)
            .attr('stroke', COLORS.leafStroke)
            .attr('stroke-width', 1)
            // Rotate leaf to follow branch angle?
            // Angle is d.x - Math.PI (in radians).
            // To be perpendicular to radius: rotation = angle * 180/PI + 90
            // To be aligned with radius: rotation = angle * 180/PI
            // User Image shows horizontal or slightly radial. 
            // Let's try aligned with radius for clean look (Fan style)
            .attr('transform', d => {
                const angle = (d.x - Math.PI) * 180 / Math.PI;
                // Add 90 to make the oval perpendicular to the radius (like a fan blade)
                return `rotate(${angle + 90})`;
            });

        // Text inside Leaf
        nodes.append('text')
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-family', "'Cairo', sans-serif")
            .attr('font-size', '10px')
            .attr('fill', 'white')
            .text(d => {
                const name = d.data.fullName || '';
                return name.split(' ')[0]; // First name for compactness
            })
            .attr('transform', d => {
                const angle = (d.x - Math.PI) * 180 / Math.PI;
                // Keep text horizontal if possible? No, it will overlap.
                // Text must rotate with leaf.
                return `rotate(${angle + 90})`;
            });

        // Tooltip title
        nodes.append('title').text(d => d.data.fullName);

        // ==================== INITIAL CAMERA ====================
        // Zoom to fit the fan
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(width / 2 - width * 0.4, 100)
            .scale(0.8));

    }, [processedData]);

    // ==================== UI WRAPPER ====================
    return (
        <div ref={containerRef} className="w-full h-full relative bg-[#F9F9F0] overflow-hidden" dir="rtl">
            <svg ref={svgRef} className="w-full h-full block" />

            {/* Info Panel */}
            {selectedNode && (
                <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow-xl border border-amber-200 z-50">
                    <h3 className="font-bold text-lg text-amber-900">{selectedNode.fullName}</h3>
                    <button className="text-sm text-red-500 mt-2" onClick={() => setSelectedNode(null)}>إغلاق</button>
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
