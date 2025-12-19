"use client"

import { useState, useEffect } from "react"
import { Table, Input, Select, Tag, Space, Button, Dropdown } from "antd"
import { Search, MoreHorizontal, Package, Clock, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react"

// Mock API
const getOrders = async () => {
  return {
    data: [
      {
        _id: "1",
        orderId: "DH001",
        customerName: "Nguyễn Văn An",
        customerEmail: "nguyenvanan@email.com",
        orderDate: "2024-12-20",
        status: "delivered",
        totalAmount: 450000,
        items: [
          { productName: "Sách Lập trình JavaScript", quantity: 2, price: 200000 },
          { productName: "Sách React và Next.js", quantity: 1, price: 250000 },
        ],
        returnRequest: {
          status: "requested",
          requestDate: "2024-12-22",
          reason: "Sách bị lỗi in",
          canReturn: true,
        },
      },
    ],
  }
}

function DetailOrders() {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [returnFilter, setReturnFilter] = useState("all")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const res = await getOrders()
      setOrders(res.data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  // Hàm xử lý lọc dữ liệu
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    const matchReturn =
      returnFilter === "all" ||
      (returnFilter === "none" && !o.returnRequest) ||
      (o.returnRequest && o.returnRequest.status === returnFilter)
    return matchSearch && matchStatus && matchReturn
  })

  // Hàm format tiền
  const formatCurrency = (num) => {
    return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  }

  // Trạng thái đơn hàng
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { label: "Chờ xử lý", color: "gold", icon: Clock }
      case "processing":
        return { label: "Đang xử lý", color: "blue", icon: Clock }
      case "shipped":
        return { label: "Đã gửi", color: "geekblue", icon: Package }
      case "delivered":
        return { label: "Đã giao", color: "green", icon: CheckCircle }
      case "cancelled":
        return { label: "Đã hủy", color: "red", icon: XCircle }
      default:
        return { label: "Không rõ", color: "default", icon: AlertTriangle }
    }
  }

  // Trạng thái hoàn trả
  const getReturnStatusInfo = (returnRequest) => {
    if (!returnRequest) return { label: "Không có", color: "default" }
    switch (returnRequest.status) {
      case "requested":
        return { label: "Yêu cầu", color: "gold" }
      case "approved":
        return { label: "Chấp nhận", color: "green" }
      case "rejected":
        return { label: "Từ chối", color: "red" }
      default:
        return { label: "Không rõ", color: "default" }
    }
  }

  // Cho phép hoàn trả trong 7 ngày
  const canReturnOrder = (orderDate) => {
    const now = new Date()
    const order = new Date(orderDate)
    const diffDays = (now - order) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  // Xử lý hoàn trả
  const handleReturnRequest = (orderId, action) => {
    alert(`Đơn hàng ${orderId} - ${action === "approve" ? "Chấp nhận" : "Từ chối"} hoàn trả`)
    setActiveDropdown(null)
  }

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (_value, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.customerName}</div>
          <div className="text-sm text-gray-500">{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (value) => {
        const canReturn = canReturnOrder(value)
        return (
          <div className="space-y-1">
            <div>{new Date(value).toLocaleDateString("vi-VN")}</div>
            {canReturn && <div className="text-xs text-green-600 font-medium">✓ Có thể hoàn trả</div>}
          </div>
        )
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const info = getStatusInfo(status)
        const Icon = info.icon
        return (
          <Tag color={info.color} style={{ borderRadius: 999, padding: "4px 10px" }}>
            <span className="inline-flex items-center gap-1 font-medium">
              <Icon size={14} /> {info.label}
            </span>
          </Tag>
        )
      },
    },
    {
      title: "Hoàn trả",
      key: "return",
      render: (_, record) => {
        const info = getReturnStatusInfo(record.returnRequest)
        return (
          <Tag color={info.color} style={{ borderRadius: 999, padding: "4px 10px" }}>
            <span className="font-medium">{info.label}</span>
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "approve",
                label: "✓ Chấp nhận hoàn trả",
                onClick: () => handleReturnRequest(record._id, "approve"),
              },
              {
                key: "reject",
                label: "✗ Từ chối hoàn trả",
                onClick: () => handleReturnRequest(record._id, "reject"),
              },
            ],
          }}
        >
          <Button
            shape="circle"
            type="default"
            icon={<MoreHorizontal size={16} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ]

  const dataSource = filteredOrders.map((o) => ({ ...o, key: o._id }))

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-10xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng của khách hàng</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <Space direction="vertical" size="middle" className="w-full">
            <Input
              allowClear
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<Search size={16} className="text-gray-500" />}
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
              className="shadow-sm"
            />
            <Space wrap>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                className="min-w-[200px]"
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Chờ xử lý", value: "pending" },
                  { label: "Đang xử lý", value: "processing" },
                  { label: "Đã gửi", value: "shipped" },
                  { label: "Đã giao", value: "delivered" },
                  { label: "Đã hủy", value: "cancelled" },
                ]}
                prefix={<Filter size={14} />}
              />
              <Select
                value={returnFilter}
                onChange={setReturnFilter}
                size="large"
                className="min-w-[180px]"
                options={[
                  { label: "Tất cả hoàn trả", value: "all" },
                  { label: "Không hoàn trả", value: "none" },
                  { label: "Yêu cầu hoàn trả", value: "requested" },
                  { label: "Đã chấp nhận", value: "approved" },
                  { label: "Đã từ chối", value: "rejected" },
                ]}
              />
            </Space>
          </Space>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-2">
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            scroll={{ x: 1000 }}
            rowClassName="cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

export default DetailOrders
