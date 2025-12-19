"use client"

import { useState, useEffect } from "react"
import { Input, Select, Table, Tag, Button, Space, Avatar, Popconfirm } from "antd"
import { Search, PlusCircle, X, Upload } from "lucide-react"
import { toast } from "react-toastify"
import { getEmployees, addEmployee, deleteEmployee } from "../utils/employeeApi"

function Employees() {
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "male",
    dateOfBirth: "",
    avatar: "",
    joinDate: new Date().toISOString().split("T")[0],
  })
  const [formErrors, setFormErrors] = useState({})
  const [avatarPreview, setAvatarPreview] = useState("")

  // ✅ Lấy danh sách nhân viên
  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const employeeResponse = await getEmployees()
      setEmployees(employeeResponse.data || [])
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error)
      toast.error("Không thể tải danh sách nhân viên")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // ✅ Handle input form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = String(reader.result)

        setAvatarPreview(base64String)
        setNewEmployee((prev) => ({
          ...prev,
          avatar: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ Validate form
  const validateForm = () => {
    const errors = {}
    if (!newEmployee.firstName) errors.firstName = "Vui lòng nhập tên"
    if (!newEmployee.lastName) errors.lastName = "Vui lòng nhập họ"
    if (!newEmployee.email) {
      errors.email = "Vui lòng nhập email"
    } else if (!/^\S+@\S+\.\S+$/.test(newEmployee.email)) {
      errors.email = "Email không hợp lệ"
    }
    if (!newEmployee.phone) errors.phone = "Vui lòng nhập số điện thoại"
    if (!newEmployee.dateOfBirth) errors.dateOfBirth = "Vui lòng nhập ngày sinh"
    if (!newEmployee.joinDate) errors.joinDate = "Vui lòng nhập ngày vào làm"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ✅ Thêm nhân viên mới
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const employeeData = {
        ...newEmployee,
        avatar: newEmployee.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + newEmployee.email,
      }
      await addEmployee(employeeData)
      toast.success("Thêm nhân viên thành công!")
      setShowAddModal(false)
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "male",
        dateOfBirth: "",
        avatar: "",
        joinDate: new Date().toISOString().split("T")[0],
      })
      setAvatarPreview("")

      // ✅ Refetch dữ liệu ngay sau khi thêm
      fetchEmployees()
    } catch (error) {
      console.error("Error adding employee:", error)
      toast.error(error.message || "Lỗi khi thêm nhân viên")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Xóa nhân viên (đổi trạng thái nghỉ việc + refetch)
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn cho nhân viên này nghỉ việc?")) {
      try {
        setIsLoading(true)
        await deleteEmployee(id, { deleteUser: true })
        toast.success("Đã cập nhật trạng thái nhân viên thành nghỉ việc!")

        // ✅ Refetch lại dữ liệu sau khi xóa (nghỉ việc)
        fetchEmployees()
      } catch (error) {
        console.error("Error deleting employee:", error)
        toast.error(error.message || "Lỗi khi cập nhật trạng thái nhân viên")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // ✅ Lọc nhân viên
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    const matchesSearch = fullName.includes(search) || (employee.email && employee.email.toLowerCase().includes(search))
    const matchesDepartment =
      departmentFilter === "all" || (employee.department && employee.department._id === departmentFilter)
    return matchesSearch && matchesDepartment
  })

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "fullName",
      key: "fullName",
      render: (_value, employee) => (
        <Space>
          <Avatar src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`} />
          <div>
            <div className="font-medium text-gray-900">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "employeeId",
      key: "employeeId",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (value) => (value === "admin" ? "Quản lý" : "Nhân viên"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "default"} style={{ borderRadius: 999, padding: "2px 10px" }}>
          {status === "active" ? "Đang làm việc" : "Nghỉ việc"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_value, employee) => (
        <Popconfirm
          title="Cho nghỉ việc?"
          okText="Xác nhận"
          cancelText="Hủy"
          onConfirm={() => handleDeleteEmployee(employee._id)}
        >
          <Button danger type="primary" ghost size="small">
            Cho nghỉ việc
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Nhân viên</h1>
          <p className="text-gray-500">Quản lý thông tin nhân viên trong hệ thống.</p>
        </div>
        <Button type="primary" icon={<PlusCircle className="h-4 w-4" />} onClick={() => setShowAddModal(true)}>
          Thêm nhân viên
        </Button>
      </div>

      {/* Thanh tìm kiếm + lọc */}
      <Space direction="vertical" size="middle" className="w-full">
        <Input
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Search className="h-4 w-4 text-gray-400" />}
          placeholder="Tìm nhân viên..."
          className="shadow-sm"
        />
        <Select
          value={departmentFilter}
          onChange={setDepartmentFilter}
          size="large"
          className="min-w-[200px]"
          options={[
            { label: "Tất cả phòng ban", value: "all" },
            ...departments.map((department) => ({ label: department.name, value: department._id })),
          ]}
        />
      </Space>

      {/* Bảng danh sách nhân viên */}
      <div className="bg-white rounded-lg shadow-sm border p-2">
        <Table
          columns={columns}
          dataSource={filteredEmployees.map((e) => ({ ...e, key: e._id }))}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Modal thêm nhân viên */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-semibold">Thêm nhân viên mới</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview || "/placeholder.svg"}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Upload className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">Tải ảnh đại diện</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500">Nếu bỏ trống, sẽ sử dụng avatar mặc định</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      value={newEmployee.lastName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      value={newEmployee.firstName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={newEmployee.gender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newEmployee.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ngày vào làm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={newEmployee.joinDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.joinDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.joinDate && <p className="text-xs text-red-500 mt-1">{formErrors.joinDate}</p>}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Đang thêm..." : "Thêm nhân viên"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees