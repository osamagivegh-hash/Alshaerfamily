/**
 * Olive Tree Visualization
 * An organic, data-driven visualization where family members are rendered
 * as components of a living tree (Trunk, Branches, Leaves).
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const OliveTreeVisualization = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const wrapperRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

    useEffect(() => {
        if (!data || !wrapperRef.current) return;

        // 1. Setup Dimensions & Responsiveness
        const updateDimensions = () => {
            const { offsetWidth, offsetHeight } = wrapperRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        };

        // Initial sizing
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // 2. D3 Setup
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous render

        const { width, height } = wrapperRef.current.getBoundingClientRect();

        // Group for Zooming/Panning
        const g = svg.append('g');

        // Zoom Behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4]) // Allow deep zoom
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Move to bottom center initially (Tree grows up)
        const initialTransform = d3.zoomIdentity
            .translate(width / 2, height - 100)
            .scale(0.8);
        svg.call(zoom.transform, initialTransform);

        // 3. Hierarchical Layout Calculation
        const root = d3.hierarchy(data);

        // Tree Dimensions
        // We use a large virtual size to ensure spacing, zoom handles the view
        const treeLayout = d3.tree()
            .size([width * 2, height * 2]) // Spread out widely
            .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5)); // Breathable spacing

        treeLayout(root);

        // 4. Organic Geometry Generators

        // Thickness Scale: More descendants = Thicker branch
        const thicknessScale = d3.scaleLog()
            .domain([1, root.descendants().length + 1])
            .range([1, 60]); // Leaves = 1px, Trunk = 60px

        // Color Palette
        const colors = {
            trunk: '#4A3728', // Dark Wood
            branch: '#6D4C3D', // Lighter Wood
            leaf: '#556B2F',   // Olive Green
            fruit: '#333300',  // Dark Olive
            text: '#FFFFFF',
            textShadow: '#000000'
        };

        // Custom Link Path (Bezier Curve for smooth branches)
        // We invert Y so tree grows UP. Source=(x, -y)
        const diagonal = d3.linkVertical()
            .x(d => d.x)
            .y(d => -d.y);

        // 5. Render Branches (Links)
        const links = g.selectAll('.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', diagonal)
            .attr('fill', 'none')
            .attr('stroke', d => {
                // Gradient or variation based on depth?
                return d.target.depth === 1 ? colors.trunk : colors.branch;
            })
            .attr('stroke-width', d => {
                // Calculate "load" (descendants)
                const load = d.target.copy().count().value;
                return thicknessScale(load);
            })
            .attr('stroke-linecap', 'round')
            .attr('stroke-opacity', 0.9);

        // 6. Render Nodes (Junctions & Leaves)
        const node = g.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
            .attr('transform', d => `translate(${d.x},${-d.y})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                if (onNodeClick) onNodeClick(d.data);
            });

        // 6a. Leaf Elements (For end nodes)
        node.filter(d => !d.children).append('path')
            .attr('d', 'M0,0 C5,0 12,-5 15,-15 C15,-20 10,-25 0,-30 C-10,-25 -15,-20 -15,-15 C-12,-5 -5,0 0,0') // Leaf Shape
            .attr('fill', colors.leaf)
            .attr('stroke', '#334422')
            .attr('stroke-width', 1)
            .attr('transform', d => `rotate(${d.x % 60 - 30}) scale(${1.5 - d.depth * 0.05})`); // Randomish rotate

        // 6b. Fruits/Olives (Optional decoration for some nodes)
        node.filter(d => !d.children && d.depth % 3 === 0).append('circle')
            .attr('r', 6)
            .attr('cy', -15)
            .attr('fill', colors.fruit)
            .attr('stroke', 'none');

        // 6c. Branch Knots (For internal nodes)
        node.filter(d => d.children).append('circle')
            .attr('r', d => thicknessScale(d.copy().count().value) / 2) // Knot size matches branch
            .attr('fill', colors.branch)
            .attr('stroke', 'none');

        // 7. Labels (Names)
        // High visibility text
        const labels = node.append('text')
            .attr('dy', d => d.children ? 5 : 20)
            .attr('y', d => d.children ? 0 : 5)
            .attr('text-anchor', 'middle')
            .text(d => d.data.fullName)
            .style('font-family', 'Cairo, sans-serif')
            .style('font-weight', 'bold')
            .style('font-size', d => d.children ? '18px' : '14px') // Larger for ancestors
            .style('fill', colors.text)
            .style('text-shadow', `
                2px 2px 0px ${colors.textShadow},
                -1px -1px 0 #000,  
                1px -1px 0 #000,
                -1px 1px 0 #000,
                1px 1px 0 #000
            `) // Heavy stroke effect for readability
            .style('pointer-events', 'none'); // Let clicks pass to group

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [data, dimensions.width]); // Re-render on data or resize

    return (
        <div
            ref={wrapperRef}
            className={`w-full h-full relative overflow-hidden bg-gradient-to-b from-blue-50 via-green-50 to-[#3e27231a] ${className}`}
            style={style}
        >
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="block touch-action-none" // touch-action-none for better mobile zoom gestures
            >
                <defs>
                    {/* Filter for organic irregularity could go here */}
                    <filter id="organic-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                    </filter>
                </defs>
            </svg>

            {/* Overlay hint */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded-lg p-3 text-sm text-gray-700 shadow-lg pointer-events-none">
                <p>🔍 استخدم الفأرة أو اللمس للتقريب والتنقل داخل الشجرة</p>
                <p>🖱️ اضغط على أي اسم لعرض التفاصيل</p>
            </div>
        </div>
    );
};

export default OliveTreeVisualization;
