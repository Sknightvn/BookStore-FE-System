import React, { useState, useEffect } from "react";
import { Modal, Input, InputNumber, message, Select } from "antd";
import axios from "axios";

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL || "https://bookstore-be-b450.onrender.com/api";

const EditBookModal = ({ isOpen, onClose, book, onBookUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    ISSN: "",
    category: "",
    price: 0,
    publishYear: "",
    pages: "",
    volume: "",
    description: "",
    coverImage: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [categories, setCategories] = useState([]);

  // Lấy danh sách category
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Lỗi khi tải thể loại:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Khi mở modal chỉnh sửa
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        ISSN: book.ISSN || "",
        category: book.category?._id || book.category || "",
        price: book.price || 0,
        publishYear: book.publishYear || "",
        pages: book.pages || "",
        volume: book.volume || "",
        description: book.description || "",
        coverImage: book.coverImage || "",
      });
      setNewImage(null);
    }
  }, [book]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (value) => {
    setFormData({ ...formData, price: value || 0 });
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, category: value });
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("author", formData.author);
      data.append("ISSN", formData.ISSN);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("publishYear", formData.publishYear);
      data.append("pages", formData.pages);
      data.append("volume", formData.volume);
      data.append("description", formData.description);
      if (newImage) data.append("coverImage", newImage);

      // Debug FormData
      for (let pair of data.entries()) {
        console.log(pair[0], ":", pair[1]);
      }

      const res = await axios.patch(
        `${API_URL}/books/${book._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        message.success("Cập nhật sách thành công!");
        onBookUpdated();
        onClose();
      } else {
        message.error(res.data.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi FormData:", err);
      message.error("Có lỗi khi cập nhật sách!");
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      title="Chỉnh sửa thông tin sách"
      width={1000}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      centered
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          Tên sách:
          <Input name="title" value={formData.title} onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          Tác giả:
          <Input name="author" value={formData.author} onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          ISBN:
          <Input
            name="ISSN"
            value={formData.ISSN}
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
          />
        </label>

        <label className="flex flex-col gap-1">
          Thể loại:
          <Select
            value={formData.category}
            onChange={handleCategoryChange}
            style={{ width: "100%" }}
          >
            {categories.map((cat) => (
              <Option key={cat._id} value={cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1">
          Giá:
          <InputNumber
            value={formData.price}
            onChange={handlePriceChange}
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/,/g, "")}
          />
        </label>

        <label className="flex flex-col gap-1">
          Năm xuất bản:
          <Input
            name="publishYear"
            value={formData.publishYear}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-1">
          Số trang:
          <Input name="pages" value={formData.pages} onChange={handleChange} />
        </label>

        <label className="flex flex-col gap-1">
          Tập sách:
          <Input
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            placeholder="VD: Tập 1, Quyển 2..."
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          Mô tả:
          <Input.TextArea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          Ảnh bìa:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {!newImage && formData.coverImage && (
          <div className="mt-2 md:col-span-2">
            <p className="text-gray-600 text-sm mb-1">Ảnh hiện tại:</p>
            <img
              src={formData.coverImage}
              alt="cover"
              className="w-24 h-32 object-cover rounded-md border"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditBookModal;