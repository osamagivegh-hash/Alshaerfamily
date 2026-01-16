/**
 * شجرة الزيتون العضوية - الإصدار المتقدم
 * Organic Olive Tree Visualization - Premium Edition
 * 
 * تصميم فني رقمي يحاكي شجرة الزيتون الحقيقية
 * كل ورقة تمثل فرداً من العائلة
 * 
 * الخوارزميات المستخدمة:
 * 1. خوارزمية النمو الشعاعي (Radial Growth Algorithm)
 * 2. خوارزمية كشف التصادم (Collision Detection)
 * 3. خوارزمية توزيع الأوراق العشوائي المتحكم (Controlled Random Leaf Distribution)
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

// ==================== CONSTANTS & CONFIGURATION ====================
const CONFIG = {
    // Trunk & Branch Colors (Olive-inspired palette)
    colors: {
        trunk: {
            base: '#5D4037',
            light: '#795548',
            dark: '#3E2723',
            stroke: '#4E342E'
        },
        branch: {
            main: '#6D4C41',
            secondary: '#8D6E63',
            tertiary: '#A1887F'
        },
        leaf: {
            dark: '#1B5E20',
            medium: '#2E7D32',
            light: '#388E3C',
            pale: '#4CAF50',
            highlight: '#66BB6A',
            olive: '#556B2F'
        },
        fruit: {
            unripe: '#6B8E23',
            ripe: '#556B2F',
            black: '#2F4F4F'
        },
        background: '#FFFFF8',
        frame: '#C4A962',
        text: {
            primary: '#2E7D32',
            secondary: '#5D4037',
            light: '#FFFFFF'
        }
    },
    // Tree Structure
    tree: {
        canopyRadius: 380,
        trunkHeight: 120,
        trunkWidth: 50,
        branchSpread: 0.85,
        leafDensity: 0.92,
        minBranchAngle: 15,
        maxBranchAngle: 75
    },
    // Typography
    typography: {
        fontFamily: "'Cairo', 'Tajawal', 'Amiri', sans-serif",
        leafFontSize: 6,
        branchFontSize: 8,
        titleFontSize: 24
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a smooth Bezier curve path between two points with organic variation
 */
const generateOrganicPath = (x1, y1, x2, y2, curvature = 0.3, variation = 0.1) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Add natural variation
    const varX = (Math.random() - 0.5) * length * variation;
    const varY = (Math.random() - 0.5) * length * variation;

    // Control points for organic curve
    const cx1 = x1 + dx * curvature + varX;
    const cy1 = y1 + dy * 0.2 + varY;
    const cx2 = x1 + dx * (1 - curvature) - varX;
    const cy2 = y2 - dy * 0.2 - varY;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};

/**
 * Calculate leaf shape path (olive leaf)
 */
const generateLeafPath = (size = 1) => {
    const w = 8 * size;
    const h = 4 * size;
    return `
        M 0 0
        Q ${w * 0.3} ${-h * 0.5} ${w * 0.5} ${-h * 0.3}
        Q ${w * 0.8} 0 ${w} 0
        Q ${w * 0.8} 0 ${w * 0.5} ${h * 0.3}
        Q ${w * 0.3} ${h * 0.5} 0 0
        Z
    `;
};

/**
 * Collision detection between points
 */
const checkCollision = (x1, y1, x2, y2, minDistance) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy) < minDistance;
};

/**
 * Generate positions avoiding collisions
 */
const generateNonCollidingPosition = (existingPositions, centerX, centerY, radius, minDistance, maxAttempts = 50) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const r = radius * (0.3 + Math.random() * 0.7);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        let collision = false;
        for (const pos of existingPositions) {
            if (checkCollision(x, y, pos.x, pos.y, minDistance)) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            return { x, y, angle };
        }
    }

    // Fallback: return with slight offset
    const angle = Math.random() * Math.PI * 2;
    return {
        x: centerX + Math.cos(angle) * radius * 0.5,
        y: centerY + Math.sin(angle) * radius * 0.5,
        angle
    };
};

// ==================== MAIN COMPONENT ====================

