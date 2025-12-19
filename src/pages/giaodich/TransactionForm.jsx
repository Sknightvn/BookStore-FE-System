import { useState, useEffect } from "react";
import { getAllTransaction } from "../../utils/transactionBookApi";
import { Search, Calendar } from "lucide-react";
import { Table, Input, Select, Tag, Space, DatePicker, Modal } from "antd";
import dayjs from "dayjs";

export default function TransactionForm() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Lấy tất cả giao dịch khi component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getAllTransaction();
        setTransactions(data.data);
      } catch (error) {
        console.error("Lỗi khi tải giao dịch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Định dạng loại giao dịch
  const formatTransactionType = (type) => {
    const typeMap = {
      kiemke: "Kiểm kê",
      huy: "Hủy",
      ban: "Bán hàng",
      khuyenmai: "Khuyến mãi",
      nhap: "Nhập kho",
      hoantra: "Trả hàng",
    };
    return typeMap[type] || type;
  };

  // Màu sắc cho loại giao dịch
  const getTypeColor = (type) => {
    const colors = {
      ban: "green",
      nhap: "blue",
      kiemke: "gold",
      hoantra: "red",
      huy: "default",
      khuyenmai: "purple",
    };
    return colors[type] || "default";
  };

  // Lọc giao dịch
  const filteredTransactions = transactions.filter((transaction) => {
    let isValid = true;

    if (searchTerm) {
      isValid =
        transaction.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         transaction.book.ISSN.toLowerCase().includes(searchTerm.toLowerCase())||
        transaction.book.author.toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (selectedDate) {
      isValid = dayjs(transaction.transactionDate).format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD");
    }

    if (selectedType !== "all") {
      isValid = transaction.transactionType === selectedType;
    }

    return isValid;
  });

  const columns = [
    {
      title: "Mã SP",
      dataIndex: ["book", "ISSN"],
      key: "ISSN",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["book", "title"],
      key: "title",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => (
        <Tag color={getTypeColor(type)} style={{ borderRadius: 999, padding: "2px 10px" }}>
          {formatTransactionType(type)}
        </Tag>
      ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách giao dịch</h1>
          <p className="text-gray-600">Quản lý các giao dịch sách trong hệ thống</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <Space wrap size="middle">
            <Input
              allowClear
              size="large"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<Search className="w-4 h-4 text-gray-500" />}
              className="shadow-sm w-[260px]"
            />
            <DatePicker
              size="large"
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
              placeholder="Chọn ngày giao dịch"
              className="w-[200px]"
              suffixIcon={<Calendar className="w-4 h-4 text-gray-500" />}
              allowClear
            />
            <Select
              size="large"
              value={selectedType}
              onChange={setSelectedType}
              className="min-w-[180px]"
              options={[
                { label: "Tất cả loại", value: "all" },
                { label: "Kiểm kê", value: "kiemke" },
                { label: "Hủy", value: "huy" },
                { label: "Bán hàng", value: "ban" },
                { label: "Khuyến mãi", value: "khuyenmai" },
                { label: "Nhập kho", value: "nhap" },
                { label: "Trả hàng", value: "hoantra" },
              ]}
            />
          </Space>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border p-2">
          <Table
            columns={columns}
            dataSource={filteredTransactions.map((t) => ({ ...t, key: t._id }))}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} giao dịch`,
            }}
            scroll={{ x: 900 }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedTransaction(record);
                setDetailOpen(true);
              },
            })}
            rowClassName="cursor-pointer"
          />
        </div>

        <Modal
          open={detailOpen && !!selectedTransaction}
          onCancel={() => {
            setDetailOpen(false);
            setSelectedTransaction(null);
          }}
          footer={null}
          title="Chi tiết giao dịch"
          width={720}
        >
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sách</h3>
                <div className="grid grid-cols-2  gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã sách</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransaction.book?.ISSN}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tên sách</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransaction.book?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tác giả</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransaction.book?.author}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin giao dịch</h3>
                <div className="grid grid-cols-2  gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số lượng</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTransaction.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại giao dịch</p>
                    <Tag color={getTypeColor(selectedTransaction.transactionType)} style={{ borderRadius: 999, padding: "2px 10px" }}>
                      {formatTransactionType(selectedTransaction.transactionType)}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày giao dịch</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {dayjs(selectedTransaction.transactionDate).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}