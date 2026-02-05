"use client";

import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface UAlertDialogProps {
  iconChildren: React.ReactNode;
  onDelete: () => void;
}

const UAlertDialog: React.FC<UAlertDialogProps> = ({
  iconChildren,
  onDelete,
}) => {
  const handleConfirm = () => {
    Modal.confirm({
      title: "Xác nhận xóa?",
      content: "Hành động này không thể hoàn tác.",
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk() {
        onDelete();
      },
    });
  };

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        handleConfirm();
      }}
      className="cursor-pointer"
    >
      {iconChildren}
    </span>
  );
};

export default UAlertDialog;
