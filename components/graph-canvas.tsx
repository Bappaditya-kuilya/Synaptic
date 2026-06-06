"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { WorkspaceEdge, WorkspaceNode } from "@/lib/types";

type SimulationNode = WorkspaceNode & d3.SimulationNodeDatum;
type SimulationEdge = WorkspaceEdge & d3.SimulationLinkDatum<SimulationNode>;

const CATEGORY_COLORS: Record<string, string> = {
  systems: "#6db4ff",
  product: "#7ff7be",
  research: "#ffd66d",
  strategy: "#ff8fab",
  design: "#b08cff",
  technology: "#5ce1e6",
  other: "#94a8c5"
};

const RADII = {
  1: 12,
  2: 18,
  3: 26
} as const;

interface GraphCanvasProps {
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export function GraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const width = svgElement.clientWidth || 900;
    const height = svgElement.clientHeight || 700;

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const root = svg.append("g");
    const edgeLayer = root.append("g");
    const nodeLayer = root.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.4])
      .on("zoom", (event) => {
        root.attr("transform", event.transform.toString());
      });

    svg.call(zoom).on("dblclick.zoom", null);

    const simulationNodes: SimulationNode[] = nodes.map((node, index) => ({
      ...node,
      x: node.x ?? width / 2 + Math.cos(index) * 120,
      y: node.y ?? height / 2 + Math.sin(index) * 120
    }));

    const simulationEdges: SimulationEdge[] = edges.map((edge) => ({
      ...edge,
      source: edge.sourceNodeId,
      target: edge.targetNodeId
    }));

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationEdge>(simulationEdges)
          .id((node) => node.id)
          .distance((edge) => 110 - edge.strength * 30)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SimulationNode>().radius((node) => RADII[node.importance] + 18))
      .force("x", d3.forceX(width / 2).strength(0.03))
      .force("y", d3.forceY(height / 2).strength(0.03));

    const edgeSelection = edgeLayer
      .selectAll<SVGLineElement, SimulationEdge>("line")
      .data(simulationEdges, (edge) => edge.id)
      .enter()
      .append("line")
      .attr("stroke", "rgba(151, 174, 206, 0.28)")
      .attr("stroke-width", (edge) => 1 + edge.strength * 1.5)
      .attr("stroke-dasharray", "6 5");

    const nodeSelection = nodeLayer
      .selectAll<SVGGElement, SimulationNode>("g")
      .data(simulationNodes, (node) => node.id)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("click", (_event, node) => onNodeSelect(node.id))
      .call(
        d3
          .drag<SVGGElement, SimulationNode>()
          .on("start", (event, node) => {
            if (!event.active) {
              simulation.alphaTarget(0.18).restart();
            }
            node.fx = node.x;
            node.fy = node.y;
          })
          .on("drag", (event, node) => {
            node.fx = event.x;
            node.fy = event.y;
          })
          .on("end", (event, node) => {
            if (!event.active) {
              simulation.alphaTarget(0);
            }
            node.fx = null;
            node.fy = null;
          })
      );

    nodeSelection
      .append("circle")
      .attr("r", (node) => RADII[node.importance] + 12)
      .attr("fill", "transparent")
      .attr("stroke", (node) =>
        node.id === selectedNodeId
          ? "rgba(255,255,255,0.28)"
          : "rgba(109, 180, 255, 0.14)"
      );

    nodeSelection
      .append("circle")
      .attr("r", (node) => RADII[node.importance])
      .attr("fill", (node) => `${CATEGORY_COLORS[node.category] ?? CATEGORY_COLORS.other}22`)
      .attr("stroke", (node) => CATEGORY_COLORS[node.category] ?? CATEGORY_COLORS.other)
      .attr("stroke-width", (node) => (node.id === selectedNodeId ? 3 : 1.4));

    nodeSelection
      .append("text")
      .text((node) => node.label)
      .attr("y", (node) => RADII[node.importance] + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#eaf2ff")
      .attr("font-size", 12)
      .attr("font-family", "Inter, sans-serif");

    simulation.on("tick", () => {
      edgeSelection
        .attr("x1", (edge) => (edge.source as SimulationNode).x ?? 0)
        .attr("y1", (edge) => (edge.source as SimulationNode).y ?? 0)
        .attr("x2", (edge) => (edge.target as SimulationNode).x ?? 0)
        .attr("y2", (edge) => (edge.target as SimulationNode).y ?? 0);

      nodeSelection.attr("transform", (node) => `translate(${node.x ?? 0}, ${node.y ?? 0})`);
    });

    svg.on("click", (event) => {
      if (event.target === svgElement) {
        onNodeSelect(null);
      }
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, onNodeSelect, selectedNodeId]);

  return (
    <div className="graph-stage">
      <svg className="graph-svg" ref={svgRef} />
    </div>
  );
}
