/**
 * شجرة "نانو بنانا" - Nano Banana Style Tree
 * 
 * تصميم مطابق للصورة المرجعية:
 * - تخطيط مروحي (Fan Layout) منظم
 * - أوراق بيضاوية تحتوي الأسماء
 * - فروع انسيابية سميكة من الأسفل ورفيعة من الأعلى
 * - خلفية بيج وإطار كلاسيكي
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

// ==================== STYLES & CONFIG ====================
const CONFIG = {
    colors: {
        bg: '#F9F9F0', // بيج كلاسيكي فاتح
        frame: '#C4A962', // ذهبي معتق
        trunk: '#6D4C41', // بني
        trunkDark: '#3E2723',
        branch: '#795548',
        leaf: '#558B2F', // أخضر زيتوني
        leafGradient: ['#33691E', '#558B2F', '#689F38'],
        text: '#FFFFFF', // نص أبيض داخل الورقة
        textDark: '#3E2723'
    },
    dimensions: {
        leafWidth: 45,
        leafHeight: 20,
        nodeRadius: 4
    }
};

const OrganicOliveTree = ({ data, onNodeClick, className = '', style = {} }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1400, height: 1000 });
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState(null);

    // ==================== DATA PROCESSING ====================
    const treeData = useMemo(() => {
        if (!data) return null;

        const root = d3.hierarchy(data)
            // ترتيب الأبناء لضمان التوازن
            .sort((a, b) => (b.height - a.height) || a.data.fullName.localeCompare(b.data.fullName));

        const allNodes = root.descendants();
        const maxDepth = d3.max(allNodes, d => d.depth);

        return { root, allNodes, maxDepth, total: allNodes.length };
    }, [data]);

    // ==================== RENDERING ====================
    useEffect(() => {
        if (!treeData || !svgRef.current || !containerRef.current) return;

        const { root, maxDepth } = treeData;

        // 1. Setup Dimensions & SVG
        const containerRect = containerRef.current.getBoundingClientRect();
        const width = Math.max(containerRect.width || 1400, 1200);
        const height = Math.max(containerRect.height || 1000, 900);
        setDimensions({ width, height });

        const centerX = width / 2;
        const centerY = height - 100; // الجذع في الأسفل
        const radius = Math.min(width, height) * 0.85; // نصف قطر الشجرة

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous

        // 2. Definitions (Gradients & Filters)
        const defs = svg.append('defs');

        // Leaf Gradient (Green)
        const leafGrad = defs.append('linearGradient')
            .attr('id', 'leafGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        leafGrad.append('stop').attr('offset', '0%').attr('stop-color', '#7CB342'); // Light
        leafGrad.append('stop').attr('offset', '100%').attr('stop-color', '#558B2F'); // Dark

        // Trunk Gradient
        const trunkGrad = defs.append('linearGradient')
            .attr('id', 'trunkGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '0%');
        trunkGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5D4037');
        trunkGrad.append('stop').attr('offset', '50%').attr('stop-color', '#8D6E63');
        trunkGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4E342E');

        // Drop Shadow
        const shadow = defs.append('filter')
            .attr('id', 'dropShadow')
            .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
        shadow.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 1.5);
        shadow.append('feOffset').attr('dx', 1).attr('dy', 1);
        shadow.append('feComponentTransfer').append('feFuncA').attr('type', 'linear').attr('slope', 0.3);
        shadow.append('feMerge').call(merge => {
            merge.append('feMergeNode');
            merge.append('feMergeNode').attr('in', 'SourceGraphic');
        });

        // 3. Main Group & Zoom
        const g = svg.append('g');
        const zoom = d3.zoom()
            .scaleExtent([0.4, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                setTransform(event.transform);
            });
        svg.call(zoom);

        // 4. Tree Layout Algorithm (Fan / Radial)
        // نستخدم d3.tree للحصول على توزيع متناسق (tidy tree) ثم نحوله لإحداثيات قطبية
        // الزاوية: 180 درجة (Math.PI) من -PI/2 إلى PI/2

        const treeLayout = d3.tree()
            .size([Math.PI, radius]) // [angle, radius]
            .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        treeLayout(root);

        // تصحيح زاوية الجذر والأبناء للمروحة (Fan Shape)
        // Root is at (0,0) in radial logic, we map it to (centerX, centerY)
        root.x = Math.PI / 2; // المركز (عمودي)
        root.y = 0;

        // Custom Radial Link Generator
        // يحول الإحداثيات من (زاوية، نصف قطر) إلى (x, y) ديكارتية
        const project = (theta, r) => {
            // Angle adjustment: -90 degrees to point upwards
            // theta is in radians, 0 is right, PI is left.
            // We want the spread to be upwards. 
            // d3.tree outputs x as angle.
            // Let's map x directly to angle. 
            // We want tree to span 180 degrees upwards.
            // So angle should be from PI (left) to 0 (right)? 
            // Or -PI/2 to PI/2?

            // Let's adjust algorithm:
            // Input tree: x within [0, PI]
            // We map this to angle: x - PI. (0 -> -PI, PI -> 0). 
            // -PI is Left, 0 is Right. -PI/2 is Up.
            const angle = theta - Math.PI;

            return [
                centerX + r * Math.cos(angle),
                centerY + r * Math.sin(angle)
            ];
        };

        const linkGenerator = d3.linkRadial()
            .angle(d => d.x - Math.PI / 2) // Adjust for vertical alignment if needed
            .radius(d => d.y);

        // CUSTOM LINK PATH - Curved Bezier
        const drawLink = (source, target) => {
            // Calculate Cartesian coordinates
            const s = project(source.x, source.y);
            const t = project(target.x, target.y);

            // Trunk behavior: straight line up for first segment
            if (source.depth === 0) {
                return `M ${centerX} ${centerY + 60} L ${centerX} ${centerY - 40} L ${t[0]} ${t[1]}`;
            }

            // Quadratic Bezier for smooth curves
            // Control point: weighted towards the parent radius but closer to target angle
            // Or simple simple cubic bezier

            // Let's rely on D3's path generator but adapted manually for Cartesian
            const mx = (s[0] + t[0]) / 2;
            const my = (s[1] + t[1]) / 2;

            return `M ${s[0]} ${s[1]} Q ${(s[0] + t[0]) / 2} ${(s[1] + t[1]) / 2 - (target.y - source.y) * 0.2} ${t[0]} ${t[1]}`;
        };

        // 5. Draw Links (Branches)
        g.selectAll('.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d => {
                // Manual projection for custom look
                const s = project(d.source.x, d.source.y);
                const t = project(d.target.x, d.target.y);

                // For root (trunk)
                if (d.source.depth === 0) {
                    return `M ${centerX} ${centerY + 80} C ${centerX} ${centerY} ${t[0]} ${(s[1] + t[1]) / 2} ${t[0]} ${t[1]}`;
                }

                // For branches
                // Use a curve that keeps the "tree" flow
                return `M ${s[0]} ${s[1]} C ${s[0]} ${(s[1] + t[1]) / 2} ${t[0]} ${(s[1] + t[1]) / 2} ${t[0]} ${t[1]}`;
            })
            .attr('fill', 'none')
            .attr('stroke', CONFIG.colors.branch)
            .attr('stroke-width', d => Math.max(1, (maxDepth - d.target.depth) * 1.5))
            .attr('stroke-opacity', 0.8)
            .attr('stroke-linecap', 'round');

        // Draw Trunk Base (Thick)
        g.append('path')
            .attr('d', `M ${centerX} ${centerY + 80} L ${centerX} ${centerY}`)
            .attr('stroke', CONFIG.colors.trunk)
            .attr('stroke-width', 25)
            .attr('stroke-linecap', 'round');

        // Roots decoration
        const roots = g.append('g').attr('class', 'roots');
        [-15, 0, 15].forEach(offset => {
            roots.append('path')
                .attr('d', `M ${centerX + offset} ${centerY + 70} Q ${centerX + offset * 2} ${centerY + 100} ${centerX + offset * 3} ${centerY + 110}`)
                .attr('stroke', CONFIG.colors.trunk)
                .attr('stroke-width', Math.abs(offset) ? 3 : 5)
                .attr('fill', 'none');
        });

        // 6. Draw Nodes (Leaves)
        const node = g.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => {
                if (d.depth === 0) return `translate(${centerX}, ${centerY})`;
                const p = project(d.x, d.y);
                return `translate(${p[0]}, ${p[1]})`;
            })
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                setSelectedNode(d.data);
                if (onNodeClick) onNodeClick(d.data);
            });

        // Loop through nodes to draw leaves
        node.each(function (d) {
            const el = d3.select(this);
            const isRoot = d.depth === 0;
            const isLeaf = !d.children;

            if (isRoot) return; // Skip drawing root here (handled separately or hidden)

            // Leaf Shape (Ellipse)
            const leafW = CONFIG.dimensions.leafWidth;
            const leafH = CONFIG.dimensions.leafHeight;

            // Calculate rotation to face outward
            // angle in degrees: (d.x - PI) * 180 / PI
            // But we have text inside, prefer horizontal readability?
            // User requested "Nano Banana" style. In that style, text is horizontal inside horizontal ovals usually,
            // or slightly rotated. Let's keep them mostly horizontal or slight rotation for style.

            // The image shows horizontal text in oval leaves.
            // So NO rotation for the text/leaf itself, unless it's very crowded.
            // Let's keep it horizontal for max readability.

            el.append('ellipse')
                .attr('rx', leafW / 2 + (d.data.fullName.length > 8 ? 5 : 0))
                .attr('ry', leafH / 2)
                .attr('fill', 'url(#leafGradient)')
                .attr('stroke', '#33691E')
                .attr('stroke-width', 1)
                .attr('filter', 'url(#dropShadow)');

            // Name
            el.append('text')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(d.data.fullName ? d.data.fullName.split(' ')[0] : '') // First name only for small scale
                .attr('font-size', '9px')
                .attr('font-family', "'Cairo', sans-serif")
                .attr('fill', 'white')
                .style('pointer-events', 'none') // Let click pass to group
                .text(d => {
                    // Smart truncation: First name + last name initial?
                    // Or just first name if deep?
                    // Let's try to fit 2 words if short, or 1 word.
                    const names = (d.data.fullName || '').split(' ');
                    if (names.length > 1 && (names[0].length + names[1].length < 10)) {
                        return `${names[0]} ${names[1]}`;
                    }
                    return names[0];
                });

            // Full name on hover
            el.append('title').text(d.data.fullName);
        });

        // 7. Initial Zoom
        const initialScale = 0.9;
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(width / 2 - width * initialScale / 2, 20)
            .scale(initialScale)
        );

    }, [treeData]);

    if (!data) return <div className="p-10 text-center">جاري تحميل الشجرة...</div>;

    return (
        <div
            className="relative w-full h-full overflow-hidden"
            ref={containerRef}
            dir="rtl"
            style={{
                background: CONFIG.colors.bg,
                fontFamily: "'Cairo', 'Tajawal', sans-serif"
            }}
        >
            {/* Header & Title */}
            <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
                <h1 className="text-3xl font-bold text-[#5D4037] mb-2 drop-shadow-sm">
                    شجرة عائلة الشاعر
                </h1>
                <div className="inline-block bg-[#6d4c41] text-white px-4 py-1 rounded-full text-sm shadow-md">
                    {treeData ? `${treeData.total} اسم تقريباً` : '...'}
                </div>
            </div>

            {/* Decorative Frame Corners */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" style={{ backgroundImage: 'url("/assets/frame-corner.svg")', transform: 'rotate(0deg)' }}>
                {/* Corner SVG inline if file not exists */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C4A962] fill-current opacity-80">
                    <path d="M0 0 L100 0 L100 10 L20 10 C15 10 10 15 10 20 L10 100 L0 100 Z" />
                    <circle cx="15" cy="15" r="3" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none transform scale-x-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C4A962] fill-current opacity-80">
                    <path d="M0 0 L100 0 L100 10 L20 10 C15 10 10 15 10 20 L10 100 L0 100 Z" />
                    <circle cx="15" cy="15" r="3" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none transform scale-y-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C4A962] fill-current opacity-80">
                    <path d="M0 0 L100 0 L100 10 L20 10 C15 10 10 15 10 20 L10 100 L0 100 Z" />
                    <circle cx="15" cy="15" r="3" />
                </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none transform scale-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C4A962] fill-current opacity-80">
                    <path d="M0 0 L100 0 L100 10 L20 10 C15 10 10 15 10 20 L10 100 L0 100 Z" />
                    <circle cx="15" cy="15" r="3" />
                </svg>
            </div>

            {/* SVG Canvas */}
            <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '90vh' }} />

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                <button className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-gray-700 transition" onClick={() => {
                    const svg = d3.select(svgRef.current);
                    svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1));
                }}>
                    🔄 إعادة تعيين
                </button>
            </div>

            {/* Node Info Panel */}
            {selectedNode && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full border border-amber-200 z-30 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-[#5D4037]">{selectedNode.fullName}</h3>
                        <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        {selectedNode.fatherName && <p>الأب: {selectedNode.fatherName}</p>}
                        {selectedNode.generation && <p>الجيل: {selectedNode.generation}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganicOliveTree;
