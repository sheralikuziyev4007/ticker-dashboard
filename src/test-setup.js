import '@testing-library/jest-dom'

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock'
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = () => {}
}
