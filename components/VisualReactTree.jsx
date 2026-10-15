"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { Sparkles, Check, Compass, Layers, CheckCircle2, Trees } from "lucide-react";
import confetti from "canvas-confetti";

// Custom Topic Node on Living Canvas
function TopicNode({ data }) {
  const {
    topic,
    categoryName,
    isSelected,
    isMastered,
    isLighthouse,
    tierColor,
    tierLabel,
    onSelect,
  } = data;

  return (
    <div
      onClick={() => onSelect(topic)}
      className={`relative group px-4 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs select-none min-w-[160px] max-w-[240px] text-right font-sans ${
        isSelected
          ? "bg-[#181A20] border-[#181A20] text-white shadow-lg ring-2 ring-sky-400/40 scale-105"
          : isMastered
          ? "bg-[#F0FDF4] border-[#86EFAC] text-[#166534] hover:bg-[#DCFCE7] hover:border-[#4ADE80]"
          : "bg-white border-[#E6E0D5] text-[#181A20] hover:border-[#B8B0A2] hover:bg-[#FAF8F5] hover:shadow-md"
      }`}
      dir="rtl"
    >
      {/* Target handle connecting from parent */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="!bg-[#0284C7] !w-2 !h-2 !border-2 !border-white"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: isMastered ? "#10B981" : tierColor }}
          />
          <span className="font-semibold text-xs truncate leading-snug" dir="auto">
            {topic.title}
          </span>
        </div>

        {isLighthouse && (
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mt-1.5 text-[10px] font-mono opacity-80">
        <span className={isSelected ? "text-neutral-300" : "text-[#6B7280]"}>
          {tierLabel}
        </span>
        {isMastered && (
          <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            <span>مسلط</span>
          </span>
        )}
      </div>

      {/* Source handle connecting to child concepts */}
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-[#0284C7] !w-2 !h-2 !border-2 !border-white"
      />
    </div>
  );
}

// Custom Root Node (The Branch Base)
function BranchRootNode({ data }) {
  const { title, totalCount, masteredCount } = data;
  return (
    <div
      className="px-5 py-3 rounded-2xl border-2 border-emerald-500/40 bg-white text-[#181A20] shadow-md text-center font-sans select-none min-w-[200px]"
      dir="rtl"
    >
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
        <span>🌿</span>
        <span>پایه شاخه: {title}</span>
      </div>
      <div className="text-[11px] font-mono text-[#6B7280] mt-1">
        پیشرفت: {masteredCount} از {totalCount} مفهوم
      </div>
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-emerald-600 !w-2.5 !h-2.5 !border-2 !border-white"
      />
    </div>
  );
}

const nodeTypes = {
  topicNode: TopicNode,
  branchRoot: BranchRootNode,
};

export default function VisualReactTree({
  categoriesWithTopics,
  selectedTopic,
  onSelectTopic,
  masteredIds = new Set(),
}) {
  const [activeBranchId, setActiveBranchId] = useState(
    categoriesWithTopics[0]?.id || null
  );

  const activeCategory = useMemo(() => {
    return (
      categoriesWithTopics.find((c) => c.id === activeBranchId) ||
      categoriesWithTopics[0]
    );
  }, [categoriesWithTopics, activeBranchId]);

  // Compute hierarchical tree nodes and bezier edges for the active branch
  const { treeNodes, treeEdges } = useMemo(() => {
    if (!activeCategory) return { treeNodes: [], treeEdges: [] };

    const topics = activeCategory.topics || [];
    const totalCount = topics.length;
    const masteredCount = topics.filter((t) => masteredIds.has(t.id)).length;

    // 1. Root Node (Center bottom)
    const rootId = `root-${activeCategory.id}`;
    const initialNodes = [
      {
        id: rootId,
        type: "branchRoot",
        position: { x: 300, y: 480 },
        data: {
          title: activeCategory.name,
          totalCount,
          masteredCount,
        },
      },
    ];

    const initialEdges = [];

    // 2. Lay out topic nodes in organic hierarchical tiers:
    // Roots (🟢) on lower tier, Trunk (🔵) in middle tier, Canopy (🟣) on top tier
    const beginner = topics.filter((t) => t.tier === "🟢");
    const common = topics.filter((t) => t.tier === "🔵");
    const advanced = topics.filter((t) => t.tier === "🟣");

    // Tier layers configuration
    const tiers = [
      { list: beginner, y: 320, label: "ریشه", color: "#059669" },
      { list: common, y: 170, label: "ساقه", color: "#0284C7" },
      { list: advanced, y: 20, label: "سایبان", color: "#7C3AED" },
    ];

    tiers.forEach((tier) => {
      const count = tier.list.length;
      if (count === 0) return;

      const spacing = Math.min(220, 750 / (count + 1));
      const startX = 350 - ((count - 1) * spacing) / 2;

      tier.list.forEach((topic, idx) => {
        const nodeId = `topic-${topic.id}`;
        const x = startX + idx * spacing;
        const y = tier.y + (idx % 2 === 0 ? 0 : 25); // natural organic stagger

        const isSelected = selectedTopic?.id === topic.id;
        const isMastered = masteredIds.has(topic.id);
        const isLighthouse =
          topic.slug?.toLowerCase().replace(/[^a-z]/g, "") === "useeffect";

        initialNodes.push({
          id: nodeId,
          type: "topicNode",
          position: { x, y },
          data: {
            topic,
            categoryName: activeCategory.name,
            isSelected,
            isMastered,
            isLighthouse,
            tierColor: tier.color,
            tierLabel: tier.label,
            onSelect: onSelectTopic,
          },
        });

        // Connect edge from root to beginner, or from lower tiers upwards
        const sourceId =
          tier.label === "ریشه"
            ? rootId
            : beginner.length > 0
            ? `topic-${beginner[idx % beginner.length].id}`
            : rootId;

        initialEdges.push({
          id: `edge-${sourceId}-${nodeId}`,
          source: sourceId,
          target: nodeId,
          type: "smoothstep",
          animated: isSelected,
          style: {
            stroke: isSelected
              ? "#0284C7"
              : isMastered
              ? "#10B981"
              : "#D1C9BC",
            strokeWidth: isSelected ? 2.5 : 1.5,
          },
        });
      });
    });

    return { treeNodes: initialNodes, treeEdges: initialEdges };
  }, [activeCategory, selectedTopic, masteredIds, onSelectTopic]);

  const [nodes, setNodes, onNodesChange] = useNodesState(treeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(treeEdges);

  // Sync state whenever treeNodes/treeEdges change
  useEffect(() => {
    setNodes(treeNodes);
    setEdges(treeEdges);
  }, [treeNodes, treeEdges, setNodes, setEdges]);

  // Trigger celebration confetti when mastered
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10B981", "#0284C7", "#7C3AED", "#F59E0B"],
    });
  }, []);

  // Handle node click event directly in React Flow
  const handleNodeClick = useCallback(
    (event, node) => {
      if (node.type === "topicNode" && node.data?.topic) {
        onSelectTopic(node.data.topic);
      }
    },
    [onSelectTopic]
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#FAF8F5] text-[#181A20] relative font-sans" dir="rtl">
      {/* Top Branch Selector Navigation Bar */}
      <div className="shrink-0 z-20 px-6 py-3 border-b border-[#E6E0D5] bg-[#FFFFFF]/90 backdrop-blur-md flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold">
            🌿
          </span>
          <span className="text-xs font-bold text-[#181A20]">
            شاخه‌های درخت ری‌اکت:
          </span>
        </div>

        {/* Branch Selector Chips */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-0.5 custom-scrollbar">
          {categoriesWithTopics.map((cat) => {
            const isSelected = cat.id === activeBranchId;
            const masteredCount = cat.topics.filter((t) => masteredIds.has(t.id)).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveBranchId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? "bg-[#181A20] text-white font-bold border-[#181A20] shadow-sm"
                    : "bg-white text-[#4A5260] border-[#E6E0D5] hover:border-[#BDB5A6] hover:text-[#181A20]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400" : "bg-[#9CA3AF]"}`} />
                <span className="truncate max-w-[130px]">{cat.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? "bg-[#2D333F] text-neutral-300" : "bg-[#F3EFE9] text-[#6B7280]"}`}>
                  {masteredCount}/{cat.topics.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ReactFlow Interactive Botanical Living Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          className="bg-[#FAF8F5]"
        >
          {/* Subtle Dot Grid */}
          <Background color="#DCD5C9" gap={24} size={1.2} />

          {/* Minimal Controls */}
          <Controls position="bottom-left" showInteractive={false} />

          {/* Minimalist MiniMap */}
          <MiniMap
            position="bottom-right"
            nodeColor={(n) => (n.type === "branchRoot" ? "#059669" : "#0284C7")}
            maskColor="rgba(250, 248, 245, 0.7)"
            className="!rounded-xl !border !border-[#E6E0D5] !bg-white !shadow-xs"
          />
        </ReactFlow>
      </div>

      {/* Bottom Editorial Caption */}
      <div className="shrink-0 px-6 py-2.5 border-t border-[#E6E0D5] bg-[#FFFFFF]/90 flex items-center justify-between text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-3">
          <span>قابلیت زوم و حرکت با ماوس / ترک‌پد فعال است • کلیک روی هر گره برای مشاهده کد و مدل ذهنی</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline font-mono">🟢 ریشه 🔵 ساقه 🟣 سایبان</span>
        </div>
        <div className="font-mono">
          پیشرفت: {activeCategory?.topics.filter((t) => masteredIds.has(t.id)).length} از {activeCategory?.topics.length}
        </div>
      </div>
    </div>
  );
}
