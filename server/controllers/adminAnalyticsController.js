export const getAnalytics = async (req, res) => {
  res.json({
    success: true,
    data: {
      dailySales: 48920,
      totalOrders: 142,
      activeInventoryCount: 86,
      activeOzoneGenerators: 4,
      ozonePurityIndex: '99.98%',
      batchesProcessedToday: 24,
      recentOzoneLogs: [
        { id: 'LOG-889', batch: 'O3-882910', crop: 'Baby Spinach (500kg)', duration: '14 min', residualO3: '0.00 ppm (Safe)', status: 'Certified Pure' },
        { id: 'LOG-888', batch: 'O3-993120', crop: 'Cherry Tomatoes (350kg)', duration: '18 min', residualO3: '0.00 ppm (Safe)', status: 'Certified Pure' },
        { id: 'LOG-887', batch: 'O3-441209', crop: 'Sweet Oranges (600kg)', duration: '20 min', residualO3: '0.00 ppm (Safe)', status: 'Certified Pure' }
      ]
    }
  });
};
