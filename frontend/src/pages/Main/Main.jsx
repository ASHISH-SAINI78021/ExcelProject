import React, { useState, useEffect } from "react";
import { Upload, Table, Modal, Select, Button, message } from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import _ from "lodash";
import { handleUpload } from "../../http";
import ErrorsModal from "../../Components/ErrorModal/ErrorModal";
import styles from "./Main.module.css"; // Import CSS Module
import { URL } from "../../../url";

const { Dragger } = Upload;
const { Option } = Select;

const Main = () => {
  const [fileData, setFileData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentSheetData, setCurrentSheetData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalVisible2, setErrorModalVisible2] = useState(false);
  const [workbook, setWorkbook] = useState(null);
  const [ErrorOnUploading, setErrorOnUploading] = useState([]);
  const [loading , setloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);



  const uploadProps = {
    beforeUpload: (file) => {
      if (!file.name.endsWith(".xlsx")) {
        message.error("Only .xlsx files are allowed!");
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error("File size must be less than 2MB");
        return false;
      }
      readExcel(file);
      setFileData(file);
      return false;
    },
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });

      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
      parseSheet(wb, wb.SheetNames[0]);
    };
    reader.readAsArrayBuffer(file);
  };

  const parseSheet = (workbook, sheetName) => {
    const ws = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1).map((row, index) => {
      let formattedRow = {};
      headers.forEach((header, colIndex) => {
        formattedRow[header] = formatValue(row[colIndex]);
      });
      return { key: index + 1, ...formattedRow };
    });

    setCurrentSheetData(rows);
  };

  const formatValue = (value) => {
    if (_.isDate(value)) return new Date(value).toLocaleDateString("en-GB");
    if (_.isNumber(value)) return value.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    return value;
  };

  const handleSheetChange = (sheetName) => {
    if (workbook) {
      setSelectedSheet(sheetName);
      parseSheet(workbook, sheetName);
    }
  };

  useEffect(() => {
    setTableData(currentSheetData);
    validateData(currentSheetData);
  }, [currentSheetData]);

  const validateData = (data) => {
    let errors = [];
    data.forEach((row, index) => {
      Object.keys(row).forEach((field) => {
        if (!row[field]) {
          errors.push({ row: index + 1, error: `Missing value in column "${field}"` });
        }
      });
    });

    setValidationErrors(errors);
    if (errors.length > 0) setErrorModalVisible(true);
  };

  const handleDeleteRow = (key) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This row will be permanently deleted.",
      onOk: () => {
        setTableData(tableData.filter((row) => row.key !== key));
        message.success("Row deleted successfully.");
      },
    });
  };

  const uploadingError = (errors) => {
    setErrorOnUploading(errors);
    setErrorModalVisible2(true);
  };


  // progress Report
  const checkProgress = () => {
    fetch(`${URL}/api/progress`)
      .then((res) => res.json())
      .then((data) => setUploadProgress(data.progress))
      .catch((err) => console.error("Progress error:", err));
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      message.warning("Some rows have errors. Only valid rows will be imported.");
    }
  
    setloading(true); // Start loading
    
    const interval = setInterval(checkProgress, 500); // Poll every 500ms
    try {
      console.log("Uploading...");
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", fileData);

      
  
      await handleUpload(formData);
      console.log("Upload complete");
      message.success("File Uploaded successfully");
    } catch (error) {
      const errors = error.response?.data?.errors || [];
      uploadingError(errors);
      console.error(error);
      message.error("File upload failed.");
    } finally {
      clearInterval(interval); // Stop polling
      setloading(false); // Stop loading
    }
  };
  

  return (
    <div className={styles.container}>
      <h2>File Import Page</h2>

      {/* File Upload */}
      <Dragger {...uploadProps} className={styles.uploadBox} multiple={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag .xlsx file to upload</p>
      </Dragger>

      {/* Sheet Selector */}
      {sheetNames.length > 0 && (
        <Select value={selectedSheet} onChange={handleSheetChange} className={styles.sheetSelector}>
          {sheetNames.map((sheet) => (
            <Option key={sheet} value={sheet}>
              {sheet}
            </Option>
          ))}
        </Select>
      )}


      {loading && <Progress percent={uploadProgress} status="active" />}


      {/* Data Table */}
      {tableData.length > 0 && (
        <Table
          className={styles.tableContainer}
          dataSource={tableData}
          columns={[
            ...Object.keys(tableData[0] || {}).map((key) => ({
              title: key,
              dataIndex: key,
              key,
            })),
            {
              title: "Action",
              key: "action",
              render: (_, record) => (
                <DeleteOutlined onClick={() => handleDeleteRow(record.key)} className={styles.actionIcon} />
              ),
            },
          ]}
          pagination={{ pageSize: 5, position: ["bottomCenter"] }} // Center the pagination
        />
      )}

      {/* Import Button */}
      {tableData.length > 0 && (
        <Button className={styles.importButton} onClick={handleImport} loading={loading}>
          Import Data
        </Button>
      )}

      <Modal title="Validation Errors" open={errorModalVisible} onCancel={() => setErrorModalVisible(false)} footer={null}
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        {validationErrors.map((err, idx) => (
          <p key={idx}>
            Row {err.row}: {err.error}
          </p>
        ))}
      </Modal>

      <ErrorsModal errorModalVisible={errorModalVisible2} setErrorModalVisible={setErrorModalVisible2} errors={ErrorOnUploading} />
    </div>
  );
};

export default Main;
