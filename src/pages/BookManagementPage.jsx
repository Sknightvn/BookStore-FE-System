import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Modal, message, Table, Breadcrumb, Button, Input, Badge, Tooltip, Space, Tag } from "antd";
import AddBookModal from "./AddBookModal";
import EditBookModal from "./EditBookModal";
const API_URL = import.meta.env.VITE_API_URL || "https://bookstore-be-b450.onrender.com/api";

const BookManagementPage = () => {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalPages: 1,
    total: 0,
  });

  // fetch all books
  const fetchBooks = async (page = 1, pageSize = pagination.limit) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/books`, {
        params: {
          page,
          limit: pageSize,
        },
      });
      if (res.data && res.data.success) {
        setBooks(res.data.data);
        const paging = res.data.pagination || {};
        setPagination((prev) => ({
          ...prev,
          ...paging,
          limit: paging.limit || pageSize || prev.limit,
          page: paging.page || page,
        }));
        setCurrentPage(paging.page || page);
      } else {
        setBooks(res.data.data || res.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải sách:", error);
      message.error("Không thể tải danh sách sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // filter by keyword
  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();
    return (
      (book.title || "").toLowerCase().includes(keyword) ||
      (book.author || "").toLowerCase().includes(keyword) ||
      (book.ISSN || "").toLowerCase().includes(keyword) ||
      ((book.category?.name || "") || "").toLowerCase().includes(keyword)
    );
  });

  const totalBooks = pagination.total || books.length;
  const totalstock = books.reduce((sum, b) => sum + (b.stock || 0), 0);

  const isSearching = search.trim().length > 0;
  const displayBooks = isSearching ? filteredBooks : books;
  const displayTotal = isSearching ? filteredBooks.length : pagination.total || filteredBooks.length;
  const baseIndex = isSearching ? 0 : (pagination.page - 1) * (pagination.limit || displayBooks.length);

  const columns = [
    {
      title: "#",
      dataIndex: "_id",
      width: 70,
      render: (_value, _record, index) => `#${baseIndex + index + 1}`,
    },
    {
      title: "ISBN",
      dataIndex: "ISSN",
      render: (value) => value || "-",
    },
    {
      title: "Tên Sách",
      dataIndex: "title",
      render: (value) => <span className="font-semibold text-blue-700">{value}</span>,
    },
    {
      title: "Tác Giả",
      dataIndex: "author",
      render: (value) => value || "—",
    },
    {
      title: "Thể Loại",
      dataIndex: ["category", "name"],
      render: (value) => value || "Chưa phân loại",
    },
    {
      title: "Năm SX",
      dataIndex: "publishYear",
      render: (value) => value || "-",
    },
    {
      title: "Tập Sách",
      dataIndex: "volume",
      render: (value) => (value ? `Tập ${value}` : "Không có"),
    },
    {
      title: "Số Trang",
      dataIndex: "pages",
      render: (value) => value || "-",
    },
    {
      title: "Giá Bán",
      dataIndex: "price",
      render: (value) => (value !== undefined ? `${Number(value).toLocaleString()} ₫` : "-"),
    },
    {
      title: "Số Lượng",
      dataIndex: "stock",
      render: (value) => {
        const qty = value || 0;
        const tone = qty > 40 ? "success" : qty > 20 ? "warning" : "error";
        return (
          <Tag
            bordered
            color={tone === "success" ? "green" : tone === "warning" ? "gold" : "red"}
            style={{ borderRadius: 999, padding: "2px 10px" }}
          >
            <span className="font-semibold text-xs whitespace-nowrap">{qty} quyển</span>
          </Tag>
        );
      },
    },
    {
      title: "Ảnh",
      dataIndex: "coverImage",
      align: "center",
      render: (url, record) =>
        url ? (
          <img src={url} alt={record.title} className="w-12 h-16 object-cover rounded-md border inline-block shadow-sm" />
        ) : (
          <div className="w-12 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm mx-auto">N/A</div>
        ),
    },
    {
      title: "Hành Động",
      dataIndex: "_id",
      width: 120,
      align: "center",
      render: (_value, record) => (
        <Space size="small" align="center" className="justify-center">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              shape="round"
              size="middle"
              onClick={() => handleEdit(record)}
              icon={<Edit2 size={16} />}
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Xóa sách">
            <Button
              danger
              type="primary"
              ghost
              shape="round"
              size="middle"
              onClick={() => handleDelete(record._id, record.title)}
              icon={<Trash2 size={16} />}
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pager) => {
    const { current, pageSize } = pager;
    if (isSearching) {
      setCurrentPage(current);
      setPagination((prev) => ({ ...prev, limit: pageSize }));
      return;
    }
    fetchBooks(current, pageSize);
  };

  // delete book
  const handleDelete = (bookId, title) => {
    Modal.confirm({
      title: "Xác nhận xóa sách",
      content: `Bạn có chắc chắn muốn xóa "${title}" khỏi danh sách không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      async onOk() {
        try {
          const res = await axios.put(`${API_URL}/books/${bookId}`);
          if (res.data && res.data.success) {
            message.success("Đã xóa sách thành công!");
            fetchBooks(currentPage);
          } else {
            message.error(res.data?.message || "Xóa thất bại!");
          }
        } catch (err) {
          console.error(err);
          message.error("Có lỗi xảy ra khi xóa sách!");
        }
      },
    });
  };

  // edit handler
  const handleEdit = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang tải dữ liệu sách...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="space-y-4">
          <Breadcrumb
            items={[
              { title: "Trang chủ" },
              { title: "Quản lý Sách" },
            ]}
          />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between  gap-4 bg-white border rounded-lg shadow-sm px-5 py-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm theo tên, tác giả, ISBN, thể loại..."
            allowClear
            prefix={<Search size={16} className="text-gray-500" />}
            className="shadow-sm"
          />
          <Button
            type="primary"
            icon={<Plus size={18} />}
            className="flex items-center gap-2 text-nowrap"
            onClick={() => {
              setIsModalOpen(true);
              setEditingBook(null);
            }}
          >
            Thêm Sách Mới
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
          <Table
            columns={columns}
            dataSource={displayBooks}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: isSearching ? 1 : pagination.page,
              pageSize: pagination.limit,
              total: displayTotal,
              showSizeChanger: true,
              pageSizeOptions: ["5", "9", "10", "20", "50"],
              showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} sách`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1100 }}
          />
        </div>
      </div>

      {/* Modals */}
      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookAdded={() => fetchBooks(currentPage)}
      />

      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBook(null);
        }}
        book={editingBook}
        onBookUpdated={() => fetchBooks(currentPage)}
      />
    </div>
  );
};

export default BookManagementPage;