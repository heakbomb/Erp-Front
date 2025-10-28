"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const dailySalesData = [
  { date: "04/14", sales: 850000 },
  { date: "04/15", sales: 920000 },
  { date: "04/16", sales: 780000 },
  { date: "04/17", sales: 1050000 },
  { date: "04/18", sales: 980000 },
  { date: "04/19", sales: 1120000 },
  { date: "04/20", sales: 1234000 },
]

const topMenus = [
  { name: "아메리카노", quantity: 145, revenue: 652500, growth: 12.5 },
  { name: "카페라떼", quantity: 98, revenue: 490000, growth: 8.3 },
  { name: "카푸치노", quantity: 76, revenue: 380000, growth: -2.1 },
  { name: "치즈케이크", quantity: 45, revenue: 292500, growth: 15.2 },
  { name: "딸기 스무디", quantity: 32, revenue: 192000, growth: 5.7 },
]

const recentTransactions = [
  { id: "TXN-001", time: "14:35", items: "아메리카노 x2, 치즈케이크 x1", amount: 15500 },
  { id: "TXN-002", time: "14:28", items: "카페라떼 x1", amount: 5000 },
  { id: "TXN-003", time: "14:15", items: "아메리카노 x1, 카푸치노 x1", amount: 9500 },
  { id: "TXN-004", time: "14:02", items: "딸기 스무디 x2", amount: 12000 },
  { id: "TXN-005", time: "13:55", items: "아메리카노 x3", amount: 13500 },
]

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">매출 관리</h1>
          <p className="text-muted-foreground">매출 현황을 확인하고 분석하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            PDF 내보내기
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩1,234,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12.5%</span> 전일 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 주 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩6,934,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+8.7%</span> 전주 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩28,450,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+8.2%</span> 전월 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 객단가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩12,500</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+3.2%</span> 전일 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">매출 현황</TabsTrigger>
          <TabsTrigger value="menu">메뉴별 분석</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일별 매출 추이</CardTitle>
              <CardDescription>최근 7일간의 매출 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} labelStyle={{ color: "#000" }} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>인기 메뉴 TOP 5</CardTitle>
              <CardDescription>오늘 기준 판매량 상위 메뉴</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순위</TableHead>
                    <TableHead>메뉴명</TableHead>
                    <TableHead>판매량</TableHead>
                    <TableHead>매출액</TableHead>
                    <TableHead>증감률</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMenus.map((menu, index) => (
                    <TableRow key={menu.name}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{menu.name}</TableCell>
                      <TableCell>{menu.quantity}개</TableCell>
                      <TableCell>₩{menu.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {menu.growth > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">+{menu.growth}%</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">{menu.growth}%</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 거래 내역</CardTitle>
              <CardDescription>오늘의 거래 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>거래번호</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>주문 내역</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.time}</TableCell>
                      <TableCell>{transaction.items}</TableCell>
                      <TableCell className="text-right">₩{transaction.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
