"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ArrowLeft, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import usePriceOpt from "./usePriceOpt";

export default function PriceOptView() {
  const { menuItems, selectedMenu, setSelectedMenu, isLoading } = usePriceOpt();

  if (isLoading || !selectedMenu) return <div>로딩 중...</div>;

  const currentCostData = selectedMenu.currentMaterials.map((m) => ({
    name: m.name,
    value: m.cost,
    color: "hsl(var(--chart-1))",
  }));

  const alternativeCostData = selectedMenu.alternativeMaterials.map((m) => ({
    name: m.name,
    value: m.cost,
    color: "hsl(var(--chart-2))",
  }));

  const comparisonData = [
    {
      category: "원가",
      current: selectedMenu.currentCost,
      alternative: selectedMenu.alternativeCost,
    },
    {
      category: "마진",
      current: selectedMenu.currentPrice - selectedMenu.currentCost,
      alternative: selectedMenu.suggestedPrice - selectedMenu.alternativeCost,
    },
  ];

  const marginDiff = selectedMenu.alternativeMargin - selectedMenu.currentMargin;
  const costSavings = selectedMenu.currentCost - selectedMenu.alternativeCost;

  return (
    <div className="space-y-6">
      <Link href="/owner/ai-insights">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          AI 인사이트로 돌아가기
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">AI 가격 최적화 & 원자재 분석</h1>
        <p className="text-muted-foreground">원자재 변경에 따른 수익성 비교 분석</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {menuItems.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setSelectedMenu(menu)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              selectedMenu.id === menu.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{menu.name}</span>
              {selectedMenu.id === menu.id && <Badge>선택됨</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              현재 가격: ₩{menu.currentPrice.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI 추천</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-lg font-medium">
              {selectedMenu.name}의 원자재를 변경하면 마진율을{" "}
              <span className="text-primary font-bold">+{marginDiff.toFixed(1)}%</span> 개선할 수 있습니다
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>원가 절감: ₩{costSavings.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>마진 증가: {marginDiff.toFixed(1)}%p</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">비교 분석</TabsTrigger>
          <TabsTrigger value="materials">원자재 상세</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>원가 구성 비교</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    {/* ✅ [수정] value 타입을 number | undefined로 지정하고 안전하게 처리 */}
                    <Tooltip formatter={(value: number | undefined) => `₩${(value ?? 0).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="current" fill="hsl(var(--chart-1))" name="현재" />
                    <Bar dataKey="alternative" fill="hsl(var(--primary))" name="대체 (추천)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>원자재 비용 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={currentCostData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value">
                        {currentCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={alternativeCostData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value">
                        {alternativeCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>원자재 상세 비교</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMenu.currentMaterials.map((current, i) => {
                  const alternative = selectedMenu.alternativeMaterials[i];
                  return (
                    <div key={i} className="p-4 rounded-lg border grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">현재</p>
                        <p className="font-medium">{current.name} ({current.origin})</p>
                        <p className="font-bold">₩{current.cost.toLocaleString()}</p>
                      </div>
                      <div className="bg-primary/5 p-2 rounded">
                        <p className="text-sm text-primary">대체 (추천)</p>
                        <p className="font-medium">{alternative.name} ({alternative.origin})</p>
                        <p className="font-bold text-primary">₩{alternative.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}