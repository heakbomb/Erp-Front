"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Upload, Download, Sparkles, TrendingUp, TrendingDown } from "lucide-react"

const mockMenuItems = [
  {
    id: 1,
    name: "아메리카노",
    category: "커피",
    price: 4500,
    cost: 1200,
    margin: 73.3,
    aiRecommendedPrice: 4800,
    priceChange: 6.7,
    description: "신선한 원두로 내린 아메리카노",
    status: "판매중",
  },
  {
    id: 2,
    name: "카페라떼",
    category: "커피",
    price: 5000,
    cost: 1800,
    margin: 64.0,
    aiRecommendedPrice: 5200,
    priceChange: 4.0,
    description: "부드러운 우유와 에스프레소",
    status: "판매중",
  },
  {
    id: 3,
    name: "카푸치노",
    category: "커피",
    price: 5000,
    cost: 1900,
    margin: 62.0,
    aiRecommendedPrice: 4900,
    priceChange: -2.0,
    description: "풍부한 거품의 카푸치노",
    status: "판매중",
  },
  {
    id: 4,
    name: "딸기 스무디",
    category: "음료",
    price: 6000,
    cost: 2500,
    margin: 58.3,
    aiRecommendedPrice: 6500,
    priceChange: 8.3,
    description: "신선한 딸기로 만든 스무디",
    status: "품절",
  },
  {
    id: 5,
    name: "치즈케이크",
    category: "디저트",
    price: 6500,
    cost: 2200,
    margin: 66.2,
    aiRecommendedPrice: 6500,
    priceChange: 0,
    description: "부드러운 뉴욕 스타일 치즈케이크",
    status: "판매중",
  },
]

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">메뉴 관리</h1>
          <p className="text-muted-foreground">메뉴와 가격을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <Upload className="mr-2 h-4 w-4" />
            Excel 가져오기
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                메뉴 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>메뉴 추가</DialogTitle>
                <DialogDescription>새로운 메뉴를 등록하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-name">메뉴명</Label>
                  <Input id="menu-name" placeholder="아메리카노" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Input id="category" placeholder="커피" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">판매가</Label>
                    <Input id="price" type="number" placeholder="4500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">원가</Label>
                    <Input id="cost" type="number" placeholder="1200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea id="description" placeholder="메뉴 설명을 입력하세요" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">AI 가격 최적화 추천</CardTitle>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-200">
            원자재 가격 변동을 반영한 최적 가격을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockMenuItems
              .filter((item) => item.priceChange !== 0)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">현재: ₩{item.price.toLocaleString()}</span>
                      <span className="text-sm font-medium text-primary">
                        추천: ₩{item.aiRecommendedPrice.toLocaleString()}
                      </span>
                      <Badge
                        variant={item.priceChange > 0 ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {item.priceChange > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {item.priceChange > 0 ? "+" : ""}
                        {item.priceChange.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm">적용하기</Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">전체 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMenuItems.length}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 마진율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">64.8%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">품절 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1개</div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>메뉴 목록</CardTitle>
              <CardDescription>등록된 메뉴를 관리하세요</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="메뉴 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockMenuItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.category}</CardDescription>
                    </div>
                    <Badge variant={item.status === "판매중" ? "default" : "secondary"}>{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">판매가</span>
                      <span className="font-medium">₩{item.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">원가</span>
                      <span className="font-medium">₩{item.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">마진율</span>
                      <span className="font-medium text-primary">{item.margin.toFixed(1)}%</span>
                    </div>
                    {item.priceChange !== 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          AI 추천가
                        </span>
                        <span className="font-medium text-blue-600">₩{item.aiRecommendedPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="mr-1 h-3 w-3" />
                      수정
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Trash2 className="mr-1 h-3 w-3" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
