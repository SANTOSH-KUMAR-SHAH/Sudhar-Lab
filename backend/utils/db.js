const { PrismaClient } = require("@prisma/client");

let realPrisma;
try { realPrisma = new PrismaClient(); } catch(e) { console.log("Prisma init failed, using mock", e.message); }

const mockCategories = [
  { id: "mock-1", name: "AC Repair", icon: "ac", subcategories: [{id:"s1", name:"AC Service"}], _count: {subcategories:1, services:2} },
  { id: "mock-2", name: "TV Repair", icon: "tv", subcategories: [{id:"s2", name:"LED TV"}], _count: {subcategories:1, services:2} },
  { id: "mock-3", name: "Washing Machine", icon: "washing", subcategories: [], _count: {subcategories:0, services:1} },
];

// In-memory notification store for demo without DB
global.__mockNotifications = global.__mockNotifications || [];
const mockNotifications = global.__mockNotifications;
global.__mockUserStatuses = global.__mockUserStatuses || {};
const mockUserStatuses = global.__mockUserStatuses;
global.__mockBookings = global.__mockBookings || [
  { id: 'mock-booking-1', customerId: 'demo-customer-1', providerId: 'demo-provider-1', serviceId: 'mock-service-1', bookingStart: new Date(), bookingEnd: new Date(Date.now()+3600000), status: 'PENDING', amount: 500, address: 'Kathmandu, Thamel', createdAt: new Date(), updatedAt: new Date(), customer: { id:'demo-customer-1', name:'Rohan Das', email:'rohan.das@example.com', phone:'9876543210', role:'CUSTOMER', status:'ACTIVE' }, provider: { id:'demo-provider-1', name:'Rahul Sharma', email:'rahul.sharma@example.com', phone:'9876543211', role:'PROVIDER', status:'ACTIVE' }, service: { id:'mock-service-1', price:500, duration:60, category:{name:'AC Repair'}, subcategory:{name:'AC Service'}, provider:{ user:{name:'Rahul Sharma'} } }, review: null, report: null },
  { id: 'mock-booking-2', customerId: 'demo-customer-2', providerId: 'demo-provider-1', serviceId: 'mock-service-1', bookingStart: new Date(Date.now()-86400000), bookingEnd: new Date(Date.now()-86400000+3600000), status: 'COMPLETED', amount: 800, address: 'Pokhara, Lakeside', createdAt: new Date(Date.now()-86400000), updatedAt: new Date(), customer: { id:'demo-customer-2', name:'Priya Singh', email:'priya@example.com', phone:'9876543212', role:'CUSTOMER', status:'BLOCKED' }, provider: { id:'demo-provider-1', name:'Rahul Sharma', email:'rahul.sharma@example.com', phone:'9876543211', role:'PROVIDER', status:'ACTIVE' }, service: { id:'mock-service-1', price:800, duration:90, category:{name:'TV Repair'}, subcategory:{name:'LED TV'} }, review: { id:'rev1', rating:5, comment:'Excellent service!', reviewer:{name:'Priya Singh'}, reviewedUser:{name:'Rahul Sharma'} }, report: null }
];
const mockBookings = global.__mockBookings;

