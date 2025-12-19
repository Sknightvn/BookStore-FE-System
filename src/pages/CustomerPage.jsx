"use client"

import React, { useState, useEffect } from "react"
import { Input, Select, Table, Tag, Avatar, Space } from "antd"
import { Search } from "lucide-react"
import { toast } from "react-toastify"
import { getCustomers } from "../utils/customerApi"

function Customers() {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const customersResponse = await getCustomers()
        setCustomers(customersResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.fullName || ""}` // Safeguard if fullName is missing
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.address && customer.address[0]?.street?.toLowerCase().includes(searchTerm.toLowerCase())) // Check if address is available

    const matchesStatus = statusFilter === "all" || (customer.isActive ? "active" : "inactive") === statusFilter

    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      render: (_value, customer) => (
        <Space>
          <Avatar src={customer.avatar || undefined}>
            {(customer.fullName || "").charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{customer.fullName}</div>
            <div className="text-sm text-gray-500">{customer.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (_value, customer) =>
        customer.address && customer.address.length > 0
          ? `${customer.address[0].street}, ${customer.address[0].ward}, ${customer.address[0].district}, ${customer.address[0].city}`
          : "Chưa cập nhật",
      ellipsis: true,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"} style={{ borderRadius: 999, padding: "2px 10px" }}>
          {isActive ? "Đang hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-muted-foreground">Quản lý thông tin khách hàng trong hệ thống.</p>
        </div>
      </div>

      <Space direction="vertical" size="middle" className="w-full">
        <Input
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Search size={16} className="text-gray-500" />}
          placeholder="Tìm khách hàng..."
          className="shadow-sm"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="large"
          className="min-w-[200px]"
          options={[
            { label: "Tất cả trạng thái", value: "all" },
            { label: "Đang hoạt động", value: "active" },
            { label: "Không hoạt động", value: "inactive" },
          ]}
        />
      </Space>

      <div className="bg-white rounded-lg shadow-sm border p-2">
        <Table
          columns={columns}
          dataSource={filteredCustomers.map((c) => ({ ...c, key: c._id }))}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
          }}
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  )
}

export default Customers