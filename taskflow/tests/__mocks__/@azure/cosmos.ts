export const mockContainer = {
  items: {
    create: jest.fn(),
    upsert: jest.fn(),
    query: jest.fn(() => ({
      fetchAll: jest.fn().mockResolvedValue({ resources: [] })
    })),
    item: jest.fn(() => ({
      delete: jest.fn(),
      replace: jest.fn(),
      read: jest.fn()
    }))
  }
};

export const CosmosClient = jest.fn(() => ({
  database: jest.fn(() => ({
    container: jest.fn(() => mockContainer)
  }))
}));