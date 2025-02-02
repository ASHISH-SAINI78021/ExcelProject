import React, { useState, useMemo } from "react";
import { Modal, List, Pagination } from "antd";

const ErrorsModal = ({ errorModalVisible, setErrorModalVisible, errors }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Show 10 errors per page

  // Memoized Paginated Errors to Improve Performance
  const paginatedErrors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return errors.slice(start, end);
  }, [currentPage, errors]);

  return (
    <Modal
      title={`Validation Errors (${errors.length})`}
      open={errorModalVisible}
      onCancel={() => setErrorModalVisible(false)}
      footer={null}
      width={600}
      style={{ maxHeight: "60vh", overflowY: "auto" }} // Add scrolling
    >
      <List
        dataSource={paginatedErrors}
        renderItem={(err, idx) => (
          <List.Item>
            <p>
              <strong>Row {err.row}:</strong> 
              <div>
              {
                err?.errors?.map((error , idx)=> {
                  return <p>{error}</p>
                })
              }
            </div>
            </p>
          </List.Item>
        )}
      />
      {/* Pagination */}
      {errors.length > pageSize && (
        <Pagination
          current={currentPage}
          total={errors.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          style={{ textAlign: "center", marginTop: 10 }}
        />
      )}
    </Modal>
  );
};

export default ErrorsModal;
