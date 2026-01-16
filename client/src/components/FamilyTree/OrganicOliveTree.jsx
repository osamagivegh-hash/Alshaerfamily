/**
 * شجرة الزيتون العضوية - الإصدار المحسن
 * Organic Olive Tree - Enhanced Version
 * 
 * تصميم فني يطابق الصورة المرجعية
 * - شكل دائري للتاج
 * - كثافة عالية للأوراق
 * - بدون اهتزاز (قيم ثابتة)
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

// ==================== SEEDED RANDOM ====================
// لمنع الاهتزاز - نستخدم random ثابت مبني على seed
const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// ==================== CONFIGURATION ====================
const CONFIG = {
    colors: {
        trunk: {
            base: '#5D4037',
            light: '#795548',
            dark: '#3E2723'
        },
        branch: {
            main: '#6D4C41',
            secondary: '#8D6E63'
        },
        leaf: {
            colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784']
        },
        gold: '#FFD54F',
        frame: '#C4A962'
    }
};

const OrganicOliveTree = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 900 });
    const [transform, setTransform] = useState({ k: 1 });
    const [selectedNode, setSelectedNode] = useState(null);

    // Process data with stable random values
    const processedData = useMemo(() => {
        if (!data) return null;

        const root = d3.hierarchy(data);
        const allNodes = root.descendants();
        const maxDepth = d3.max(allNodes, d => d.depth);

        // Generate stable random values for each node
        allNodes.forEach((node, index) => {
            node.seed = index + 1;
            node.randomAngle = seededRandom(node.seed * 1.1) * 360;
            node.randomOffset = seededRandom(node.seed * 2.2) * 20 - 10;
            node.leafVariation = seededRandom(node.seed * 3.3);
        });

        return { root, allNodes, maxDepth, totalCount: allNodes.length };
    }, [data]);

    // Calculate circular positions for nodes
    const calculateCircularLayout = useCallback((root, centerX, centerY, radius) => {
        if (!root) return new Map();

        const nodePositions = new Map();
        const allNodes = root.descendants();
        const maxDepth = d3.max(allNodes, d => d.depth) || 1;

        // Root at center bottom of canopy
        nodePositions.set(root, {
            x: centerX,
            y: centerY + radius * 0.4,
            depth: 0
        });

        // Process each generation level
        const processGeneration = (nodes, generation, parentAngleStart, parentAngleEnd) => {
            if (!nodes || nodes.length === 0) return;

            const angleRange = parentAngleEnd - parentAngleStart;
            const angleStep = angleRange / nodes.length;

            nodes.forEach((node, index) => {
                // Calculate angle for this node
                const baseAngle = parentAngleStart + angleStep * (index + 0.5);
                const angleOffset = (seededRandom(node.seed * 5) - 0.5) * angleStep * 0.3;
                const angle = baseAngle + angleOffset;

                // Calculate radius based on generation (outer = later generations)
                const radiusFactor = 0.2 + (generation / maxDepth) * 0.8;
                const nodeRadius = radius * radiusFactor;

                // Add some variation to radius
                const radiusVariation = seededRandom(node.seed * 7) * 30 - 15;

                // Calculate x, y (angle from top, going around)
                const x = centerX + Math.sin(angle) * (nodeRadius + radiusVariation);
                const y = centerY - Math.cos(angle) * (nodeRadius + radiusVariation) * 0.9;

                nodePositions.set(node, {
                    x,
                    y,
                    angle,
                    radius: nodeRadius,
                    depth: generation
                });

                // Process children
                if (node.children && node.children.length > 0) {
                    const childSpread = angleStep * 0.9;
                    processGeneration(
                        node.children,
                        generation + 1,
                        angle - childSpread / 2,
                        angle + childSpread / 2
                    );
                }
            });
        };

        // Start processing from root's children
        if (root.children) {
            // Distribute main branches across the top arc
            processGeneration(root.children, 1, -Math.PI * 0.85, Math.PI * 0.85);
        }

        return nodePositions;
    }, []);

    // Main rendering effect
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !processedData) return;

        const { root, allNodes, maxDepth, totalCount } = processedData;

        // Update dimensions
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(rect.width || 1000, 900);
        const height = Math.max(rect.height || 900, 800);
        setDimensions({ width, height });

        const centerX = width / 2;
        const centerY = height / 2 + 50;
        const canopyRadius = Math.min(width, height) * 0.38;

        // Clear SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Setup SVG
        svg.attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // ==================== DEFINITIONS ====================
        const defs = svg.append('defs');

        // Trunk gradient
        const trunkGrad = defs.append('linearGradient')
            .attr('id', 'trunkGrad')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '0%');
        trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', CONFIG.colors.trunk.light);
        trunkGrad.append('stop').attr('offset', '50%').attr('stop-color', CONFIG.colors.trunk.base);
        trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', CONFIG.colors.trunk.dark);

        // Leaf gradients
        CONFIG.colors.leaf.colors.forEach((color, i) => {
            const grad = defs.append('radialGradient')
                .attr('id', `leafGrad${i}`)
                .attr('cx', '30%').attr('cy', '30%').attr('r', '70%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', d3.color(color).brighter(0.5));
            grad.append('stop').attr('offset', '100%').attr('stop-color', color);
        });

        // Gold gradient
        const goldGrad = defs.append('radialGradient')
            .attr('id', 'goldGrad')
            .attr('cx', '30%').attr('cy', '30%').attr('r', '70%');
        goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FFE082');
        goldGrad.append('stop').attr('offset', '50%').attr('stop-color', '#FFD54F');
        goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#FFC107');

        // ==================== MAIN GROUP ====================
        const mainGroup = svg.append('g').attr('class', 'main-group');

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.3, 4])
            .on('zoom', (event) => {
                mainGroup.attr('transform', event.transform);
                setTransform({ k: event.transform.k });
            });

        svg.call(zoom);

        // ==================== DRAW FRAME ====================
        const frameGroup = mainGroup.append('g').attr('class', 'frame');

        // Decorative frame
        frameGroup.append('rect')
            .attr('x', 15).attr('y', 15)
            .attr('width', width - 30).attr('height', height - 30)
            .attr('fill', 'none')
            .attr('stroke', CONFIG.colors.frame)
            .attr('stroke-width', 2)
            .attr('rx', 10);

        // Corner decorations
        [[20, 20, 0], [width - 20, 20, 90], [width - 20, height - 20, 180], [20, height - 20, 270]].forEach(([x, y, r]) => {
            frameGroup.append('path')
                .attr('d', 'M 0 25 Q 0 0 25 0')
                .attr('fill', 'none')
                .attr('stroke', CONFIG.colors.frame)
                .attr('stroke-width', 2)
                .attr('transform', `translate(${x}, ${y}) rotate(${r})`);
        });

        // ==================== CALCULATE POSITIONS ====================
        const nodePositions = calculateCircularLayout(root, centerX, centerY, canopyRadius);

        // ==================== DRAW CANOPY OUTLINE ====================
        mainGroup.append('ellipse')
            .attr('cx', centerX)
            .attr('cy', centerY - canopyRadius * 0.1)
            .attr('rx', canopyRadius * 1.05)
            .attr('ry', canopyRadius * 0.95)
            .attr('fill', 'none')
            .attr('stroke', '#2E7D32')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0.2);

        // ==================== DRAW TRUNK ====================
        const trunkGroup = mainGroup.append('g').attr('class', 'trunk');

        const trunkTop = centerY + canopyRadius * 0.35;
        const trunkBottom = height - 80;
        const trunkWidth = 35;

        // Main trunk path
        trunkGroup.append('path')
            .attr('d', `
                M ${centerX - trunkWidth} ${trunkBottom}
                Q ${centerX - trunkWidth * 1.1} ${(trunkTop + trunkBottom) / 2} ${centerX - trunkWidth * 0.4} ${trunkTop}
                Q ${centerX - trunkWidth * 0.1} ${trunkTop - 20} ${centerX} ${trunkTop - 30}
                Q ${centerX + trunkWidth * 0.1} ${trunkTop - 20} ${centerX + trunkWidth * 0.4} ${trunkTop}
                Q ${centerX + trunkWidth * 1.1} ${(trunkTop + trunkBottom) / 2} ${centerX + trunkWidth} ${trunkBottom}
                L ${centerX - trunkWidth} ${trunkBottom}
                Z
            `)
            .attr('fill', 'url(#trunkGrad)')
            .attr('stroke', CONFIG.colors.trunk.dark)
            .attr('stroke-width', 1);

        // Trunk texture
        for (let i = 0; i < 6; i++) {
            const y = trunkTop + 30 + i * 25;
            const curve = seededRandom(i * 100) * 8 - 4;
            trunkGroup.append('path')
                .attr('d', `M ${centerX - trunkWidth * 0.6} ${y} Q ${centerX + curve} ${y + 3} ${centerX + trunkWidth * 0.6} ${y}`)
                .attr('fill', 'none')
                .attr('stroke', CONFIG.colors.trunk.dark)
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.25);
        }

        // ==================== DRAW BRANCHES ====================
        const branchGroup = mainGroup.append('g').attr('class', 'branches');

        // Draw branches from parent to child
        allNodes.forEach(node => {
            if (!node.parent) return;

            const parentPos = nodePositions.get(node.parent);
            const childPos = nodePositions.get(node);
            if (!parentPos || !childPos) return;

            // Calculate thickness based on depth
            const thickness = Math.max(1.5, 7 - node.depth * 1.2);
            const color = node.depth <= 2 ? CONFIG.colors.branch.main : CONFIG.colors.branch.secondary;

            // Create smooth curve
            const midX = (parentPos.x + childPos.x) / 2;
            const midY = (parentPos.y + childPos.y) / 2;
            const curveOffset = seededRandom(node.seed * 10) * 15 - 7.5;

            branchGroup.append('path')
                .attr('d', `M ${parentPos.x} ${parentPos.y} Q ${midX + curveOffset} ${midY + curveOffset} ${childPos.x} ${childPos.y}`)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', thickness)
                .attr('stroke-linecap', 'round')
                .attr('opacity', 0.9);
        });

        // Connect trunk to main branches
        if (root.children) {
            const trunkTopPos = { x: centerX, y: trunkTop - 30 };
            root.children.forEach(child => {
                const childPos = nodePositions.get(child);
                if (childPos) {
                    const midY = (trunkTopPos.y + childPos.y) / 2;
                    branchGroup.append('path')
                        .attr('d', `M ${trunkTopPos.x} ${trunkTopPos.y} Q ${trunkTopPos.x} ${midY} ${childPos.x} ${childPos.y}`)
                        .attr('fill', 'none')
                        .attr('stroke', CONFIG.colors.branch.main)
                        .attr('stroke-width', 6)
                        .attr('stroke-linecap', 'round');
                }
            });
        }

        // ==================== DRAW LEAVES ====================
        const leavesGroup = mainGroup.append('g').attr('class', 'leaves');

        allNodes.forEach((node, nodeIndex) => {
            const pos = nodePositions.get(node);
            if (!pos) return;

            const leafGroup = leavesGroup.append('g')
                .attr('transform', `translate(${pos.x}, ${pos.y})`)
                .style('cursor', 'pointer')
                .on('click', (event) => {
                    event.stopPropagation();
                    setSelectedNode(node.data);
                    if (onNodeClick) onNodeClick(node.data);
                });

            if (node.depth === 0) {
                // Root - Golden circle at trunk
                leafGroup.append('circle')
                    .attr('r', 18)
                    .attr('fill', 'url(#goldGrad)')
                    .attr('stroke', '#FF8F00')
                    .attr('stroke-width', 2);

                leafGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 5)
                    .attr('font-size', '14px')
                    .text('👑');

            } else {
                // Regular leaves
                const isMainBranch = node.depth <= 1;
                const numLeaves = isMainBranch ? 3 : (node.children ? 2 : 1);

                for (let i = 0; i < numLeaves; i++) {
                    const leafAngle = node.randomAngle + i * 40 - 20;
                    const leafScale = isMainBranch ? 1.3 : (0.7 + seededRandom(node.seed * 20 + i) * 0.4);
                    const colorIndex = Math.floor(seededRandom(node.seed * 30 + i) * CONFIG.colors.leaf.colors.length);

                    // Leaf shape (olive leaf)
                    const leafWidth = 10 * leafScale;
                    const leafHeight = 4 * leafScale;

                    leafGroup.append('ellipse')
                        .attr('rx', leafWidth)
                        .attr('ry', leafHeight)
                        .attr('fill', `url(#leafGrad${colorIndex})`)
                        .attr('stroke', '#1B5E20')
                        .attr('stroke-width', 0.3)
                        .attr('transform', `rotate(${leafAngle})`)
                        .attr('opacity', 0.92);

                    // Leaf vein
                    leafGroup.append('line')
                        .attr('x1', -leafWidth * 0.7)
                        .attr('y1', 0)
                        .attr('x2', leafWidth * 0.7)
                        .attr('y2', 0)
                        .attr('stroke', '#1B5E20')
                        .attr('stroke-width', 0.3)
                        .attr('opacity', 0.4)
                        .attr('transform', `rotate(${leafAngle})`);
                }

                // Add olive fruit for some leaf nodes
                if (!node.children && seededRandom(node.seed * 50) > 0.6) {
                    const fruitAngle = node.randomAngle + 60;
                    leafGroup.append('ellipse')
                        .attr('cx', 12)
                        .attr('cy', 0)
                        .attr('rx', 3)
                        .attr('ry', 5)
                        .attr('fill', seededRandom(node.seed * 60) > 0.5 ? '#556B2F' : '#6B8E23')
                        .attr('stroke', '#333')
                        .attr('stroke-width', 0.3)
                        .attr('transform', `rotate(${fruitAngle})`);
                }
            }

            // Tooltip
            leafGroup.append('title')
                .text(node.data.fullName || 'غير معروف');
        });

        // ==================== DRAW NAME LABELS ====================
        const labelsGroup = mainGroup.append('g').attr('class', 'labels');

        // Only show names for first 3 generations to avoid clutter
        allNodes.filter(n => n.depth <= 2).forEach((node, index) => {
            const pos = nodePositions.get(node);
            if (!pos) return;

            const name = node.data.fullName || '';
            if (!name) return;

            labelsGroup.append('text')
                .attr('x', pos.x)
                .attr('y', pos.y + (node.depth === 0 ? 35 : 18))
                .attr('text-anchor', 'middle')
                .attr('font-family', "'Cairo', 'Tajawal', sans-serif")
                .attr('font-size', node.depth === 0 ? '14px' : '9px')
                .attr('font-weight', node.depth <= 1 ? 'bold' : 'normal')
                .attr('fill', node.depth === 0 ? CONFIG.colors.trunk.base : '#2E7D32')
                .attr('paint-order', 'stroke')
                .attr('stroke', 'white')
                .attr('stroke-width', '2px')
                .text(name.length > 15 ? name.substring(0, 12) + '...' : name);
        });

        // ==================== TITLE & STATS ====================
        const titleGroup = mainGroup.append('g').attr('class', 'title-group');

        // Family name
        titleGroup.append('text')
            .attr('x', centerX)
            .attr('y', height - 35)
            .attr('text-anchor', 'middle')
            .attr('font-family', "'Cairo', sans-serif")
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('fill', '#2E7D32')
            .text(root.data.fullName || 'عائلة الشاعر');

        // Count
        titleGroup.append('text')
            .attr('x', centerX)
            .attr('y', height - 12)
            .attr('text-anchor', 'middle')
            .attr('font-family', "'Cairo', sans-serif")
            .attr('font-size', '14px')
            .attr('fill', '#5D4037')
            .text(`${totalCount} اسم تقريباً`);

        // ==================== INITIAL TRANSFORM ====================
        const scale = 0.9;
        const tx = (width - width * scale) / 2;
        const ty = (height - height * scale) / 2;
        svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

    }, [processedData, calculateCircularLayout, onNodeClick]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">لا توجد بيانات</p>
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
                background: 'linear-gradient(180deg, #FFFFF8 0%, #F5F5DC 30%, #FFFEF0 70%, #F5F5DC 100%)',
                ...style
            }}
        >
            {/* Title */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
                <h1
                    className="text-2xl md:text-3xl font-bold text-green-800"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                    🌳 شجرة أنساب عائلة الشاعر 🌳
                </h1>
                <p className="text-sm text-amber-700">
                    {processedData?.totalCount || 0} فرد • {(processedData?.maxDepth || 0) + 1} أجيال
                </p>
            </div>

            {/* Legend */}
            <div
                className="absolute top-20 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-sm"
                style={{ borderColor: CONFIG.colors.frame, borderWidth: 2 }}
            >
                <h3 className="font-bold mb-2 text-green-800 border-b pb-1">دليل الشجرة</h3>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500"></span>
                        <span>الجد المؤسس</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-2.5 rounded-full bg-green-600"></span>
                        <span>أفراد العائلة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-3.5 rounded-full bg-olive-600" style={{ backgroundColor: '#556B2F' }}></span>
                        <span>زيتون (أحفاد)</span>
                    </div>
                </div>
            </div>

            {/* SVG */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block', minHeight: '90vh', fontFamily: "'Cairo', sans-serif" }}
            />

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-green-800/90 backdrop-blur-sm rounded-full px-5 py-2 text-white text-xs shadow-lg flex items-center gap-3">
                <span>🔍 عجلة الماوس للتكبير</span>
                <span className="w-px h-3 bg-white/30"></span>
                <span>✋ اسحب للتنقل</span>
                <span className="w-px h-3 bg-white/30"></span>
                <span>👆 اضغط للتفاصيل</span>
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 z-20 bg-white/90 rounded-lg px-3 py-1 text-xs shadow text-amber-700">
                {Math.round(transform.k * 100)}%
            </div>

            {/* Selected node info */}
            {selectedNode && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-xl shadow-2xl p-4 max-w-sm border-2 border-green-600">
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                    <h3 className="text-lg font-bold text-green-800 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {selectedNode.fullName}
                    </h3>
                    {selectedNode.generation && (
                        <p className="text-sm text-gray-600">الجيل: {selectedNode.generation}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
