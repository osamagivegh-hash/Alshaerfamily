/**
 * شجرة الزيتون العضوية - الإصدار النهائي المحسن
 * Organic Olive Tree - Final Enhanced Version
 * 
 * التركيز على:
 * 1. منع التداخل بين الأوراق
 * 2. أسماء مقروءة على كل ورقة
 * 3. توزيع منظم ومنطقي
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ==================== SEEDED RANDOM (لمنع الاهتزاز) ====================
const seededRandom = (seed) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

// ==================== CONFIGURATION ====================
const COLORS = {
    trunk: '#5D4037',
    trunkLight: '#795548',
    trunkDark: '#3E2723',
    branch: '#6D4C41',
    branchLight: '#8D6E63',
    leafGreen: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50'],
    gold: '#FFD54F',
    goldDark: '#FF8F00',
    text: '#FFFFFF',
    textDark: '#1B5E20'
};

const OrganicOliveTree = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 1000 });
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedNode, setSelectedNode] = useState(null);

    // ==================== PROCESS DATA ====================
    const treeData = useMemo(() => {
        if (!data) return null;

        const root = d3.hierarchy(data);
        const allNodes = root.descendants();
        const maxDepth = d3.max(allNodes, d => d.depth) || 1;

        // Assign stable random values
        allNodes.forEach((node, i) => {
            node.stableRandom = seededRandom(i + 1);
            node.stableRandom2 = seededRandom((i + 1) * 7);
            node.stableRandom3 = seededRandom((i + 1) * 13);
        });

        return { root, allNodes, maxDepth, count: allNodes.length };
    }, [data]);

    // ==================== MAIN RENDER ====================
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !treeData) return;

        const { root, allNodes, maxDepth, count } = treeData;

        // Dimensions
        const container = containerRef.current.getBoundingClientRect();
        const width = Math.max(container.width || 1200, 1000);
        const height = Math.max(container.height || 1000, 900);
        setDimensions({ width, height });

        const centerX = width / 2;
        const centerY = height / 2;
        const treeRadius = Math.min(width, height) * 0.4;

        // Setup SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Defs
        const defs = svg.append('defs');

        // Trunk gradient
        const trunkGrad = defs.append('linearGradient')
            .attr('id', 'trunkGradient')
            .attr('x1', '0%').attr('x2', '100%');
        trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', COLORS.trunkLight);
        trunkGrad.append('stop').attr('offset', '50%').attr('stop-color', COLORS.trunk);
        trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', COLORS.trunkDark);

        // Leaf gradients
        COLORS.leafGreen.forEach((color, i) => {
            const grad = defs.append('radialGradient')
                .attr('id', `leaf${i}`)
                .attr('cx', '30%').attr('cy', '30%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', d3.color(color).brighter(0.3));
            grad.append('stop').attr('offset', '100%').attr('stop-color', color);
        });

        // Gold gradient
        const goldGrad = defs.append('radialGradient')
            .attr('id', 'goldGradient')
            .attr('cx', '30%').attr('cy', '30%');
        goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FFE082');
        goldGrad.append('stop').attr('offset', '100%').attr('stop-color', COLORS.gold);

        // Main group
        const mainGroup = svg.append('g').attr('class', 'tree-main');

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([0.3, 5])
            .on('zoom', (e) => {
                mainGroup.attr('transform', e.transform);
                setZoomLevel(Math.round(e.transform.k * 100));
            });
        svg.call(zoom);

        // ==================== LAYOUT CALCULATION ====================
        // Use D3 cluster layout for proper spacing
        const clusterLayout = d3.cluster()
            .size([360, treeRadius])
            .separation((a, b) => {
                // More separation for deeper nodes
                return (a.parent === b.parent ? 1 : 2) / a.depth;
            });

        clusterLayout(root);

        // Convert polar to cartesian
        const polarToCartesian = (angle, radius) => {
            const rad = (angle - 90) * Math.PI / 180;
            return {
                x: centerX + radius * Math.cos(rad),
                y: centerY + radius * Math.sin(rad)
            };
        };

        // Assign cartesian positions
        allNodes.forEach(node => {
            if (node.depth === 0) {
                node.pos = { x: centerX, y: centerY + treeRadius * 0.5 };
            } else {
                const radius = (node.depth / maxDepth) * treeRadius * 0.9;
                node.pos = polarToCartesian(node.x, radius);
            }
        });

        // ==================== COLLISION DETECTION & RESOLUTION ====================
        const minDistance = 45; // Minimum distance between nodes
        const resolveCollisions = (nodes, iterations = 50) => {
            for (let iter = 0; iter < iterations; iter++) {
                let moved = false;
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const a = nodes[i];
                        const b = nodes[j];
                        if (a.depth === 0 || b.depth === 0) continue;

                        const dx = b.pos.x - a.pos.x;
                        const dy = b.pos.y - a.pos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < minDistance && dist > 0) {
                            const overlap = (minDistance - dist) / 2;
                            const moveX = (dx / dist) * overlap;
                            const moveY = (dy / dist) * overlap;

                            a.pos.x -= moveX;
                            a.pos.y -= moveY;
                            b.pos.x += moveX;
                            b.pos.y += moveY;
                            moved = true;
                        }
                    }
                }
                if (!moved) break;
            }
        };

        resolveCollisions(allNodes);

        // ==================== DRAW DECORATIVE FRAME ====================
        const frameGroup = mainGroup.append('g').attr('class', 'frame');
        frameGroup.append('rect')
            .attr('x', 20).attr('y', 20)
            .attr('width', width - 40).attr('height', height - 40)
            .attr('fill', 'none')
            .attr('stroke', '#C4A962')
            .attr('stroke-width', 2)
            .attr('rx', 8);

        // ==================== DRAW TRUNK ====================
        const trunkGroup = mainGroup.append('g').attr('class', 'trunk');
        const trunkTop = centerY + treeRadius * 0.3;
        const trunkBottom = height - 60;
        const trunkW = 30;

        trunkGroup.append('path')
            .attr('d', `
                M ${centerX - trunkW} ${trunkBottom}
                Q ${centerX - trunkW * 1.2} ${(trunkTop + trunkBottom) / 2} ${centerX - trunkW * 0.3} ${trunkTop}
                L ${centerX} ${trunkTop - 20}
                L ${centerX + trunkW * 0.3} ${trunkTop}
                Q ${centerX + trunkW * 1.2} ${(trunkTop + trunkBottom) / 2} ${centerX + trunkW} ${trunkBottom}
                Z
            `)
            .attr('fill', 'url(#trunkGradient)')
            .attr('stroke', COLORS.trunkDark)
            .attr('stroke-width', 1);

        // ==================== DRAW BRANCHES ====================
        const branchGroup = mainGroup.append('g').attr('class', 'branches');

        // Link generator
        const linkGen = d3.linkRadial()
            .angle(d => d.x * Math.PI / 180)
            .radius(d => d.depth === 0 ? 0 : (d.depth / maxDepth) * treeRadius * 0.9);

        root.links().forEach(link => {
            const source = link.source;
            const target = link.target;

            // Branch thickness based on descendants
            const thickness = Math.max(1, 6 - target.depth * 0.8);

            // Draw curved branch
            const path = d3.path();

            if (source.depth === 0) {
                // From trunk top
                path.moveTo(centerX, trunkTop - 20);
                path.quadraticCurveTo(
                    (centerX + target.pos.x) / 2,
                    (trunkTop - 20 + target.pos.y) / 2 - 30,
                    target.pos.x,
                    target.pos.y
                );
            } else {
                // Between nodes
                path.moveTo(source.pos.x, source.pos.y);
                const midX = (source.pos.x + target.pos.x) / 2;
                const midY = (source.pos.y + target.pos.y) / 2;
                const offset = (target.stableRandom - 0.5) * 20;
                path.quadraticCurveTo(midX + offset, midY + offset, target.pos.x, target.pos.y);
            }

            branchGroup.append('path')
                .attr('d', path.toString())
                .attr('fill', 'none')
                .attr('stroke', target.depth <= 2 ? COLORS.branch : COLORS.branchLight)
                .attr('stroke-width', thickness)
                .attr('stroke-linecap', 'round')
                .attr('opacity', 0.85);
        });

        // ==================== DRAW LEAVES WITH NAMES ====================
        const leavesGroup = mainGroup.append('g').attr('class', 'leaves');

        allNodes.forEach((node, idx) => {
            const { x, y } = node.pos;
            const name = node.data.fullName || '';
            const isRoot = node.depth === 0;
            const isMainBranch = node.depth === 1;

            const leafG = leavesGroup.append('g')
                .attr('class', `leaf-node depth-${node.depth}`)
                .attr('transform', `translate(${x}, ${y})`)
                .style('cursor', 'pointer')
                .on('click', (event) => {
                    event.stopPropagation();
                    setSelectedNode(node.data);
                    if (onNodeClick) onNodeClick(node.data);
                });

            if (isRoot) {
                // Root: Golden circle with crown
                leafG.append('circle')
                    .attr('r', 25)
                    .attr('fill', 'url(#goldGradient)')
                    .attr('stroke', COLORS.goldDark)
                    .attr('stroke-width', 2);

                leafG.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 6)
                    .attr('font-size', '18px')
                    .text('👑');

                // Name below
                leafG.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', 40)
                    .attr('font-family', "'Cairo', sans-serif")
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .attr('fill', COLORS.textDark)
                    .text(name);

            } else {
                // Calculate leaf size based on name length
                const displayName = name.length > 10 ? name.substring(0, 8) + '..' : name;
                const leafWidth = Math.max(35, displayName.length * 5 + 15);
                const leafHeight = 18;

                // Leaf rotation based on position
                const angleToCenter = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
                const leafRotation = angleToCenter + 90 + (node.stableRandom2 - 0.5) * 20;

                // Leaf shape (ellipse)
                const colorIdx = Math.floor(node.stableRandom3 * COLORS.leafGreen.length);

                leafG.append('ellipse')
                    .attr('rx', leafWidth / 2)
                    .attr('ry', leafHeight / 2)
                    .attr('fill', `url(#leaf${colorIdx})`)
                    .attr('stroke', '#1B5E20')
                    .attr('stroke-width', 0.5)
                    .attr('transform', `rotate(${leafRotation})`);

                // Leaf vein
                leafG.append('line')
                    .attr('x1', -leafWidth / 2 + 5)
                    .attr('y1', 0)
                    .attr('x2', leafWidth / 2 - 5)
                    .attr('y2', 0)
                    .attr('stroke', '#1B5E20')
                    .attr('stroke-width', 0.5)
                    .attr('opacity', 0.4)
                    .attr('transform', `rotate(${leafRotation})`);

                // Name text ON the leaf (horizontal for readability)
                leafG.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-family', "'Cairo', 'Tajawal', sans-serif")
                    .attr('font-size', isMainBranch ? '9px' : '7px')
                    .attr('font-weight', isMainBranch ? 'bold' : 'normal')
                    .attr('fill', COLORS.text)
                    .attr('paint-order', 'stroke')
                    .attr('stroke', '#1B5E20')
                    .attr('stroke-width', '0.5px')
                    .text(displayName);

                // Tooltip for full name
                leafG.append('title').text(name);
            }
        });

        // ==================== TITLE & STATS ====================
        const titleG = mainGroup.append('g').attr('class', 'title');

        titleG.append('text')
            .attr('x', centerX)
            .attr('y', height - 30)
            .attr('text-anchor', 'middle')
            .attr('font-family', "'Cairo', sans-serif")
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('fill', COLORS.textDark)
            .text(root.data.fullName || 'عائلة الشاعر');

        titleG.append('text')
            .attr('x', centerX)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('font-family', "'Cairo', sans-serif")
            .attr('font-size', '12px')
            .attr('fill', COLORS.trunk)
            .text(`${count} اسم تقريباً`);

        // ==================== CANOPY OUTLINE ====================
        mainGroup.insert('ellipse', '.trunk')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('rx', treeRadius + 20)
            .attr('ry', treeRadius * 0.9 + 20)
            .attr('fill', 'none')
            .attr('stroke', '#2E7D32')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.15);

        // Initial zoom
        const initScale = 0.85;
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(width * (1 - initScale) / 2, height * (1 - initScale) / 2)
            .scale(initScale)
        );

    }, [treeData, onNodeClick]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <p className="text-gray-500 text-lg">لا توجد بيانات للعرض</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden ${className}`}
            dir="rtl"
            style={{
                minHeight: '90vh',
                background: 'linear-gradient(180deg, #FFFFF8 0%, #F5F5DC 50%, #FFFFF8 100%)',
                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                ...style
            }}
        >
            {/* Header */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-center">
                <h1 className="text-xl md:text-2xl font-bold text-green-800">
                    🌳 شجرة أنساب عائلة الشاعر 🌳
                </h1>
                <p className="text-xs text-amber-700">
                    {treeData?.count || 0} فرد • {(treeData?.maxDepth || 0) + 1} أجيال
                </p>
            </div>

            {/* Legend */}
            <div className="absolute top-16 right-3 z-20 bg-white/95 rounded-lg p-2 shadow text-xs border border-amber-300">
                <div className="font-bold text-green-800 border-b pb-1 mb-1">دليل الشجرة</div>
                <div className="flex items-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span>الجد المؤسس</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-2 rounded-full bg-green-600"></span>
                    <span>أفراد العائلة</span>
                </div>
            </div>

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block', minHeight: '90vh' }}
            />

            {/* Controls */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 bg-green-800/90 rounded-full px-4 py-1.5 text-white text-xs flex items-center gap-2">
                <span>🔍 تكبير</span>
                <span>•</span>
                <span>✋ تنقل</span>
                <span>•</span>
                <span>👆 تفاصيل</span>
            </div>

            {/* Zoom Level */}
            <div className="absolute bottom-3 right-3 z-20 bg-white/90 rounded px-2 py-1 text-xs text-amber-700">
                {zoomLevel}%
            </div>

            {/* Selected Node Panel */}
            {selectedNode && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-lg shadow-xl p-3 max-w-xs border-2 border-green-600">
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-1 left-1 text-gray-400 hover:text-gray-600 text-sm"
                    >
                        ✕
                    </button>
                    <h3 className="text-base font-bold text-green-800 pr-4">
                        {selectedNode.fullName}
                    </h3>
                    {selectedNode.generation && (
                        <p className="text-xs text-gray-600 mt-1">الجيل: {selectedNode.generation}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
