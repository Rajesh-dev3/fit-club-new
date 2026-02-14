import React, { useState, useEffect } from "react";
import { Table, Input, Space, Spin, message } from "antd";
import { SearchOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../components/commonTable";
import PageBreadcrumb from "../../components/breadcrumb";
import SearchBar from "../../components/searchBar";
import AddButton from "../../components/addButton";
import { EditInventoryModal, AddQuantityModal } from "../../components/modals";
import { getInventoryColumns } from "./columns";
import { useGetInventoryQuery, useDeleteInventoryMutation, useToggleInventoryStatusMutation } from "../../services/inventory";
import { Home, AddInventoryRoute } from "../../routes/routepath";
import "./styles.scss";

const { Search } = Input;

const AllInventory = () => {
  const navigate = useNavigate();
  
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddQuantityModalOpen, setIsAddQuantityModalOpen] = useState(false);
  const [addQuantityRecord, setAddQuantityRecord] = useState(null);
  
  // API calls
  const { data: inventoryData, error, isLoading, refetch } = useGetInventoryQuery();
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleInventoryStatusMutation();

  // Process and filter data when API data changes
  useEffect(() => {
    
    if (inventoryData?.success && inventoryData?.data && Array.isArray(inventoryData.data)) {
      const processedData = inventoryData.data.map((item, index) => ({
        ...item,
        key: item._id || index.toString(),
        branchName: item.branchId?.name || 'N/A',
        warehouseName: item.warehouseName || 'N/A',
        productName: item.productName,
        quantity: item.quantity,
        quantityAvailable: item.quantity,
      }));
      
      // Filter data based on search text
      const filtered = searchText 
        ? processedData.filter(item => 
            item.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.branchName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.warehouseName?.toLowerCase().includes(searchText.toLowerCase())
          )
        : processedData;
      
      console.log('Processed data:', filtered);
      setFilteredData(filtered);
    } else {
      console.log('No data found');
      setFilteredData([]);
    }
  }, [inventoryData, searchText]); // Add searchText to dependencies

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteInventory(record._id || record.id).unwrap();
      message.success('Inventory item deleted successfully!');
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Error deleting inventory:', error);
      message.error(error?.data?.message || 'Failed to delete inventory item.');
    }
  };

  const handleStatusToggle = async (record, newStatus) => {
    console.log('Status toggle called:', { record, newStatus });
    try {
      const result = await toggleStatus({ id: record._id || record.id, status: newStatus }).unwrap();
      refetch(); // Refresh the data
    } catch (error) {
    }
  };

  const handleAddQuantity = (record) => {
    setAddQuantityRecord(record);
    setIsAddQuantityModalOpen(true);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="all-inventory-page">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}>
          <h2 style={{ margin: 0 }}>All Inventory</h2>
          <PageBreadcrumb items={[
            { label: <HomeOutlined />, to: Home },
            { label: "All Inventory" },
          ]} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }



  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Inventory" },
  ];
console.log(filteredData,"filteredDatafilteredData")

  return (
    <div className="all-inventory-page">
     

      <div className="content-wrapper">
        <div className="search-and-add-section">
         <SearchBar
            value={searchText}
            onChange={setSearchText}
            onSearch={handleSearch}
            placeholder="Search inventory..."
            allowClear
          />
          <AddButton
            to={AddInventoryRoute}
          >
            Add Inventory
          </AddButton>
        </div>

        <CommonTable
          dataSource={filteredData}
          columns={getInventoryColumns(handleEdit, handleDelete, handleStatusToggle, handleAddQuantity)}
          entityType="inventory"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <EditInventoryModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecord(null);
        }}
        recordData={selectedRecord}
        onSuccess={() => {
          refetch();
          // message.success('Inventory updated successfully!');
        }}
      />
      
      <AddQuantityModal
        open={isAddQuantityModalOpen}
        onClose={() => {
          setIsAddQuantityModalOpen(false);
          setAddQuantityRecord(null);
        }}
        recordData={addQuantityRecord}
        onSuccess={() => {
          refetch();
          message.success('Quantity added successfully!');
        }}
      />
    </div>
  );
};

export default AllInventory;