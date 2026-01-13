/**
 * Natural Tree Visualization Component
 * Renders the family tree as an organic, bottom-up tree
 */

import React, { useRef, useEffect, useState } from 'react';

// Configuration
const config = {
    nodeWidth: 60,
    nodeHeight: 60,
    horizontalSpacing: 40,
    verticalSpacing: 120, // Longer branches
    padding: 100
};

// Truncate name
const truncateName = (name, maxLength = 12) => {
    if (!name) return '';
    return name.split(' ')[0]; // Show first name only for the artistic view to save space?
    // Or just truncate. First name is cleaner for "Leaves".
};

// Calculate layout (Standard Reingold-Tilford)
const calculateLayout = (node, depth = 0) => {
    const layout = {
        node,
        x: 0,
        y: depth * config.verticalSpacing, // We will invert this later
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

const offsetSubtree = (layout, offset) => {
    layout.x += offset;
    if (layout.children) {
        layout.children.forEach(child => offsetSubtree(child, offset));
    }
};

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

// Natural components
const BranchLink = ({ parentState, childState, maxDepth }) => {
    // Invert Y: The root is at maxY, children at maxY - spacing
    // Actually, easy way: just pass proper coords.

    // We want curved branches.
    // Bezier control points.
    const startX = parentState.x;
    const startY = parentState.y; // Bottom (Parent)
    const endX = childState.x;
    const endY = childState.y; // Top (Child)

    // Control points for organic curve
    const midY = (startY + endY) / 2;
    // Mess it up slightly for organic feel? No, keep clean.

    const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

    // Thickness based on depth (reverse depth?)
    // Root should be thick. Node depth increases down? No, we calculated top-down 0..N.
    // Wait, in standard layout 0 is root.
    // So Root (0) should be thickest.
    const thickness = Math.max(1, 12 - (parentState.node.depth || 0) * 1.5);

    return (
        <path
            d={d}
            fill="none"
            stroke="#5D4037" // Dark Wood Color
            strokeWidth={thickness}
            strokeLinecap="round"
            className="drop-shadow-sm opacity-90"
        />
    );
};

const LeafNode = ({ layoutNode, onClick, maxY }) => {
    const { node, x, y } = layoutNode;

    // Determine style based on gender/status
    const isMale = node.gender !== 'female';
    const isRoot = node.isRoot;

    return (
        <g
            className="group cursor-pointer"
            transform={`translate(${x}, ${y})`}
            onClick={() => onClick && onClick(node)}
        >
            {/* Hover Scale */}
            <g className="transition-transform duration-300 ease-in-out group-hover:scale-125 origin-center">

                {/* Leaf Shape */}
                {!isRoot && (
                    <path
                        d="M0 0 Q 30 -30 0 -60 Q -30 -30 0 0"
                        fill={isMale ? "url(#leafGradientMale)" : "url(#leafGradientFemale)"}
                        transform="translate(0, 30)" // Center the tip?
                        className="drop-shadow-md"
                    />
                )}

                {/* Root is a special stump/base */}
                {isRoot && (
                    <circle r="35" fill="url(#rootGradient)" stroke="#8B4513" strokeWidth="3" />
                )}

                {/* Name Label */}
                <text
                    x="0"
                    y={isRoot ? 5 : -10}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isRoot ? "14" : "11"}
                    fontWeight="bold"
                    fontFamily="Cairo, sans-serif"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    pointerEvents="none"
                >
                    {truncateName(node.fullName)}
                </text>
            </g>
        </g>
    );
};

// Recursive drawing
const renderTree = (layoutNode, maxY, onClick) => {
    const nodes = [];

    // Draw links to children first
    if (layoutNode.children) {
        layoutNode.children.forEach(child => {
            // NOTE: We invert Y for drawing here.
            // Layout calculated Y=0 for root, Y=100 for Child.
            // visualY = maxY - layoutY.
            // So Root is at maxY (Bottom). Child is higher up.

            const parentPos = {
                x: layoutNode.x,
                y: maxY - layoutNode.y,
                node: layoutNode.node // carry node for depth check
            };
            const childPos = {
                x: child.x,
                y: maxY - child.y
            };

            nodes.push(
                <BranchLink
                    key={`link-${layoutNode.node._id}-${child.node._id}`}
                    parentState={parentPos}
                    childState={childPos}
                />
            );

            nodes.push(...renderTree(child, maxY, onClick));
        });
    }

    // Draw the node itself
    const visualY = maxY - layoutNode.y;
    nodes.push(
        <LeafNode
            key={layoutNode.node._id}
            layoutNode={{ ...layoutNode, y: visualY }}
            onClick={onClick}
            maxY={maxY}
        />
    );

    return nodes;
};

const NaturalTreeVisualization = ({ data, onNodeClick, zoom = 1, className = '', style = {} }) => {
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

    if (!data) return null;

    const layout = calculateLayout(data);
    const bounds = getBounds(layout);

    // Coordinate conversion
    // Layout gives Y from 0 (top) to Max (bottom).
    // We want to flip it: Layout Y=0 should be at SVG Y=Max.
    // bounds.maxY is the height of the tree.

    const treeHeight = bounds.maxY;
    const treeWidth = bounds.maxX - bounds.minX;

    const svgWidth = (treeWidth + config.padding * 2) * zoom;
    const svgHeight = (treeHeight + config.padding * 2) * zoom;

    // ViewBox centered around tree
    // X goes from bounds.minX to bounds.maxX
    // Y goes from 0 to treeHeight.
    // SVG coords: X is normal. Y is inverted logic done in render.
    // The "Bottom" is Y = treeHeight.

    const viewBoxX = bounds.minX - config.padding;
    const viewBoxY = -config.padding; // Top of the drawing area (leaves)
    const viewBoxW = svgWidth / zoom;
    const viewBoxH = svgHeight / zoom;

    // Correct ViewBox?
    // Node Ys will be between 0 and treeHeight.
    // We map layoutY (0..Max) -> visualY (Max..0).
    // So visual range is 0 to Max.
    // padding added.

    const viewBox = `${viewBoxX} ${-config.padding} ${viewBoxW} ${viewBoxH}`;

    return (
        <div
            ref={containerRef}
            className={`w-full overflow-hidden relative ${className}`}
            style={{
                background: 'linear-gradient(to top, #e6f0e6 0%, #e0f7fa 100%)', // Sky to Grass gradient
                ...style
            }}
        >
            {/* Background Sky/Sun optional */}
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-yellow-300 blur-xl opacity-50 pointer-events-none mix-blend-screen"></div>

            <svg
                className="w-full h-full"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMax meet" // Align bottom
            >
                <defs>
                    <linearGradient id="leafGradientMale" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#81C784' }} /> {/* Light Green */}
                        <stop offset="100%" style={{ stopColor: '#2E7D32' }} /> {/* Dark Green */}
                    </linearGradient>
                    <linearGradient id="leafGradientFemale" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#F48FB1' }} /> {/* Pink Light */}
                        <stop offset="100%" style={{ stopColor: '#D81B60' }} /> {/* Pink Dark */}
                    </linearGradient>
                    <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#8D6E63' }} />
                        <stop offset="100%" style={{ stopColor: '#4E342E' }} />
                    </linearGradient>
                </defs>

                <g className="tree-group">
                    {renderTree(layout, treeHeight, onNodeClick)}
                </g>
            </svg>
        </div>
    );
};

export default NaturalTreeVisualization;
