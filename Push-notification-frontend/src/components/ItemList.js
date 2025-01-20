import React from "react";
import { updateItem, deleteItem } from "../api";

const ItemList = ({ items, onUpdate, onDelete }) => {
  const handleUpdate = async (id) => {
    const newQuantity = prompt("Enter new quantity:");
    if (newQuantity) {
      await updateItem(id, { quantity: Number(newQuantity) });
      onUpdate();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
      onDelete();
    }
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item._id}>
          {item.name} - {item.quantity}
          <button onClick={() => handleUpdate(item._id)}>Edit</button>
          <button onClick={() => handleDelete(item._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default ItemList;
