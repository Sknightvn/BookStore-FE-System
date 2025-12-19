import { useState, useEffect } from "react"
import { notification, Table, Input, Select, Tag, Space, Button, Dropdown } from "antd"
import { Search, MoreHorizontal, Package, Clock, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"

function DetailOrders() {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [returnFilter, setReturnFilter] = useState("all")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://bookstore-be-b450.onrender.com/api/orders")
        const result = await res.json()

        if (result.success && result.orders) {
          const mappedOrders = result.orders.map((o) => ({
            _id: o._id,
            orderId: o.orderCode,
            customerName: o.shippingAddress?.fullName ?? "Không rõ",
            customerEmail: o.shippingAddress?.email ?? "Không có",
            orderDate: o.createdAt,
            totalAmount: o.total,
            status: o.status,
            items: o.items,
            returnRequest: null,
          }))
          setOrders(mappedOrders)
        }
      } catch (err) {
        console.error("❌ Error fetching orders:", err)
      }
    }

    // Fetch immediately on mount
    fetchData()

    // Set up interval to fetch every 4 seconds
    const intervalId = setInterval(() => {
      fetchData()
    }, 4000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

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

  const formatCurrency = (num) => {
    return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { label: "Chờ xử lý", color: "gold", icon: Clock }
      case "processing":
        return { label: "Đang xử lý", color: "blue", icon: Clock }
      case "shipping":
        return { label: "Vận chuyển", color: "geekblue", icon: Package }
      case "delivered":
        return { label: "Đã giao", color: "green", icon: CheckCircle }
      case "cancelled":
        return { label: "Từ chối trả hàng", color: "red", icon: XCircle }
      case "shipped":
        return { label: "Đã gửi", color: "geekblue", icon: Package }
      case "yeu_cau_hoan_tra":
        return { label: "Yêu cầu hoàn trả", color: "orange", icon: Package }
      case "paid":
        return { label: "Đã trả hàng", color: "cyan", icon: CheckCircle }
      case "tuchoi":
        return { label: "Huỷ đơn", color: "red", icon: XCircle }
      default:
        return { label: "Không rõ", color: "default", icon: AlertTriangle }
    }
  }

  const getReturnStatusInfo = (order) => {
    if (!order) return { label: "Không", color: "default" }

    if (["yeu_cau_hoan_tra", "paid", "cancelled"].includes(order.status)) {
      return { label: "Có", color: "green" }
    }

    if (order.returnRequest) {
      return { label: "Yêu cầu", color: "gold" }
    }

    return { label: "Không", color: "default" }
  }

  const canReturnOrder = (orderDate) => {
    const now = new Date()
    const order = new Date(orderDate)
    const diffDays = (now - order) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  const handleReturnRequest = (orderId, action) => {
    const message = action === "approve" ? "Chấp nhận hoàn trả" : "Từ chối hoàn trả"

    notification.open({
      message: `Đơn hàng ${orderId} - ${message}`,
      description: `Bạn đã ${message.toLowerCase()} đơn hàng ${orderId}.`,
      onClick: () => {
        console.log("Thông báo được nhấn!")
      },
      duration: 3, // Thời gian hiển thị thông báo (giây)
    })

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
        const info = getReturnStatusInfo(record.returnRequest || record)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-10xl mx-auto space-y-6">
        {/* Tiêu đề */}
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng của khách hàng</p>
        </div>

        {/* Bộ lọc + tìm kiếm */}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={orders.length === 0}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            scroll={{ x: 1000 }}
            onRow={(record) => ({
              onClick: () => navigate(`/orders/${record._id}`),
            })}
            rowClassName="cursor-pointer"
          />
        </div>

      </div>
    </div>
  )
}

export default DetailOrders;