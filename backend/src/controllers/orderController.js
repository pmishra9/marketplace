import { orders } from '../data/mockData.js';

let orderList = [...orders];

export const getOrders = (_req, res) => {
  res.json({
    success: true,
    count: orderList.length,
    data: orderList
  });
};

export const createOrder = (req, res) => {
  const { customerName, customerEmail, items, totalAmount } = req.body;

  if (!customerEmail || !items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'Customer email and at least one order item are required'
    });
  }

  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || 'Valued Customer',
    customerEmail,
    items,
    totalAmount: Number(totalAmount || 0),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orderList.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
};