const OrganicOliveTree = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const [selectedNode, setSelectedNode] = useState(null);
    const [stats, setStats] = useState({ total: 0, generations: 0 });

    // Process hierarchical data
    const processedData = useMemo(() => {
        if (!data) return null;

        const root = d3.hierarchy(data);
        const allNodes = root.descendants();
        const leaves = root.leaves();
        const maxDepth = d3.max(allNodes, d => d.depth);

        setStats({
            total: allNodes.length,
            generations: maxDepth + 1
        });

        return { root, allNodes, leaves, maxDepth };
    }, [data]);

    // Radial Growth Algorithm
    const calculatePositions = useCallback((root, canopyRadius, centerX, centerY) => {
        if (!root) return [];

        const positions = [];
        const nodePositions = new Map();

        // Root at trunk top
        nodePositions.set(root, {
            x: centerX,
            y: centerY + canopyRadius * 0.7,
            radius: 0,
            angle: -Math.PI / 2
        });

        // Process each level
        const processLevel = (nodes, parentRadius, angleStart, angleEnd) => {
            if (nodes.length === 0) return;

            const angleStep = (angleEnd - angleStart) / nodes.length;

            nodes.forEach((node, index) => {
                const parentPos = nodePositions.get(node.parent) || { x: centerX, y: centerY };
                const depth = node.depth;
                const maxDepth = processedData?.maxDepth || 6;

                // Calculate radius based on depth (outer = deeper generations)
                const radiusFactor = 0.15 + (depth / maxDepth) * 0.85;
                const nodeRadius = canopyRadius * radiusFactor;

                // Calculate angle with variation
                const baseAngle = angleStart + angleStep * (index + 0.5);
                const angleVariation = (Math.random() - 0.5) * angleStep * 0.3;
                const angle = baseAngle + angleVariation;

                // Calculate position
                const x = centerX + Math.cos(angle) * nodeRadius;
                const y = centerY + Math.sin(angle) * nodeRadius;

                // Apply slight randomization for organic feel
                const jitterX = (Math.random() - 0.5) * 15;
                const jitterY = (Math.random() - 0.5) * 15;

                const position = {
                    x: x + jitterX,
                    y: y + jitterY,
                    radius: nodeRadius,
                    angle,
                    depth,
                    data: node.data,
                    children: node.children,
                    parent: node.parent
                };

                nodePositions.set(node, position);
                positions.push({ node, position });

                // Recursively process children
                if (node.children && node.children.length > 0) {
                    const childAngleSpread = angleStep * 0.8;
                    const childAngleStart = angle - childAngleSpread / 2;
                    const childAngleEnd = angle + childAngleSpread / 2;
                    processLevel(node.children, nodeRadius, childAngleStart, childAngleEnd);
                }
            });
        };

        // Start from root's children
        if (root.children) {
            processLevel(root.children, 0, -Math.PI * 0.9, Math.PI * 0.1);
        }

        return { positions, nodePositions };
    }, [processedData]);

    // Main rendering effect
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !processedData) return;

        const { root, allNodes, maxDepth } = processedData;

        // Update dimensions
        const updateDimensions = () => {
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: Math.max(rect.width, 800),
                height: Math.max(rect.height, 800)
            });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        const { width, height } = dimensions;
        const centerX = width / 2;
        const centerY = height / 2 - 50;
        const canopyRadius = Math.min(width, height) * 0.4;

        // Clear and setup SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // ==================== SVG DEFINITIONS ====================
        const defs = svg.append('defs');

        // Trunk texture gradient
        const trunkGradient = defs.append('linearGradient')
            .attr('id', 'trunkTexture')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%');
        trunkGradient.append('stop').attr('offset', '0%').attr('stop-color', CONFIG.colors.trunk.light);
        trunkGradient.append('stop').attr('offset', '30%').attr('stop-color', CONFIG.colors.trunk.base);
        trunkGradient.append('stop').attr('offset', '70%').attr('stop-color', CONFIG.colors.trunk.dark);
        trunkGradient.append('stop').attr('offset', '100%').attr('stop-color', CONFIG.colors.trunk.base);

        // Leaf gradients
        const leafGradients = [
            { id: 'leaf1', colors: [CONFIG.colors.leaf.dark, CONFIG.colors.leaf.medium] },
            { id: 'leaf2', colors: [CONFIG.colors.leaf.medium, CONFIG.colors.leaf.light] },
            { id: 'leaf3', colors: [CONFIG.colors.leaf.light, CONFIG.colors.leaf.pale] },
            { id: 'leaf4', colors: [CONFIG.colors.leaf.olive, CONFIG.colors.leaf.dark] },
            { id: 'leaf5', colors: [CONFIG.colors.leaf.highlight, CONFIG.colors.leaf.medium] }
        ];

        leafGradients.forEach(({ id, colors }) => {
            const grad = defs.append('radialGradient')
                .attr('id', id)
                .attr('cx', '30%').attr('cy', '30%').attr('r', '70%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', colors[0]);
            grad.append('stop').attr('offset', '100%').attr('stop-color', colors[1]);
        });

        // Golden gradient for main ancestors
        const goldGrad = defs.append('radialGradient')
            .attr('id', 'goldLeaf')
            .attr('cx', '30%').attr('cy', '30%').attr('r', '70%');
        goldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FFE082');
        goldGrad.append('stop').attr('offset', '50%').attr('stop-color', '#FFD54F');
        goldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#FFC107');

        // Shadow filter
        const shadow = defs.append('filter')
            .attr('id', 'shadow')
            .attr('x', '-20%').attr('y', '-20%')
            .attr('width', '140%').attr('height', '140%');
        shadow.append('feDropShadow')
            .attr('dx', '0').attr('dy', '2')
            .attr('stdDeviation', '3')
            .attr('flood-color', 'rgba(0,0,0,0.2)');

        // ==================== MAIN GROUP WITH ZOOM ====================
        const mainGroup = svg.append('g').attr('class', 'main-group');

        const zoom = d3.zoom()
            .scaleExtent([0.3, 4])
            .on('zoom', (event) => {
                mainGroup.attr('transform', event.transform);
                setTransform(event.transform);
            });

        svg.call(zoom);

        // ==================== DRAW DECORATIVE FRAME ====================
        const frameGroup = mainGroup.append('g').attr('class', 'frame');

        // Outer decorative border
        frameGroup.append('rect')
            .attr('x', 20)
            .attr('y', 20)
            .attr('width', width - 40)
            .attr('height', height - 40)
            .attr('fill', 'none')
            .attr('stroke', CONFIG.colors.frame)
            .attr('stroke-width', 3)
            .attr('rx', 15);

        // Corner decorations
        const corners = [
            { x: 25, y: 25, rotate: 0 },
            { x: width - 25, y: 25, rotate: 90 },
            { x: width - 25, y: height - 25, rotate: 180 },
            { x: 25, y: height - 25, rotate: 270 }
        ];

        corners.forEach(({ x, y, rotate }) => {
            frameGroup.append('path')
                .attr('d', 'M 0 30 Q 0 0 30 0')
                .attr('fill', 'none')
                .attr('stroke', CONFIG.colors.frame)
                .attr('stroke-width', 2)
                .attr('transform', `translate(${x}, ${y}) rotate(${rotate})`);
        });

        // ==================== CALCULATE NODE POSITIONS ====================
        const { positions, nodePositions } = calculatePositions(root, canopyRadius, centerX, centerY);

        // ==================== DRAW TRUNK ====================
        const trunkGroup = mainGroup.append('g').attr('class', 'trunk');

        const trunkTop = centerY + canopyRadius * 0.3;
        const trunkBottom = centerY + canopyRadius * 0.9;
        const trunkWidth = CONFIG.tree.trunkWidth;

        // Main trunk shape
        trunkGroup.append('path')
            .attr('d', `
                M ${centerX - trunkWidth * 0.5} ${trunkBottom}
                Q ${centerX - trunkWidth * 0.6} ${trunkTop + 60} ${centerX - trunkWidth * 0.3} ${trunkTop + 20}
                Q ${centerX - trunkWidth * 0.1} ${trunkTop} ${centerX} ${trunkTop - 10}
                Q ${centerX + trunkWidth * 0.1} ${trunkTop} ${centerX + trunkWidth * 0.3} ${trunkTop + 20}
                Q ${centerX + trunkWidth * 0.6} ${trunkTop + 60} ${centerX + trunkWidth * 0.5} ${trunkBottom}
                Q ${centerX + trunkWidth * 0.3} ${trunkBottom + 20} ${centerX} ${trunkBottom + 30}
                Q ${centerX - trunkWidth * 0.3} ${trunkBottom + 20} ${centerX - trunkWidth * 0.5} ${trunkBottom}
                Z
            `)
            .attr('fill', 'url(#trunkTexture)')
            .attr('stroke', CONFIG.colors.trunk.stroke)
            .attr('stroke-width', 2);

        // Trunk texture lines
        for (let i = 0; i < 8; i++) {
            const startY = trunkTop + 30 + i * 15;
            const curveX = (Math.random() - 0.5) * 10;
            trunkGroup.append('path')
                .attr('d', `M ${centerX - trunkWidth * 0.3 + curveX} ${startY} 
                           Q ${centerX} ${startY + 5} 
                             ${centerX + trunkWidth * 0.3 - curveX} ${startY}`)
                .attr('fill', 'none')
                .attr('stroke', CONFIG.colors.trunk.dark)
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.3);
        }

        // ==================== DRAW BRANCHES ====================
        const branchGroup = mainGroup.append('g').attr('class', 'branches');

        // Draw branches from parent to children
        const drawBranch = (parentPos, childPos, depth) => {
            const thickness = Math.max(1, 8 - depth * 1.2);
            const color = depth <= 1 ? CONFIG.colors.branch.main :
                depth <= 3 ? CONFIG.colors.branch.secondary :
                    CONFIG.colors.branch.tertiary;

            // Create organic curve
            const path = generateOrganicPath(
                parentPos.x, parentPos.y,
                childPos.x, childPos.y,
                0.3 + Math.random() * 0.2,
                0.1
            );

            branchGroup.append('path')
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', thickness)
                .attr('stroke-linecap', 'round')
                .attr('opacity', 0.85);
        };

        // Draw all branches
        positions.forEach(({ node, position }) => {
            if (node.parent) {
                const parentPos = nodePositions.get(node.parent);
                if (parentPos) {
                    drawBranch(parentPos, position, node.depth);
                }
            }
        });

        // Connect trunk to first level branches
        if (root.children) {
            root.children.forEach(child => {
                const childPos = nodePositions.get(child);
                if (childPos) {
                    const trunkTopPos = { x: centerX, y: trunkTop };
                    drawBranch(trunkTopPos, childPos, 0);
                }
            });
        }

        // ==================== DRAW LEAVES ====================
        const leavesGroup = mainGroup.append('g').attr('class', 'leaves');

        positions.forEach(({ node, position }, index) => {
            const depth = node.depth;
            const isLeaf = !node.children || node.children.length === 0;
            const isMainAncestor = depth <= 1;

            // Leaf group
            const leafGroup = leavesGroup.append('g')
                .attr('class', `leaf depth-${depth}`)
                .attr('transform', `translate(${position.x}, ${position.y})`)
                .style('cursor', 'pointer')
                .on('click', (event) => {
                    event.stopPropagation();
                    setSelectedNode(node.data);
                    if (onNodeClick) onNodeClick(node.data);
                });

            // Determine leaf appearance
            const leafRotation = position.angle * (180 / Math.PI) + (Math.random() - 0.5) * 30;
            const leafSize = isMainAncestor ? 1.5 : (isLeaf ? 0.8 : 1.0);
            const gradientId = isMainAncestor ? 'goldLeaf' : `leaf${(index % 5) + 1}`;

            if (depth === 0) {
                // Root - special golden circle
                leafGroup.append('circle')
                    .attr('r', 20)
                    .attr('fill', 'url(#goldLeaf)')
                    .attr('stroke', '#FFB300')
                    .attr('stroke-width', 2)
                    .attr('filter', 'url(#shadow)');

                leafGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 5)
                    .attr('font-size', '16px')
                    .text('👑');

            } else {
                // Regular leaves
                const numLeaves = isLeaf ? 1 : Math.min(3, Math.floor(Math.random() * 2) + 1);

                for (let i = 0; i < numLeaves; i++) {
                    const angleOffset = (i - (numLeaves - 1) / 2) * 25;
                    const leafPath = generateLeafPath(leafSize);

                    leafGroup.append('path')
                        .attr('d', leafPath)
                        .attr('fill', `url(#${gradientId})`)
                        .attr('stroke', CONFIG.colors.leaf.dark)
                        .attr('stroke-width', 0.3)
                        .attr('transform', `rotate(${leafRotation + angleOffset}) translate(-4, 0)`)
                        .attr('opacity', 0.9);

                    // Leaf vein
                    leafGroup.append('line')
                        .attr('x1', -3 * leafSize)
                        .attr('y1', 0)
                        .attr('x2', 5 * leafSize)
                        .attr('y2', 0)
                        .attr('stroke', CONFIG.colors.leaf.dark)
                        .attr('stroke-width', 0.3)
                        .attr('opacity', 0.4)
                        .attr('transform', `rotate(${leafRotation + angleOffset})`);
                }

                // Add olive fruit occasionally
                if (isLeaf && Math.random() > 0.7) {
                    const fruitColor = Math.random() > 0.5 ? CONFIG.colors.fruit.ripe : CONFIG.colors.fruit.unripe;
                    leafGroup.append('ellipse')
                        .attr('cx', 10 + Math.random() * 5)
                        .attr('cy', Math.random() * 10 - 5)
                        .attr('rx', 3)
                        .attr('ry', 5)
                        .attr('fill', fruitColor)
                        .attr('stroke', '#333')
                        .attr('stroke-width', 0.3)
                        .attr('transform', `rotate(${leafRotation + 30})`);
                }
            }

            // Add name as tooltip
            leafGroup.append('title')
                .text(node.data.fullName || 'غير معروف');
        });

        // ==================== DRAW NAMES ON BRANCHES (textPath) ====================
        const textGroup = mainGroup.append('g').attr('class', 'branch-labels');

        // Add names for main ancestors on curved paths
        positions.filter(({ node }) => node.depth <= 2).forEach(({ node, position }, index) => {
            const name = node.data.fullName || '';
            if (!name) return;

            // Create curved path for text
            const pathId = `textPath-${index}`;
            const startX = position.x - 30;
            const startY = position.y + 15;
            const endX = position.x + 30;
            const endY = position.y + 10;

            defs.append('path')
                .attr('id', pathId)
                .attr('d', `M ${startX} ${startY} Q ${position.x} ${position.y + 25} ${endX} ${endY}`);

            textGroup.append('text')
                .attr('font-family', CONFIG.typography.fontFamily)
                .attr('font-size', node.depth === 0 ? 12 : 8)
                .attr('fill', node.depth === 0 ? CONFIG.colors.text.secondary : CONFIG.colors.text.primary)
                .attr('font-weight', 'bold')
                .append('textPath')
                .attr('href', `#${pathId}`)
                .attr('startOffset', '50%')
                .attr('text-anchor', 'middle')
                .text(name);
        });

        // ==================== TITLE & STATS ====================
        const titleGroup = mainGroup.append('g').attr('class', 'title');

        // Family name at trunk
        titleGroup.append('text')
            .attr('x', centerX)
            .attr('y', trunkBottom + 60)
            .attr('text-anchor', 'middle')
            .attr('font-family', CONFIG.typography.fontFamily)
            .attr('font-size', '22px')
            .attr('font-weight', 'bold')
            .attr('fill', CONFIG.colors.text.primary)
            .text(root.data.fullName || 'عائلة الشاعر');

        // Member count
        titleGroup.append('text')
            .attr('x', centerX)
            .attr('y', trunkBottom + 85)
            .attr('text-anchor', 'middle')
            .attr('font-family', CONFIG.typography.fontFamily)
            .attr('font-size', '16px')
            .attr('fill', CONFIG.colors.text.secondary)
            .text(`${stats.total} اسم تقريباً`);

        // ==================== INITIAL TRANSFORM ====================
        const initialScale = 0.85;
        const initialTransform = d3.zoomIdentity
            .translate((width - width * initialScale) / 2, (height - height * initialScale) / 2 + 30)
            .scale(initialScale);

        svg.call(zoom.transform, initialTransform);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [processedData, dimensions, calculatePositions, onNodeClick, stats]);

    // ==================== RENDER ====================
    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden ${className}`}
            dir="rtl"
            style={{
                minHeight: '90vh',
                height: '100%',
                background: `linear-gradient(180deg, 
                    #FFFFF8 0%, 
                    #F5F5DC 20%, 
                    #FFFEF0 50%, 
                    #F5F5DC 80%, 
                    #FFFFF8 100%)`,
                ...style
            }}
        >
            {/* Header with title */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{
                        fontFamily: CONFIG.typography.fontFamily,
                        color: CONFIG.colors.text.primary
                    }}
                >
                    🌳 شجرة أنساب عائلة الشاعر 🌳
                </h1>
                <p
                    className="text-sm md:text-base"
                    style={{ color: CONFIG.colors.text.secondary }}
                >
                    {stats.total} فرد في {stats.generations} أجيال
                </p>
            </div>

            {/* Legend */}
            <div
                className="absolute top-20 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2"
                style={{ borderColor: CONFIG.colors.frame }}
            >
                <h3
                    className="font-bold mb-3 pb-2 border-b"
                    style={{
                        fontFamily: CONFIG.typography.fontFamily,
                        color: CONFIG.colors.text.primary,
                        borderColor: CONFIG.colors.frame
                    }}
                >
                    دليل الشجرة
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-500 shadow"></span>
                        <span>الجد المؤسس</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="w-5 h-3 rounded-full"
                            style={{ backgroundColor: CONFIG.colors.leaf.medium }}
                        ></span>
                        <span>أفراد العائلة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="w-3 h-4 rounded-full"
                            style={{ backgroundColor: CONFIG.colors.fruit.ripe }}
                        ></span>
                        <span>زيتون (أحفاد)</span>
                    </div>
                </div>
            </div>

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio="xMidYMid meet"
                style={{
                    display: 'block',
                    minHeight: '90vh',
                    fontFamily: CONFIG.typography.fontFamily
                }}
            />

            {/* Controls */}
            <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 
                           bg-green-800/90 backdrop-blur-sm rounded-full px-6 py-2 
                           text-white text-sm shadow-lg flex items-center gap-4"
            >
                <span>🔍 عجلة الماوس للتكبير</span>
                <span className="w-px h-4 bg-white/30"></span>
                <span>✋ اسحب للتنقل</span>
                <span className="w-px h-4 bg-white/30"></span>
                <span>👆 اضغط للتفاصيل</span>
            </div>

            {/* Zoom level indicator */}
            <div
                className="absolute bottom-4 right-4 z-20 bg-white/90 rounded-lg px-3 py-1 
                           text-sm shadow-md"
                style={{ color: CONFIG.colors.text.secondary }}
            >
                {Math.round(transform.k * 100)}%
            </div>

            {/* Selected node info panel */}
            {selectedNode && (
                <div
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 
                               bg-white rounded-2xl shadow-2xl p-6 max-w-md border-2"
                    style={{ borderColor: CONFIG.colors.leaf.medium }}
                >
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ✕
                    </button>
                    <h3
                        className="text-xl font-bold mb-2"
                        style={{
                            fontFamily: CONFIG.typography.fontFamily,
                            color: CONFIG.colors.text.primary
                        }}
                    >
                        {selectedNode.fullName}
                    </h3>
                    {selectedNode.generation && (
                        <p className="text-gray-600">الجيل: {selectedNode.generation}</p>
                    )}
                    {selectedNode.branch && (
                        <p className="text-gray-600">الفرع: {selectedNode.branch}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
