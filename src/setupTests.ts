import '@testing-library/jest-dom/vitest'

// jsdom does not implement scrollTo
window.scrollTo = () => {}