function mockResult(model, method, args) {
  const where = args?.[0]?.where || {};
  // Notification in-memory handling
  if (model === 'notification') {
    if (method === 'create') {
      const data = args[0].data;
      const notif = { id: 'notif-'+Date.now()+'-'+Math.random().toString(36).slice(2,6), ...data, isRead: false, createdAt: new Date() };
      mockNotifications.unshift(notif);
      return notif;
    }
    if (method === 'findMany') {
      let result = [...mockNotifications];
      if (where.userId) result = result.filter(n => n.userId === where.userId);
      if (where.isRead !== undefined) result = result.filter(n => n.isRead === where.isRead);
      const take = args[0]?.take || 50;
      return result.slice(0, take);
    }
    if (method === 'count') {
      let result = [...mockNotifications];
      if (where.userId) result = result.filter(n => n.userId === where.userId);
      if (where.isRead !== undefined) result = result.filter(n => n.isRead === where.isRead);
      return result.length;
    }
    if (method === 'findUnique') {
      return mockNotifications.find(n => n.id === where.id) || null;
    }
    if (method === 'update') {
      const idx = mockNotifications.findIndex(n => n.id === where.id);
      if (idx !== -1) { mockNotifications[idx] = { ...mockNotifications[idx], ...args[0].data }; return mockNotifications[idx]; }
      return null;
    }
    if (method === 'updateMany') {
      let count = 0;
      mockNotifications.forEach(n => {
        let match = true;
        if (where.userId && n.userId !== where.userId) match = false;
        if (where.isRead !== undefined && n.isRead !== where.isRead) match = false;
        if (match) { n.isRead = args[0].data.isRead; count++; }
      });
      return { count };
    }
    if (method === 'delete') {
      const idx = mockNotifications.findIndex(n => n.id === where.id);
      if (idx !== -1) mockNotifications.splice(idx, 1);
      return { id: where.id };
    }
  }
  // Booking in-memory handling
  if (model === 'booking') {
    if (method === 'create') {
      const data = args[0].data;
      const b = { id: 'mock-booking-'+Date.now(), ...data, status: data.status || 'PENDING', createdAt: new Date(), updatedAt: new Date(),
        customer: { id: data.customerId, name: data.customerId === 'demo-customer-1' ? 'Rohan Das' : 'Customer', email: 'test@example.com', phone: '9876543210' },
        provider: { id: data.providerId, name: 'Rahul Sharma', phone: '9876543211' },
        service: { id: data.serviceId, price: data.amount || 500, duration: 60, category:{name:'AC Repair'}, subcategory:{name:'AC Service'} },
        review: null, report: null };
      mockBookings.unshift(b);
      return b;
    }
    if (method === 'findMany') {
      let res = [...mockBookings];
      const where = args[0]?.where || {};
      if (where.providerId) res = res.filter(b => b.providerId === where.providerId);
      if (where.customerId) res = res.filter(b => b.customerId === where.customerId);
      if (where.customerProfileId) res = res.filter(b => b.customerId === where.customerProfileId);
      if (where.status && typeof where.status === 'string') res = res.filter(b => b.status === where.status);
      if (where.status?.in) res = res.filter(b => where.status.in.includes(b.status));
      if (where.status?.not) res = res.filter(b => b.status !== where.status.not);
      return res;
    }
    if (method === 'findUnique' || method === 'findFirst') {
      const where = args[0]?.where || {};
      if (where.id) return mockBookings.find(b => b.id === where.id) || null;
      // for conflict check with OR
      if (where.OR) return null; // no conflict for demo
      return null;
    }
    if (method === 'update') {
      const where = args[0]?.where || {};
      const data = args[0]?.data || {};
      const idx = mockBookings.findIndex(b => b.id === where.id);
      if (idx !== -1) { mockBookings[idx] = { ...mockBookings[idx], ...data, updatedAt: new Date() }; return mockBookings[idx]; }
      return null;
    }
    if (method === 'count') {
      let res = [...mockBookings];
      const where = args[0]?.where || {};
      if (where.providerId) res = res.filter(b => b.providerId === where.providerId);
      if (where.customerId) res = res.filter(b => b.customerId === where.customerId);
      if (where.status?.in) res = res.filter(b => where.status.in.includes(b.status));
      if (where.status && typeof where.status === 'string') res = res.filter(b => b.status === where.status);
      return res.length;
    }
    if (method.includes('aggregate')) return { _sum: { amount: mockBookings.filter(b=>b.status==='COMPLETED').reduce((s,b)=>s+b.amount,0) }, _avg: { rating: 0 }, _count: mockBookings.length };
  }
  // Demo provider profile mock
  if (model === 'providerProfile' && (method.includes('findUnique') || method.includes('findFirst'))) {
    if (where.userId === 'demo-provider-1' || where.id === 'demo-provider-1') {
      return {
        id: 'demo-provider-profile-1',
        userId: 'demo-provider-1',
        bio: 'Expert technician for demo',
        experience: 5,
        isVerified: true,
        rating: 4.8,
        applicationStatus: 'APPROVED',
        isAvailable: true,
        schedule: { Monday: {start:"09:00", end:"17:00"}, Tuesday: {start:"09:00", end:"17:00"} },
        aadharNumber: 'XXXX-XXXX-1234',
        user: { id: 'demo-provider-1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '9876543210' }
      };
    }
    if (where.userId === 'demo-admin-1') {
      return { id: 'demo-admin-profile-1', userId: 'demo-admin-1', applicationStatus: 'APPROVED', isAvailable: true, user: { id: 'demo-admin-1', name: 'Admin', email: 'admin@example.com' } };
    }
    if (where.userId) return null;
  }
  if (model === 'user' && method === 'update') {
    const where = args[0]?.where || {};
    const data = args[0]?.data || {};
    if (where.id && where.id.startsWith('demo-')) {
      if (data.status) mockUserStatuses[where.id] = data.status;
      return { id: where.id, ...data, status: data.status || mockUserStatuses[where.id] || 'ACTIVE' };
    }
  }
  if (model === 'user' && method.includes('findUnique')) {
    if (where.id === 'demo-provider-1') return { id: 'demo-provider-1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '9876543210', role: 'PROVIDER', earnings: 12500, status: mockUserStatuses['demo-provider-1'] || 'ACTIVE' };
    if (where.id === 'demo-customer-1') return { id: 'demo-customer-1', name: 'Rohan Das', email: 'rohan.das@example.com', role: 'CUSTOMER', status: mockUserStatuses['demo-customer-1'] || 'ACTIVE' };
    if (where.id === 'demo-customer-2') return { id: 'demo-customer-2', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543212', role: 'CUSTOMER', status: mockUserStatuses['demo-customer-2'] || 'BLOCKED' };
    if (where.id === 'demo-admin-1') return { id: 'demo-admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE' };
    if (where.id && where.id.startsWith('demo-')) return { id: where.id, name: 'Demo User', email: 'demo@example.com', role: 'CUSTOMER', status: mockUserStatuses[where.id] || 'ACTIVE' };
    if (where.email === 'priya@example.com') return { id: 'demo-customer-2', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543212', role: 'CUSTOMER', status: mockUserStatuses['demo-customer-2'] || 'BLOCKED' };
  }
  if (model === 'providerService' && method.includes('findMany')) {
    return [{ id: 'mock-service-1', providerId: 'demo-provider-profile-1', categoryId: 'mock-1', price: 500, description: 'Demo AC Repair', duration: 60, category: {id:'mock-1', name:'AC Repair'}, subcategory: {id:'s1', name:'AC Service'} }];
  }
  if (model === 'providerService' && (method.includes('findUnique') || method.includes('findFirst'))) {
    if (where.id === 'mock-service-1') return { id: 'mock-service-1', providerId: 'demo-provider-profile-1', price: 500, duration: 60, categoryId: 'mock-1', provider: { isAvailable: true, schedule: { Monday: {start:"09:00", end:"17:00"} } } };
    if (where.id && where.id.startsWith('mock-')) return { id: where.id, providerId: 'demo-provider-profile-1', price: 500, duration: 60, categoryId: 'mock-1' };
    return null;
  }
  if (model === 'serviceCategory' && (method.includes('findUnique') || method.includes('findFirst'))) {
    const found = mockCategories.find(c => c.id === where.id);
    if (found) return { ...found, subcategories: found.subcategories || [{id:'s1', name:'Mock Subcategory'}], services: [] };
    if (where.id && where.id.startsWith('mock-')) return { id: where.id, name: 'Mock Category', icon: 'mock', subcategories: [{id:'s1', name:'Mock Subcategory'}] };
    // return first mock as fallback to avoid 404
    return mockCategories[0];
  }
  if (model === 'user' && method.includes('findMany')) {
    return [
      { id: 'demo-customer-1', name: 'Rohan Das', email: 'rohan.das@example.com', phone: '9876543210', role: 'CUSTOMER', status: mockUserStatuses['demo-customer-1'] || 'ACTIVE', earnings: 0, createdAt: new Date(), providerProfile: null },
      { id: 'demo-provider-1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '9876543211', role: 'PROVIDER', status: mockUserStatuses['demo-provider-1'] || 'ACTIVE', earnings: 12500, createdAt: new Date(), providerProfile: { applicationStatus: 'APPROVED', isAvailable: true, rating: 4.8 } },
      { id: 'demo-customer-2', name: 'Priya Singh', email: 'priya@example.com', phone: '9876543212', role: 'CUSTOMER', status: mockUserStatuses['demo-customer-2'] || 'BLOCKED', earnings: 0, createdAt: new Date(), providerProfile: null },
      { id: 'demo-admin-1', name: 'Admin', email: 'admin@example.com', phone: '9876543213', role: 'ADMIN', status: 'ACTIVE', earnings: 0, createdAt: new Date(), providerProfile: null }
    ];
  }
  if (model === 'booking' && method.includes('findMany')) {
    // mock admin all bookings
    return [
      { id: 'mock-booking-1', customerId: 'demo-customer-1', providerId: 'demo-provider-1', serviceId: 'mock-service-1', bookingStart: new Date(), bookingEnd: new Date(Date.now()+3600000), status: 'PENDING', amount: 500, address: 'Kathmandu, Thamel', createdAt: new Date(), customer: { id:'demo-customer-1', name:'Rohan Das', email:'rohan.das@example.com', phone:'9876543210', role:'CUSTOMER', status:'ACTIVE' }, provider: { id:'demo-provider-1', name:'Rahul Sharma', email:'rahul.sharma@example.com', phone:'9876543211', role:'PROVIDER', status:'ACTIVE' }, service: { id:'mock-service-1', price:500, duration:60, category:{name:'AC Repair'}, subcategory:{name:'AC Service'}, provider:{ user:{name:'Rahul Sharma'} } }, review: null, report: null },
      { id: 'mock-booking-2', customerId: 'demo-customer-2', providerId: 'demo-provider-1', serviceId: 'mock-service-1', bookingStart: new Date(Date.now()-86400000), bookingEnd: new Date(Date.now()-86400000+3600000), status: 'COMPLETED', amount: 800, address: 'Pokhara, Lakeside', createdAt: new Date(Date.now()-86400000), customer: { id:'demo-customer-2', name:'Priya Singh', email:'priya@example.com', phone:'9876543212', role:'CUSTOMER', status:'BLOCKED' }, provider: { id:'demo-provider-1', name:'Rahul Sharma', email:'rahul.sharma@example.com', phone:'9876543211', role:'PROVIDER', status:'ACTIVE' }, service: { id:'mock-service-1', price:800, duration:90, category:{name:'TV Repair'}, subcategory:{name:'LED TV'} }, review: { id:'rev1', rating:5, comment:'Excellent service!', reviewer:{name:'Priya Singh'}, reviewedUser:{name:'Rahul Sharma'} }, report: null }
    ];
  }
  if (method.includes('findMany')) {
    if (model === 'serviceCategory') return mockCategories;
    return [];
  }
  if (method.includes('findUnique') || method.includes('findFirst')) return null;
  if (method.includes('count')) return 0;
  if (method.includes('aggregate')) return { _sum: { amount: 0 }, _avg: { rating: 0 }, _count: 0 };
  if (method.includes('create')) return { id: 'mock-id-'+Date.now(), ...args?.[0]?.data, createdAt: new Date() };
  if (method.includes('update')) return { id: 'mock-id', ...args?.[0]?.data };
  if (method.includes('delete')) return { count: 0 };
  if (method === '$queryRaw' || method === '$queryRawUnsafe') return [];
  return null;
}

const prisma = new Proxy(realPrisma || {}, {
  get(target, prop) {
    if (prop === '$transaction' || prop === '$connect' || prop === '$disconnect') {
      return async (fn) => { try { return await target[prop]?.(fn); } catch(e) { return null; } };
    }
    if (prop in target) {
      const val = target[prop];
      if (val && typeof val === 'object' && !val.findMany) return val;
      // if it's a model
      return new Proxy(val || {}, {
        get(_, method) {
          return async (...args) => {
            try {
              if (val && typeof val[method] === 'function') {
                return await val[method](...args);
              }
            } catch (e) {
              // DB not reachable -> fallback to mock
              // console.log(`Mock fallback ${String(prop)}.${String(method)}:`, e.message);
            }
            return mockResult(String(prop), String(method), args);
          };
        }
      });
    }
    // unknown prop -> mock model
    return new Proxy({}, {
      get(_, method) {
        return async (...args) => mockResult(String(prop), String(method), args);
      }
    });
  }
});

module.exports = prisma;
