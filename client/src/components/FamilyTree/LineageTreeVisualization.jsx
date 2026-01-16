/**
 * شجرة الأنساب - النسخة المطابقة للتصميم الأصلي
 * Lineage Tree Visualization - Matching Original Design
 * تصميم شجرة نسب بأوراق خضراء تمثل أفراد العائلة
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const LineageTreeVisualization = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 1000 });
    const [totalMembers, setTotalMembers] = useState(0);

    useEffect(() => {
        if (!data || !wrapperRef.current) return;

        const updateDimensions = () => {
            const { offsetWidth, offsetHeight } = wrapperRef.current;
            setDimensions({
                width: Math.max(offsetWidth, 900),
                height: Math.max(offsetHeight, 800)
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // D3 Setup
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const { width, height } = dimensions;
        const centerX = width / 2;
        const centerY = height / 2;

        // Hierarchical data
        const root = d3.hierarchy(data);
        const allNodes = root.descendants();
        setTotalMembers(allNodes.length);

        // Define gradients and patterns
        const defs = svg.append('defs');

        // Trunk gradient
        const trunkGradient = defs.append('linearGradient')
            .attr('id', 'lineageTrunkGradient')
            .attr('x1', '0%').attr('y1', '100%')
            .attr('x2', '0%').attr('y2', '0%');
        trunkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#5D4037');
        trunkGradient.append('stop').attr('offset', '50%').attr('stop-color', '#795548');
        trunkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8D6E63');

        // Leaf gradients for variety
        const leafColors = [
            { id: 'leafGreen1', colors: ['#4CAF50', '#388E3C'] },
            { id: 'leafGreen2', colors: ['#66BB6A', '#43A047'] },
            { id: 'leafGreen3', colors: ['#81C784', '#4CAF50'] },
            { id: 'leafDark', colors: ['#2E7D32', '#1B5E20'] },
            { id: 'leafLight', colors: ['#A5D6A7', '#81C784'] }
        ];

        leafColors.forEach(({ id, colors }) => {
            const grad = defs.append('radialGradient')
                .attr('id', id)
                .attr('cx', '30%').attr('cy', '30%').attr('r', '70%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', colors[0]);
            grad.append('stop').attr('offset', '100%').attr('stop-color', colors[1]);
        });

        // Golden gradient for ancestors
        const goldGradient = defs.append('radialGradient')
            .attr('id', 'lineageGoldGradient')
            .attr('cx', '40%').attr('cy', '40%').attr('r', '60%');
        goldGradient.append('stop').attr('offset', '0%').attr('stop-color', '#FFE082');
        goldGradient.append('stop').attr('offset', '50%').attr('stop-color', '#FFD54F');
        goldGradient.append('stop').attr('offset', '100%').attr('stop-color', '#FFC107');

        // Main container group
        const mainGroup = svg.append('g').attr('class', 'main-group');

        // Enable zoom and pan
        const zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                mainGroup.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Calculate tree radius based on number of nodes
        const baseRadius = Math.min(width, height) * 0.35;
        const maxDepth = d3.max(allNodes, d => d.depth);

        // Radial layout - spreading nodes in a circular pattern
        const angleScale = d3.scaleLinear()
            .domain([0, allNodes.filter(d => !d.children).length])
            .range([0, 2 * Math.PI]);

        // Assign positions to all nodes
        let leafIndex = 0;
        const assignPositions = (node, startAngle = 0, endAngle = 2 * Math.PI) => {
            const descendants = node.descendants();
            const leaves = descendants.filter(d => !d.children);
            const anglePerLeaf = (endAngle - startAngle) / Math.max(leaves.length, 1);

            leaves.forEach((leaf, i) => {
                leaf.angle = startAngle + (i + 0.5) * anglePerLeaf;
                leaf.radius = baseRadius + (leaf.depth - 1) * 25;
            });

            // Position intermediate nodes based on their children
            const positionNode = (n) => {
                if (n.children) {
                    n.children.forEach(positionNode);
                    const childAngles = n.children.map(c => c.angle);
                    n.angle = d3.mean(childAngles);
                    n.radius = baseRadius * (n.depth / maxDepth) * 0.8;
                }
            };

            positionNode(node);
        };

        assignPositions(root);

        // Position root at center
        root.x = 0;
        root.y = 0;
        root.radius = 0;

        // Calculate x, y from angle and radius
        allNodes.forEach(node => {
            if (node.depth === 0) {
                node.x = 0;
                node.y = 0;
            } else {
                node.x = Math.cos(node.angle - Math.PI / 2) * node.radius;
                node.y = Math.sin(node.angle - Math.PI / 2) * node.radius;
            }
        });

        // Draw background circle (tree crown outline)
        mainGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', baseRadius + 80)
            .attr('fill', 'none')
            .attr('stroke', '#2E7D32')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.3);

        // Draw trunk
        const trunkGroup = mainGroup.append('g').attr('class', 'trunk');

        // Main trunk
        trunkGroup.append('path')
            .attr('d', `
                M -25 ${baseRadius + 100}
                Q -30 ${baseRadius + 50} -20 ${baseRadius * 0.3}
                Q -10 0 0 -10
                Q 10 0 20 ${baseRadius * 0.3}
                Q 30 ${baseRadius + 50} 25 ${baseRadius + 100}
                Z
            `)
            .attr('fill', 'url(#lineageTrunkGradient)')
            .attr('stroke', '#4E342E')
            .attr('stroke-width', 2);

        // Draw branches (links from parent to children)
        const linksGroup = mainGroup.append('g').attr('class', 'branches');

        // Create curved branches
        root.links().forEach(link => {
            const source = link.source;
            const target = link.target;

            // Different branch styles based on depth
            const branchWidth = Math.max(2, 8 - target.depth * 1.5);

            linksGroup.append('path')
                .attr('d', () => {
                    if (source.depth === 0) {
                        // From trunk center
                        return `M 0 0 Q ${target.x * 0.5} ${target.y * 0.3} ${target.x} ${target.y}`;
                    }
                    // Curved branch
                    const midX = (source.x + target.x) / 2;
                    const midY = (source.y + target.y) / 2;
                    const curveOffset = 20 * (Math.random() - 0.5);
                    return `M ${source.x} ${source.y} Q ${midX + curveOffset} ${midY + curveOffset} ${target.x} ${target.y}`;
                })
                .attr('fill', 'none')
                .attr('stroke', target.depth <= 2 ? '#5D4037' : '#8D6E63')
                .attr('stroke-width', branchWidth)
                .attr('stroke-linecap', 'round')
                .attr('opacity', 0.8);
        });

        // Draw leaves (nodes)
        const nodesGroup = mainGroup.append('g').attr('class', 'leaves');

        allNodes.forEach((node, index) => {
            const nodeGroup = nodesGroup.append('g')
                .attr('class', `node depth-${node.depth}`)
                .attr('transform', `translate(${node.x}, ${node.y})`)
                .style('cursor', 'pointer')
                .on('click', (event) => {
                    event.stopPropagation();
                    if (onNodeClick) onNodeClick(node.data);
                });

            if (node.depth === 0) {
                // Root - Golden fruit/base at trunk
                nodeGroup.append('circle')
                    .attr('r', 30)
                    .attr('fill', 'url(#lineageGoldGradient)')
                    .attr('stroke', '#FF8F00')
                    .attr('stroke-width', 3);

                nodeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 5)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .attr('font-family', 'Cairo, sans-serif')
                    .attr('fill', '#5D4037')
                    .text('👑');

                // Name below trunk
                nodeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', baseRadius + 130)
                    .attr('font-size', '18px')
                    .attr('font-weight', 'bold')
                    .attr('font-family', 'Cairo, sans-serif')
                    .attr('fill', '#2E7D32')
                    .text(node.data.fullName || 'الشاعر');

            } else if (node.depth === 1) {
                // Main ancestors - Larger golden leaves/fruits
                nodeGroup.append('ellipse')
                    .attr('rx', 25)
                    .attr('ry', 18)
                    .attr('fill', 'url(#lineageGoldGradient)')
                    .attr('stroke', '#FFA000')
                    .attr('stroke-width', 2)
                    .attr('transform', `rotate(${(node.angle * 180 / Math.PI) - 90})`);

                nodeGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 4)
                    .attr('font-size', '10px')
                    .attr('font-weight', 'bold')
                    .attr('font-family', 'Cairo, sans-serif')
                    .attr('fill', '#5D4037')
                    .text(node.data.fullName?.substring(0, 8) || '');

            } else {
                // Regular family members - Green leaves
                const leafGradients = ['leafGreen1', 'leafGreen2', 'leafGreen3', 'leafDark', 'leafLight'];
                const randomGradient = leafGradients[index % leafGradients.length];

                // Leaf shape
                const leafSize = node.children ? 12 : 8;
                const rotation = (node.angle * 180 / Math.PI) - 90 + (Math.random() * 30 - 15);

                nodeGroup.append('ellipse')
                    .attr('rx', leafSize)
                    .attr('ry', leafSize * 0.6)
                    .attr('fill', `url(#${randomGradient})`)
                    .attr('stroke', '#1B5E20')
                    .attr('stroke-width', 0.5)
                    .attr('transform', `rotate(${rotation})`)
                    .attr('opacity', 0.9);

                // Leaf vein
                nodeGroup.append('line')
                    .attr('x1', -leafSize * 0.7)
                    .attr('y1', 0)
                    .attr('x2', leafSize * 0.7)
                    .attr('y2', 0)
                    .attr('stroke', '#1B5E20')
                    .attr('stroke-width', 0.5)
                    .attr('transform', `rotate(${rotation})`)
                    .attr('opacity', 0.5);
            }

            // Add tooltip on hover
            nodeGroup.append('title')
                .text(node.data.fullName || 'غير معروف');
        });

        // Center the view
        const initialTransform = d3.zoomIdentity
            .translate(centerX, centerY - 50)
            .scale(0.85);

        svg.call(zoom.transform, initialTransform);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [data, dimensions.width, dimensions.height]);

    return (
        <div
            ref={wrapperRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                minHeight: '90vh',
                height: '100%',
                background: 'linear-gradient(180deg, #F5F5DC 0%, #FFFEF0 30%, #FFFFF8 70%, #F5F5DC 100%)',
                ...style
            }}
        >
            {/* Decorative golden frame corners */}
            <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M 5 50 Q 5 5 50 5" fill="none" stroke="#C4A962" strokeWidth="3" />
                    <path d="M 10 40 Q 10 10 40 10" fill="none" stroke="#D4B972" strokeWidth="2" />
                    <circle cx="5" cy="5" r="5" fill="#C4A962" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M 5 50 Q 5 5 50 5" fill="none" stroke="#C4A962" strokeWidth="3" />
                    <path d="M 10 40 Q 10 10 40 10" fill="none" stroke="#D4B972" strokeWidth="2" />
                    <circle cx="5" cy="5" r="5" fill="#C4A962" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none" style={{ transform: 'scaleY(-1)' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M 5 50 Q 5 5 50 5" fill="none" stroke="#C4A962" strokeWidth="3" />
                    <path d="M 10 40 Q 10 10 40 10" fill="none" stroke="#D4B972" strokeWidth="2" />
                    <circle cx="5" cy="5" r="5" fill="#C4A962" />
                </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none" style={{ transform: 'scale(-1)' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M 5 50 Q 5 5 50 5" fill="none" stroke="#C4A962" strokeWidth="3" />
                    <path d="M 10 40 Q 10 10 40 10" fill="none" stroke="#D4B972" strokeWidth="2" />
                    <circle cx="5" cy="5" r="5" fill="#C4A962" />
                </svg>
            </div>

            {/* Title at top center */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#2E7D32] mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    🌳 شجرة أنساب عائلة الشاعر 🌳
                </h2>
                <p className="text-lg text-[#5D4037] font-semibold">
                    {totalMembers} اسم تقريباً
                </p>
            </div>

            {/* Legend */}
            <div className="absolute top-24 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10 text-sm border border-amber-200" dir="rtl">
                <h3 className="font-bold mb-2 text-gray-800 border-b pb-1">دليل الشجرة:</h3>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-400 border border-amber-600"></span>
                        <span>الأجداد الأوائل</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-3 rounded-full bg-green-600"></span>
                        <span>أفراد العائلة</span>
                    </div>
                </div>
            </div>

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block', minHeight: '90vh' }}
            />

            {/* Controls hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2E7D32]/90 backdrop-blur-sm rounded-full px-6 py-2 text-white text-sm shadow-lg">
                🔍 استخدم عجلة الماوس للتكبير • اسحب للتنقل • اضغط على الورقة للتفاصيل
            </div>
        </div>
    );
};

export default LineageTreeVisualization;
