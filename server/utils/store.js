// Shared In-Memory Persistent Store for Customers & Orders

export let CUSTOMERS_STORE = [
  {
    _id: 'usr-1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98250 12345',
    city: 'Vadodara',
    state: 'Gujarat',
    totalOrders: 6,
    lifetimeValue: 8450,
    status: 'VIP Member',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    _id: 'usr-2',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98790 67890',
    city: 'Ahmedabad',
    state: 'Gujarat',
    totalOrders: 4,
    lifetimeValue: 4890,
    status: 'Active',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    _id: 'usr-3',
    name: 'Vikramaditya Patel',
    email: 'vikram.patel@outlook.com',
    phone: '+91 94260 54321',
    city: 'Anand',
    state: 'Gujarat',
    totalOrders: 12,
    lifetimeValue: 16200,
    status: 'VIP Member',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    _id: 'usr-4',
    name: 'Divya Desai',
    email: 'divya.desai@gmail.com',
    phone: '+91 99040 11223',
    city: 'Surat',
    state: 'Gujarat',
    totalOrders: 2,
    lifetimeValue: 1980,
    status: 'Active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export let ORDERS_STORE = [
  {
    _id: 'NUV-9081',
    user: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98250 12345' },
    items: [
      { title: 'Desi Gir Cow A2 Bilona Ghee', quantity: 1, price: 1350, unit: '500ml', image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500' },
      { title: 'Wood Cold-Pressed Groundnut Oil', quantity: 2, price: 340, unit: '1 Litre', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' }
    ],
    totalAmount: 2030,
    discountApplied: 0,
    paymentStatus: 'Completed',
    paymentMethod: 'UPI Instant QR Pay',
    transactionId: 'TXN_NUV8492019',
    orderStatus: 'Dispatched',
    tracking: {
      trackingNumber: 'NUV-TRK-9081-EX',
      carrier: 'Nuva Express Sunrise Fleet',
      currentLocation: 'Vadodara Central Distribution Hub',
      estimatedDelivery: 'Tomorrow by 08:30 AM',
      trackingNotes: 'Cold-chain storage vehicle #GJ-06-NV-2026 en route',
      stages: [
        { id: 1, title: 'Order Confirmed', description: 'Fresh batch harvest allocated at Anand Organic Farm', time: 'Today, 08:30 AM', completed: true },
        { id: 2, title: '4-Stage Aqueous Ozone Wash (O₃)', description: 'Eliminated 99.9% surface residues & microbiological contaminants', time: 'Today, 10:15 AM', completed: true },
        { id: 3, title: 'Quality Tested & Zero-Plastic Sealed', description: 'Batch #410 lab-verified for zero adulteration and sealed in breathable bio-film', time: 'Today, 01:45 PM', completed: true },
        { id: 4, title: 'Dispatched with Sunrise Fleet', description: 'Loaded onto temperature-controlled EV transport fleet', time: 'Today, 04:20 PM', completed: true },
        { id: 5, title: 'Out for Delivery', description: 'Delivery executive Ramesh K. (+91 98240 11223) will arrive shortly', time: 'Tomorrow, 07:30 AM', completed: false },
        { id: 6, title: 'Delivered Fresh to Doorstep', description: 'Delivered in pristine condition with freshness guarantee', time: 'Pending', completed: false }
      ]
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    deliveryAddress: {
      name: 'Priya Sharma',
      street: '4th Floor, Pancham Icon, Vasna Rd',
      city: 'Vadodara',
      state: 'Gujarat',
      postalCode: '390007',
      phone: '+91 98250 12345'
    }
  },
  {
    _id: 'NUV-8842',
    user: { name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', phone: '+91 98790 67890' },
    items: [
      { title: 'Cold-Pressed Mustard Oil (Kachi Ghani)', quantity: 2, price: 290, unit: '1 Litre', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' }
    ],
    totalAmount: 580,
    discountApplied: 50,
    paymentStatus: 'Completed',
    paymentMethod: 'Google Pay',
    transactionId: 'TXN_GPAY772189',
    orderStatus: 'Ozone Washing',
    tracking: {
      trackingNumber: 'NUV-TRK-8842-GJ',
      carrier: 'Nuva Express Sunrise Fleet',
      currentLocation: 'Vadodara Bio-Purification Chamber',
      estimatedDelivery: 'Tomorrow by 11:00 AM',
      trackingNotes: 'Micro-bubble aqueous ozone purification in progress',
      stages: [
        { id: 1, title: 'Order Confirmed', description: 'Farm batch reserved', time: 'Today, 11:00 AM', completed: true },
        { id: 2, title: '4-Stage Aqueous Ozone Wash (O₃)', description: 'Purification chamber active', time: 'In Progress', completed: true },
        { id: 3, title: 'Quality Tested & Zero-Plastic Sealed', description: 'Lab verification pending', time: 'Pending', completed: false },
        { id: 4, title: 'Dispatched with Sunrise Fleet', description: 'Awaiting dispatch', time: 'Pending', completed: false },
        { id: 5, title: 'Out for Delivery', description: 'Courier allocation pending', time: 'Pending', completed: false },
        { id: 6, title: 'Delivered Fresh to Doorstep', description: 'Awaiting arrival', time: 'Pending', completed: false }
      ]
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    deliveryAddress: {
      name: 'Aarav Mehta',
      street: '12 Shivalik Heights, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
      phone: '+91 98790 67890'
    }
  }
];

export const addCustomerToStore = (user) => {
  const existingIdx = CUSTOMERS_STORE.findIndex(c => c.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    CUSTOMERS_STORE[existingIdx] = {
      ...CUSTOMERS_STORE[existingIdx],
      name: user.name || CUSTOMERS_STORE[existingIdx].name,
      phone: user.phone || CUSTOMERS_STORE[existingIdx].phone,
      city: user.city || CUSTOMERS_STORE[existingIdx].city || 'Vadodara'
    };
    return CUSTOMERS_STORE[existingIdx];
  }

  const newCust = {
    _id: user._id || `usr-${Date.now().toString().slice(-4)}`,
    name: user.name || 'New Customer',
    email: user.email,
    phone: user.phone || '+91 92277 25359',
    city: user.city || 'Vadodara',
    state: user.state || 'Gujarat',
    totalOrders: 0,
    lifetimeValue: 0,
    status: 'Active',
    createdAt: new Date().toISOString()
  };
  CUSTOMERS_STORE.unshift(newCust);
  return newCust;
};

export const addOrderToStore = (orderData) => {
  const orderId = orderData._id || `NUV-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const initialStages = [
    { id: 1, title: 'Order Confirmed', description: 'Fresh farm produce and pure oils allocated for your order', time: 'Just Now', completed: true },
    { id: 2, title: '4-Stage Aqueous Ozone Wash (O₃)', description: 'Passing through micro-bubble aqueous ozone chambers for 99.9% chemical/pesticide removal', time: 'Preparing', completed: false },
    { id: 3, title: 'Quality Tested & Zero-Plastic Sealed', description: 'Lab tested for purity, cold-extraction integrity, and packed in eco-friendly bio-film', time: 'Pending', completed: false },
    { id: 4, title: 'Dispatched with Sunrise Fleet', description: 'Loaded into insulated EV transport vehicles for doorstep express transfer', time: 'Pending', completed: false },
    { id: 5, title: 'Out for Delivery', description: 'Local delivery partner is on the way to your address', time: 'Pending', completed: false },
    { id: 6, title: 'Delivered Fresh to Doorstep', description: 'Fresh chemical-free order received and verified', time: 'Pending', completed: false }
  ];

  const newOrder = {
    _id: orderId,
    user: {
      name: orderData.deliveryAddress?.name || orderData.user?.name || 'Customer',
      email: orderData.user?.email || 'customer@example.com',
      phone: orderData.deliveryAddress?.phone || orderData.user?.phone || '+91 92277 25359'
    },
    items: orderData.items || [],
    totalAmount: orderData.totalAmount || 0,
    discountApplied: orderData.discountApplied || 0,
    paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'COD' ? 'Pending' : 'Completed'),
    paymentMethod: orderData.paymentMethod || 'UPI Instant QR Pay',
    transactionId: orderData.transactionId || `TXN_${Date.now().toString().slice(-8)}`,
    orderStatus: orderData.orderStatus || 'Placed',
    tracking: {
      trackingNumber: `NUV-TRK-${orderId.replace('NUV-', '')}-GJ`,
      carrier: 'Nuva Express Sunrise Fleet',
      currentLocation: 'Vadodara Bio-Purification Chamber',
      estimatedDelivery: 'Tomorrow morning by 08:00 AM',
      trackingNotes: 'Order received. Farm harvest allocated for Ozone micro-wash.',
      stages: initialStages
    },
    deliveryAddress: orderData.deliveryAddress || {
      name: orderData.user?.name || 'Customer',
      street: 'Vasna Road',
      city: 'Vadodara',
      state: 'Gujarat',
      postalCode: '390007',
      phone: '+91 92277 25359'
    },
    createdAt: new Date().toISOString()
  };

  ORDERS_STORE.unshift(newOrder);

  // Update customer order count & LTV
  const custEmail = newOrder.user.email?.toLowerCase();
  const cust = CUSTOMERS_STORE.find(c => c.email.toLowerCase() === custEmail);
  if (cust) {
    cust.totalOrders = (cust.totalOrders || 0) + 1;
    cust.lifetimeValue = (cust.lifetimeValue || 0) + (newOrder.totalAmount || 0);
  } else {
    addCustomerToStore({
      name: newOrder.user.name,
      email: newOrder.user.email,
      phone: newOrder.user.phone,
      city: newOrder.deliveryAddress?.city || 'Vadodara'
    });
    const newlyAdded = CUSTOMERS_STORE.find(c => c.email.toLowerCase() === custEmail);
    if (newlyAdded) {
      newlyAdded.totalOrders = 1;
      newlyAdded.lifetimeValue = newOrder.totalAmount;
    }
  }

  return newOrder;
};

export const updateOrderInStore = (orderId, updates) => {
  const idx = ORDERS_STORE.findIndex(o => o._id === orderId || o._id.toLowerCase() === orderId.toLowerCase());
  if (idx === -1) return null;

  const current = ORDERS_STORE[idx];
  const newStatus = updates.orderStatus || current.orderStatus;
  
  // Calculate completed stages based on newStatus
  const stageTitles = [
    'Order Confirmed',
    '4-Stage Aqueous Ozone Wash (O₃)',
    'Quality Tested & Zero-Plastic Sealed',
    'Dispatched with Sunrise Fleet',
    'Out for Delivery',
    'Delivered Fresh to Doorstep'
  ];

  let completedUpToIndex = 0;
  if (newStatus === 'Placed' || newStatus === 'Pending') completedUpToIndex = 0;
  else if (newStatus === 'Ozone Washing' || newStatus === 'Ozone Purifying') completedUpToIndex = 1;
  else if (newStatus === 'Quality Inspected' || newStatus === 'Processing') completedUpToIndex = 2;
  else if (newStatus === 'Dispatched') completedUpToIndex = 3;
  else if (newStatus === 'Out for Delivery') completedUpToIndex = 4;
  else if (newStatus === 'Delivered') completedUpToIndex = 5;

  const updatedStages = (current.tracking?.stages || []).map((stage, i) => ({
    ...stage,
    completed: i <= completedUpToIndex,
    time: i <= completedUpToIndex && stage.time === 'Pending' ? 'Updated Today' : stage.time
  }));

  const updatedOrder = {
    ...current,
    orderStatus: newStatus,
    paymentStatus: updates.paymentStatus || current.paymentStatus,
    tracking: {
      ...current.tracking,
      carrier: updates.carrier || current.tracking?.carrier || 'Nuva Express Sunrise Fleet',
      trackingNumber: updates.trackingNumber || current.tracking?.trackingNumber || `NUV-TRK-${orderId}`,
      currentLocation: updates.currentLocation || current.tracking?.currentLocation || 'Vadodara Hub',
      estimatedDelivery: updates.estimatedDelivery || current.tracking?.estimatedDelivery || 'Tomorrow',
      trackingNotes: updates.trackingNotes || current.tracking?.trackingNotes || `Status updated to ${newStatus}`,
      stages: updatedStages
    }
  };

  ORDERS_STORE[idx] = updatedOrder;
  return updatedOrder;
};

export const deleteOrderFromStore = (orderId) => {
  const initialLength = ORDERS_STORE.length;
  ORDERS_STORE = ORDERS_STORE.filter(o => o._id !== orderId && o._id.toLowerCase() !== orderId.toLowerCase());
  return ORDERS_STORE.length < initialLength;
};
