import { Users, Clock, Receipt, TrendingUp } from "lucide-react"
import { Card, Row, Col, Statistic, Typography, Space, Skeleton } from "antd"
import { BarChart } from "../components/charts/BarChart"
import { RecentActivity } from "../components/dashboard/RecentActivity"
import { getEmployees } from "../utils/employeeApi"
import { getBooks, getStatisticsTop, getCategories, getStatistics } from "../utils/booksApi"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [products, setProducts] = useState([])
  const [topProducts, setTopProducts] = useState([]) // State for top-selling products
  const [totalRevenue, setTotalRevenue] = useState(0) // State for total revenue
  const [categories, setCategories] = useState([]) // State for categories
  const [isLoading, setIsLoading] = useState(true)

  // Tính số lượng sản phẩm theo từng loại từ API categories
  const getProductCountByCategory = () => {
    // Sử dụng dữ liệu từ API categories với trường quantity
    if (categories && categories.length > 0) {
      return categories.map((category) => ({
        name: category.name,
        total: category.quantity || 0,
      }))
    }
    return []
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const [
          statisticsResponse,
          categoriesResponse,
          employeesResponse,
          booksResponse,
          topProductsResponse,
        ] = await Promise.all([
          getStatistics(),
          getCategories(),
          getEmployees(),
          getBooks(),
          getStatisticsTop(),
        ])

        const totalRevenueValue =
          statisticsResponse?.totalRevenue || statisticsResponse?.data?.totalRevenue || 0
        setTotalRevenue(totalRevenueValue)

        setCategories(categoriesResponse?.data || categoriesResponse || [])
        setEmployees(employeesResponse?.data || [])
        setProducts(booksResponse?.data || [])

        const topProductsData =
          topProductsResponse?.topProducts || topProductsResponse?.data?.topProducts || []
        setTopProducts(topProductsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])


  // Tổng số nhân viên
  const totalEmployees = employees.length

  // Tổng số sản phẩm
  const totalProducts = products.length

  // Dữ liệu biểu đồ theo loại sản phẩm
  const chartData = getProductCountByCategory()

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2} style={{ marginBottom: 4 }}>
          Dashboard
        </Typography.Title>
        <Typography.Text type="secondary">Tổng quan về hệ thống quản lý bán sách trực tuyến.</Typography.Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            bordered
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 12, boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}
          >
            <Space size="large" align="start" className="w-full justify-between">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Tổng nhân viên
                </Typography.Text>
                <div className="mt-1">
                  {isLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                  ) : (
                    <Statistic value={totalEmployees} valueStyle={{ fontSize: 24, fontWeight: 700 }} />
                  )}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  +{totalEmployees > 0 ? 3 : 0} trong tháng này
                </Typography.Text>
              </div>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-50">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            bordered
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 12, boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}
          >
            <Space size="large" align="start" className="w-full justify-between">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Tổng sản phẩm
                </Typography.Text>
                <div className="mt-1">
                  {isLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                  ) : (
                    <Statistic value={totalProducts} valueStyle={{ fontSize: 24, fontWeight: 700 }} />
                  )}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  +{totalProducts > 0 ? 2 : 0} trong tháng này
                </Typography.Text>
              </div>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50">
                <Clock className="h-4 w-4 text-emerald-500" />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            bordered
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 12, boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}
          >
            <Space size="large" align="start" className="w-full justify-between">
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Tổng doanh thu
                </Typography.Text>
                <div className="mt-1">
                  {isLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 140 }} />
                  ) : (
                    <Typography.Title level={4} style={{ margin: 0, color: "#16a34a" }}>
                      {totalRevenue.toLocaleString("vi-VN")}₫
                    </Typography.Title>
                  )}
                </div>
              </div>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-orange-50">
                <Receipt className="h-4 w-4 text-orange-500" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={<Typography.Text strong>Tổng quan</Typography.Text>}
            extra={<Typography.Text type="secondary">Số lượng sản phẩm theo loại</Typography.Text>}
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 12 }}
          >
            <div style={{ height: 320 }}>
              {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <BarChart data={chartData} />}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<Typography.Text strong>Hoạt động gần đây</Typography.Text>}
            extra={<Typography.Text type="secondary">Các hoạt động mới trong hệ thống</Typography.Text>}
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 12 }}
          >
            {isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : <RecentActivity />}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard