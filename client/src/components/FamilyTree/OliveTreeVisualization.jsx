/**
 * Olive Tree Visualization
 * A beautiful organic visualization inspired by real olive trees.
 * Family members are rendered as leaves and olives on a natural tree structure.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

const OliveTreeVisualization = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 900 });

    useEffect(() => {
        if (!data || !wrapperRef.current) return;

        const updateDimensions = () => {
            const { offsetWidth, offsetHeight } = wrapperRef.current;
            setDimensions({
                width: Math.max(offsetWidth, 800),
                height: Math.max(offsetHeight, 600)
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // D3 Setup
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const { width, height } = dimensions;

        // Main group for transformations
        const mainGroup = svg.append('g')
            .attr('class', 'main-group');

        // Zoom Behavior
        const zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                mainGroup.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Hierarchical Layout
        const root = d3.hierarchy(data);
        const nodeCount = root.descendants().length;

        // Dynamic sizing based on tree size
        const treeWidth = Math.max(width * 1.5, nodeCount * 80);
        const treeHeight = Math.max(height * 1.2, root.height * 180);

        // Use cluster layout for organic spread
        const treeLayout = d3.tree()
            .size([treeWidth, treeHeight])
            .separation((a, b) => (a.parent === b.parent ? 1.2 : 2));

        treeLayout(root);

        // Color Palette - Natural Olive Tree
        const colors = {
            trunk: '#3D2914',
            trunkLight: '#5C4033',
            branch: '#4A3520',
            branchLight: '#6B4423',
            leafDark: '#2D5016',
            leaf: '#4A7023',
            leafLight: '#6B8E23',
            leafPale: '#8FBC8F',
            olive: '#556B2F',
            oliveRipe: '#8B7355',
            text: '#FFFFFF',
            ground: '#7CB342'
        };

        // Thickness scale for branches
        const maxDescendants = root.copy().count().value;
        const thicknessScale = d3.scalePow()
            .exponent(0.5)
            .domain([1, maxDescendants])
            .range([3, 45]);

        // Draw Ground/Hill
        const groundGroup = mainGroup.append('g').attr('class', 'ground');

        // Find trunk position
        const trunkX = root.x;
        const trunkY = -root.y;

        groundGroup.append('ellipse')
            .attr('cx', trunkX)
            .attr('cy', trunkY + 30)
            .attr('rx', 120)
            .attr('ry', 35)
            .attr('fill', colors.ground)
            .attr('opacity', 0.9);

        // Draw Branches (Links) with organic curves
        const linksGroup = mainGroup.append('g').attr('class', 'links');

        linksGroup.selectAll('.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d => {
                const sourceX = d.source.x;
                const sourceY = -d.source.y;
                const targetX = d.target.x;
                const targetY = -d.target.y;

                // Create organic curved path
                const midY = (sourceY + targetY) / 2;
                const controlOffset = (targetX - sourceX) * 0.3;

                return `M ${sourceX} ${sourceY} 
                        C ${sourceX + controlOffset} ${midY}, 
                          ${targetX - controlOffset} ${midY}, 
                          ${targetX} ${targetY}`;
            })
            .attr('fill', 'none')
            .attr('stroke', d => {
                if (d.source.depth === 0) return colors.trunk;
                if (d.source.depth === 1) return colors.trunkLight;
                return colors.branch;
            })
            .attr('stroke-width', d => {
                const load = d.target.copy().count().value;
                return thicknessScale(load);
            })
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round');

        // Draw Nodes
        const nodesGroup = mainGroup.append('g').attr('class', 'nodes');

        const node = nodesGroup.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-branch' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.x},${-d.y})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                if (onNodeClick) onNodeClick(d.data);
            });

        // Leaf nodes - Draw leaves
        const leafNodes = node.filter(d => !d.children);

        // Multiple leaves per person for fullness
        leafNodes.each(function (d) {
            const leafGroup = d3.select(this);
            const numLeaves = 3 + Math.floor(Math.random() * 3);

            for (let i = 0; i < numLeaves; i++) {
                const angle = (i / numLeaves) * 360 + Math.random() * 30;
                const distance = 15 + Math.random() * 10;
                const scale = 0.8 + Math.random() * 0.4;
                const leafColor = [colors.leafDark, colors.leaf, colors.leafLight, colors.leafPale][Math.floor(Math.random() * 4)];

                leafGroup.append('path')
                    .attr('d', 'M0,0 C3,-2 8,-8 10,-18 C8,-22 4,-24 0,-25 C-4,-24 -8,-22 -10,-18 C-8,-8 -3,-2 0,0')
                    .attr('fill', leafColor)
                    .attr('stroke', colors.leafDark)
                    .attr('stroke-width', 0.5)
                    .attr('transform', `rotate(${angle}) translate(0, ${-distance}) scale(${scale})`)
                    .attr('opacity', 0.9);
            }

            // Add olive fruit randomly
            if (Math.random() > 0.5) {
                const oliveColor = Math.random() > 0.5 ? colors.olive : colors.oliveRipe;
                leafGroup.append('ellipse')
                    .attr('cx', Math.random() * 20 - 10)
                    .attr('cy', -15 - Math.random() * 15)
                    .attr('rx', 5)
                    .attr('ry', 7)
                    .attr('fill', oliveColor)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 0.5);
            }
        });

        // Branch nodes - Draw knots
        node.filter(d => d.children && d.depth > 0).append('circle')
            .attr('r', d => Math.min(thicknessScale(d.copy().count().value) / 2.5, 15))
            .attr('fill', colors.branchLight)
            .attr('stroke', colors.trunk)
            .attr('stroke-width', 2);

        // Root node - Draw trunk base
        node.filter(d => d.depth === 0).append('ellipse')
            .attr('rx', 35)
            .attr('ry', 25)
            .attr('fill', colors.trunk)
            .attr('stroke', colors.trunkLight)
            .attr('stroke-width', 3);

        // Labels with background for readability
        const labelGroup = node.append('g').attr('class', 'label-group');

        // Text background
        labelGroup.append('rect')
            .attr('class', 'label-bg')
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', 'rgba(0,0,0,0.7)')
            .attr('opacity', 0);

        // Name text
        const labels = labelGroup.append('text')
            .attr('class', 'name-label')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.children ? (d.depth === 0 ? 45 : 35) : 45)
            .text(d => d.data.fullName)
            .style('font-family', 'Cairo, Tajawal, sans-serif')
            .style('font-weight', 'bold')
            .style('font-size', d => d.depth === 0 ? '16px' : (d.children ? '14px' : '12px'))
            .style('fill', colors.text)
            .style('paint-order', 'stroke')
            .style('stroke', '#000')
            .style('stroke-width', '3px')
            .style('stroke-linecap', 'round')
            .style('stroke-linejoin', 'round')
            .style('pointer-events', 'none');

        // Fit view to show entire tree
        const bounds = mainGroup.node().getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;

        const scale = Math.min(
            (width * 0.9) / fullWidth,
            (height * 0.85) / fullHeight,
            1.2
        );

        const translateX = width / 2 - (bounds.x + fullWidth / 2) * scale;
        const translateY = height * 0.55 - (bounds.y + fullHeight / 2) * scale;

        const initialTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);

        svg.call(zoom.transform, initialTransform);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [data, dimensions.width, dimensions.height]);

    return (
        <div
            ref={wrapperRef}
            className={`w-full relative overflow-hidden ${className}`}
            style={{
                minHeight: '80vh',
                height: '100%',
                background: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 30%, #C8E6C9 70%, #A5D6A7 100%)',
                ...style
            }}
        >
            {/* Decorative frame border */}
            <div className="absolute inset-2 border-4 border-amber-600/30 rounded-lg pointer-events-none" />
            <div className="absolute inset-4 border-2 border-amber-700/20 rounded-lg pointer-events-none" />

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ display: 'block', minHeight: '80vh' }}
            />

            {/* Minimal floating hint - smaller and less intrusive */}
            <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm rounded px-2 py-1 text-xs text-white/80 pointer-events-none">
                🔍 اسحب للتنقل • قرّب للتكبير • اضغط للتفاصيل
            </div>
        </div>
    );
};

export default OliveTreeVisualization;
