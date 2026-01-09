/**
 * Tree Visualization Component for Family Tree
 * Pure SVG-based tree rendering with React
 */

import React, { useRef, useEffect, useState } from 'react';

// Configuration
const config = {
    nodeWidth: 140,
    nodeHeight: 60,
    horizontalSpacing: 50,
    verticalSpacing: 100,
    padding: 60
};

// Truncate name to fit in node
const truncateName = (name, maxLength = 14) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '..';
};

// Calculate layout positions for all nodes using modified Reingold-Tilford algorithm
const calculateLayout = (node, depth = 0) => {
    const layout = {
        node,
        x: 0,
        y: depth * (config.nodeHeight + config.verticalSpacing),
        children: [],
        width: config.nodeWidth
    };

    if (node.children && node.children.length > 0) {
        layout.children = node.children.map((child) =>
            calculateLayout(child, depth + 1)
        );

        let totalChildrenWidth = 0;
        layout.children.forEach((child, i) => {
            totalChildrenWidth += child.width;
            if (i > 0) totalChildrenWidth += config.horizontalSpacing;
        });

        let currentX = -totalChildrenWidth / 2;
        layout.children.forEach((child) => {
            const childOffset = currentX + child.width / 2;
            offsetSubtree(child, childOffset);
            currentX += child.width + config.horizontalSpacing;
        });

        layout.width = Math.max(config.nodeWidth, totalChildrenWidth);

        if (layout.children.length > 0) {
            const firstChild = layout.children[0];
            const lastChild = layout.children[layout.children.length - 1];
            layout.x = (firstChild.x + lastChild.x) / 2;
        }
    }

    return layout;
};

// Offset subtree x positions
const offsetSubtree = (layout, offset) => {
    layout.x += offset;
    if (layout.children) {
        layout.children.forEach(child => offsetSubtree(child, offset));
    }
};

// Get bounds of layout
const getBounds = (layout) => {
    let minX = layout.x;
    let maxX = layout.x;
    let maxY = layout.y;

    const traverse = (node) => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
        if (node.children) node.children.forEach(traverse);
    };

    traverse(layout);
    return { minX, maxX, maxY };
};

// Tree Node Component
const TreeNode = ({ layoutNode, onClick }) => {
    const { node, x, y } = layoutNode;

    const getGradient = () => {
        if (node.isRoot) return 'url(#rootGradient)';
        if (node.gender === 'female') return 'url(#femaleGradient)';
        return 'url(#maleGradient)';
    };

    return (
        <g
            className="tree-node group cursor-pointer"
            transform={`translate(${x}, ${y})`}
            onClick={() => onClick && onClick(node)}
        >
            {/* Inner group for scaling effects to avoid conflict with positioning transform */}
            <g
                className="transition-transform duration-200 ease-in-out group-hover:scale-105"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
                {/* Node background */}
                <rect
                    x="0"
                    y="0"
                    width={config.nodeWidth}
                    height={config.nodeHeight}
                    rx="12"
                    ry="12"
                    fill={getGradient()}
                    className="drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
                />

                {/* Root indicator */}
                {node.isRoot && (
                    <rect
                        x="0"
                        y="0"
                        width={config.nodeWidth}
                        height={config.nodeHeight}
                        rx="12"
                        ry="12"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="3"
                    />
                )}

                {/* Name */}
                <text
                    x={config.nodeWidth / 2}
                    y={config.nodeHeight / 2 - 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="Cairo, sans-serif"
                    direction="rtl"
                    pointerEvents="none"
                >
                    {truncateName(node.fullName)}
                </text>

                {/* Generation */}
                <text
                    x={config.nodeWidth / 2}
                    y={config.nodeHeight / 2 + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="10"
                    fontFamily="Cairo, sans-serif"
                    pointerEvents="none"
                >
                    الجيل {node.generation}
                </text>
            </g>
        </g>
    );
};

// Tree Links Component
const TreeLinks = ({ layout }) => {
    const paths = [];

    const drawLinks = (parent) => {
        if (parent.children && parent.children.length > 0) {
            parent.children.forEach((child, index) => {
                const startX = parent.x + config.nodeWidth / 2;
                const startY = parent.y + config.nodeHeight;
                const endX = child.x + config.nodeWidth / 2;
                const endY = child.y;
                const midY = (startY + endY) / 2;

                const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                paths.push(
                    <path
                        key={`${parent.node._id}-${child.node._id}-${index}`}
                        d={d}
                        fill="none"
                        stroke="rgba(200, 200, 200, 0.6)"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                );

                drawLinks(child);
            });
        }
    };

    drawLinks(layout);

    return <g className="tree-links">{paths}</g>;
};

// Recursive node renderer
const renderNodes = (layoutNode, onClick) => {
    const nodes = [
        <TreeNode key={layoutNode.node._id} layoutNode={layoutNode} onClick={onClick} />
    ];

    if (layoutNode.children) {
        layoutNode.children.forEach(child => {
            nodes.push(...renderNodes(child, onClick));
        });
    }

    return nodes;
};

// Main Tree Visualization Component
const TreeVisualization = ({ data, onNodeClick, zoom = 1 }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (containerRef.current) {
            const updateDimensions = () => {
                setDimensions({
                    width: containerRef.current.offsetWidth || 800,
                    height: containerRef.current.offsetHeight || 600
                });
            };
            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2 17l10 5 10-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2 12l10 5 10-5" />
                    </svg>
                    <p className="text-lg">لا توجد شجرة عائلة بعد</p>
                </div>
            </div>
        );
    }

    const layout = calculateLayout(data);
    const bounds = getBounds(layout);

    const svgWidth = (bounds.maxX - bounds.minX + config.nodeWidth + config.padding * 2) * zoom;
    const svgHeight = (bounds.maxY + config.nodeHeight + config.padding * 2) * zoom;

    const viewBox = `${bounds.minX - config.padding} ${-config.padding} ${svgWidth / zoom} ${svgHeight / zoom}`;

    return (
        <div
            ref={containerRef}
            className="w-full overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl"
            style={{ maxHeight: '70vh' }}
        >
            <svg
                className="tree-svg w-full"
                viewBox={viewBox}
                style={{
                    minWidth: Math.max(svgWidth, dimensions.width),
                    minHeight: Math.max(svgHeight, 500)
                }}
            >
                {/* Definitions for gradients */}
                <defs>
                    <linearGradient id="maleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#007A3D' }} />
                        <stop offset="100%" style={{ stopColor: '#005528' }} />
                    </linearGradient>
                    <linearGradient id="femaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#CE1126' }} />
                        <stop offset="100%" style={{ stopColor: '#9A0D1C' }} />
                    </linearGradient>
                    <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#C9A227' }} />
                        <stop offset="100%" style={{ stopColor: '#9A7B1D' }} />
                    </linearGradient>
                </defs>

                {/* Render links first (behind nodes) */}
                <TreeLinks layout={layout} />

                {/* Render nodes */}
                <g className="tree-nodes">
                    {renderNodes(layout, onNodeClick)}
                </g>
            </svg>
        </div>
    );
};

export default TreeVisualization;
